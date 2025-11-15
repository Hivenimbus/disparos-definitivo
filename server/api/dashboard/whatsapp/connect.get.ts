import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'

type EvolutionConnectResponse = {
  base64?: string
  pairingCode?: string
  code?: string
  count?: number
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()

  try {
    const data = await $fetch<EvolutionConnectResponse>(`/instance/connect/${user.id}`, {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: evolutionApiKey
      }
    })

    if (!data?.base64 && !data?.pairingCode && !data?.code) {
      throw createError({
        statusCode: 502,
        statusMessage: 'Resposta inesperada da Evolution API'
      })
    }

    return data
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
      statusMessage: 'Não foi possível iniciar a conexão com a Evolution API'
    })
  }
})


