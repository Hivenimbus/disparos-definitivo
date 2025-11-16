const normalizeUrl = (url: string) => url.replace(/\/+$/, '')

export const getPublicAppUrl = () => {
  const config = useRuntimeConfig()
  const configured = (config.public?.appUrl || '').trim()

  if (!configured) {
    return 'http://localhost:3000'
  }

  return normalizeUrl(configured)
}

export const buildPublicAppUrl = (path = '/') => {
  const base = getPublicAppUrl()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalizedPath}`.replace(/(?<!:)\/{2,}/g, '/')
}


