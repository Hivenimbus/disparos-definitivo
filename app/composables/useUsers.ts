export const useUsers = () => {
  const supabase = useSupabaseClient()

  const fetchUsers = async () => {
    console.log('🔍 useUsers.fetchUsers() - Buscando todos os usuários')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ useUsers: Erro ao buscar usuários:', error)
      throw error
    }

    console.log('✅ useUsers: Usuários encontrados:', data?.length || 0)
    return data || []
  }

  const fetchUserById = async (userId: string) => {
    console.log('🔍 useUsers.fetchUserById() - Buscando usuário:', userId)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('❌ useUsers: Erro ao buscar usuário:', error)
      throw error
    }

    console.log('✅ useUsers: Usuário encontrado:', data)
    return data
  }

  const createUser = async (userData: any) => {
    console.log('🔍 useUsers.createUser() - Criando usuário:', userData.email)

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          email: userData.email,
          full_name: userData.nome,
          role: userData.role || 'user',
          company_id: userData.empresaId,
          celular: userData.celular || null,
          cpf: userData.cpf || null,
          data_vencimento: userData.dataVencimento,
          status: userData.status || 'ativo'
        }
      ])
      .select('*')
      .single()

    if (error) {
      console.error('❌ useUsers: Erro ao criar usuário:', error)
      throw error
    }

    console.log('✅ useUsers: Usuário criado:', data)
    return data
  }

  const updateUser = async (userId: string, userData: any) => {
    console.log('🔍 useUsers.updateUser() - Atualizando usuário:', userId)

    const updatePayload: any = {
      email: userData.email,
      full_name: userData.nome,
      role: userData.role,
      company_id: userData.empresaId,
      celular: userData.celular || null,
      cpf: userData.cpf || null,
      data_vencimento: userData.dataVencimento,
      status: userData.status,
      updated_at: new Date().toISOString()
    }

    // Só inclui senha se foi fornecida
    if (userData.senha && userData.senha.trim()) {
      updatePayload.senha = userData.senha
    }

    const { data, error } = await supabase
      .from('users')
      .update(updatePayload)
      .eq('id', userId)
      .select('*')
      .single()

    if (error) {
      console.error('❌ useUsers: Erro ao atualizar usuário:', error)
      throw error
    }

    console.log('✅ useUsers: Usuário atualizado:', data)
    return data
  }

  const deleteUser = async (userId: string) => {
    console.log('🔍 useUsers.deleteUser() - Deletando usuário:', userId)

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      console.error('❌ useUsers: Erro ao deletar usuário:', error)
      throw error
    }

    console.log('✅ useUsers: Usuário deletado')
    return true
  }

  const getUsersByCompany = async (companyId: string) => {
    console.log('🔍 useUsers.getUsersByCompany() - Buscando usuários da empresa:', companyId)

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ useUsers: Erro ao buscar usuários por empresa:', error)
      throw error
    }

    console.log('✅ useUsers: Usuários da empresa encontrados:', data?.length || 0)
    return data || []
  }

  return {
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    getUsersByCompany
  }
}
