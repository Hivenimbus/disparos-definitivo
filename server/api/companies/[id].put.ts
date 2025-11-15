import { readBody, createError } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { calcCompanyStatus, mapCompanyRow } from '../../utils/companies'

type UpdatePayload = {
  nome?: string
  dataVencimento?: string
  maxUsuarios?: number
  usuariosAtuais?: number
  celular?: string | null
  cpfCnpj?: string | null
  status?: 'ativo' | 'vencido'
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID da empresa é obrigatório' })
  }

  const supabase = getServiceSupabaseClient()
  const body = (await readBody(event)) as UpdatePayload

  const { data: existing, error: existingError } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (existingError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Empresa não encontrada' })
  }

  const updates: Record<string, any> = {}

  if (body.nome !== undefined) {
    const trimmed = body.nome.trim()
    if (!trimmed) {
      throw createError({ statusCode: 400, statusMessage: 'Nome não pode ser vazio' })
    }
    updates.nome = trimmed
  }

  let newDataVencimento = existing.data_vencimento
  let shouldSyncUsers = false

  if (body.dataVencimento !== undefined) {
    if (!body.dataVencimento) {
      throw createError({ statusCode: 400, statusMessage: 'Data de vencimento inválida' })
    }
    newDataVencimento = body.dataVencimento
    updates.data_vencimento = body.dataVencimento
    shouldSyncUsers = body.dataVencimento !== existing.data_vencimento
  }

  let newMaxUsuarios = existing.max_usuarios

  if (body.maxUsuarios !== undefined) {
    if (body.maxUsuarios <= 0) {
      throw createError({ statusCode: 400, statusMessage: 'Número máximo de usuários deve ser maior que zero' })
    }
    newMaxUsuarios = body.maxUsuarios
    updates.max_usuarios = body.maxUsuarios
  }

  let newUsuariosAtuais = existing.usuarios_atuais

  if (body.usuariosAtuais !== undefined) {
    if (body.usuariosAtuais < 0) {
      throw createError({ statusCode: 400, statusMessage: 'Usuários atuais inválido' })
    }
    newUsuariosAtuais = body.usuariosAtuais
    updates.usuarios_atuais = body.usuariosAtuais
  }

  if (newUsuariosAtuais > newMaxUsuarios) {
    throw createError({ statusCode: 400, statusMessage: 'Usuários atuais não pode exceder o máximo permitido' })
  }

  if (body.celular !== undefined) {
    updates.celular = body.celular?.trim() || null
  }

  if (body.cpfCnpj !== undefined) {
    updates.cpf_cnpj = body.cpfCnpj?.trim() || null
  }

  const newStatus = body.status ?? calcCompanyStatus(newDataVencimento)
  updates.status = newStatus

  const { data, error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', id)
    .select('*')
    .single()

  if (error || !data) {
    console.error('[companies] PUT error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar empresa' })
  }

  if (shouldSyncUsers && newDataVencimento) {
    const { error: usersUpdateError } = await supabase
      .from('users')
      .update({ vencimento: newDataVencimento })
      .eq('company_id', id)

    if (usersUpdateError) {
      console.error('[companies] sync users vencimento error', usersUpdateError)
      throw createError({
        statusCode: 500,
        statusMessage: 'Empresa atualizada, mas não foi possível sincronizar os usuários vinculados.'
      })
    }
  }

  return {
    company: mapCompanyRow(data)
  }
})


