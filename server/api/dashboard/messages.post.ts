import { createError, readMultipartFormData } from 'h3'
import { randomUUID } from 'node:crypto'
import { getServiceSupabaseClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/auth'

const BUCKET_ID = 'message-attachments'

type AttachmentMeta = {
  id: string
  caption?: string
  mimeType?: string
  fileName?: string
  type?: string
}

type AttachmentRow = {
  id: string
  bucket_id: string
  storage_path: string
  public_url: string
  file_name: string
  mime_type: string
  file_size_bytes: number
  caption: string | null
  created_at: string
}

const sanitizeFileName = (fileName: string) => {
  return fileName
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase() || 'arquivo'
}

const parseAttachmentsMeta = (raw?: string): AttachmentMeta[] => {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      throw new Error('Formato inválido')
    }
    return parsed
  } catch (error) {
    console.error('[dashboard/messages] Invalid attachments_meta payload', error)
    throw createError({ statusCode: 400, statusMessage: 'Metadados de anexos inválidos' })
  }
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const formData = await readMultipartFormData(event)

  const fields: Record<string, string> = {}
  const files = new Map<string, { data: Buffer; filename: string; type: string }>()

  if (formData) {
    for (const part of formData) {
      if (!part.name || !part.data) continue

      if (part.filename) {
        files.set(part.name, {
          data: part.data,
          filename: part.filename,
          type: part.type || 'application/octet-stream'
        })
      } else {
        fields[part.name] = part.data.toString('utf8')
      }
    }
  }

  const body = fields.body?.trim()

  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Mensagem é obrigatória' })
  }

  const attachmentsMeta = parseAttachmentsMeta(fields.attachments_meta)

  const expectedFileKeys = new Set(attachmentsMeta.map((meta) => `file-${meta.id}`))
  for (const key of files.keys()) {
    if (!expectedFileKeys.has(key)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Metadados não encontrados para o arquivo ${key}`
      })
    }
  }

  const { data: message, error: messageError } = await supabase
    .from('dashboard_messages')
    .insert({
      user_id: user.id,
      body
    })
    .select('id, body, caption, status, scheduled_for, created_at, updated_at')
    .single()

  if (messageError || !message) {
    console.error('[dashboard/messages] POST insert message error', messageError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível salvar a mensagem' })
  }

  const uploadedPaths: string[] = []
  const attachments: AttachmentRow[] = []

  try {
    for (const meta of attachmentsMeta) {
      const fileKey = `file-${meta.id}`
      const filePart = files.get(fileKey)

      if (!filePart) {
        throw createError({
          statusCode: 400,
          statusMessage: `Arquivo não enviado para o anexo ${meta.id}`
        })
      }

      const fileName = sanitizeFileName(meta.fileName || filePart.filename || 'arquivo')
      const storagePath = `${user.id}/${message.id}/${Date.now()}-${randomUUID()}-${fileName}`

      const { error: uploadError } = await supabase.storage.from(BUCKET_ID).upload(storagePath, filePart.data, {
        contentType: filePart.type || meta.mimeType || 'application/octet-stream',
        upsert: false
      })

      if (uploadError) {
        console.error('[dashboard/messages] Storage upload error', uploadError)
        throw createError({ statusCode: 500, statusMessage: 'Falha ao enviar anexo' })
      }

      uploadedPaths.push(storagePath)

      const { data: publicUrlData } = supabase.storage.from(BUCKET_ID).getPublicUrl(storagePath)

      const { data: attachmentRow, error: attachmentError } = await supabase
        .from('dashboard_message_attachments')
        .insert({
          message_id: message.id,
          bucket_id: BUCKET_ID,
          storage_path: storagePath,
          public_url: publicUrlData?.publicUrl ?? '',
          file_name: fileName,
          mime_type: filePart.type || meta.mimeType || 'application/octet-stream',
          file_size_bytes: filePart.data.length,
          caption: meta.caption?.trim() || null
        })
        .select('id, bucket_id, storage_path, public_url, file_name, mime_type, file_size_bytes, caption, created_at')
        .single()

      if (attachmentError || !attachmentRow) {
        console.error('[dashboard/messages] Attachment insert error', attachmentError)
        throw createError({ statusCode: 500, statusMessage: 'Falha ao salvar anexo' })
      }

      attachments.push(attachmentRow)
    }
  } catch (error) {
    console.error('[dashboard/messages] POST attachments error', error)

    await supabase.from('dashboard_messages').delete().eq('id', message.id)

    if (uploadedPaths.length > 0) {
      await supabase.storage.from(BUCKET_ID).remove(uploadedPaths)
    }

    throw error
  }

  return {
    message: {
      id: message.id,
      body: message.body,
      caption: message.caption,
      status: message.status,
      scheduledFor: message.scheduled_for,
      createdAt: message.created_at,
      updatedAt: message.updated_at,
      attachments: attachments.map((attachment) => ({
        id: attachment.id,
        bucketId: attachment.bucket_id,
        storagePath: attachment.storage_path,
        publicUrl: attachment.public_url,
        fileName: attachment.file_name,
        mimeType: attachment.mime_type,
        fileSizeBytes: attachment.file_size_bytes,
        caption: attachment.caption,
        createdAt: attachment.created_at
      }))
    }
  }
})


