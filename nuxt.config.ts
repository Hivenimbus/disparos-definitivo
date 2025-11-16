// https://nuxt.com/docs/api/configuration/nuxt-config

const fallbackAppUrl = process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'

const resolveBasePath = (url: string) => {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname || '/'
    if (pathname === '/' || pathname === '') {
      return '/'
    }
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  } catch {
    return '/'
  }
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  app: {
    baseURL: resolveBasePath(fallbackAppUrl)
  },
  modules: ['@nuxtjs/tailwindcss'],
  runtimeConfig: {
    supabaseUrl: '',
    supabaseAnonKey: '',
    supabaseServiceRoleKey: '',
    jwtSecret: '',
    evolutionApiUrl: '',
    evolutionApiKey: '',
    public: {
      appUrl: fallbackAppUrl
    }
  }
})