import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'

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

type DashboardInstanceStatus = {
  connected: boolean
  loggedIn: boolean
  name: string | null
  myJid: string | null
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl } = getEvolutionConfig()

  try {
    const response = await $fetch<EvolutionStatusResponse>('/instance/status', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: user.id
      }
    })

    if (!response?.data) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Resposta inesperada da Evolution API'
      })
    }

    const normalized: DashboardInstanceStatus = {
      connected: Boolean(
        response.data.connected ??
          response.data.Connected
      ),
      loggedIn: Boolean(
        response.data.loggedIn ??
          response.data.LoggedIn
      ),
      name: response.data.name ?? response.data.Name ?? null,
      myJid: response.data.myJid ?? response.data.MyJid ?? null
    }

    return normalized
  } catch (error: any) {
    const status = error?.response?.status

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Instância não encontrada na Evolution API'
      })
    }

    console.error('[dashboard/whatsapp/state] Evolution API error', {
      status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível consultar o estado da conexão na Evolution API'
    })
  }
})
