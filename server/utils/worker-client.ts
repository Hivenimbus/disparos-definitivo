import { promises as fs } from 'node:fs'
import path from 'node:path'
import { createError } from 'h3'

type WorkerInstance = {
  url: string
  port: number
}

const portsFile = path.resolve('.worker-ports.json')

const instancesCache: WorkerInstance[] = []
let lastLoad = 0
let roundRobinIndex = 0

const REFRESH_INTERVAL_MS = 5000

const loadInstances = async (): Promise<WorkerInstance[]> => {
  const now = Date.now()
  if (instancesCache.length > 0 && now - lastLoad < REFRESH_INTERVAL_MS) {
    return instancesCache
  }

  try {
    const data = await fs.readFile(portsFile, 'utf-8')
    const parsed = JSON.parse(data)
    if (Array.isArray(parsed)) {
      instancesCache.length = 0
      for (const item of parsed) {
        if (item?.url && item?.port) {
          instancesCache.push({ url: item.url, port: item.port })
        }
      }
      lastLoad = now
    }
  } catch {
    instancesCache.length = 0
  }
  return instancesCache
}

const getInstanceByKey = async (key?: string): Promise<string | null> => {
  const instances = await loadInstances()
  if (instances.length === 0) {
    return null
  }
  if (key) {
    const hash = Array.from(key).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return instances[hash % instances.length].url
  }
  roundRobinIndex = (roundRobinIndex + 1) % instances.length
  return instances[roundRobinIndex].url
}

export const getWorkerBaseUrl = async (key?: string) => {
  const fallback = useRuntimeConfig().workerServiceUrl?.replace(/\/$/, '')
  const dynamicUrl = await getInstanceByKey(key)
  return dynamicUrl ?? fallback
}

export const callWorker = async <T>(pathname: string, options: any = {}, key?: string) => {
  const config = useRuntimeConfig()
  const token = config.workerToken

  if (!token) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WORKER_TOKEN não configurado'
    })
  }

  const baseUrl = await getWorkerBaseUrl(key)

  if (!baseUrl) {
    throw createError({
      statusCode: 500,
      statusMessage: 'WORKER_SERVICE_URL não configurado'
    })
  }

  try {
    return await $fetch(pathname, {
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

