export default defineNuxtRouteMiddleware(async () => {
  const authUser = useAuthUser()

  if (authUser.value?.role === 'manager') {
    return
  }

  const authCookie = useCookie<string | null>('auth_token', { sameSite: 'lax' })

  if (!authCookie.value) {
    return navigateTo('/dashboard')
  }

  try {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const { user } = await $fetch('/api/auth/session', { headers })
    authUser.value = user

    if (user.role !== 'manager') {
      return navigateTo('/dashboard')
    }
  } catch (error) {
    console.warn('[gerente-middleware] sessão inválida', error)
    authCookie.value = null
    return navigateTo('/dashboard')
  }
})





