export default defineNuxtRouteMiddleware(async (to, from) => {
  const supabase = useSupabase()
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return navigateTo('/login')
  }
  
  try {
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    if (!profile || profile.role !== 'admin') {
      return navigateTo('/')
    }
  } catch (error) {
    console.error('Erro no middleware admin:', error)
    return navigateTo('/')
  }
})
