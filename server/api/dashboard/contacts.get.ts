import { createError, getQuery } from 'h3'
import { requireAuthUser } from '../../utils/auth'
import { getServiceSupabaseClient } from '../../utils/supabase'

const DEFAULT_LIMIT = 20
const MAX_LIMIT = 100

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const query = getQuery(event)
  const limitParam = Number(query.limit)
  const pageParam = Number(query.page)

  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam))
  const page = Math.max(1, Number.isNaN(pageParam) ? 1 : pageParam)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('dashboard_contacts')
    .select('id, name, whatsapp, var1, var2, var3, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false, nullsFirst: false })
    .order('id', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[dashboard/contacts] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar contatos' })
  }

  const { count: totalCount, error: countError } = await supabase
    .from('dashboard_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  if (countError) {
    console.error('[dashboard/contacts] COUNT error', countError)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao calcular total de contatos' })
  }

  const validContactsCount = await supabase
    .from('dashboard_contacts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .neq('whatsapp', '')

  return {
    contacts: data ?? [],
    meta: {
      page,
      limit,
      total: totalCount ?? 0,
      validTotal: validContactsCount.count ?? 0
    }
  }
})


