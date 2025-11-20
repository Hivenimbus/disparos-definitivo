import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getUazapiConfig } from '../../../utils/uazapi'

type UazapiConnectResponse = {
  message?: string
  instance?: {
    qrcode?: string
    Qrcode?: string
    code?: string | number
    Code?: string | number
  }
}

type DashboardQrResponse = {
  base64: string
  qrcode?: string | null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { uazapiApiUrl } = getUazapiConfig()

  try {
    const response = await $fetch<UazapiConnectResponse>('/instance/connect', {
      baseURL: uazapiApiUrl,
      method: 'POST',
      headers: {
        token: user.uazapi_token
      },
      body: {
        phone: ''
      }
    })

    const base64 =
      response?.instance?.qrcode ??
      response?.instance?.Qrcode ??
      null
    const rawQrcode =
      response?.instance?.code ??
      response?.instance?.Code ??
      null
    const qrcode = rawQrcode == null ? null : String(rawQrcode)

    if (!base64) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Resposta inesperada da UAZAPI'
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
        statusMessage: 'Instância não encontrada na UAZAPI'
      })
    }

    console.error('[dashboard/whatsapp/connect] UAZAPI error', {
      status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível gerar o QR Code na UAZAPI'
    })
  }
})


