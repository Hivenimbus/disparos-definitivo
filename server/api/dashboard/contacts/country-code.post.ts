import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type CountryCodeBody = {
  countryCode?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { countryCode } = (await readBody(event)) as CountryCodeBody

  const code = countryCode?.replace(/\D/g, '')

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: 'Código do país inválido' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: updatedCount, error } = await supabase.rpc('apply_country_code_to_contacts', {
    code_prefix: code,
    filter_user_id: user.id
  })

  if (error) {
    console.error('[dashboard/contacts] country-code error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível aplicar o código do país' })
  }

  return { success: true, updated: updatedCount ?? 0 }
})


