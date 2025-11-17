import { createError } from 'h3'
import type { AuthenticatedUser } from './auth'
import type { SendJobSummary } from '../../types/send-job'
import { callWorker } from './worker-client'

type WorkerResponse<T> = {
  job?: T
  success?: boolean
  error?: string
}

export const startSendJob = async (user: AuthenticatedUser): Promise<SendJobSummary> => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>(
    '/jobs/start',
    {
      method: 'POST',
      body: {
        user_id: user.id
      }
    },
    user.id
  )
  if (!response?.job) {
    throw createError({ statusCode: 500, statusMessage: 'Resposta inválida do worker ao iniciar disparo' })
  }
  return response.job
}

export const requestStopSendJob = async (userId: string): Promise<SendJobSummary> => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>(
    '/jobs/stop',
    {
      method: 'POST',
      body: { user_id: userId }
    },
    userId
  )
  if (!response?.job) {
    throw createError({ statusCode: 500, statusMessage: 'Resposta inválida do worker ao cancelar disparo' })
  }
  return response.job
}

export const pauseSendJob = async (userId: string): Promise<SendJobSummary> => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>(
    '/jobs/pause',
    {
      method: 'POST',
      body: { user_id: userId }
    },
    userId
  )
  if (!response?.job) {
    throw createError({ statusCode: 500, statusMessage: 'Resposta inválida do worker ao pausar disparo' })
  }
  return response.job
}

export const resumeSendJob = async (userId: string): Promise<SendJobSummary> => {
  const response = await callWorker<WorkerResponse<SendJobSummary>>(
    '/jobs/resume',
    {
      method: 'POST',
      body: { user_id: userId }
    },
    userId
  )
  if (!response?.job) {
    throw createError({ statusCode: 500, statusMessage: 'Resposta inválida do worker ao retomar disparo' })
  }
  return response.job
}

export const getSendJobStatus = async (userId: string): Promise<SendJobSummary | null> => {
  const response = await callWorker<WorkerResponse<SendJobSummary | null>>(
    '/jobs/status',
    {
      method: 'GET',
      query: { user_id: userId }
    },
    userId
  )
  return response?.job ?? null
}

type FinalizeOptions = {
  force?: boolean
}

export const finalizeSendJob = async (userId: string, options: FinalizeOptions = {}) => {
  const force = options.force ?? true
  const response = await callWorker<WorkerResponse<SendJobSummary>>(
    '/jobs/finish',
    {
      method: 'POST',
      body: { user_id: userId, force }
    },
    userId
  )
  if (!response?.success) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao limpar histórico no worker' })
  }
  return { success: true }
}





