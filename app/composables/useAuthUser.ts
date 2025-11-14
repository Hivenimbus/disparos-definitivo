/**
 * Composable padronizado para obter dados do usuário autenticado
 * Extrai consistentemente o ID do JWT payload (sub ou id)
 */

export const useAuthUser = () => {
  const user = useSupabaseUser()

  // Computed que extrai o ID de forma consistente
  const userId = computed(() => {
    if (!user.value) {
      console.log('🔍 useAuthUser: Usuário não autenticado')
      return null
    }

    // Tentar obter ID de múltiplas fontes no JWT
    const id = user.value.id || user.value.sub

    if (!id) {
      console.log('🔍 useAuthUser: ID não encontrado no objeto user:', {
        hasUser: !!user.value,
        keys: Object.keys(user.value),
        id: user.value?.id,
        sub: user.value?.sub
      })
      return null
    }

    console.log('🔍 useAuthUser: ID extraído com sucesso:', id)
    return id
  })

  // Computed para verificação de autenticação
  const isAuthenticated = computed(() => !!user.value && !!userId.value)

  // Computed para obter email
  const email = computed(() => user.value?.email || null)

  // Retornar dados de forma padronizada
  return {
    user,
    userId,
    isAuthenticated,
    email,

    // Método helper para verificar se tem ID
    hasUserId: () => !!userId.value,

    // Método para obter ID para queries (throw error se não tiver)
    getIdOrThrow: () => {
      const id = userId.value
      if (!id) {
        throw new Error('Usuário não autenticado ou sem ID')
      }
      return id
    }
  }
}