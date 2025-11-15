type CompanyRow = {
  id: string
  nome: string
  data_vencimento: string
  max_usuarios: number
  usuarios_atuais: number
  celular: string | null
  cpf_cnpj: string | null
  status: 'ativo' | 'desativado'
  created_at: string
  updated_at: string
}

export type CompanyDTO = {
  id: string
  nome: string
  dataVencimento: string
  maxUsuarios: number
  usuariosAtuais: number
  celular: string | null
  cpfCnpj: string | null
  status: 'ativo' | 'desativado'
  createdAt: string
  updatedAt: string
}

export const mapCompanyRow = (row: CompanyRow): CompanyDTO => ({
  id: row.id,
  nome: row.nome,
  dataVencimento: row.data_vencimento,
  maxUsuarios: row.max_usuarios,
  usuariosAtuais: row.usuarios_atuais,
  celular: row.celular,
  cpfCnpj: row.cpf_cnpj,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const parseDateOnly = (date: string): Date | null => {
  if (!date) return null
  const [year, month, day] = date.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

export const calcCompanyStatus = (date: string): 'ativo' | 'desativado' => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiration = parseDateOnly(date)
  if (!expiration) {
    return 'ativo'
  }
  expiration.setHours(0, 0, 0, 0)

  return expiration < today ? 'desativado' : 'ativo'
}


