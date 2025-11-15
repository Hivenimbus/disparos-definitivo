import { createClient, SupabaseClient } from '@supabase/supabase-js'

let supabaseServiceClient: SupabaseClient | null = null

export const getServiceSupabaseClient = (): SupabaseClient => {
  if (supabaseServiceClient) {
    return supabaseServiceClient
  }

  const config = useRuntimeConfig()
  const url = config.supabaseUrl
  const serviceRoleKey = config.supabaseServiceRoleKey

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase URL ou Service Role Key não configurados')
  }

  supabaseServiceClient = createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  return supabaseServiceClient
}

