export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabase()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return navigateTo('/login')
  }
  
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select(`
        *,
        companies:empresa_id (
          data_vencimento
        )
      `)
      .eq('id', session.user.id)
      .single()
    
    if (error || !profile) {
      await supabase.auth.signOut()
      return navigateTo('/login')
    }
    
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const dataVencimento = new Date(profile.data_vencimento)
    dataVencimento.setHours(0, 0, 0, 0)
    
    if (profile.status === 'bloqueado' || dataVencimento < hoje) {
      await supabase.auth.signOut()
      return navigateTo('/login')
    }
    
    if (profile.companies) {
      const empresaVencimento = new Date(profile.companies.data_vencimento)
      empresaVencimento.setHours(0, 0, 0, 0)
      
      if (empresaVencimento < hoje) {
        await supabase.auth.signOut()
        return navigateTo('/login')
      }
    }
  } catch (error) {
    console.error('Erro no middleware auth:', error)
    await supabase.auth.signOut()
    return navigateTo('/login')
  }
})
