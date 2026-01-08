import { createError, deleteCookie, getCookie } from 'h3'
import { verifyAuthToken } from '../../utils/jwt'
import { getServiceSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão não encontrada' })
  }

  let payload: ReturnType<typeof verifyAuthToken>

  try {
    payload = verifyAuthToken(token)
  } catch {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Sessão inválida' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, nome, email, role, status, empresa, numero, vencimento, created_at, must_change_password, maturador_enabled')
    .eq('id', payload.sub)
    .single()

  if (error || !user || user.status !== 'ativo') {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Usuário não autorizado' })
  }

  const { must_change_password, maturador_enabled, ...rest } = user as typeof user & { must_change_password: boolean; maturador_enabled: boolean }
  const formattedUser = {
    ...rest,
    mustChangePassword: must_change_password,
    maturadorEnabled: maturador_enabled ?? false
  }

  return {
    user: formattedUser
  }
})


