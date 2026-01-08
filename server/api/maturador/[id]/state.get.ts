import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type EvolutionStatusResponse = {
  message?: string
  data?: {
    Connected?: boolean
    connected?: boolean
    LoggedIn?: boolean
    loggedIn?: boolean
    Name?: string
    name?: string
    MyJid?: string
    myJid?: string
  }
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const { evolutionApiUrl } = getEvolutionConfig()
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

  // Verificar estado da instância A
  let instanceAConnected = maturation.instance_a_connected
  let phoneA = maturation.phone_a

  try {
    const responseA = await $fetch<EvolutionStatusResponse>('/instance/status', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: maturation.instance_a_id
      }
    })

    const connectedA = Boolean(responseA?.data?.connected ?? responseA?.data?.Connected)
    const loggedInA = Boolean(responseA?.data?.loggedIn ?? responseA?.data?.LoggedIn)
    instanceAConnected = connectedA && loggedInA

    if (instanceAConnected) {
      const jidA = responseA?.data?.myJid ?? responseA?.data?.MyJid
      if (jidA) {
        phoneA = jidA.split('@')[0] || null
      }
    }
  } catch (e: any) {
    console.warn('[maturador/state] Erro ao verificar instância A:', e?.message)
  }

  // Verificar estado da instância B
  let instanceBConnected = maturation.instance_b_connected
  let phoneB = maturation.phone_b

  try {
    const responseB = await $fetch<EvolutionStatusResponse>('/instance/status', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: maturation.instance_b_id
      }
    })

    const connectedB = Boolean(responseB?.data?.connected ?? responseB?.data?.Connected)
    const loggedInB = Boolean(responseB?.data?.loggedIn ?? responseB?.data?.LoggedIn)
    instanceBConnected = connectedB && loggedInB

    if (instanceBConnected) {
      const jidB = responseB?.data?.myJid ?? responseB?.data?.MyJid
      if (jidB) {
        phoneB = jidB.split('@')[0] || null
      }
    }
  } catch (e: any) {
    console.warn('[maturador/state] Erro ao verificar instância B:', e?.message)
  }

  // Atualizar banco se houver mudanças
  const needsUpdate =
    instanceAConnected !== maturation.instance_a_connected ||
    instanceBConnected !== maturation.instance_b_connected ||
    phoneA !== maturation.phone_a ||
    phoneB !== maturation.phone_b

  if (needsUpdate) {
    await supabase
      .from('maturacoes')
      .update({
        instance_a_connected: instanceAConnected,
        instance_b_connected: instanceBConnected,
        phone_a: phoneA,
        phone_b: phoneB,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
  }

  return {
    id: maturation.id,
    status: maturation.status,
    instanceA: {
      id: maturation.instance_a_id,
      connected: instanceAConnected,
      phone: phoneA
    },
    instanceB: {
      id: maturation.instance_b_id,
      connected: instanceBConnected,
      phone: phoneB
    },
    bothConnected: instanceAConnected && instanceBConnected
  }
})
