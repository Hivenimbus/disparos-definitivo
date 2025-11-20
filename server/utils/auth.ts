import { createError, deleteCookie, getCookie, type H3Event } from 'h3'
import { verifyAuthToken } from './jwt'
import { getServiceSupabaseClient } from './supabase'

export type AuthenticatedUser = {
  id: string
  nome: string
  email: string
  status: 'ativo' | 'desativado'
  role: 'admin' | 'manager' | 'user'
  company_id: string | null
  uazapi_token: string
}

export const requireAuthUser = async (event: H3Event): Promise<AuthenticatedUser> => {
  const sessionToken = getCookie(event, 'auth_token')

  if (!sessionToken) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão não encontrada' })
  }

  let payload: ReturnType<typeof verifyAuthToken>

  try {
    payload = verifyAuthToken(sessionToken)
  } catch {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Sessão inválida' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, nome, email, status, role, company_id, uazapi_token')
    .eq('id', payload.sub)
    .single()

  if (error || !user || user.status !== 'ativo') {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Usuário não autorizado' })
  }

  const uazapiToken = user.uazapi_token?.trim()

  if (!uazapiToken) {
    deleteCookie(event, 'auth_token')
    throw createError({
      statusCode: 412,
      statusMessage: 'Token da UAZAPI não configurado para este usuário'
    })
  }

  return {
    ...user,
    uazapi_token: uazapiToken
  } as AuthenticatedUser
}


