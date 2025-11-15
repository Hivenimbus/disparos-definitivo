import { createError } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { error, count } = await supabase
    .from('dashboard_contacts')
    .delete({ count: 'exact' })
    .eq('user_id', user.id)
    .select('id', { count: 'exact', head: true })

  if (error) {
    console.error('[dashboard/contacts] bulk delete error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover os contatos' })
  }

  return { success: true, deleted: count ?? 0 }
})


