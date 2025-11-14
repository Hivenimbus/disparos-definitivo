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

    // Obter dados do corpo da requisição
    const body = await readBody(event)
    const {
      nome,
      data_vencimento,
      max_usuarios,
      celular,
      cpf_cnpj,
      status
    } = body

    // Validações básicas
    if (!nome || !data_vencimento || !max_usuarios) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Nome, data de vencimento e limite de usuários são obrigatórios'
      })
    }

    if (max_usuarios < 1) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Limite de usuários deve ser maior que zero'
      })
    }

    // Verificar status válido
    const validStatus = ['ativo', 'vencido']
    const companyStatus = status || 'ativo'
    if (!validStatus.includes(companyStatus)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Status inválido'
      })
    }

    // Buscar empresa atual
    const { data: currentCompany, error: fetchError } = await supabase
      .from('companies')
      .select('nome, usuarios_atuais')
      .eq('id', companyId)
      .single()

    if (fetchError || !currentCompany) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Empresa não encontrada'
      })
    }

    // Verificar se nome já existe (se foi alterado)
    if (nome.trim() !== currentCompany.nome) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('nome')
        .eq('nome', nome.trim())
        .neq('id', companyId)
        .single()

      if (existingCompany) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Empresa com este nome já cadastrada'
        })
      }
    }

    // Verificar se novo limite de usuários é válido
    if (max_usuarios < currentCompany.usuarios_atuais) {
      throw createError({
        statusCode: 400,
        statusMessage: `Limite de usuários não pode ser menor que o número atual de usuários (${currentCompany.usuarios_atuais})`
      })
    }

    // Validar data de vencimento
    const vencimentoDate = new Date(data_vencimento)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (vencimentoDate < today && companyStatus === 'ativo') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Data de vencimento não pode ser anterior a hoje para empresas ativas'
      })
    }

    // Atualizar empresa
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({
        nome: nome.trim(),
        data_vencimento: vencimentoDate.toISOString().split('T')[0],
        max_usuarios,
        celular: celular?.trim() || null,
        cpf_cnpj: cpf_cnpj?.trim() || null,
        status: companyStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', companyId)
      .select()
      .single()

    if (updateError) {
      console.error('Erro ao atualizar empresa:', updateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao atualizar empresa'
      })
    }

    // Buscar contagem atualizada de usuários
    const { data: userCount } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .eq('company_id', companyId)

    return {
      success: true,
      data: { ...updatedCompany, users_count: userCount?.length || 0 },
      message: 'Empresa atualizada com sucesso'
    }

  } catch (error) {
    console.error('Erro ao atualizar empresa:', error)
    throw error
  }
})