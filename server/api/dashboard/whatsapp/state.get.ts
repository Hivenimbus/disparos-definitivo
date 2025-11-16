import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'

type EvolutionStateResponse = {
  instance?: {
    instanceName: string
    state: string
  }
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()

  try {
    const data = await $fetch<EvolutionStateResponse>(`/instance/connectionState/${user.id}`, {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: evolutionApiKey
      }
    })

    if (!data?.instance?.state) {
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






