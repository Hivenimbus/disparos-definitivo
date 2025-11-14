export const useUserRole = () => {
  const supabase = useSupabaseClient()
  const { user, userId } = useAuthUser()

  const userRole = useState<string | null>('userRole', () => null)
  const userFullName = useState<string | null>('userFullName', () => null)
  
  const fetchUserRole = async (retryCount = 0) => {
    console.log('🔍 useUserRole.fetchUserRole() iniciado - retry:', retryCount)

    if (!user.value || !userId.value) {
      console.log('❌ useUserRole: Usuário não autenticado ou sem ID/sub:', {
        user: !!user.value,
        userId: userId.value,
        email: user.value?.email
      })
      userRole.value = null
      userFullName.value = null
      return null
    }

    console.log('🔍 useUserRole: Buscando role para usuário', userId.value, user.value.email)

    try {
      const { data, error } = await supabase
        .from('users')
        .select('role, full_name')
        .eq('id', userId.value)
        .single()

      if (error) {
        console.error('❌ useUserRole: Erro ao buscar role:', error)

        // Se for retry e ainda falhar, limpa o estado
        if (retryCount >= 2) {
          userRole.value = null
          userFullName.value = null
          return null
        }

        // Tentar novamente após delay
        setTimeout(() => fetchUserRole(retryCount + 1), 500)
        return null
      }

      const role = data?.role || 'user'
      const fullName = data?.full_name || null

      console.log('✅ useUserRole: Dados encontrados - Role:', role, 'Nome:', fullName)

      userRole.value = role
      userFullName.value = fullName

      return role
    } catch (err) {
      console.error('❌ useUserRole: Erro inesperado:', err)

      // Tentar novamente se for erro de rede/temporário
      if (retryCount < 2) {
        setTimeout(() => fetchUserRole(retryCount + 1), 500)
        return null
      }

      userRole.value = null
      userFullName.value = null
      return null
    }
  }
  
  const isAdmin = computed(() => {
    const result = userRole.value === 'admin'
    console.log('🔍 useUserRole.isAdmin computed:', {
      userRole: userRole.value,
      isAdmin: result
    })
    return result
  })

  const isManager = computed(() => {
    const result = userRole.value === 'manager'
    console.log('🔍 useUserRole.isManager computed:', {
      userRole: userRole.value,
      isManager: result
    })
    return result
  })

  return {
    userRole,
    userFullName,
    fetchUserRole,
    isAdmin,
    isManager
  }
}
