import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getUazapiConfig } from '../../../utils/uazapi'

type UazapiStatusResponse = {
  instance?: {
    status?: 'disconnected' | 'connecting' | 'connected' | string
    qrcode?: string | null
    name?: string | null
  } | null
  status?: {
    connected?: boolean
    loggedIn?: boolean
    jid?: string | null
  } | null
}

type DashboardInstanceStatus = {
  connected: boolean
  loggedIn: boolean
  name: string | null
  myJid: string | null
  qrcode: string | null
  status: 'disconnected' | 'connecting' | 'connected' | null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { uazapiApiUrl } = getUazapiConfig()

  try {
    const response = await $fetch<UazapiStatusResponse>('/instance/status', {
      baseURL: uazapiApiUrl,
      method: 'GET',
      headers: {
        token: user.uazapi_token
      }
    })

    if (!response?.status) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Resposta inesperada da UAZAPI'
      })
    }

    const normalized: DashboardInstanceStatus = {
      connected: Boolean(response.status?.connected),
      loggedIn: Boolean(response.status?.loggedIn),
      name: response.instance?.name ?? null,
      myJid: response.status?.jid ?? null,
      qrcode: response.instance?.qrcode ?? null,
      status: (response.instance?.status as DashboardInstanceStatus['status']) ?? null
    }

    return normalized
  } catch (error: any) {
    const status = error?.response?.status

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Instância não encontrada na UAZAPI'
      })
    }

    console.error('[dashboard/whatsapp/state] UAZAPI error', {
      status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível consultar o estado da conexão na UAZAPI'
    })
  }
})
