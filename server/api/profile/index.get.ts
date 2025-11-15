import { createError } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth-user'

const PROFILE_FIELDS =
  'id, nome, email, empresa, numero, vencimento, status, role, created_at, updated_at'

export default defineEventHandler(async (event) => {
  const payload = requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { data, error } = await supabase
    .from('users')
    .select(PROFILE_FIELDS)
    .eq('id', payload.sub)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Perfil não encontrado'
    })
  }

  return {
    profile: data
  }
})


