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
    .select('id, nome, email, role, status, empresa, numero, vencimento, created_at')
    .eq('id', payload.sub)
    .single()

  if (error || !user || user.status !== 'ativo') {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Usuário não autorizado' })
  }

  return {
    user
  }
})


