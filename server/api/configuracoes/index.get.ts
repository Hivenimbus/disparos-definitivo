import { createError } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth-user'

const DEFAULT_INTERVALO = 10
const DEFAULT_LIMITE = 1000

export default defineEventHandler(async (event) => {
  const authUser = requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { data: config, error } = await supabase
    .from('configuracoes')
    .select('id, intervalo_segundos, limite_diario')
    .eq('user_id', authUser.sub)
    .maybeSingle()

  if (error) {
    console.error('[configuracoes] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar configurações' })
  }

  if (config) {
    return {
      configuracoes: {
        intervalo: config.intervalo_segundos,
        limite: config.limite_diario
      }
    }
  }

  const { data: created, error: createErrorResult } = await supabase
    .from('configuracoes')
    .insert({
      user_id: authUser.sub,
      intervalo_segundos: DEFAULT_INTERVALO,
      limite_diario: DEFAULT_LIMITE
    })
    .select('intervalo_segundos, limite_diario')
    .single()

  if (createErrorResult || !created) {
    console.error('[configuracoes] Erro ao criar configuração padrão', createErrorResult)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar configuração padrão' })
  }

  return {
    configuracoes: {
      intervalo: created.intervalo_segundos,
      limite: created.limite_diario
    }
  }
})





