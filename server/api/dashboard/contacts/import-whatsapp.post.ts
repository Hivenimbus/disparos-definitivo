import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig, sanitizePhoneNumber } from '../../../utils/evolution'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type EvolutionContact = {
  remoteJid?: string | null
  pushName?: string | null
  isGroup?: boolean
  type?: string
}

type EvolutionContactsResponse = EvolutionContact[]

const extractPhoneFromJid = (remoteJid?: string | null) => {
  if (!remoteJid) return undefined
  const [rawNumber] = remoteJid.split('@')
  return sanitizePhoneNumber(rawNumber)
}

const buildContactName = (pushName?: string | null, whatsapp?: string) => {
  if (pushName?.trim()) return pushName.trim()
  if (whatsapp?.length) {
    const suffix = whatsapp.slice(-4)
    return `Contato ${suffix}`
  }
  return 'Contato'
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()

  let contacts: EvolutionContactsResponse = []

  try {
    contacts = await $fetch<EvolutionContactsResponse>(`/chat/findContacts/${user.id}`, {
      baseURL: evolutionApiUrl,
      method: 'POST',
      headers: {
        apikey: evolutionApiKey
      },
      body: {
        where: {}
      }
    })
  } catch (error: any) {
    console.error('[dashboard/contacts/import-whatsapp] Evolution API error', {
      status: error?.response?.status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível consultar os contatos no WhatsApp'
    })
  }

  if (!Array.isArray(contacts) || !contacts.length) {
    return { imported: 0 }
  }

  const normalizedContacts = contacts
    .filter((contact) => !contact.isGroup && contact.type === 'contact')
    .map((contact) => {
      const whatsapp = extractPhoneFromJid(contact.remoteJid)
      if (!whatsapp) return null

      return {
        user_id: user.id,
        name: buildContactName(contact.pushName, whatsapp),
        whatsapp
      }
    })
    .filter((contact): contact is { user_id: string; name: string; whatsapp: string } => Boolean(contact))

  const uniqueContactsMap = new Map<string, { user_id: string; name: string; whatsapp: string }>()
  normalizedContacts.forEach((contact) => {
    if (!uniqueContactsMap.has(contact.whatsapp)) {
      uniqueContactsMap.set(contact.whatsapp, contact)
    }
  })

  const uniqueContacts = Array.from(uniqueContactsMap.values())

  if (!uniqueContacts.length) {
    return { imported: 0 }
  }

  const supabase = getServiceSupabaseClient()

  const { data, error } = await supabase
    .from('dashboard_contacts')
    .insert(uniqueContacts)
    .select('id')

  if (error) {
    console.error('[dashboard/contacts/import-whatsapp] Supabase insert error', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível salvar os contatos importados'
    })
  }

  return {
    imported: data?.length ?? 0
  }
})



