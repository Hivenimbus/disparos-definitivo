import { readBody, createError, setCookie } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { verifyPassword } from '../../utils/password'
import { signAuthToken } from '../../utils/jwt'

type LoginBody = {
  email: string
  password: string
}

const normalizeEmail = (email: string) => email.trim().toLowerCase()

export default defineEventHandler(async (event) => {
  const body = (await readBody(event)) as LoginBody

  if (!body?.email || !body?.password) {
    throw createError({ statusCode: 400, statusMessage: 'Email e senha são obrigatórios' })
  }

  const email = normalizeEmail(body.email)
  const supabase = getServiceSupabaseClient()

  const { data: user, error } = await supabase
    .from('users')
    .select('id, nome, email, senha_hash, role, status, empresa, numero, vencimento, created_at')
    .eq('email', email)
    .single()

  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou senha inválidos' })
  }

  if (user.status !== 'ativo') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Sua conta está desativada. Entre em contato com o suporte.'
    })
  }

  const isPasswordValid = await verifyPassword(body.password, user.senha_hash)

  if (!isPasswordValid) {
    throw createError({ statusCode: 401, statusMessage: 'Email ou senha inválidos' })
  }

  const token = signAuthToken({
    sub: user.id,
    email: user.email,
    role: user.role,
    status: user.status
  })

  const isProd = process.env.NODE_ENV === 'production'

  setCookie(event, 'auth_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 dias
  })

  return {
    token,
    user: {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      status: user.status,
      empresa: user.empresa,
      numero: user.numero,
      vencimento: user.vencimento,
      created_at: user.created_at
    }
  }
})

