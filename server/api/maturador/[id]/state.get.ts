import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type EvolutionInstance = {
  id?: string
  name?: string
  jid?: string
  connected?: boolean
}

// Extrai o número de telefone do JID
// Ex: "559591711956:93@s.whatsapp.net" -> "559591711956"
function extractPhoneFromJid(jid: string | undefined | null): string | null {
  if (!jid) return null
  // Remove a parte após o @
  const withoutDomain = jid.split('@')[0]
  // Remove a parte após o : (se existir)
  const phoneOnly = withoutDomain.split(':')[0]
  return phoneOnly || null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()
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

  // Buscar todas as instâncias da Evolution API para obter o JID
  let allInstances: EvolutionInstance[] = []
  try {
    const response = await $fetch<{ data?: EvolutionInstance[] }>('/instance/all', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: evolutionApiKey
      }
    })
    allInstances = response?.data || []
  } catch (e: any) {
    console.warn('[maturador/state] Erro ao buscar instâncias:', e?.message)
  }

  // Encontrar instância A pelo nome (que é o UUID)
  const instanceA = allInstances.find(i => i.name === maturation.instance_a_id)
  let instanceAConnected = Boolean(instanceA?.connected)
  let phoneA = maturation.phone_a

  if (instanceAConnected && instanceA?.jid) {
    const extractedPhone = extractPhoneFromJid(instanceA.jid)
    if (extractedPhone) {
      phoneA = extractedPhone
    }
  }

  // Encontrar instância B pelo nome (que é o UUID)
  const instanceB = allInstances.find(i => i.name === maturation.instance_b_id)
  let instanceBConnected = Boolean(instanceB?.connected)
  let phoneB = maturation.phone_b

  if (instanceBConnected && instanceB?.jid) {
    const extractedPhone = extractPhoneFromJid(instanceB.jid)
    if (extractedPhone) {
      phoneB = extractedPhone
    }
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
