import { serverSupabaseClient, serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

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
    const serviceRole = serverSupabaseServiceRole(event)

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
      email,
      password,
      full_name,
      role,
      company_id,
      celular,
      cpf,
      dataVencimento,
      status
    } = body

    // Validações básicas
    if (!email || !password || !full_name) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email, senha e nome são obrigatórios'
      })
    }

    if (!role || !['admin', 'user', 'manager'].includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Role inválida'
      })
    }

    // Verificar limite de usuários se for associado a uma empresa
    if (company_id) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('max_usuarios, usuarios_atuais, status')
        .eq('id', company_id)
        .single()

      if (companyError || !company) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Empresa não encontrada'
        })
      }

      if (company.status !== 'ativo') {
        throw createError({
          statusCode: 400,
          statusMessage: 'Empresa não está ativa'
        })
      }

      if (company.usuarios_atuais >= company.max_usuarios) {
        throw createError({
          statusCode: 400,
          statusMessage: `Limite de usuários excedido. Máximo: ${company.max_usuarios}`
        })
      }
    }

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single()

    if (existingUser) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email já cadastrado'
      })
    }

    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await serviceRole.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role
      }
    })

    if (authError) {
      console.error('Erro ao criar usuário no Auth:', authError)
      throw createError({
        statusCode: 400,
        statusMessage: 'Erro ao criar usuário: ' + authError.message
      })
    }

    // Criar registro na tabela users
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role,
        company_id: company_id || null,
        celular: celular || null,
        cpf: cpf || null,
        data_vencimento: dataVencimento ? new Date(dataVencimento) : null,
        status: status || 'ativo'
      })
      .select(`
        *,
        companies:company_id (
          id,
          nome
        )
      `)
      .single()

    if (insertError) {
      console.error('Erro ao inserir usuário na tabela:', insertError)
      // Tentar remover usuário criado no Auth
      await serviceRole.auth.admin.deleteUser(authData.user.id)

      throw createError({
        statusCode: 500,
        statusMessage: 'Erro ao criar registro do usuário'
      })
    }

    return {
      success: true,
      data: newUser,
      message: 'Usuário criado com sucesso'
    }

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    throw error
  }
})