import { createError } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { mapCompanyRow } from '../../utils/companies'

export default defineEventHandler(async () => {
  const supabase = getServiceSupabaseClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[companies] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao listar empresas' })
  }

  return {
    companies: (data ?? []).map(mapCompanyRow)
  }
})


