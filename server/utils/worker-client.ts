import { createError } from 'h3'

export const getWorkerBaseUrl = () => {
  return useRuntimeConfig().workerServiceUrl?.replace(/\/$/, '') || ''
}

export const callWorker = async <T>(pathname: string, options: any = {}) => {
  const config = useRuntimeConfig()
  const token = config.workerToken

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WORKER_TOKEN não configurado'
    })
  }

  const baseUrl = getWorkerBaseUrl()

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WORKER_SERVICE_URL não configurado'
    })
  }

  try {
    return await $fetch<T>(pathname, {
      baseURL: baseUrl,
      headers: {
        'X-Worker-Token': token
      },
      ...options
    })
  } catch (error: any) {
    const statusCode = error?.response?.status || 500
    const statusMessage = error?.data?.error || error?.response?._data?.error || 'Falha na comunicação com o worker'
    throw createError({ statusCode, statusMessage })
  }
}
