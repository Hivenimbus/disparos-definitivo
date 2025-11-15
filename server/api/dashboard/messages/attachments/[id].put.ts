import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../../../utils/auth'
import { getServiceSupabaseClient } from '../../../../utils/supabase'

type UpdateAttachmentBody = {
  caption?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const attachmentId = event.context.params?.id

  if (!attachmentId) {
    throw createError({ statusCode: 400, statusMessage: 'attachmentId inválido' })
  }

  const body = (await readBody(event)) as UpdateAttachmentBody
  const caption = body?.caption?.trim() || null

  const { data: attachment, error: fetchError } = await supabase
    .from('dashboard_message_attachments')
    .select('id, message_id, file_name, file_size_bytes, caption, dashboard_messages!inner (id, user_id)')
    .eq('id', attachmentId)
    .maybeSingle()

  if (fetchError || !attachment) {
    throw createError({ statusCode: 404, statusMessage: 'Anexo não encontrado' })
  }

  if (attachment.dashboard_messages.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Anexo não pertence ao usuário' })
  }

  const { data: updatedAttachment, error: updateError } = await supabase
    .from('dashboard_message_attachments')
    .update({
      caption
    })
    .eq('id', attachmentId)
    .select('id, message_id, bucket_id, storage_path, public_url, file_name, mime_type, file_size_bytes, caption, created_at')
    .single()

  if (updateError || !updatedAttachment) {
    console.error('[dashboard/attachments] update error', updateError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível atualizar o anexo' })
  }

  return {
    attachment: updatedAttachment
  }
})


