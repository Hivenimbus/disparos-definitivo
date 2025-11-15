export const useLogout = () => {
  const authUser = useAuthUser()
  const authCookie = useCookie<string | null>('auth_token', { sameSite: 'lax' })

  return async () => {
    try {
      await $fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.warn('[useLogout] Failed to call logout endpoint', error)
    }

    authUser.value = null
    authCookie.value = null
    await navigateTo('/login', { replace: true })
  }
}


