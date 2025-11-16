import { createError, readBody } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth-user'

type UpdateConfigPayload = {
  intervalo?: number
  limite?: number
}

const validatePayload = (payload: UpdateConfigPayload) => {
  if (
    payload.intervalo !== undefined &&
    (typeof payload.intervalo !== 'number' || payload.intervalo < 1)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Intervalo deve ser um número maior ou igual a 1'
    })
  }

  if (payload.limite !== undefined && (typeof payload.limite !== 'number' || payload.limite < 1)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Limite diário deve ser um número maior ou igual a 1'
    })
  }

  if (payload.intervalo === undefined && payload.limite === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Nenhum campo informado para atualização'
    })
  }
}

export default defineEventHandler(async (event) => {
  const authUser = requireAuthUser(event)
  const payload = (await readBody(event)) as UpdateConfigPayload
  validatePayload(payload)

  const supabase = getServiceSupabaseClient()

  const { data: existing, error: fetchError } = await supabase
    .from('configuracoes')
    .select('id')
    .eq('user_id', authUser.sub)
    .maybeSingle()

  if (fetchError) {
    console.error('[configuracoes] PUT fetch error', fetchError)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao buscar configuração' })
  }

  if (!existing) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Configuração não encontrada para este usuário'
    })
  }

  const { data, error } = await supabase
    .from('configuracoes')
    .update({
      intervalo_segundos: payload.intervalo ?? undefined,
      limite_diario: payload.limite ?? undefined,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', authUser.sub)
    .select('intervalo_segundos, limite_diario')
    .single()

  if (error || !data) {
    console.error('[configuracoes] PUT update error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao salvar configurações' })
  }

  return {
    configuracoes: {
      intervalo: data.intervalo_segundos,
      limite: data.limite_diario
    }
  }
})













