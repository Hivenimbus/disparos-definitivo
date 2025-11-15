import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../utils/auth'
import { getServiceSupabaseClient } from '../../utils/supabase'

type ContactPayload = {
  name?: string
  whatsapp?: string
  var1?: string | null
  var2?: string | null
  var3?: string | null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = (await readBody(event)) as ContactPayload

  if (!body?.name?.trim() || !body?.whatsapp?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome e WhatsApp são obrigatórios' })
  }

  const supabase = getServiceSupabaseClient()
  const payload = {
    user_id: user.id,
    name: body.name.trim(),
    whatsapp: body.whatsapp.trim(),
    var1: body.var1?.trim() || null,
    var2: body.var2?.trim() || null,
    var3: body.var3?.trim() || null
  }

  const { data, error } = await supabase
    .from('dashboard_contacts')
    .insert(payload)
    .select('id, name, whatsapp, var1, var2, var3, created_at, updated_at')
    .single()

  if (error || !data) {
    console.error('[dashboard/contacts] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível salvar o contato' })
  }

  return {
    contact: data
  }
})


