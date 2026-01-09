import { createError, getRouterParam } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Apenas administradores podem apagar atualizações' })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID da atualização é obrigatório' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: deleted, error } = await supabase
    .from('updates')
    .delete()
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    console.error('[updates] DELETE error', error)
    if (error.code === 'PGRST116') {
      throw createError({ statusCode: 404, statusMessage: 'Atualização não encontrada' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao apagar atualização' })
  }

  return { success: true, deletedId: deleted?.id }
})
