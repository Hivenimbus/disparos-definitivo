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
    const role = query.role as string || ''
    const status = query.status as string || ''
    const offset = (page - 1) * limit

    // Construir query
    let dbQuery = supabase
      .from('users')
      .select(`
        *,
        companies:company_id (
          id,
          nome
        )
      `, { count: 'exact' })

    // Aplicar filtros
    if (search) {
      dbQuery = dbQuery.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    if (role && role !== 'all') {
      dbQuery = dbQuery.eq('role', role)
    }

    if (status && status !== 'all') {
      dbQuery = dbQuery.eq('status', status)
    }

    // Executar query com paginação
    const { data: users, error, count } = await dbQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar usuários:', error)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao buscar usuários'
      })
    }

    // Calcular estatísticas
    const { data: stats } = await supabase
      .from('users')
      .select('role, status')

    const statistics = {
      total: count || 0,
      ativos: stats?.filter(u => u.status === 'ativo').length || 0,
      vencidos: stats?.filter(u => u.status === 'vencido').length || 0,
      bloqueados: stats?.filter(u => u.status === 'bloqueado').length || 0,
      admins: stats?.filter(u => u.role === 'admin').length || 0,
      usuarios: stats?.filter(u => u.role === 'user').length || 0
    }

    return {
      success: true,
      data: users || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      },
      statistics
    }

  } catch (error) {
    console.error('Erro na API de usuários:', error)
    throw error
  }
})