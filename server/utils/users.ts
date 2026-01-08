import { createError } from 'h3'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

type DbRole = 'admin' | 'manager' | 'user'
type UiRole = 'admin' | 'gerente' | 'usuario'
type DbStatus = 'ativo' | 'desativado'
type UiStatus = 'ativo' | 'desativado'

export type CompanyRow = {
  id: string
  nome: string | null
  status: DbStatus
  data_vencimento?: string | null
  max_usuarios: number
  usuarios_atuais: number
}

export type UserRow = {
  id: string
  nome: string
  email: string
  empresa: string | null
  numero: string | null
  vencimento: string | null
  status: DbStatus
  role: DbRole
  company_id: string | null
  cpf: string | null
  created_at: string
  updated_at: string
  must_change_password: boolean
  maturador_enabled: boolean
}

export type UserRowWithCompany = UserRow & {
  companies?: CompanyRow | null
}

export type AdminUserDTO = {
  id: string
  nome: string
  email: string
  empresaId: string | null
  empresaNome: string | null
  celular: string | null
  cpf: string | null
  dataVencimento: string | null
  status: UiStatus
  statusLabel: 'ativo' | 'desativado'
  role: UiRole
  createdAt: string
  updatedAt: string
  mustChangePassword: boolean
  maturadorEnabled: boolean
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const mapRoleToUi = (role: DbRole): UiRole => {
  switch (role) {
    case 'admin':
      return 'admin'
    case 'manager':
      return 'gerente'
    default:
      return 'usuario'
  }
}

export const mapRoleToDb = (role: UiRole | string | undefined): DbRole => {
  switch (role) {
    case 'admin':
      return 'admin'
    case 'gerente':
    case 'manager':
      return 'manager'
    default:
      return 'user'
  }
}

export const mapStatusToUi = (status: DbStatus): UiStatus => (status === 'desativado' ? 'desativado' : 'ativo')

export const mapStatusToDb = (status: UiStatus | string | undefined): DbStatus =>
  status === 'desativado' ? 'desativado' : 'ativo'

const parseDateOnly = (dateString: string | null): Date | null => {
  if (!dateString) return null
  const [year, month, day] = dateString.split('-').map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

const computeStatusLabel = (uiStatus: UiStatus, dataVencimento: string | null): 'ativo' | 'desativado' => {
  const expiration = parseDateOnly(dataVencimento)
  if (expiration) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    expiration.setHours(0, 0, 0, 0)

    if (expiration < today) {
      return 'desativado'
    }
  }

  return uiStatus === 'desativado' ? 'desativado' : 'ativo'
}

export const mapAdminUserRow = (row: UserRowWithCompany): AdminUserDTO => {
  const uiStatus = mapStatusToUi(row.status)
  const companyName = row.empresa || row.companies?.nome || null

  return {
    id: row.id,
    nome: row.nome,
    email: row.email,
    empresaId: row.company_id,
    empresaNome: companyName,
    celular: row.numero,
    cpf: row.cpf,
    dataVencimento: row.vencimento,
    status: uiStatus,
    statusLabel: computeStatusLabel(uiStatus, row.vencimento),
    role: mapRoleToUi(row.role),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    mustChangePassword: row.must_change_password,
    maturadorEnabled: row.maturador_enabled ?? false
  }
}

export const fetchCompanyById = async (
  supabase: SupabaseClient,
  companyId: string
): Promise<CompanyRow> => {
  const { data, error } = await supabase
    .from('companies')
    .select('id, nome, status, data_vencimento, max_usuarios, usuarios_atuais')
    .eq('id', companyId)
    .single()

  if (error || !data) {
    throw createHttpError(404, 'Empresa não encontrada', error)
  }

  return data
}

export const ensureCompanyCapacity = (company: CompanyRow) => {
  if (company.usuarios_atuais >= company.max_usuarios) {
    throw createHttpError(409, `Limite de usuários atingido para a empresa ${company.nome || ''}`)
  }
}

export const buildCompanyUpdatePayload = (company: CompanyRow, delta: number) => {
  const novoValor = Math.max(0, company.usuarios_atuais + delta)
  return { usuarios_atuais: novoValor }
}

const createHttpError = (statusCode: number, statusMessage: string, error?: PostgrestError) => {
  if (error) {
    console.error('[users] Supabase error', error)
  }
  return createError({ statusCode, statusMessage })
}


