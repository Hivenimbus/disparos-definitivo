import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()

  try {
    await $fetch(`/instance/logout/${user.id}`, {
      baseURL: evolutionApiUrl,
      method: 'DELETE',
      headers: {
        apikey: evolutionApiKey
      }
    })

    return { success: true }
  } catch (error: any) {
    const status = error?.response?.status

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Instância não encontrada na Evolution API'
      })
    }

    console.error('[dashboard/whatsapp/logout] Evolution API error', {
      status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível desconectar na Evolution API'
    })
  }
})










