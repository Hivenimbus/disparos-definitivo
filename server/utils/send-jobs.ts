import { createError } from 'h3'
import type { AuthenticatedUser } from './auth'
import type { SendJobSummary } from '../../types/send-job'

type WorkerResponse<T> = {
  job?: T
  success?: boolean
  error?: string
}

const getWorkerConfig = () => {
  const config = useRuntimeConfig()
  const baseUrl = config.workerServiceUrl?.replace(/\/$/, '')
  const token = config.workerToken

  if (!baseUrl || !token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração do worker Go ausente. Defina WORKER_SERVICE_URL e WORKER_TOKEN.'
    })
  }

  return { baseUrl, token }
}

const callWorker = async <T>(path: string, options: any = {}) => {
  const { baseUrl, token } = getWorkerConfig()
  try {
    return await $fetch<T>(path, {
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

export const startSendJob = async (user: AuthenticatedUser): Promise<SendJobSummary> => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>('/jobs/start', {
    method: 'POST',
    body: {
      user_id: user.id
    }
  })
  if (!response?.job) {
    throw createError({ statusCode: 500, statusMessage: 'Resposta inválida do worker ao iniciar disparo' })
  }
  return response.job
}

export const requestStopSendJob = async (userId: string): Promise<SendJobSummary> => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>('/jobs/stop', {
    method: 'POST',
    body: { user_id: userId }
  })
  if (!response?.job) {
    throw createError({ statusCode: 500, statusMessage: 'Resposta inválida do worker ao cancelar disparo' })
  }
  return response.job
}

export const getSendJobStatus = async (userId: string): Promise<SendJobSummary | null> => {
  const response = await callWorker<WorkerResponse<SendJobSummary | null>>('/jobs/status', {
    method: 'GET',
    query: { user_id: userId }
  })
  return response?.job ?? null
}

export const finalizeSendJob = async (userId: string) => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>('/jobs/finish', {
    method: 'POST',
    body: { user_id: userId }
  })
  if (!response?.success) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao limpar histórico no worker' })
  }
  return { success: true }
}





