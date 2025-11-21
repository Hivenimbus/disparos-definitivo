import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getUazapiConfig, sanitizePhoneNumber } from '../../../utils/uazapi'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type UazapiContact = {
  contact_FirstName?: string | null
  contact_name?: string | null
  jid?: string | null
}

type UazapiContactsResponse = UazapiContact[]

const extractPhoneFromJid = (jid?: string | null) => {
  if (!jid) return undefined
  const [rawNumber] = jid.split('@')
  return sanitizePhoneNumber(rawNumber)
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { uazapiApiUrl } = getUazapiConfig()

  try {
    const response = await $fetch<UazapiContactsResponse>('/contacts', {
      baseURL: uazapiApiUrl,
      method: 'GET',
      headers: {
        token: user.uazapi_token
      }
    })
    const contacts = Array.isArray(response) ? response : []

    if (!contacts.length) {
      return { imported: 0 }
    }

    const normalizedContacts = contacts
      .map((contact) => {
        const whatsapp = extractPhoneFromJid(contact.jid)
        if (!whatsapp) return null

        return {
          user_id: user.id,
          name: contact.contact_name?.trim() ||
            contact.contact_FirstName?.trim() ||
            '',
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
    console.error('[dashboard/contacts/import-whatsapp] UAZAPI error', {
      status: error?.response?.status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível consultar os contatos no WhatsApp'
    })
  }
})



