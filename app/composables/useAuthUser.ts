type AuthUser = {
  id: string
  nome: string
  email: string
  role: 'admin' | 'manager' | 'user'
  status: 'ativo' | 'desativado'
  empresa: string | null
  numero: string | null
  vencimento: string | null
  created_at: string
  mustChangePassword?: boolean
}

export const useAuthUser = () => useState<AuthUser | null>('auth-user', () => null)


