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

    // Verificar se empresa com mesmo nome já existe
    const { data: existingCompany } = await supabase
      .from('companies')
      .select('nome')
      .eq('nome', nome)
      .single()

    if (existingCompany) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Empresa com este nome já cadastrada'
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

    // Criar empresa
    const { data: newCompany, error: insertError } = await supabase
      .from('companies')
      .insert({
        nome: nome.trim(),
        data_vencimento: vencimentoDate.toISOString().split('T')[0],
        max_usuarios,
        usuarios_atuais: 0,
        celular: celular?.trim() || null,
        cpf_cnpj: cpf_cnpj?.trim() || null,
        status: companyStatus,
        data_criacao: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao criar empresa:', insertError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao criar empresa'
      })
    }

    return {
      success: true,
      data: { ...newCompany, users_count: 0 },
      message: 'Empresa criada com sucesso'
    }

  } catch (error) {
    console.error('Erro ao criar empresa:', error)
    throw error
  }
})