import { createError, readBody } from 'h3'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'

const BUCKET_ID = 'message-attachments'

type ClearMessageBody = {
  messageId?: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { messageId } = (await readBody(event)) as ClearMessageBody

  if (!messageId) {
    return { success: true, deletedAttachments: 0 }
  }

  const { data: messageRow, error: fetchMessageError } = await supabase
    .from('dashboard_messages')
    .select('id, user_id')
    .eq('id', messageId)
    .single()

  if (fetchMessageError || !messageRow || messageRow.user_id !== user.id) {
    throw createError({ statusCode: 404, statusMessage: 'Mensagem não encontrada' })
  }

  const { data: attachmentsRows, error: attachmentsError } = await supabase
    .from('dashboard_message_attachments')
    .select('id, storage_path')
    .eq('message_id', messageId)

  if (attachmentsError) {
    console.error('[dashboard/messages] clear attachments fetch error', attachmentsError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível carregar os anexos para limpeza' })
  }

  const storagePaths = (attachmentsRows ?? [])
    .map((attachment) => attachment.storage_path)
    .filter((path): path is string => Boolean(path))

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from(BUCKET_ID).remove(storagePaths)
    if (storageError) {
      console.error('[dashboard/messages] clear storage error', storageError)
      throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover arquivos do armazenamento' })
    }
  }

  const { error: deleteAttachmentsError } = await supabase
    .from('dashboard_message_attachments')
    .delete()
    .eq('message_id', messageId)

  if (deleteAttachmentsError) {
    console.error('[dashboard/messages] clear delete attachments error', deleteAttachmentsError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover os anexos' })
  }

  const { error: deleteMessageError } = await supabase.from('dashboard_messages').delete().eq('id', messageId)

  if (deleteMessageError) {
    console.error('[dashboard/messages] clear delete message error', deleteMessageError)
    throw createError({ statusCode: 500, statusMessage: 'Não foi possível remover a mensagem' })
  }

  return { success: true, deletedAttachments: storagePaths.length }
})


