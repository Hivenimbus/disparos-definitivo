const normalizeUrl = (url: string) => url.replace(/\/+$/, '')

export const getAppUrl = () => {
  const config = useRuntimeConfig()
  const configured = (config.public?.appUrl || '').trim()

  if (!configured) {
    throw new Error('NUXT_PUBLIC_APP_URL não configurada')
  }

  return normalizeUrl(configured)
}

export const buildAppUrl = (path = '/') => {
  const base = getAppUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`.replace(/(?<!:)\/{2,}/g, '/')
}

