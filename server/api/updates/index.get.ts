import { createError } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { data: updates, error } = await supabase
    .from('updates')
    .select('id, title, description, content, created_at, created_by')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[updates] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar atualizações' })
  }

  return {
    updates: updates ?? []
  }
})
