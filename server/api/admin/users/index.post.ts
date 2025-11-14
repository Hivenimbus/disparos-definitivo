import { readBody, createError, setResponseStatus } from 'h3'
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

type CreateUserPayload = {
  nome: string
  email: string
  password: string
  role?: 'admin' | 'usuario'
  status?: 'ativo' | 'bloqueado'
  companyId?: string | null
  dataVencimento: string
  celular?: string | null
  cpf?: string | null
}

const validateCreatePayload = (payload: CreateUserPayload) => {
  if (!payload?.nome?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' })
  }

  if (!payload?.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email é obrigatório' })
  }

  if (!payload?.password || payload.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Senha deve ter ao menos 8 caracteres' })
  }

  if (!payload?.dataVencimento) {
    throw createError({ statusCode: 400, statusMessage: 'Data de vencimento é obrigatória' })
  }
}

export default defineEventHandler(async (event) => {
  const payload = (await readBody(event)) as CreateUserPayload
  validateCreatePayload(payload)

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
  }

  const hashedPassword = await hashPassword(payload.password)
  const statusDb = mapStatusToDb(payload.status)
  const roleDb = mapRoleToDb(payload.role)

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
      vencimento: payload.dataVencimento,
      numero: payload.celular?.trim() || null,
      cpf: payload.cpf?.trim() || null
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
        'companies:company_id (id, nome, max_usuarios, usuarios_atuais)'
      ].join(', ')
    )
    .single()

  if (error || !data) {
    console.error('[admin/users] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar usuário' })
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


