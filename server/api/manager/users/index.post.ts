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
  const uazapiApiUrl = config.uazapiApiUrl?.replace(/\/$/, '')
  const uazapiApiKey = config.uazapiApiKey

  if (!uazapiApiUrl || !uazapiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da UAZAPI não encontradas'
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
    console.error('[manager/users] erro ao criar configuração padrão', configError)
    await supabase.from('users').delete().eq('id', data.id)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar configurações padrão do usuário' })
  }

  try {
    await $fetch('/instance/create', {
      baseURL: uazapiApiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: uazapiApiKey
      },
      body: {
        instanceName: data.id,
        integration: 'WHATSAPP-BAILEYS',
        qrcode: true
      }
    })
  } catch (e: any) {
    console.error('[manager/users] erro ao criar instância na UAZAPI', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    await supabase.from('users').delete().eq('id', data.id)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar instância na UAZAPI' })
  }

  const updatePayload = buildCompanyUpdatePayload(companyRecord, 1)
  await supabase.from('companies').update(updatePayload).eq('id', companyRecord.id)

  setResponseStatus(event, 201)

  return {
    user: mapAdminUserRow(data)
  }
})


