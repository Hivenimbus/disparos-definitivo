import { createError } from 'h3'

export const getUazapiConfig = () => {
  const config = useRuntimeConfig()
  const uazapiApiUrl = config.uazapiApiUrl?.replace(/\/$/, '')
  const uazapiApiKey = config.uazapiApiKey

  if (!uazapiApiUrl || !uazapiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da UAZAPI não encontradas'
    })
  }

  return { uazapiApiUrl, uazapiApiKey }
}

export const buildUazapiHeaders = (overrideApiKey?: string | null) => {
  const apiKey = overrideApiKey?.trim()
  if (apiKey) {
    return { apikey: apiKey }
  }
  const { uazapiApiKey } = getUazapiConfig()
  return { apikey: uazapiApiKey }
}

export const sanitizePhoneNumber = (value?: string | null) => {
  if (!value) return undefined
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly || undefined
}

