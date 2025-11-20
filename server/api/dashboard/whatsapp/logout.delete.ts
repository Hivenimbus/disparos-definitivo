import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getUazapiConfig } from '../../../utils/uazapi'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { uazapiApiUrl } = getUazapiConfig()

  try {
    await $fetch('/instance/disconnect', {
      baseURL: uazapiApiUrl,
      method: 'POST',
      headers: {
        token: user.uazapi_token
      }
    })

    return { success: true }
  } catch (error: any) {
    const status = error?.response?.status

    if (status === 404) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Instância não encontrada na UAZAPI'
      })
    }

    console.error('[dashboard/whatsapp/logout] UAZAPI error', {
      status,
      data: error?.response?._data ?? error?.data ?? null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Não foi possível desconectar na UAZAPI'
    })
  }
})
