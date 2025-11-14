type CompanyRow = {
  id: string
  nome: string
  data_vencimento: string
  max_usuarios: number
  usuarios_atuais: number
  celular: string | null
  cpf_cnpj: string | null
  status: 'ativo' | 'vencido'
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
  status: 'ativo' | 'vencido'
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

export const calcCompanyStatus = (date: string): 'ativo' | 'vencido' => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const expiration = new Date(date)
  expiration.setHours(0, 0, 0, 0)

  return expiration < today ? 'vencido' : 'ativo'
}


