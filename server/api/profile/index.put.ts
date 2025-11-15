import { createError, readBody } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth-user'

type ProfileUpdateBody = {
  nome?: string
}

const PROFILE_FIELDS =
  'id, nome, email, empresa, numero, vencimento, status, role, created_at, updated_at'

export default defineEventHandler(async (event) => {
  const payload = requireAuthUser(event)
  const body = (await readBody(event)) as ProfileUpdateBody
  const supabase = getServiceSupabaseClient()

  const nome = typeof body?.nome === 'string' ? body.nome.trim() : ''

  if (!nome) {
    throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' })
  }

  const updates = {
    nome,
    updated_at: new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', payload.sub)
    .select(PROFILE_FIELDS)
    .single()

  if (error || !data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Não foi possível atualizar o perfil'
    })
  }

  return {
    profile: data
  }
})


