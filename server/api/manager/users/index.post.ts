import { readBody, createError, setResponseStatus } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import {
  buildCompanyUpdatePayload,
  ensureCompanyCapacity,
  fetchCompanyById,
  mapAdminUserRow,
  mapStatusToDb,
  normalizeEmail
} from '../../../utils/users'
import { hashPassword } from '../../../utils/password'

type ParsedProxyConfig = {
  host: string
  port: string
  username: string
  password: string
}

type CreateManagerUserPayload = {
  nome: string
  email: string
  password: string
  celular?: string | null
  cpf?: string | null
  status?: 'ativo' | 'desativado'
}

const validatePayload = (payload: CreateManagerUserPayload) => {
  if (!payload?.nome?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' })
  }

  if (!payload?.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email é obrigatório' })
  }

  if (!payload?.password || payload.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Senha deve ter ao menos 8 caracteres' })
  }
}

const parseProxyString = (proxyString: string): ParsedProxyConfig => {
  try {
    const trimmed = proxyString.trim()
    const parsedUrl = new URL(trimmed)

    if (!parsedUrl.hostname || !parsedUrl.port || !parsedUrl.username || !parsedUrl.password) {
      throw new Error('Missing proxy components')
    }

    return {
      host: parsedUrl.hostname,
      port: parsedUrl.port,
      username: decodeURIComponent(parsedUrl.username),
      password: decodeURIComponent(parsedUrl.password)
    }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Formato de proxy inválido.'
    })
  }
}

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'manager') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso restrito aos gerentes' })
  }

  if (!authUser.company_id) {
    throw createError({ statusCode: 400, statusMessage: 'Gerente não vinculado a uma empresa' })
  }

  const payload = (await readBody(event)) as CreateManagerUserPayload
  validatePayload(payload)

  const supabase = getServiceSupabaseClient()
  const companyRecord = await fetchCompanyById(supabase, authUser.company_id)

  if (companyRecord.status === 'desativado') {
    throw createError({ statusCode: 400, statusMessage: 'Empresa desativada não pode receber novos usuários.' })
  }

  ensureCompanyCapacity(companyRecord)

  if (!companyRecord.data_vencimento) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Empresa sem data de vencimento configurada. Solicite ao administrador.'
    })
  }

  const finalVencimento = companyRecord.data_vencimento

  const config = useRuntimeConfig()
  const evolutionApiUrl = config.evolutionApiUrl?.replace(/\/$/, '')
  const evolutionApiKey = config.evolutionApiKey

  if (!evolutionApiUrl || !evolutionApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da Evolution API não encontradas'
    })
  }

  const email = normalizeEmail(payload.email)
  const { data: existingEmail } = await supabase.from('users').select('id').eq('email', email).maybeSingle()

  if (existingEmail) {
    throw createError({ statusCode: 409, statusMessage: 'Email já cadastrado' })
  }

  const hashedPassword = await hashPassword(payload.password)
  let statusDb = mapStatusToDb(payload.status)
  if (companyRecord.status === 'desativado') {
    statusDb = 'desativado'
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      nome: payload.nome.trim(),
      email,
      senha_hash: hashedPassword,
      role: 'user',
      status: statusDb,
      company_id: companyRecord.id,
      empresa: companyRecord.nome || null,
      vencimento: finalVencimento,
      numero: payload.celular?.trim() || null,
      cpf: payload.cpf?.trim() || null,
      must_change_password: true
    })
    .select(
      [
        'id',
        'nome',
        'email',
        'empresa',
        'numero',
        'vencimento',
        'status',
        'role',
        'company_id',
        'cpf',
        'created_at',
        'updated_at',
        'must_change_password',
        'companies:company_id (id, nome, max_usuarios, usuarios_atuais)'
      ].join(', ')
    )
    .single()

  if (error || !data) {
    console.error('[manager/users] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar usuário' })
  }

  const { error: configError } = await supabase.from('configuracoes').insert({
    user_id: data.id
  })

  if (configError) {
    console.error('[manager/users] Erro ao criar configuração padrão do usuário', configError)
    const { error: rollbackError } = await supabase.from('users').delete().eq('id', data.id)
    if (rollbackError) {
      console.error('[manager/users] Erro ao remover usuário após falha ao criar configuração', rollbackError)
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar configurações padrão do usuário'
    })
  }

  let proxyString: string | null = null
  let proxyPayload: ParsedProxyConfig | null = null

  const restoreProxy = async () => {
    if (!proxyString) {
      return
    }
    try {
      await supabase.from('Proxys').insert({ Proxy: proxyString })
    } catch (restoreError) {
      console.error('[manager/users] Erro ao devolver proxy para pool', restoreError)
    } finally {
      proxyString = null
    }
  }

  try {
    const { data: proxyRecord, error: proxySelectError } = await supabase
      .from('Proxys')
      .select('id, "Proxy"')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (proxySelectError || !proxyRecord?.Proxy || !proxyRecord.id) {
      throw proxySelectError || new Error('Proxy não disponível')
    }

    const { data: deletedProxy, error: proxyDeleteError } = await supabase
      .from('Proxys')
      .delete()
      .eq('id', proxyRecord.id)
      .select('id')
      .maybeSingle()

    if (proxyDeleteError || !deletedProxy?.id) {
      throw proxyDeleteError || new Error('Não foi possível reservar a proxy')
    }

    proxyString = proxyRecord.Proxy.trim()
    proxyPayload = parseProxyString(proxyString)
  } catch (proxyError: any) {
    console.error('[manager/users] Falha ao reservar proxy', proxyError)
    await restoreProxy()
    const { error: rollbackError } = await supabase.from('users').delete().eq('id', data.id)
    if (rollbackError) {
      console.error('[manager/users] Erro ao remover usuário após falha ao reservar proxy', rollbackError)
    }
    throw createError({
      statusCode: 503,
      statusMessage: 'Não há proxies disponíveis no momento. Tente novamente mais tarde.'
    })
  }

  try {
    if (!proxyPayload) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Configuração de proxy não encontrada.'
      })
    }

    await $fetch('/instance/create', {
      baseURL: evolutionApiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey
      },
      body: {
        name: data.id,
        token: data.id
      }
    })

    if (proxyString) {
      const { error: proxyUpdateError } = await supabase
        .from('users')
        .update({ Proxy: proxyString })
        .eq('id', data.id)

      if (proxyUpdateError) {
        console.error('[manager/users] Erro ao salvar proxy do usuário', proxyUpdateError)
      }

      proxyString = null
    }
  } catch (e: any) {
    await restoreProxy()
    console.error('[manager/users] Erro ao criar instância no Evolution', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    const { error: rollbackError } = await supabase.from('users').delete().eq('id', data.id)
    if (rollbackError) {
      console.error('[manager/users] Erro ao remover usuário após falha no Evolution', rollbackError)
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar instância no Evolution'
    })
  }

  const updatePayload = buildCompanyUpdatePayload(companyRecord, 1)
  const { error: companyError } = await supabase.from('companies').update(updatePayload).eq('id', companyRecord.id)

  if (companyError) {
    console.error('[manager/users] Erro ao atualizar contagem da empresa', companyError)
  }

  setResponseStatus(event, 201)

  return {
    user: mapAdminUserRow(data)
  }
})


