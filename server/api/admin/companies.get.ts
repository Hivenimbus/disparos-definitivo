import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    // Verificar se o usuário está autenticado e é admin
    const user = await serverSupabaseUser(event)
    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Não autorizado'
      })
    }

    const supabase = serverSupabaseClient(event)

    // Verificar se o usuário é admin
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userError || userData?.role !== 'admin') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Acesso negado'
      })
    }

    // Obter query parameters para filtros e paginação
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 50
    const search = query.search as string || ''
    const status = query.status as string || ''
    const offset = (page - 1) * limit

    // Construir query
    let dbQuery = supabase
      .from('companies')
      .select('*', { count: 'exact' })

    // Aplicar filtros
    if (search) {
      dbQuery = dbQuery.or(`nome.ilike.%${search}%,cpf_cnpj.ilike.%${search}%,celular.ilike.%${search}%`)
    }

    if (status && status !== 'all') {
      dbQuery = dbQuery.eq('status', status)
    }

    // Executar query com paginação
    const { data: companies, error, count } = await dbQuery
      .order('data_criacao', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar empresas:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao buscar empresas'
      })
    }

    // Buscar contagem de usuários por empresa
    const companiesWithUsers = await Promise.all(
      (companies || []).map(async (company) => {
        const { data: userCount } = await supabase
          .from('users')
          .select('id', { count: 'exact' })
          .eq('company_id', company.id)

        return {
          ...company,
          users_count: userCount?.length || 0
        }
      })
    )

    // Calcular estatísticas
    const { data: stats } = await supabase
      .from('companies')
      .select('status, max_usuarios, usuarios_atuais')

    const statistics = {
      total: count || 0,
      ativas: stats?.filter(c => c.status === 'ativo').length || 0,
      vencidas: stats?.filter(c => c.status === 'vencido').length || 0,
      totalUsuarios: stats?.reduce((sum, c) => sum + (c.usuarios_atuais || 0), 0) || 0,
      totalLimite: stats?.reduce((sum, c) => sum + (c.max_usuarios || 0), 0) || 0
    }

    return {
      success: true,
      data: companiesWithUsers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      statistics
    }

  } catch (error) {
    console.error('Erro na API de empresas:', error)
    throw error
  }
})