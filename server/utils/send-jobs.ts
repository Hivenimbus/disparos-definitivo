import { createError } from 'h3'
import { $fetch } from 'ofetch'
import type { AuthenticatedUser } from './auth'
import type { SendJobStatus, SendJobSummary } from '~/types/send-job'
import { getEvolutionConfig, sanitizePhoneNumber } from './evolution'
import { getServiceSupabaseClient } from './supabase'

type ContactRow = {
  id: string
  name: string | null
  whatsapp: string
  var1: string | null
  var2: string | null
  var3: string | null
}

type AttachmentRow = {
  id: string
  file_name: string
  mime_type: string
  public_url: string
  caption: string | null
}

type AttachmentDescriptor = {
  type: string
  name: string
  caption: string | null
}

type MessageRow = {
  id: string
  body: string | null
  attachments?: AttachmentRow[]
}

type ConfigRow = {
  intervalo_segundos: number | null
}

type JobRow = {
  id: string
  user_id: string
  status: SendJobStatus
  total_contacts: number
  processed_contacts: number
  success_contacts: number
  failed_contacts: number
  requested_stop: boolean
  last_error: string | null
  last_contact_name: string | null
  started_at: string | null
  finished_at: string | null
  created_at: string
  updated_at: string
}

type ActiveJob = {
  runtime: SendJobSummary
  messageBody: string
  attachments: AttachmentRow[]
  attachmentDescriptors: AttachmentDescriptor[]
  contacts: ContactRow[]
  delayMs: number
  userId: string
}

const FINISHED_STATUSES: SendJobStatus[] = ['completed', 'failed', 'stopped']

const activeJobs = new Map<string, ActiveJob>()

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const normalizeSummary = (row: JobRow): SendJobSummary => ({
  id: row.id,
  status: row.status,
  totalContacts: row.total_contacts,
  processedContacts: row.processed_contacts,
  successContacts: row.success_contacts,
  failedContacts: row.failed_contacts,
  requestedStop: row.requested_stop,
  lastError: row.last_error,
  lastContactName: row.last_contact_name,
  startedAt: row.started_at,
  finishedAt: row.finished_at,
  createdAt: row.created_at,
  updatedAt: row.updated_at
})

const runtimeToSummary = (runtime: SendJobSummary): SendJobSummary => ({ ...runtime })

const resolveSpintax = (text: string) => {
  return text.replace(/\{([^{}]+)\}/g, (match, token: string) => {
    const lower = token.toLowerCase()
    if (['nome', 'var1', 'var2', 'var3'].includes(lower)) {
      return match
    }
    if (!token.includes('|')) {
      return match
    }
    const options = token.split('|').map((value) => value.trim()).filter(Boolean)
    if (options.length === 0) {
      return match
    }
    const randomIndex = Math.floor(Math.random() * options.length)
    return options[randomIndex]
  })
}

const renderMessage = (body: string, contact: ContactRow) => {
  if (!body) return ''
  let rendered = resolveSpintax(body)
  rendered = rendered.replace(/\{([^{}]+)\}/g, (_, key: string) => {
    const normalized = key.trim().toLowerCase()
    if (normalized === 'nome') {
      return contact.name?.trim() || ''
    }
    if (['var1', 'var2', 'var3'].includes(normalized)) {
      const variables: Record<'var1' | 'var2' | 'var3', string | null> = {
        var1: contact.var1,
        var2: contact.var2,
        var3: contact.var3
      }
      return variables[normalized as 'var1' | 'var2' | 'var3']?.trim() || ''
    }
    return `{${key}}`
  })
  return rendered.trim()
}

const deriveMediaType = (mime?: string) => {
  if (!mime) return 'document'
  if (mime.startsWith('image/')) return 'image'
  if (mime.startsWith('video/')) return 'video'
  return 'document'
}

const mapAttachmentDescriptor = (attachment: AttachmentRow): AttachmentDescriptor => ({
  type: deriveMediaType(attachment.mime_type),
  name: attachment.file_name,
  caption: attachment.caption || null
})

const insertContactLogs = async (
  jobId: string,
  contacts: ContactRow[],
  attachments: AttachmentDescriptor[]
) => {
  if (contacts.length === 0) {
    return
  }

  const supabase = getServiceSupabaseClient()
  const now = new Date().toISOString()

  const rows = contacts.map((contact) => ({
    job_id: jobId,
    contact_id: contact.id,
    contact_name: contact.name,
    whatsapp: contact.whatsapp,
    status: 'pending',
    attachments,
    created_at: now,
    updated_at: now
  }))

  const { error } = await supabase.from('dashboard_send_job_logs').insert(rows)

  if (error) {
    console.error('[send-jobs] insertContactLogs error', error)
  }
}

const updateContactLog = async (
  jobId: string,
  contact: ContactRow,
  patch: Record<string, any>
) => {
  const supabase = getServiceSupabaseClient()
  const where = contact.id
    ? { job_id: jobId, contact_id: contact.id }
    : { job_id: jobId, whatsapp: contact.whatsapp }

  const payload = {
    ...patch,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase.from('dashboard_send_job_logs').update(payload).match(where)

  if (error) {
    console.error('[send-jobs] updateContactLog error', {
      jobId,
      contactId: contact.id,
      error
    })
  }
}

const sendTextMessage = async (instance: string, number: string, text: string) => {
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()
  await $fetch(`/message/sendText/${instance}`, {
    baseURL: evolutionApiUrl,
    method: 'POST',
    headers: { apikey: evolutionApiKey },
    body: { number, text }
  })
}

const sendMediaMessage = async (instance: string, number: string, attachment: AttachmentRow) => {
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()
  const mediatype = deriveMediaType(attachment.mime_type)
  await $fetch(`/message/sendMedia/${instance}`, {
    baseURL: evolutionApiUrl,
    method: 'POST',
    headers: { apikey: evolutionApiKey },
    body: {
      number,
      mediatype,
      mimetype: attachment.mime_type,
      caption: attachment.caption ?? '',
      media: attachment.public_url,
      fileName: attachment.file_name
    }
  })
}

const sendAudioMessage = async (instance: string, number: string, attachment: AttachmentRow) => {
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()
  await $fetch(`/message/sendAudio/${instance}`, {
    baseURL: evolutionApiUrl,
    method: 'POST',
    headers: { apikey: evolutionApiKey },
    body: {
      number,
      mimetype: attachment.mime_type,
      audio: attachment.public_url,
      fileName: attachment.file_name,
      caption: attachment.caption ?? ''
    }
  })
}

const updateJobRow = async (jobId: string, patch: Partial<JobRow>) => {
  const supabase = getServiceSupabaseClient()
  const payload = {
    ...patch,
    updated_at: new Date().toISOString()
  }
  await supabase
    .from('dashboard_send_jobs')
    .update(payload)
    .eq('id', jobId)
}

const fetchLatestJob = async (userId: string): Promise<JobRow | null> => {
  const supabase = getServiceSupabaseClient()
  const { data, error } = await supabase
    .from('dashboard_send_jobs')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[send-jobs] fetchLatestJob error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar status de disparo' })
  }

  return data ?? null
}

const createQueuedJob = async (userId: string, totalContacts: number) => {
  const supabase = getServiceSupabaseClient()
  const { data, error } = await supabase
    .from('dashboard_send_jobs')
    .insert({
      user_id: userId,
      status: 'queued',
      total_contacts: totalContacts,
      processed_contacts: 0,
      success_contacts: 0,
      failed_contacts: 0
    })
    .select('*')
    .single()

  if (error || !data) {
    console.error('[send-jobs] create job error', error)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível criar o registro do disparo' })
  }

  return data as JobRow
}

const handleContactSend = async (activeJob: ActiveJob, contact: ContactRow) => {
  const sanitizedNumber = sanitizePhoneNumber(contact.whatsapp)
  if (!sanitizedNumber) {
    throw new Error('Número de WhatsApp inválido')
  }

  const instanceId = activeJob.userId
  const attachments = activeJob.attachments
  const messageBody = activeJob.messageBody

  let messagePreview = ''

  if (messageBody.trim().length > 0) {
    messagePreview = renderMessage(messageBody, contact)
    if (messagePreview.length > 0) {
      await sendTextMessage(instanceId, sanitizedNumber, messagePreview)
    }
  }

  for (const attachment of attachments) {
    if (!attachment.public_url) continue
    if (attachment.mime_type?.startsWith('audio/')) {
      await sendAudioMessage(instanceId, sanitizedNumber, attachment)
    } else {
      await sendMediaMessage(instanceId, sanitizedNumber, attachment)
    }
  }

  return { messagePreview }
}

const runJob = async (activeJob: ActiveJob) => {
  const runtime = activeJob.runtime
  const startedAt = new Date().toISOString()

  runtime.status = 'processing'
  runtime.startedAt = startedAt

  await updateJobRow(runtime.id, {
    status: 'processing',
    started_at: startedAt,
    processed_contacts: 0,
    success_contacts: 0,
    failed_contacts: 0
  })

  console.info('[send-jobs] job started', {
    jobId: runtime.id,
    userId: activeJob.userId,
    total: runtime.totalContacts
  })

  try {
    for (const contact of activeJob.contacts) {
      if (runtime.requestedStop) break

      runtime.lastContactName = contact.name ?? contact.whatsapp

      let messagePreview = ''

      try {
        const result = await handleContactSend(activeJob, contact)
        messagePreview = result.messagePreview || ''
        runtime.successContacts += 1
        await updateContactLog(runtime.id, contact, {
          status: 'success',
          message_preview: messagePreview || null,
          attachments: activeJob.attachmentDescriptors,
          error: null,
          processed_at: new Date().toISOString()
        })
      } catch (error: any) {
        runtime.failedContacts += 1
        runtime.lastError = error?.message || 'Falha ao enviar mensagem'
        console.error('[send-jobs] contact send error', {
          jobId: runtime.id,
          contactId: contact.id,
          error
        })
        await updateContactLog(runtime.id, contact, {
          status: 'failed',
          message_preview: messagePreview || null,
          attachments: activeJob.attachmentDescriptors,
          error: runtime.lastError,
          processed_at: new Date().toISOString()
        })
      }

      runtime.processedContacts += 1

      await updateJobRow(runtime.id, {
        processed_contacts: runtime.processedContacts,
        success_contacts: runtime.successContacts,
        failed_contacts: runtime.failedContacts,
        requested_stop: runtime.requestedStop,
        last_error: runtime.lastError,
        last_contact_name: runtime.lastContactName
      })

      if (runtime.requestedStop) break
      if (activeJob.delayMs > 0 && runtime.processedContacts < runtime.totalContacts) {
        await wait(activeJob.delayMs)
      }
    }

    runtime.status = runtime.requestedStop ? 'stopped' : 'completed'
  } catch (error: any) {
    runtime.status = 'failed'
    runtime.lastError = error?.message || 'Falha inesperada no disparo'
    console.error('[send-jobs] fatal job error', { jobId: runtime.id, error })
  } finally {
    runtime.finishedAt = new Date().toISOString()
    try {
      await updateJobRow(runtime.id, {
        status: runtime.status,
        finished_at: runtime.finishedAt,
        requested_stop: runtime.requestedStop,
        last_error: runtime.lastError,
        last_contact_name: runtime.lastContactName
      })
      if (runtime.status === 'stopped') {
        await deleteJobData(runtime.id)
      }
    } finally {
      activeJobs.delete(activeJob.userId)
    }
  }
}

const loadMessageData = async (userId: string): Promise<MessageRow | null> => {
  const supabase = getServiceSupabaseClient()
  const { data, error } = await supabase
    .from('dashboard_messages')
    .select(`
      id,
      body,
      attachments:dashboard_message_attachments (
        id,
        file_name,
        mime_type,
        public_url,
        caption
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[send-jobs] load message error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar mensagem configurada' })
  }

  return data ?? null
}

const loadContacts = async (userId: string): Promise<ContactRow[]> => {
  const supabase = getServiceSupabaseClient()
  const { data, error } = await supabase
    .from('dashboard_contacts')
    .select('id, name, whatsapp, var1, var2, var3')
    .eq('user_id', userId)
    .neq('whatsapp', '')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[send-jobs] load contacts error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar contatos' })
  }

  return data ?? []
}

const loadConfig = async (userId: string): Promise<ConfigRow | null> => {
  const supabase = getServiceSupabaseClient()
  const { data } = await supabase
    .from('configuracoes')
    .select('intervalo_segundos')
    .eq('user_id', userId)
    .maybeSingle()
  return data ?? null
}

export const startSendJob = async (user: AuthenticatedUser) => {
  if (activeJobs.has(user.id)) {
    throw createError({ statusCode: 409, statusMessage: 'Já existe um disparo em andamento' })
  }

  const [messageRow, contacts, config] = await Promise.all([
    loadMessageData(user.id),
    loadContacts(user.id),
    loadConfig(user.id)
  ])

  if (!messageRow) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhuma mensagem configurada para envio' })
  }

  const messageBody = messageRow.body?.trim() ?? ''
  const attachments = (messageRow.attachments ?? []).filter((attachment) => !!attachment.public_url)
  const attachmentDescriptors = attachments.map(mapAttachmentDescriptor)

  if (messageBody.length === 0 && attachments.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Configure uma mensagem ou mídias antes de iniciar o disparo' })
  }

  if (contacts.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Nenhum contato disponível para disparo' })
  }

  const delaySeconds = config?.intervalo_segundos ?? 10
  const delayMs = Math.max(0, delaySeconds) * 1000

  const jobRow = await createQueuedJob(user.id, contacts.length)
  const runtime = normalizeSummary(jobRow)
  await insertContactLogs(runtime.id, contacts, attachmentDescriptors)
  const activeJob: ActiveJob = {
    runtime,
    messageBody,
    attachments,
    attachmentDescriptors,
    contacts,
    delayMs,
    userId: user.id
  }

  activeJobs.set(user.id, activeJob)

  runJob(activeJob).catch((error) => {
    console.error('[send-jobs] unexpected runner error', error)
  })

  return runtimeToSummary(runtime)
}

export const requestStopSendJob = async (userId: string) => {
  const activeJob = activeJobs.get(userId)
  if (!activeJob) {
    const lastJob = await fetchLatestJob(userId)
    if (!lastJob || FINISHED_STATUSES.includes(lastJob.status)) {
      throw createError({ statusCode: 404, statusMessage: 'Nenhum disparo em andamento' })
    }
    if (!lastJob.requested_stop) {
      await updateJobRow(lastJob.id, { requested_stop: true })
      lastJob.requested_stop = true
    }
    return normalizeSummary(lastJob)
  }

  if (activeJob.runtime.requestedStop) {
    return runtimeToSummary(activeJob.runtime)
  }

  activeJob.runtime.requestedStop = true
  await updateJobRow(activeJob.runtime.id, { requested_stop: true })

  return runtimeToSummary(activeJob.runtime)
}

export const getSendJobStatus = async (userId: string) => {
  const activeJob = activeJobs.get(userId)
  if (activeJob) {
    return runtimeToSummary(activeJob.runtime)
  }

  const lastJob = await fetchLatestJob(userId)
  if (!lastJob) {
    return null
  }

  return normalizeSummary(lastJob)
}

const deleteJobData = async (jobId: string) => {
  const supabase = getServiceSupabaseClient()
  const { error: logsError } = await supabase
    .from('dashboard_send_job_logs')
    .delete()
    .eq('job_id', jobId)

  if (logsError) {
    console.error('[send-jobs] delete logs error', logsError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível limpar o histórico do disparo' })
  }

  const { error: jobError } = await supabase
    .from('dashboard_send_jobs')
    .delete()
    .eq('id', jobId)

  if (jobError) {
    console.error('[send-jobs] delete job error', jobError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível finalizar o disparo' })
  }
}

export const finalizeSendJob = async (userId: string) => {
  if (activeJobs.has(userId)) {
    throw createError({ statusCode: 409, statusMessage: 'O disparo ainda está em andamento' })
  }

  const lastJob = await fetchLatestJob(userId)

  if (!lastJob) {
    return { success: true }
  }

  if (!FINISHED_STATUSES.includes(lastJob.status)) {
    throw createError({ statusCode: 400, statusMessage: 'Finalize o disparo antes de limpar o histórico' })
  }

  await deleteJobData(lastJob.id)
  return { success: true }
}

