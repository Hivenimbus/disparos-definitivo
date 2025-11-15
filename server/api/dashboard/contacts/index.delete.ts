import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type DeleteContactBody = {
  contactId?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const body = (await readBody(event)) as DeleteContactBody

  if (!body?.contactId) {
    throw createError({ statusCode: 400, statusMessage: 'contactId é obrigatório' })
  }

  const { error } = await supabase
    .from('dashboard_contacts')
    .delete()
    .eq('id', body.contactId)
    .eq('user_id', user.id)

  if (error) {
    console.error('[dashboard/contacts] DELETE error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover o contato' })
  }

  return { success: true }
})


