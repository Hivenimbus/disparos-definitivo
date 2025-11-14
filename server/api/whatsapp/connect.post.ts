import { createClient } from '@supabase/supabase-js'
import { H3Event } from 'h3'

export default defineEventHandler(async (event: H3Event) => {
  try {
    // Get runtime config
    const config = useRuntimeConfig()

    // Create Supabase client with service role key for admin operations
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

    // Call Evolution API to connect instance
    const evolutionResponse = await $fetch(
      `${config.evolutionApiBaseUrl}/instance/connect/${userId}`,
      {
        method: 'GET',
        headers: {
          'apikey': config.evolutionApiKey
        }
      }
    )

    // Check if evolutionResponse has the expected structure
    if (!evolutionResponse || typeof evolutionResponse !== 'object') {
      throw createError({
        statusCode: 500,
        message: 'Resposta inválida da Evolution API'
      })
    }

    const { base64 } = evolutionResponse as { base64?: string }

    if (!base64) {
      throw createError({
        statusCode: 500,
        message: 'QR Code não retornado pela API'
      })
    }

    // Save or update connection status in database
    const { data: existingConnection } = await supabase
      .from('whatsapp_connections')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (existingConnection) {
      // Update existing connection
      const { error: updateError } = await supabase
        .from('whatsapp_connections')
        .update({
          status: 'connecting',
          pairing_code: base64,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (updateError) {
        console.error('Error updating connection:', updateError)
        throw createError({
          statusCode: 500,
          message: 'Erro ao atualizar conexão no banco de dados'
        })
      }
    } else {
      // Insert new connection
      const { error: insertError } = await supabase
        .from('whatsapp_connections')
        .insert({
          user_id: userId,
          status: 'connecting',
          pairing_code: base64
        })

      if (insertError) {
        console.error('Error inserting connection:', insertError)
        throw createError({
          statusCode: 500,
          message: 'Erro ao salvar conexão no banco de dados'
        })
      }
    }

    return {
      success: true,
      base64
    }

  } catch (error: any) {
    console.error('WhatsApp connection error:', error)

    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Handle Evolution API errors
    if (error.response) {
      throw createError({
        statusCode: error.response.status || 500,
        message: error.response._data?.message || 'Erro ao conectar com Evolution API'
      })
    }

    throw createError({
      statusCode: 500,
      message: error.message || 'Erro ao processar conexão do WhatsApp'
    })
  }
})
