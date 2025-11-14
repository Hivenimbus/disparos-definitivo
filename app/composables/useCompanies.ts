export const useCompanies = () => {
  const supabase = useSupabaseClient()

  const companies = useState<any[]>('companies', () => [])
  const loading = useState<boolean>('companiesLoading', () => false)
  const error = useState<string | null>('companiesError', () => null)

  // Função para calcular o status baseado na data de vencimento
  const calculateStatus = (dataVencimento: string): string => {
    const expirationDate = new Date(dataVencimento)
    const currentDate = new Date()
    return expirationDate < currentDate ? 'vencido' : 'ativo'
  }

  // Buscar todas as empresas do banco
  const fetchCompanies = async () => {
    console.log('🔍 useCompanies.fetchCompanies() - Buscando empresas...')

    loading.value = true
    error.value = null

    try {
      const { data, error: fetchError } = await supabase
        .from('companies')
        .select('*')
        .order('data_criacao', { ascending: false })

      if (fetchError) {
        console.error('❌ useCompanies: Erro ao buscar empresas:', fetchError)
        error.value = 'Erro ao carregar empresas'
        return
      }

      console.log('✅ useCompanies: Empresas encontradas:', data?.length || 0)

      // Processar dados e calcular status automaticamente
      const processedCompanies = data?.map(company => ({
        ...company,
        status: calculateStatus(company.data_vencimento),
        // Mapear nomes de colunas do banco para o formato do componente
        nome: company.nome,
        dataVencimento: company.data_vencimento,
        maxUsuarios: company.max_usuarios,
        usuariosAtuais: company.usuarios_atuais || 0,
        celular: company.celular,
        cpfCnpj: company.cpf_cnpj,
        dataCriacao: company.data_criacao
      })) || []

      companies.value = processedCompanies
    } catch (err) {
      console.error('❌ useCompanies: Erro inesperado:', err)
      error.value = 'Erro inesperado ao carregar empresas'
    } finally {
      loading.value = false
    }
  }

  // Criar nova empresa
  const createCompany = async (companyData: {
    nome: string
    dataVencimento: string
    maxUsuarios: number
    celular?: string
    cpfCnpj?: string
  }) => {
    console.log('🔍 useCompanies.createCompany() - Criando empresa:', companyData.nome)

    try {
      const { data, error: insertError } = await supabase
        .from('companies')
        .insert({
          nome: companyData.nome,
          data_vencimento: companyData.dataVencimento,
          max_usuarios: companyData.maxUsuarios,
          celular: companyData.celular || null,
          cpf_cnpj: companyData.cpfCnpj || null,
          usuarios_atuais: 0,
          status: 'ativo'
        })
        .select()
        .single()

      if (insertError) {
        console.error('❌ useCompanies: Erro ao criar empresa:', insertError)
        throw new Error('Erro ao criar empresa')
      }

      console.log('✅ useCompanies: Empresa criada com sucesso:', data.id)

      // Atualizar lista local
      await fetchCompanies()

      return data
    } catch (err) {
      console.error('❌ useCompanies: Erro inesperado ao criar:', err)
      throw err
    }
  }

  // Atualizar empresa
  const updateCompany = async (companyId: string, companyData: {
    nome: string
    dataVencimento: string
    maxUsuarios: number
    celular?: string
    cpfCnpj?: string
  }) => {
    console.log('🔍 useCompanies.updateCompany() - Atualizando empresa:', companyId)

    try {
      const { data, error: updateError } = await supabase
        .from('companies')
        .update({
          nome: companyData.nome,
          data_vencimento: companyData.dataVencimento,
          max_usuarios: companyData.maxUsuarios,
          celular: companyData.celular || null,
          cpf_cnpj: companyData.cpfCnpj || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', companyId)
        .select()
        .single()

      if (updateError) {
        console.error('❌ useCompanies: Erro ao atualizar empresa:', updateError)
        throw new Error('Erro ao atualizar empresa')
      }

      console.log('✅ useCompanies: Empresa atualizada com sucesso')

      // Atualizar lista local
      await fetchCompanies()

      return data
    } catch (err) {
      console.error('❌ useCompanies: Erro inesperado ao atualizar:', err)
      throw err
    }
  }

  // Deletar empresa (com verificação de usuários)
  const deleteCompany = async (companyId: string) => {
    console.log('🔍 useCompanies.deleteCompany() - Deletando empresa:', companyId)

    // Verificar se há usuários vinculados
    const company = companies.value.find(c => c.id === companyId)
    if (company?.usuariosAtuais > 0) {
      throw new Error('Não é possível excluir empresa com usuários vinculados')
    }

    try {
      const { error: deleteError } = await supabase
        .from('companies')
        .delete()
        .eq('id', companyId)

      if (deleteError) {
        console.error('❌ useCompanies: Erro ao deletar empresa:', deleteError)
        throw new Error('Erro ao deletar empresa')
      }

      console.log('✅ useCompanies: Empresa deletada com sucesso')

      // Atualizar lista local
      await fetchCompanies()

      return true
    } catch (err) {
      console.error('❌ useCompanies: Erro inesperado ao deletar:', err)
      throw err
    }
  }

  // Buscar empresas por nome
  const searchCompanies = (query: string) => {
    if (!query || query.trim() === '') {
      return companies.value
    }

    const lowercaseQuery = query.toLowerCase()
    return companies.value.filter(company =>
      company.nome.toLowerCase().includes(lowercaseQuery)
    )
  }

  // Estatísticas computadas
  const stats = computed(() => {
    const total = companies.value.length
    const ativas = companies.value.filter(c => c.status === 'ativo').length
    const vencidas = companies.value.filter(c => c.status === 'vencido').length
    const vagasDisponiveis = companies.value.reduce((sum, company) => {
      return sum + (company.maxUsuarios - company.usuariosAtuais)
    }, 0)

    return {
      total,
      ativas,
      vencidas,
      vagasDisponiveis
    }
  })

  // Carregar dados na inicialização
  onMounted(() => {
    fetchCompanies()
  })

  return {
    companies,
    loading,
    error,
    stats,
    fetchCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    searchCompanies,
    calculateStatus
  }
}
