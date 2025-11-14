import { readBody, createError, setResponseStatus } from 'h3'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { hashPassword } from '../../utils/password'

type RegisterBody = {
  nome: string
  email: string
  password: string
  empresa?: string
  vencimento?: string
  numero?: string
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as RegisterBody

  if (!body?.nome) {
    throw createError({ statusCode: 400, statusMessage: 'Nome é obrigatório' })
  }

  if (!body?.email) {
    throw createError({ statusCode: 400, statusMessage: 'Email é obrigatório' })
  }

  if (!body?.password || body.password.length < 8) {
    throw createError({ statusCode: 400, statusMessage: 'Senha inválida' })
  }

  const email = normalizeEmail(body.email)
  const passwordHash = await hashPassword(body.password)

  let supabase: SupabaseClient
  try {
    supabase = getServiceSupabaseClient()
  } catch (error) {
    console.error('[auth/register] Configuração Supabase ausente', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Configuração do banco ausente. Verifique as variáveis do Supabase.'
    })
  }

  let data: Record<string, any> | null = null
  try {
    const response = await supabase
      .from('users')
      .insert({
        nome: body.nome.trim(),
        email,
        senha_hash: passwordHash,
        empresa: body.empresa?.trim() || null,
        vencimento: body.vencimento || null,
        numero: body.numero?.trim() || null,
        status: 'ativo',
        role: 'user'
      })
      .select('id, nome, email, role, status, empresa, numero, vencimento, created_at')
      .single()

    if (response.error) {
      throw response.error
    }

    data = response.data
  } catch (error: any) {
    console.error('[auth/register] Erro ao inserir usuário', error)

    if (error && typeof error === 'object' && 'code' in error && error.code === '23505') {
      throw createError({ statusCode: 409, statusMessage: 'Email já cadastrado' })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro interno ao criar usuário. Tente novamente em instantes.'
    })
  }

  if (!data) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Falha desconhecida ao criar usuário.'
    })
  }

  setResponseStatus(event, 201)

  return {
    user: data
  }
})

