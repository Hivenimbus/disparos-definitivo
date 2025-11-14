import { createClient } from '@supabase/supabase-js'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Verificar se é um admin
    const supabase = createClient(
      useRuntimeConfig().supabase.url,
      useRuntimeConfig().supabase.serviceRoleKey
    )

    // Obter dados do corpo da requisição
    const userData = await readBody(event)

    console.log('🔍 API: Criando usuário:', userData.email)

    // 1. Criar usuário no Supabase Auth usando Admin API
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.senha,
      email_confirm: true,
      user_metadata: {
        full_name: userData.nome,
        role: userData.role
      }
    })

    if (authError) {
      console.error('❌ API: Erro ao criar usuário no Auth:', authError)
      throw createError({
        statusCode: 400,
        message: authError.message
      })
    }

    if (!authData.user) {
      throw createError({
        statusCode: 400,
        message: 'Falha ao criar usuário no Auth'
      })
    }

    console.log('✅ API: Usuário criado no Auth:', authData.user.id)

    // 2. Inserir dados na tabela public.users
    const { data: userProfileData, error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: userData.email,
        full_name: userData.nome,
        role: userData.role,
        company_id: userData.empresaId,
        celular: userData.celular || null,
        cpf: userData.cpf || null,
        data_vencimento: userData.dataVencimento,
        status: userData.status || 'ativo',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select('*')
      .single()

    if (profileError) {
      console.error('❌ API: Erro ao inserir perfil:', profileError)
      // Tenta deletar o usuário do Auth se falhou
      await supabase.auth.admin.deleteUser(authData.user.id)
      throw createError({
        statusCode: 400,
        message: 'Falha ao criar perfil do usuário'
      })
    }

    console.log('✅ API: Perfil criado:', userProfileData)

    return {
      success: true,
      user: userProfileData
    }

  } catch (error: any) {
    console.error('❌ API: Erro:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || 'Erro interno do servidor'
    })
  }
})
