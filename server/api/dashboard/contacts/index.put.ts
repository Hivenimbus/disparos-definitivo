import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { normalizeContactVariableOrNull } from '../../../../shared/normalize-contact-variable'

type UpdateContactBody = {
  id?: string
  name?: string
  whatsapp?: string
  var1?: string | null
  var2?: string | null
  var3?: string | null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = (await readBody(event)) as UpdateContactBody

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do contato é obrigatório' })
  }

  if (!body?.name?.trim() || !body?.whatsapp?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome e WhatsApp são obrigatórios' })
  }

  const supabase = getServiceSupabaseClient()

  const payload = {
    name: body.name.trim(),
    whatsapp: body.whatsapp.trim(),
    var1: normalizeContactVariableOrNull(body.var1),
    var2: normalizeContactVariableOrNull(body.var2),
    var3: normalizeContactVariableOrNull(body.var3)
  }

  const { data, error } = await supabase
    .from('dashboard_contacts')
    .update(payload)
    .eq('id', body.id)
    .eq('user_id', user.id)
    .select('id, name, whatsapp, var1, var2, var3, created_at, updated_at')
    .single()

  if (error || !data) {
    console.error('[dashboard/contacts] PUT error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível atualizar o contato' })
  }

  return {
    contact: data
  }
})


