import { createError } from 'h3'
import { requireAuthUser } from '../../utils/auth'
import { getServiceSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()

  const { data: maturacoes, error } = await supabase
    .from('maturacoes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[maturador/list] Erro ao listar maturações:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao listar maturações'
    })
  }

  return {
    maturacoes: maturacoes.map((m) => ({
      id: m.id,
      instanceAId: m.instance_a_id,
      instanceBId: m.instance_b_id,
      instanceAConnected: m.instance_a_connected,
      instanceBConnected: m.instance_b_connected,
      phoneA: m.phone_a,
      phoneB: m.phone_b,
      maturationType: m.maturation_type,
      intervalType: m.interval_type,
      totalMessages: m.total_messages,
      messagesSent: m.messages_sent,
      status: m.status,
      startedAt: m.started_at,
      completedAt: m.completed_at,
      createdAt: m.created_at
    }))
  }
})
