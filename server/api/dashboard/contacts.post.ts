import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../utils/auth'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { normalizeContactVariableOrNull } from '../../../shared/normalize-contact-variable'

type ContactPayload = {
  name?: string
  whatsapp?: string
  var1?: string | null
  var2?: string | null
  var3?: string | null
}

const normalizeContact = (contact: ContactPayload, userId: string) => {
  if (!contact?.whatsapp?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'WhatsApp é obrigatório' })
  }

  return {
    user_id: userId,
    name: contact.name?.trim() || '',
    whatsapp: contact.whatsapp.trim(),
    var1: normalizeContactVariableOrNull(contact.var1),
    var2: normalizeContactVariableOrNull(contact.var2),
    var3: normalizeContactVariableOrNull(contact.var3)
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

  // Use upsert to prevent duplicates - if contact with same user_id + whatsapp exists, update it
  const { data, error } = await supabase
    .from('dashboard_contacts')
    .upsert(records, {
      onConflict: 'user_id,whatsapp',
      ignoreDuplicates: false
    })
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


