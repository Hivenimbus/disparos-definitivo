import { readBody, createError, setResponseStatus } from 'h3'
import { $fetch } from 'ofetch'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { hashPassword } from '../../../utils/password'
import {
  mapAdminUserRow,
  mapRoleToDb,
  mapStatusToDb,
  fetchCompanyById,
  ensureCompanyCapacity,
  buildCompanyUpdatePayload,
  normalizeEmail
} from '../../../utils/users'

type ParsedProxyConfig = {
  host: string
  port: string
  username: string
  password: string
}

type CreateUserPayload = {
  nome: string
  email: string
  password: string
  role?: 'admin' | 'gerente' | 'usuario'
  status?: 'ativo' | 'desativado'
  companyId?: string | null
  dataVencimento?: string
  celular?: string | null
  cpf?: string | null
}

const validateCreatePayload = (payload: CreateUserPayload, requireVencimento: boolean) => {
  if (!payload?.nome?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' })
  }

  if (!payload?.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email é obrigatório' })
  }

  if (!payload?.password || payload.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Senha deve ter ao menos 8 caracteres' })
  }

  if (requireVencimento && !payload?.dataVencimento) {
    throw createError({ statusCode: 400, statusMessage: 'Data de vencimento é obrigatória' })
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
  const payload = (await readBody(event)) as CreateUserPayload
  const requireVencimento = !payload.companyId
  validateCreatePayload(payload, requireVencimento)

  const config = useRuntimeConfig()
  const evolutionApiUrl = config.evolutionApiUrl?.replace(/\/$/, '')
  const evolutionApiKey = config.evolutionApiKey

  if (!evolutionApiUrl || !evolutionApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da Evolution API não encontradas'
    })
  }

  const supabase = getServiceSupabaseClient()
  const email = normalizeEmail(payload.email)

  const { data: existingEmail } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingEmail) {
    throw createError({ statusCode: 409, statusMessage: 'Email já cadastrado' })
  }

  let companyRecord: Awaited<ReturnType<typeof fetchCompanyById>> | null = null

  if (payload.companyId) {
    companyRecord = await fetchCompanyById(supabase, payload.companyId)
    ensureCompanyCapacity(companyRecord)

    if (companyRecord.status === 'desativado') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Não é possível vincular usuário a uma empresa desativada.'
      })
    }
  }

  const finalVencimento = companyRecord?.data_vencimento ?? payload.dataVencimento

  if (!finalVencimento) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Data de vencimento não encontrada para esta empresa.'
    })
  }

  const hashedPassword = await hashPassword(payload.password)
  let statusDb = mapStatusToDb(payload.status)
  if (companyRecord && companyRecord.status === 'desativado') {
    statusDb = 'desativado'
  }
  const roleDb = mapRoleToDb(payload.role)

  if (roleDb === 'manager' && !payload.companyId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Gerentes devem estar vinculados a uma empresa.'
    })
  }

  const { data, error } = await supabase
    .from('users')
    .insert({
      nome: payload.nome.trim(),
      email,
      senha_hash: hashedPassword,
      role: roleDb,
      status: statusDb,
      company_id: payload.companyId || null,
      empresa: companyRecord?.nome || null,
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
    console.error('[admin/users] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar usuário' })
  }

  const { error: configError } = await supabase.from('configuracoes').insert({
    user_id: data.id
  })

  if (configError) {
    console.error('[admin/users] Erro ao criar configuração padrão do usuário', configError)
    const { error: rollbackError } = await supabase.from('users').delete().eq('id', data.id)
    if (rollbackError) {
      console.error('[admin/users] Erro ao remover usuário após falha ao criar configuração', rollbackError)
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
      console.error('[admin/users] Erro ao devolver proxy para pool', restoreError)
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
    console.error('[admin/users] Falha ao reservar proxy', proxyError)
    await restoreProxy()
    const { error: rollbackError } = await supabase.from('users').delete().eq('id', data.id)
    if (rollbackError) {
      console.error('[admin/users] Erro ao remover usuário após falha ao reservar proxy', rollbackError)
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
        console.error('[admin/users] Erro ao salvar proxy do usuário', proxyUpdateError)
      }

      proxyString = null
    }
  } catch (e: any) {
    await restoreProxy()
    console.error('[admin/users] Erro ao criar instância no Evolution', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    const { error: rollbackError } = await supabase.from('users').delete().eq('id', data.id)
    if (rollbackError) {
      console.error('[admin/users] Erro ao remover usuário após falha no Evolution', rollbackError)
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar instância no Evolution'
    })
  }

  if (companyRecord) {
    const updatePayload = buildCompanyUpdatePayload(companyRecord, 1)
    const { error: companyError } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', companyRecord.id)

    if (companyError) {
      console.error('[admin/users] Erro ao atualizar contagem da empresa', companyError)
    }
  }

  setResponseStatus(event, 201)

  return {
    user: mapAdminUserRow(data)
  }
})


