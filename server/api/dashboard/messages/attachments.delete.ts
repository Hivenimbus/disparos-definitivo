import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

type DeleteAttachmentBody = {
  attachmentId?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const body = (await readBody(event)) as DeleteAttachmentBody

  if (!body?.attachmentId) {
    throw createError({ statusCode: 400, statusMessage: 'attachmentId é obrigatório' })
  }

  const { data: attachment, error: fetchError } = await supabase
    .from('dashboard_message_attachments')
    .select(
      'id, message_id, bucket_id, storage_path, public_url, file_name, mime_type, file_size_bytes, caption, created_at, dashboard_messages!inner (id, user_id)'
    )
    .eq('id', body.attachmentId)
    .maybeSingle()

  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Anexo não encontrado' })
  }

  if (attachment.dashboard_messages.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anexo não pertence ao usuário' })
  }

  const { error: deleteError } = await supabase
    .from('dashboard_message_attachments')
    .delete()
    .eq('id', attachment.id)

  if (deleteError) {
    console.error('[dashboard/attachments] delete error', deleteError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover o anexo' })
  }

  if (attachment.bucket_id && attachment.storage_path) {
    const { error: storageError } = await supabase.storage.from(attachment.bucket_id).remove([attachment.storage_path])
    if (storageError) {
      console.error('[dashboard/attachments] storage delete error', storageError)
    }
  }

  return {
    success: true,
    attachmentId: attachment.id
  }
})


