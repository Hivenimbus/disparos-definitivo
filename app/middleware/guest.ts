const REDIRECT_ROUTE = '/dashboard'

export default defineNuxtRouteMiddleware(async () => {
  const authUser = useAuthUser()
  const authCookie = useCookie<string | null>('auth_token', { sameSite: 'lax' })

  if (authUser.value) {
    return navigateTo(REDIRECT_ROUTE)
  }

  if (!authCookie.value) {
    return
  }

  try {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const { user } = await $fetch('/api/auth/session', { headers })
    authUser.value = user
    return navigateTo(REDIRECT_ROUTE)
  } catch (error) {
    console.warn('[guest-middleware] sessão inválida', error)
    authCookie.value = null
  }
})


