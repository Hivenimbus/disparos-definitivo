import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type EvolutionQrResponse = {
  message?: string
  data?: {
    Qrcode?: string
    qrcode?: string
    Code?: string
    code?: string
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

  // Buscar QR Code da instância A
  let qrCodeA: string | null = null
  let pairingCodeA: string | null = null

  if (!maturation.instance_a_connected) {
    try {
      const responseA = await $fetch<EvolutionQrResponse>('/instance/qr', {
        baseURL: evolutionApiUrl,
        method: 'GET',
        headers: {
          apikey: maturation.instance_a_id
        }
      })
      qrCodeA = responseA?.data?.Qrcode ?? responseA?.data?.qrcode ?? null
      pairingCodeA = responseA?.data?.Code ?? responseA?.data?.code ?? null
    } catch (e: any) {
      console.warn('[maturador/qrcode] Erro ao buscar QR Code A:', e?.message)
    }
  }

  // Buscar QR Code da instância B
  let qrCodeB: string | null = null
  let pairingCodeB: string | null = null

  if (!maturation.instance_b_connected) {
    try {
      const responseB = await $fetch<EvolutionQrResponse>('/instance/qr', {
        baseURL: evolutionApiUrl,
        method: 'GET',
        headers: {
          apikey: maturation.instance_b_id
        }
      })
      qrCodeB = responseB?.data?.Qrcode ?? responseB?.data?.qrcode ?? null
      pairingCodeB = responseB?.data?.Code ?? responseB?.data?.code ?? null
    } catch (e: any) {
      console.warn('[maturador/qrcode] Erro ao buscar QR Code B:', e?.message)
    }
  }

  return {
    instanceA: {
      id: maturation.instance_a_id,
      connected: maturation.instance_a_connected,
      qrCode: qrCodeA,
      pairingCode: pairingCodeA
    },
    instanceB: {
      id: maturation.instance_b_id,
      connected: maturation.instance_b_connected,
      qrCode: qrCodeB,
      pairingCode: pairingCodeB
    }
  }
})
