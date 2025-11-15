import { createError, getQuery } from 'h3'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'

type AttachmentRow = {
  id: string
  message_id: string
  bucket_id: string
  storage_path: string
  public_url: string
  file_name: string
  mime_type: string
  file_size_bytes: number
  caption: string | null
  created_at: string
}

type MessageRow = {
  id: string
  body: string
  status: string
  scheduled_for: string | null
  created_at: string
  updated_at: string
}

const MAX_LIMIT = 50
const DEFAULT_LIMIT = 10

const mapAttachment = (attachment: AttachmentRow) => ({
  id: attachment.id,
  bucketId: attachment.bucket_id,
  storagePath: attachment.storage_path,
  publicUrl: attachment.public_url,
  fileName: attachment.file_name,
  mimeType: attachment.mime_type,
  fileSizeBytes: attachment.file_size_bytes,
  caption: attachment.caption,
  createdAt: attachment.created_at
})

const mapMessage = (row: MessageRow, attachments: AttachmentRow[]) => ({
  id: row.id,
  body: row.body,
  status: row.status,
  scheduledFor: row.scheduled_for,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  attachments: attachments.map(mapAttachment)
})

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const query = getQuery(event)
  const limitParam = Number(query.limit)
  const pageParam = Number(query.page)
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number.isNaN(limitParam) ? DEFAULT_LIMIT : limitParam))
  const page = Math.max(1, Number.isNaN(pageParam) ? 1 : pageParam)
  const from = (page - 1) * limit
  const to = from + limit - 1

  const { data, error } = await supabase
    .from('dashboard_messages')
    .select('id, body, status, scheduled_for, created_at, updated_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[dashboard/messages] GET error', error)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar mensagens' })
  }

  const messageRows = data ?? []
  const messageIds = messageRows.map((row) => row.id)
  let attachmentsByMessage: Record<string, AttachmentRow[]> = {}

  if (messageIds.length > 0) {
    const { data: attachmentRows, error: attachmentsError } = await supabase
      .from('dashboard_message_attachments')
      .select('id, message_id, bucket_id, storage_path, public_url, file_name, mime_type, file_size_bytes, caption, created_at')
      .in('message_id', messageIds)

    if (attachmentsError) {
      console.error('[dashboard/messages] GET attachments error', attachmentsError)
      throw createError({ statusCode: 500, statusMessage: 'Erro ao carregar anexos' })
    }

    attachmentsByMessage = (attachmentRows ?? []).reduce<Record<string, AttachmentRow[]>>((acc, attachment) => {
      if (!acc[attachment.message_id]) {
        acc[attachment.message_id] = []
      }
      acc[attachment.message_id].push(attachment)
      return acc
    }, {})
  }

  return {
    messages: messageRows.map((row) => mapMessage(row, attachmentsByMessage[row.id] ?? [])),
    meta: {
      page,
      limit
    }
  }
})


