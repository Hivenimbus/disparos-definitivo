const PUBLIC_ROUTES = ['/login', '/register']
const PASSWORD_ROUTE = '/definir-senha'

export default defineNuxtRouteMiddleware(async (to) => {
  const authUser = useAuthUser()
  const authCookie = useCookie<string | null>('auth_token', { sameSite: 'lax' })
  const isPublicRoute = PUBLIC_ROUTES.includes(to.path)
  const isPasswordRoute = to.path === PASSWORD_ROUTE

  const redirectToDashboard = () => navigateTo('/dashboard')
  const redirectToLogin = () => navigateTo('/login')

  if (authUser.value) {
    if (authUser.value.status !== 'ativo') {
      authUser.value = null
      authCookie.value = null
      return redirectToLogin()
    }

    if (authUser.value.mustChangePassword) {
      if (!isPasswordRoute) {
        return navigateTo(PASSWORD_ROUTE)
      }
    } else if (isPasswordRoute) {
      return redirectToDashboard()
    }

    if (isPublicRoute) {
      return redirectToDashboard()
    }

    return
  }

  if (!authCookie.value) {
    if (!isPublicRoute) {
      return redirectToLogin()
    }

    return
  }

  try {
    const headers = process.server ? useRequestHeaders(['cookie']) : undefined
    const { user } = await $fetch('/api/auth/session', {
      headers
    })

    if (user.status !== 'ativo') {
      authCookie.value = null
      return redirectToLogin()
    }

    authUser.value = user
  } catch (error) {
    console.warn('[auth-middleware] sessão inválida', error)
    authCookie.value = null
  }

  if (!authUser.value && !isPublicRoute) {
    return redirectToLogin()
  }

  if (authUser.value) {
    if (authUser.value.mustChangePassword) {
      if (!isPasswordRoute) {
        return navigateTo(PASSWORD_ROUTE)
      }
      return
    }

    if (isPasswordRoute) {
      return redirectToDashboard()
    }

    if (isPublicRoute) {
      return redirectToDashboard()
    }
  }
})
