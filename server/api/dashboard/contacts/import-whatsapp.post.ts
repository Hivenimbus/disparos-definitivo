import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { buildEvolutionHeaders, getEvolutionConfig, sanitizePhoneNumber } from '../../../utils/evolution'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type EvolutionApiContact = {
  Jid?: string | null
  PushName?: string | null
  Found?: boolean
}

type EvolutionContactsResponse = {
  message?: string
  data?: EvolutionApiContact[]
}

const extractPhoneFromJid = (jid?: string | null) => {
  if (!jid) return undefined
  const [rawNumber] = jid.split('@')
  return sanitizePhoneNumber(rawNumber)
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl } = getEvolutionConfig()

  try {
    const response = await $fetch<EvolutionContactsResponse>('/user/contacts', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: buildEvolutionHeaders(user.id)
    })
    const contacts = Array.isArray(response?.data) ? response.data : []

    if (!contacts.length) {
      return { imported: 0 }
    }

    const normalizedContacts = contacts
      .map((contact) => {
        const whatsapp = extractPhoneFromJid(contact.Jid)
        if (!whatsapp) return null

        return {
          user_id: user.id,
          name: contact.PushName?.trim() || '',
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
})



