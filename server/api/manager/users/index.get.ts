import { createError } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { fetchCompanyById, mapAdminUserRow } from '../../../utils/users'

const mapCompanyToResponse = (company: Awaited<ReturnType<typeof fetchCompanyById>>) => ({
  id: company.id,
  nome: company.nome,
  maxUsuarios: company.max_usuarios,
  usuariosAtuais: company.usuarios_atuais,
  dataVencimento: company.data_vencimento ?? null
})

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'manager') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso restrito aos gerentes' })
  }

  if (!authUser.company_id) {
    throw createError({ statusCode: 400, statusMessage: 'Gerente não vinculado a uma empresa' })
  }

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
        'must_change_password',
        'companies:company_id (id, nome, max_usuarios, usuarios_atuais)'
      ].join(', ')
    )
    .eq('company_id', authUser.company_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[manager/users] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao listar usuários' })
  }

  const company = await fetchCompanyById(supabase, authUser.company_id)

  return {
    users: (data ?? []).map(mapAdminUserRow),
    company: mapCompanyToResponse(company)
  }
})





