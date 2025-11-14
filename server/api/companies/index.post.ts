import { readBody, createError, setResponseStatus } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { calcCompanyStatus, mapCompanyRow } from '../../utils/companies'

type CompanyPayload = {
  nome: string
  dataVencimento: string
  maxUsuarios: number
  usuariosAtuais?: number
  celular?: string | null
  cpfCnpj?: string | null
  status?: 'ativo' | 'vencido'
}

const validatePayload = (payload: CompanyPayload) => {
  if (!payload?.nome?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Nome da empresa é obrigatório' })
  }

  if (!payload?.dataVencimento) {
    throw createError({ statusCode: 400, statusMessage: 'Data de vencimento é obrigatória' })
  }

  if (!payload?.maxUsuarios || payload.maxUsuarios <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'Número máximo de usuários inválido' })
  }

  const usuariosAtuais = payload.usuariosAtuais ?? 0

  if (usuariosAtuais < 0) {
    throw createError({ statusCode: 400, statusMessage: 'Usuários atuais não pode ser negativo' })
  }

  if (usuariosAtuais > payload.maxUsuarios) {
    throw createError({ statusCode: 400, statusMessage: 'Usuários atuais não pode exceder o máximo permitido' })
  }
}

export default defineEventHandler(async (event) => {
  const supabase = getServiceSupabaseClient()
  const body = (await readBody(event)) as CompanyPayload

  validatePayload(body)

  const status = body.status ?? calcCompanyStatus(body.dataVencimento)
  const usuariosAtuais = body.usuariosAtuais ?? 0

  const { data, error } = await supabase
    .from('companies')
    .insert({
      nome: body.nome.trim(),
      data_vencimento: body.dataVencimento,
      max_usuarios: body.maxUsuarios,
      usuarios_atuais: usuariosAtuais,
      celular: body.celular?.trim() || null,
      cpf_cnpj: body.cpfCnpj?.trim() || null,
      status
    })
    .select('*')
    .single()

  if (error) {
    console.error('[companies] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar empresa' })
  }

  setResponseStatus(event, 201)

  return {
    company: mapCompanyRow(data)
  }
})


