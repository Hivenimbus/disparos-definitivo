import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'

type EvolutionQrResponse = {
  message?: string
  data?: {
    Qrcode?: string
    qrcode?: string
    Code?: string
    code?: string
  }
}

type DashboardQrResponse = {
  base64: string
  qrcode?: string | null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl } = getEvolutionConfig()

  try {
    const response = await $fetch<EvolutionQrResponse>('/instance/qr', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: user.id
      }
    })

    const base64 =
      response?.data?.Qrcode ??
      response?.data?.qrcode
    const qrcode =
      response?.data?.Code ??
      response?.data?.code ??
      null

    if (!base64) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Resposta inesperada da Evolution API'
      })
    }

    const payload: DashboardQrResponse = {
      base64,
      qrcode
    }

    return payload
  } catch (error: any) {
    const status = error?.response?.status

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Instância não encontrada na Evolution API'
      })
    }

    console.error('[dashboard/whatsapp/connect] Evolution API error', {
      status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível gerar o QR Code na Evolution API'
    })
  }
})


