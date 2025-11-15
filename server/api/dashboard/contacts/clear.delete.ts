import { createError } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { error } = await supabase
    .from('dashboard_contacts')
    .delete()
    .eq('user_id', user.id)

  if (error) {
    console.error('[dashboard/contacts] bulk delete error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover os contatos' })
  }

  return { success: true }
})


