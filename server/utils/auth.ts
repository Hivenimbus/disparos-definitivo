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
}

export const requireAuthUser = async (event: H3Event): Promise<AuthenticatedUser> => {
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
    .select('id, nome, email, status, role, company_id')
    .eq('id', payload.sub)
    .single()

  if (error || !user || user.status !== 'ativo') {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Usuário não autorizado' })
  }

  return user as AuthenticatedUser
}


