import { createError } from 'h3'

export const getEvolutionConfig = () => {
  const config = useRuntimeConfig()
  const evolutionApiUrl = config.evolutionApiUrl?.replace(/\/$/, '')
  const evolutionApiKey = config.evolutionApiKey

  if (!evolutionApiUrl || !evolutionApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da Evolution API não encontradas'
    })
  }

  return { evolutionApiUrl, evolutionApiKey }
}

export const sanitizePhoneNumber = (value?: string | null) => {
  if (!value) return undefined
  const digitsOnly = value.replace(/\D/g, '')
  return digitsOnly || undefined
}










