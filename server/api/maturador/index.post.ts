import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../utils/auth'
import { getEvolutionConfig } from '../../utils/evolution'
import { getServiceSupabaseClient } from '../../utils/supabase'

type MaturationTypeOption = 'rapida' | 'media' | 'completa'
type IntervalTypeOption = '15-30' | '30-45' | '45-60'

const MATURATION_MESSAGES: Record<MaturationTypeOption, number> = {
  rapida: 60,
  media: 120,
  completa: 240
}

const MAX_ACTIVE_MATURATIONS = 5

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()

  const body = await readBody<{
    maturation_type: MaturationTypeOption
    interval_type: IntervalTypeOption
  }>(event)

  // Validar campos obrigatórios
  if (!body.maturation_type || !body.interval_type) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipo de maturação e intervalo são obrigatórios'
    })
  }

  // Validar valores
  if (!['rapida', 'media', 'completa'].includes(body.maturation_type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipo de maturação inválido'
    })
  }

  if (!['15-30', '30-45', '45-60'].includes(body.interval_type)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tipo de intervalo inválido'
    })
  }

  // Verificar limite de maturações ativas
  const { count, error: countError } = await supabase
    .from('maturacoes')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .not('status', 'in', '("completed","stopped")')

  if (countError) {
    console.error('[maturador/create] Erro ao contar maturações:', countError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao verificar limite de maturações'
    })
  }

  if ((count ?? 0) >= MAX_ACTIVE_MATURATIONS) {
    throw createError({
      statusCode: 409,
      statusMessage: `Limite de ${MAX_ACTIVE_MATURATIONS} maturações ativas atingido`
    })
  }

  // Gerar UUIDs para as instâncias
  const instanceAId = crypto.randomUUID()
  const instanceBId = crypto.randomUUID()

  // Criar instância A na Evolution API
  try {
    await $fetch('/instance/create', {
      baseURL: evolutionApiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey
      },
      body: {
        name: instanceAId, // Compatibilidade com versões antigas (v1.5-)
        instanceName: instanceAId, // Compatibilidade com versões novas (v1.6+)
        token: instanceAId,
        qrcode: true
      }
    })
  } catch (e: any) {
    // Se já existe, consideramos sucesso
    const errorMsg = e?.response?._data?.error || e?.data?.error || ''
    if (e?.response?.status !== 403 && !errorMsg.includes('already exists')) {
      console.error('[maturador/create] Erro ao criar instância A:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.data || e?.response?._data || null
      })
      throw createError({
        statusCode: 502,
        statusMessage: 'Erro ao criar instância A na Evolution API'
      })
    }
  }

  // Criar instância B na Evolution API
  try {
    await $fetch('/instance/create', {
      baseURL: evolutionApiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey
      },
      body: {
        name: instanceBId, // Compatibilidade com versões antigas (v1.5-)
        instanceName: instanceBId, // Compatibilidade com versões novas (v1.6+)
        token: instanceBId,
        qrcode: true
      }
    })
  } catch (e: any) {
    // Se já existe, consideramos sucesso
    const errorMsg = e?.response?._data?.error || e?.data?.error || ''
    if (e?.response?.status !== 403 && !errorMsg.includes('already exists')) {
      console.error('[maturador/create] Erro ao criar instância B:', {
        message: e?.message,
        status: e?.response?.status,
        data: e?.data || e?.response?._data || null
      })
      
      // Tentar remover instância A que já foi criada
      try {
        await $fetch(`/instance/delete/${instanceAId}`, {
          baseURL: evolutionApiUrl,
          method: 'DELETE',
          headers: { apikey: evolutionApiKey }
        })
      } catch {}

      throw createError({
        statusCode: 502,
        statusMessage: 'Erro ao criar instância B na Evolution API'
      })
    }
  }

  // Criar registro no banco de dados
  const totalMessages = MATURATION_MESSAGES[body.maturation_type]

  const { data: maturation, error: insertError } = await supabase
    .from('maturacoes')
    .insert({
      user_id: user.id,
      instance_a_id: instanceAId,
      instance_b_id: instanceBId,
      instance_a_connected: false,
      instance_b_connected: false,
      maturation_type: body.maturation_type,
      interval_type: body.interval_type,
      total_messages: totalMessages,
      messages_sent: 0,
      status: 'connecting'
    })
    .select()
    .single()

  if (insertError || !maturation) {
    console.error('[maturador/create] Erro ao inserir maturação:', insertError)
    
    // Tentar remover instâncias criadas
    try {
      await $fetch(`/instance/delete/${instanceAId}`, {
        baseURL: evolutionApiUrl,
        method: 'DELETE',
        headers: { apikey: evolutionApiKey }
      })
    } catch {}
    
    try {
      await $fetch(`/instance/delete/${instanceBId}`, {
        baseURL: evolutionApiUrl,
        method: 'DELETE',
        headers: { apikey: evolutionApiKey }
      })
    } catch {}

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao criar maturação no banco de dados'
    })
  }

  return {
    success: true,
    maturation: {
      id: maturation.id,
      instance_a_id: maturation.instance_a_id,
      instance_b_id: maturation.instance_b_id,
      maturation_type: maturation.maturation_type,
      interval_type: maturation.interval_type,
      total_messages: maturation.total_messages,
      status: maturation.status
    }
  }
})
