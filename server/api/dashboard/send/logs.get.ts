import { createError, getQuery } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 100
const ORDER_VALUES = ['asc', 'desc'] as const

const mapLog = (row: any) => {
  let attachments = row.attachments

  if (attachments && !Array.isArray(attachments)) {
    try {
      attachments = JSON.parse(attachments)
    } catch {
      attachments = []
    }
  }

  return {
    id: row.id,
    contactId: row.contact_id,
    contactName: row.contact_name,
    whatsapp: row.whatsapp,
    status: row.status,
    messagePreview: row.message_preview,
    attachments: attachments ?? [],
    error: row.error,
    processedAt: row.processed_at ?? null,
    createdAt: row.created_at
  }
}

const getStatusFilter = (statusParam?: string | string[]) => {
  if (typeof statusParam === 'string') {
    if (statusParam === 'finalized') {
      return ['success', 'failed']
    }
    if (['pending', 'success', 'failed'].includes(statusParam)) {
      return [statusParam]
    }
  }
  return null
}

const getOrderDirection = (value?: string | string[]) => {
  if (typeof value === 'string' && ORDER_VALUES.includes(value as (typeof ORDER_VALUES)[number])) {
    return value as 'asc' | 'desc'
  }
  return 'desc'
}

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
  const orderDirection = getOrderDirection(query.order)
  const statusFilter = getStatusFilter(query.status)

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

  const buildBaseQuery = () =>
    supabase
      .from('dashboard_send_job_logs')
      .select('id, contact_id, contact_name, whatsapp, status, message_preview, attachments, error, processed_at, created_at', { count: 'exact' })
      .eq('job_id', jobRow.id)

  if (statusFilter && statusFilter.length === 1 && statusFilter[0] === 'pending') {
    const { data, error, count } = await buildBaseQuery()
      .eq('status', 'pending')
      .order('processed_at', { ascending: true, nullsFirst: true })
      .order('created_at', { ascending: true })
      .range(from, to)

    if (error) {
      console.error('[dashboard/send/logs] fetch pending error', error)
      throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar pendências do disparo' })
    }

    return {
      logs: (data ?? []).map(mapLog),
      meta: {
        page,
        limit,
        total: count ?? 0
      }
    }
  }

  const request =
    statusFilter && statusFilter.length === 1
      ? buildBaseQuery().eq('status', statusFilter[0])
      : statusFilter
        ? buildBaseQuery().in('status', statusFilter)
        : buildBaseQuery().neq('status', 'pending')

  const { data, error, count } = await request
    .order('processed_at', { ascending: orderDirection === 'asc', nullsLast: true })
    .order('created_at', { ascending: orderDirection === 'asc' })
    .range(from, to)

  if (error) {
    console.error('[dashboard/send/logs] fetch logs error', error)
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

