const PUBLIC_ROUTES = ['/login', '/register']

export default defineNuxtRouteMiddleware(async (to) => {
  const authUser = useAuthUser()
  const authCookie = useCookie<string | null>('auth_token', { sameSite: 'lax' })
  const isPublicRoute = PUBLIC_ROUTES.includes(to.path)

  if (authUser.value) {
    if (isPublicRoute) {
      return navigateTo('/dashboard')
    }

    return
  }

  if (!authCookie.value) {
    if (!isPublicRoute) {
      return navigateTo('/login')
    }

    return
  }

  try {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const { user } = await $fetch('/api/auth/session', {
      headers
    })

    authUser.value = user
  } catch (error) {
    console.warn('[auth-middleware] sessão inválida', error)
    authCookie.value = null
  }

  if (!authUser.value && !isPublicRoute) {
    return navigateTo('/login')
  }

  if (authUser.value && isPublicRoute) {
      return navigateTo('/dashboard')
  }
})


