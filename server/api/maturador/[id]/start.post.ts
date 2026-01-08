import { createError } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const config = useRuntimeConfig()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da maturação é obrigatório'
    })
  }

  // Buscar maturação do usuário
  const { data: maturation, error } = await supabase
    .from('maturacoes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !maturation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Maturação não encontrada'
    })
  }

  // Verificar se ambas instâncias estão conectadas
  if (!maturation.instance_a_connected || !maturation.instance_b_connected) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Ambos os números precisam estar conectados para iniciar a maturação'
    })
  }

  // Verificar se já está rodando
  if (maturation.status === 'running') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Maturação já está em execução'
    })
  }

  // Verificar se já foi completada ou parada
  if (maturation.status === 'completed' || maturation.status === 'stopped') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Esta maturação já foi finalizada'
    })
  }

  // Chamar o worker Go para iniciar a maturação
  const maturationWorkerUrl = config.maturationWorkerUrl || config.workerServiceUrl?.replace(':8080', ':8081')
  const workerToken = config.workerToken

  if (!maturationWorkerUrl) {
    // Fallback: atualizar direto no banco se o worker não estiver configurado
    console.warn('[maturador/start] MATURATION_WORKER_URL não configurado, atualizando apenas o status')
    
    const { error: updateError } = await supabase
      .from('maturacoes')
      .update({
        status: 'running',
        started_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      console.error('[maturador/start] Erro ao atualizar maturação:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao iniciar maturação'
      })
    }

    return {
      success: true,
      message: 'Maturação iniciada (modo fallback)',
      maturation: {
        id: maturation.id,
        status: 'running',
        phoneA: maturation.phone_a,
        phoneB: maturation.phone_b,
        totalMessages: maturation.total_messages,
        messagesSent: maturation.messages_sent
      }
    }
  }

  // Chamar worker Go
  try {
    const workerResponse = await $fetch<{ maturation: { id: string; status: string; messages_sent: number; total_messages: number } }>('/maturation/start', {
      baseURL: maturationWorkerUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Worker-Token': workerToken
      },
      body: {
        maturation_id: id
      }
    })

    return {
      success: true,
      message: 'Maturação iniciada com sucesso',
      maturation: {
        id: maturation.id,
        status: workerResponse.maturation?.status || 'running',
        phoneA: maturation.phone_a,
        phoneB: maturation.phone_b,
        totalMessages: maturation.total_messages,
        messagesSent: workerResponse.maturation?.messages_sent || maturation.messages_sent
      }
    }
  } catch (workerError: any) {
    console.error('[maturador/start] Erro ao chamar worker:', workerError?.message, workerError?.response?._data)
    
    // Se o worker retornou um erro específico, propagar
    if (workerError?.response?._data?.error) {
      throw createError({
        statusCode: workerError?.response?.status || 500,
        statusMessage: workerError.response._data.error
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao iniciar maturação no worker'
    })
  }
})
