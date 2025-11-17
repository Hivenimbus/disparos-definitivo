import jwt from 'jsonwebtoken'

type AuthTokenPayload = {
  sub: string
  email: string
  role: 'admin' | 'manager' | 'user'
  status: 'ativo' | 'desativado'
}

const getJwtSecret = (): string => {
  const config = useRuntimeConfig()
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET não configurado')
  }
  return config.jwtSecret
}

export const signAuthToken = (payload: AuthTokenPayload, expiresIn = '7d'): string => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn })
}

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, getJwtSecret()) as AuthTokenPayload
}

