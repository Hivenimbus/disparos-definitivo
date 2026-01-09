import { readBody, createError, setResponseStatus } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'

type CreateUpdatePayload = {
  title: string
  description: string
  content: string
}

export default defineEventHandler(async (event) => {
  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Apenas administradores podem criar atualizações' })
  }

  const payload = (await readBody(event)) as CreateUpdatePayload

  if (!payload?.title?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Título é obrigatório' })
  }

  if (!payload?.description?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Descrição é obrigatória' })
  }

  if (!payload?.content?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'Conteúdo é obrigatório' })
  }

  const supabase = getServiceSupabaseClient()

  const { data: update, error } = await supabase
    .from('updates')
    .insert({
      title: payload.title.trim(),
      description: payload.description.trim(),
      content: payload.content.trim(),
      created_by: authUser.id
    })
    .select('id, title, description, content, created_at, created_by')
    .single()

  if (error || !update) {
    console.error('[updates] POST error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao criar atualização' })
  }

  setResponseStatus(event, 201)

  return {
    update
  }
})
