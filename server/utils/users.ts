import { createError } from 'h3'
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js'

type DbRole = 'admin' | 'user'
type UiRole = 'admin' | 'usuario'
type DbStatus = 'ativo' | 'desativado'
type UiStatus = 'ativo' | 'bloqueado'

type CompanyRow = {
  id: string
  nome: string | null
  max_usuarios: number
  usuarios_atuais: number
}

type UserRow = {
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
}

type UserRowWithCompany = UserRow & {
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
  statusLabel: 'ativo' | 'bloqueado' | 'vencido'
  role: UiRole
  createdAt: string
  updatedAt: string
}

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

export const mapRoleToUi = (role: DbRole): UiRole => (role === 'admin' ? 'admin' : 'usuario')

export const mapRoleToDb = (role: UiRole | string | undefined): DbRole => (role === 'admin' ? 'admin' : 'user')

export const mapStatusToUi = (status: DbStatus): UiStatus => (status === 'desativado' ? 'bloqueado' : 'ativo')

export const mapStatusToDb = (status: UiStatus | string | undefined): DbStatus =>
  status === 'bloqueado' ? 'desativado' : 'ativo'

const computeStatusLabel = (uiStatus: UiStatus, dataVencimento: string | null): 'ativo' | 'bloqueado' | 'vencido' => {
  if (dataVencimento) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const expiration = new Date(dataVencimento)
    expiration.setHours(0, 0, 0, 0)

    if (expiration < today) {
      return 'vencido'
    }
  }

  return uiStatus === 'bloqueado' ? 'bloqueado' : 'ativo'
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
    updatedAt: row.updated_at
  }
}

export const fetchCompanyById = async (
  supabase: SupabaseClient,
  companyId: string
): Promise<CompanyRow> => {
  const { data, error } = await supabase
    .from('companies')
    .select('id, nome, max_usuarios, usuarios_atuais')
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


