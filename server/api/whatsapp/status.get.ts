import { createClient } from '@supabase/supabase-js'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get runtime config
    const config = useRuntimeConfig()

    // Create Supabase client with service role key
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey
    )

    // Get user from session
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      throw createError({
        statusCode: 401,
        message: 'Não autorizado'
      })
    }

    // Verify user session
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      throw createError({
        statusCode: 401,
        message: 'Sessão inválida'
      })
    }

    const userId = user.id

    // Get connection status from database
    const { data: connection, error: dbError } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching connection:', dbError)
      throw createError({
        statusCode: 500,
        message: 'Erro ao buscar status da conexão'
      })
    }

    // If no connection exists, return disconnected status
    if (!connection) {
      return {
        status: 'disconnected',
        connected_at: null,
        updated_at: null
      }
    }

    return {
      status: connection.status,
      connected_at: connection.connected_at,
      updated_at: connection.updated_at
    }

  } catch (error: any) {
    console.error('WhatsApp status error:', error)

    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao obter status da conexão'
    })
  }
})
