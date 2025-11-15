import type { H3Event } from 'h3'
import { createError, deleteCookie, getCookie } from 'h3'
import { verifyAuthToken } from './jwt'

export const requireAuthUser = (event: H3Event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão não encontrada' })
  }

  try {
    return verifyAuthToken(token)
  } catch {
    deleteCookie(event, 'auth_token')
    throw createError({ statusCode: 401, statusMessage: 'Sessão inválida' })
  }
}


