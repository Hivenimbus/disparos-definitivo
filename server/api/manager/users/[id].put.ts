import { readBody, createError } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { mapAdminUserRow, mapStatusToDb, normalizeEmail } from '../../../utils/users'
import { hashPassword } from '../../../utils/password'

type UpdateManagerUserPayload = {
  nome?: string
  email?: string
  password?: string
  status?: 'ativo' | 'desativado'
  celular?: string | null
  cpf?: string | null
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do usuário é obrigatório' })
  }

  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'manager') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso restrito aos gerentes' })
  }

  if (!authUser.company_id) {
    throw createError({ statusCode: 400, statusMessage: 'Gerente não vinculado a uma empresa' })
  }

  const payload = (await readBody(event)) as UpdateManagerUserPayload
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
        'updated_at',
        'must_change_password'
      ].join(', ')
    )
    .eq('id', id)
    .single()

  if (existingError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  }

  if (existing.company_id !== authUser.company_id) {
    throw createError({ statusCode: 403, statusMessage: 'Você não pode editar usuários de outra empresa.' })
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

  if (payload.celular !== undefined) {
    updates.numero = payload.celular?.trim() || null
  }

  if (payload.cpf !== undefined) {
    updates.cpf = payload.cpf?.trim() || null
  }

  if (payload.status !== undefined) {
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

  if (Object.keys(updates).length === 0) {
    return {
      user: mapAdminUserRow(existing)
    }
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
    console.error('[manager/users] PUT error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar usuário' })
  }

  return {
    user: mapAdminUserRow(data)
  }
})


