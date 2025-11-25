import { createError, readBody } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'
import { verifyPassword, hashPassword } from '../../utils/password'

type PasswordUpdateBody = {
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

const MIN_PASSWORD_LENGTH = 8

export default defineEventHandler(async (event) => {
  const payload = await requireAuthUser(event)
  const body = (await readBody(event)) as PasswordUpdateBody
  const supabase = getServiceSupabaseClient()

  const currentPassword = body?.currentPassword?.trim() || ''
  const newPassword = body?.newPassword?.trim() || ''
  const confirmPassword = body?.confirmPassword?.trim() || ''

  if (!currentPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Senha atual é obrigatória' })
  }

  if (!newPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Nova senha é obrigatória' })
  }

  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `A nova senha deve ter no mínimo ${MIN_PASSWORD_LENGTH} caracteres`
    })
  }

  if (newPassword !== confirmPassword) {
    throw createError({ statusCode: 400, statusMessage: 'As senhas não coincidem' })
  }

  const { data: user, error } = await supabase
    .from('users')
    .select('id, senha_hash')
    .eq('id', payload.id)
    .single()

  if (error || !user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Usuário não encontrado'
    })
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.senha_hash)

  if (!isCurrentPasswordValid) {
    throw createError({ statusCode: 400, statusMessage: 'Senha atual incorreta' })
  }

  const newPasswordHash = await hashPassword(newPassword)

  const { error: updateError } = await supabase
    .from('users')
    .update({
      senha_hash: newPasswordHash,
      updated_at: new Date().toISOString()
    })
    .eq('id', payload.id)

  if (updateError) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível atualizar a senha. Tente novamente.'
    })
  }

  return {
    success: true
  }
})


