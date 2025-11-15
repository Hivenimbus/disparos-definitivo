import { createError, getQuery } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100

const mapLog = (row: any) => ({
  id: row.id,
  contactId: row.contact_id,
  contactName: row.contact_name,
  whatsapp: row.whatsapp,
  status: row.status,
  messagePreview: row.message_preview,
  attachments: Array.isArray(row.attachments) ? row.attachments : [],
  error: row.error,
  processedAt: row.processed_at ?? row.created_at,
  createdAt: row.created_at
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const supabase = getServiceSupabaseClient()

  const limitParam = Number(query.limit)
  const pageParam = Number(query.page)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam))
  const page = Math.max(1, Number.isNaN(pageParam) ? 1 : pageParam)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data: jobRow, error: jobError } = await supabase
    .from('dashboard_send_jobs')
    .select('id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (jobError) {
    console.error('[dashboard/send/logs] job lookup error', jobError)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar disparo atual' })
  }

  if (!jobRow) {
    return {
      logs: [],
      meta: {
        page,
        limit,
        total: 0
      }
    }
  }

  let request = supabase
    .from('dashboard_send_job_logs')
    .select('id, contact_id, contact_name, whatsapp, status, message_preview, attachments, error, processed_at, created_at', { count: 'exact' })
    .eq('job_id', jobRow.id)
    .order('created_at', { ascending: false })

  if (typeof query.status === 'string' && ['pending', 'success', 'failed'].includes(query.status)) {
    request = request.eq('status', query.status)
  }

  const { data, error, count } = await request.range(from, to)

  if (error) {
    console.error('[dashboard/send/logs] fetch error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar histórico do disparo' })
  }

  return {
    logs: (data ?? []).map(mapLog),
    meta: {
      page,
      limit,
      total: count ?? 0
    }
  }
})

