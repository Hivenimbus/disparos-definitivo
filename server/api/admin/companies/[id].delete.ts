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
    const companyId = getRouterParam(event, 'id')

    if (!companyId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID da empresa é obrigatório'
      })
    }

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

    // Verificar se empresa existe
    const { data: existingCompany, error: fetchError } = await supabase
      .from('companies')
      .select('nome, usuarios_atuais')
      .eq('id', companyId)
      .single()

    if (fetchError || !existingCompany) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Empresa não encontrada'
      })
    }

    // Verificar se empresa possui usuários
    if (existingCompany.usuarios_atuais > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Não é possível remover empresa com usuários ativos. Usuários: ${existingCompany.usuarios_atuais}`
      })
    }

    // Remover empresa
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyId)

    if (deleteError) {
      console.error('Erro ao remover empresa:', deleteError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao remover empresa'
      })
    }

    return {
      success: true,
      message: `Empresa "${existingCompany.nome}" removida com sucesso`
    }

  } catch (error) {
    console.error('Erro ao remover empresa:', error)
    throw error
  }
})