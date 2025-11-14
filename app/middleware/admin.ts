export default defineNuxtRouteMiddleware(async (to, from) => {
  console.log('🔍 Middleware admin: Verificando permissão')

  const { user, userId } = useAuthUser()
  const supabase = useSupabaseClient()

  if (!user.value || !userId.value) {
    console.log('❌ Middleware admin: Usuário não autenticado ou sem ID', {
      hasUser: !!user.value,
      userId: userId.value,
      email: user.value?.email
    })
    return navigateTo('/login')
  }

  console.log('🔍 Middleware admin: Verificando role para usuário', userId.value)

  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId.value)
      .single()

    if (error) {
      console.error('❌ Middleware admin: Erro ao buscar role:', error)
      return navigateTo('/')
    }

    if (!data || data.role !== 'admin') {
      console.log('❌ Middleware admin: Usuário não é admin. Role:', data?.role)
      return navigateTo('/')
    }

    console.log('✅ Middleware admin: Acesso permitido para admin')
    // Continuar para a rota admin
  } catch (err) {
    console.error('❌ Middleware admin: Erro inesperado:', err)
    return navigateTo('/')
  }
})
