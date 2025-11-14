import { createError, setResponseStatus } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID da empresa é obrigatório' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: existing, error: existingError } = await supabase
    .from('companies')
    .select('id, usuarios_atuais')
    .eq('id', id)
    .single()

  if (existingError || !existing) {
    throw createError({ statusCode: 404, statusMessage: 'Empresa não encontrada' })
  }

  if (existing.usuarios_atuais > 0) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Não é possível excluir empresas com usuários vinculados'
    })
  }

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('[companies] DELETE error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir empresa' })
  }

  setResponseStatus(event, 204)
})


