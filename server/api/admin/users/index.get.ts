import { createError } from 'h3'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { mapAdminUserRow } from '../../../utils/users'

export default defineEventHandler(async () => {
  const supabase = getServiceSupabaseClient()

  const { data, error } = await supabase
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
        'companies:company_id (id, nome, max_usuarios, usuarios_atuais)'
      ].join(', ')
    )
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[admin/users] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao listar usuários' })
  }

  return {
    users: (data ?? []).map(mapAdminUserRow)
  }
})


