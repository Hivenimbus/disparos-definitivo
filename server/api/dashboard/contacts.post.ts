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

const normalizeContact = (contact: ContactPayload, userId: string) => {
  if (!contact?.name?.trim() || !contact?.whatsapp?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome e WhatsApp são obrigatórios' })
  }

  return {
    user_id: userId,
    name: contact.name.trim(),
    whatsapp: contact.whatsapp.trim(),
    var1: contact.var1?.trim() || null,
    var2: contact.var2?.trim() || null,
    var3: contact.var3?.trim() || null
  }
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const body = await readBody(event)

  let contactsPayload: ContactPayload[] = []

  if (Array.isArray(body)) {
    contactsPayload = body
  } else if (Array.isArray(body?.contacts)) {
    contactsPayload = body.contacts
  } else if (body && typeof body === 'object') {
    contactsPayload = [body as ContactPayload]
  }

  if (!contactsPayload.length) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum contato enviado' })
  }

  const records = contactsPayload.map((contact) => normalizeContact(contact, user.id))

  const supabase = getServiceSupabaseClient()

  const { data, error } = await supabase
    .from('dashboard_contacts')
    .insert(records)
    .select('id, name, whatsapp, var1, var2, var3, created_at, updated_at')

  if (error || !data?.length) {
    console.error('[dashboard/contacts] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível salvar os contatos' })
  }

  return {
    contacts: data,
    contact: data.length === 1 ? data[0] : undefined
  }
})


