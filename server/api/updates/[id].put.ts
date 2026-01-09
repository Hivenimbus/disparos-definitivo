import { readBody, createError, getRouterParam } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'

type UpdatePayload = {
  title?: string
  description?: string
  content?: string
}

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Apenas administradores podem editar atualizações' })
  }

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID da atualização é obrigatório' })
  }

  const payload = (await readBody(event)) as UpdatePayload

  const updateData: Record<string, string> = {}

  if (payload.title !== undefined) {
    if (!payload.title.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Título não pode estar vazio' })
    }
    updateData.title = payload.title.trim()
  }

  if (payload.description !== undefined) {
    if (!payload.description.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Descrição não pode estar vazia' })
    }
    updateData.description = payload.description.trim()
  }

  if (payload.content !== undefined) {
    if (!payload.content.trim()) {
      throw createError({ statusCode: 400, statusMessage: 'Conteúdo não pode estar vazio' })
    }
    updateData.content = payload.content.trim()
  }

  if (Object.keys(updateData).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum dado para atualizar' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: update, error } = await supabase
    .from('updates')
    .update(updateData)
    .eq('id', id)
    .select('id, title, description, content, created_at, created_by')
    .single()

  if (error) {
    console.error('[updates] PUT error', error)
    if (error.code === 'PGRST116') {
      throw createError({ statusCode: 404, statusMessage: 'Atualização não encontrada' })
    }
    throw createError({ statusCode: 500, statusMessage: 'Erro ao atualizar' })
  }

  return { update }
})
