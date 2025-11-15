import { createError, getCookie } from 'h3'
import { readBody } from 'h3'
import { verifyAuthToken } from '../../utils/jwt'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { hashPassword } from '../../utils/password'

type SetPasswordBody = {
  newPassword: string
  confirmPassword?: string
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, 'auth_token')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sessão não encontrada' })
  }

  let payload: ReturnType<typeof verifyAuthToken>

  try {
    payload = verifyAuthToken(token)
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Sessão inválida' })
  }

  const body = (await readBody(event)) as SetPasswordBody

  if (!body?.newPassword || body.newPassword.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'A nova senha deve ter ao menos 8 caracteres.'
    })
  }

  if (body.confirmPassword !== undefined && body.confirmPassword !== body.newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'As senhas não coincidem.'
    })
  }

  const supabase = getServiceSupabaseClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, status, must_change_password')
    .eq('id', payload.sub)
    .single()

  if (error || !user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado.' })
  }

  if (user.status !== 'ativo') {
    throw createError({ statusCode: 403, statusMessage: 'Usuário desativado.' })
  }

  const passwordHash = await hashPassword(body.newPassword)

  const { error: updateError } = await supabase
    .from('users')
    .update({
      senha_hash: passwordHash,
      must_change_password: false
    })
    .eq('id', user.id)

  if (updateError) {
    console.error('[auth/set-password] erro ao atualizar senha', updateError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível atualizar a senha.' })
  }

  return {
    success: true
  }
})


