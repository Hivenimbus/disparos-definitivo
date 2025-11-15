import { readBody, createError } from 'h3'
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

type UpdateUserPayload = {
  nome?: string
  email?: string
  password?: string
  role?: 'admin' | 'usuario'
  status?: 'ativo' | 'desativado'
  companyId?: string | null
  dataVencimento?: string
  celular?: string | null
  cpf?: string | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do usuário é obrigatório' })
  }

  const payload = (await readBody(event)) as UpdateUserPayload
  const supabase = getServiceSupabaseClient()

  const { data: existing, error: existingError } = await supabase
    .from('users')
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
        'updated_at'
      ].join(', ')
    )
    .eq('id', id)
    .single()

  if (existingError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  }

  const updates: Record<string, any> = {}
  const nextEmail = payload.email ? normalizeEmail(payload.email) : existing.email

  if (nextEmail !== existing.email) {
    const { data: emailOwner } = await supabase
      .from('users')
      .select('id')
      .eq('email', nextEmail)
      .neq('id', id)
      .maybeSingle()

    if (emailOwner) {
      throw createError({ statusCode: 409, statusMessage: 'Email já cadastrado' })
    }

    updates.email = nextEmail
  }

  if (payload.nome !== undefined) {
    if (!payload.nome.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Nome não pode ser vazio' })
    }
    updates.nome = payload.nome.trim()
  }

  if (payload.dataVencimento !== undefined) {
    if (!payload.dataVencimento) {
      throw createError({ statusCode: 400, statusMessage: 'Data de vencimento inválida' })
    }
    updates.vencimento = payload.dataVencimento
  }

  if (payload.celular !== undefined) {
    updates.numero = payload.celular?.trim() || null
  }

  if (payload.cpf !== undefined) {
    updates.cpf = payload.cpf?.trim() || null
  }

  if (payload.role !== undefined) {
    updates.role = mapRoleToDb(payload.role)
  }

  const companyIdTarget = payload.companyId !== undefined ? payload.companyId : existing.company_id
  let companyRecord: Awaited<ReturnType<typeof fetchCompanyById>> | null = null

  if (companyIdTarget) {
    companyRecord = await fetchCompanyById(supabase, companyIdTarget)
  }

  if (payload.status !== undefined) {
    if (companyRecord && companyRecord.status === 'desativado' && payload.status === 'ativo') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Não é possível ativar usuário vinculado a empresa desativada.'
      })
    }
    updates.status = mapStatusToDb(payload.status)
  }

  if (payload.password !== undefined) {
    if (payload.password && payload.password.length < 8) {
      throw createError({ statusCode: 400, statusMessage: 'Senha deve ter ao menos 8 caracteres' })
    }
    if (payload.password) {
      updates.senha_hash = await hashPassword(payload.password)
      updates.must_change_password = true
    }
  }

  let newCompany = payload.companyId ?? existing.company_id

  if (payload.companyId !== undefined) {
    newCompany = payload.companyId

    if (payload.companyId) {
      companyRecord = await fetchCompanyById(supabase, payload.companyId)
      if (companyRecord.status === 'desativado') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Não é possível vincular usuário a uma empresa desativada.'
        })
      }
      if (payload.companyId !== existing.company_id) {
        ensureCompanyCapacity(companyRecord)
      }
      updates.empresa = companyRecord.nome
    } else {
      updates.company_id = null
      updates.empresa = null
    }
  }

  if (newCompany && payload.companyId === undefined) {
    updates.company_id = existing.company_id
  } else if (payload.companyId !== undefined) {
    updates.company_id = newCompany
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
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
    console.error('[admin/users] PUT error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar usuário' })
  }

  const oldCompanyId = existing.company_id
  const newCompanyId = payload.companyId !== undefined ? payload.companyId : existing.company_id

  if (oldCompanyId && oldCompanyId !== newCompanyId) {
    const { data: oldCompany } = await supabase
      .from('companies')
      .select('id, usuarios_atuais')
      .eq('id', oldCompanyId)
      .maybeSingle()

    if (oldCompany) {
      const novoValor = Math.max(0, oldCompany.usuarios_atuais - 1)
      const { error: decrementError } = await supabase
        .from('companies')
        .update({ usuarios_atuais: novoValor })
        .eq('id', oldCompanyId)

      if (decrementError) {
        console.error('[admin/users] erro ao decrementar empresa antiga', decrementError)
      }
    }
  }

  if (newCompanyId && newCompanyId !== oldCompanyId) {
    const record = companyRecord || (await fetchCompanyById(supabase, newCompanyId))
    const updatePayload = buildCompanyUpdatePayload(record, 1)
    const { error: incrementError } = await supabase
      .from('companies')
      .update(updatePayload)
      .eq('id', newCompanyId)

    if (incrementError) {
      console.error('[admin/users] erro ao incrementar empresa nova', incrementError)
    }
  }

  return {
    user: mapAdminUserRow(data)
  }
})


