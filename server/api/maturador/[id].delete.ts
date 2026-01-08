import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../utils/auth'
import { getEvolutionConfig } from '../../utils/evolution'
import { getServiceSupabaseClient } from '../../utils/supabase'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getServiceSupabaseClient()
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'ID da maturação é obrigatório'
    })
  }

  // Buscar maturação do usuário
  const { data: maturation, error } = await supabase
    .from('maturacoes')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !maturation) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Maturação não encontrada'
    })
  }

  // Buscar todas as instâncias para encontrar os IDs corretos
  let instancesList: Array<{ id?: string; name?: string; instance?: { id?: string; name?: string } }> = []
  try {
    const instancesResponse = await $fetch<{ data?: typeof instancesList }>('/instance/all', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: { apikey: evolutionApiKey }
    })

    if (instancesResponse?.data) {
      instancesList = instancesResponse.data
    }
  } catch (e: any) {
    console.warn('[maturador/delete] Erro ao buscar instâncias:', e?.message)
  }

  // Função auxiliar para encontrar e deletar instância pelo nome
  const deleteInstanceByName = async (instanceName: string) => {
    // Encontrar a instância pelo nome
    const targetInstance = instancesList.find((i) => 
      i.name === instanceName || 
      i.instance?.name === instanceName
    )

    if (!targetInstance) {
      console.warn(`[maturador/delete] Instância ${instanceName} não encontrada na Evolution API`)
      return false
    }

    // Usar o ID interno da instância para deletar
    const instanceId = targetInstance.id || targetInstance.instance?.id
    
    if (!instanceId) {
      console.warn(`[maturador/delete] ID da instância ${instanceName} não encontrado`)
      return false
    }

    try {
      await $fetch(`/instance/delete/${instanceId}`, {
        baseURL: evolutionApiUrl,
        method: 'DELETE',
        headers: { apikey: evolutionApiKey }
      })
      console.log(`[maturador/delete] Instância ${instanceName} (ID: ${instanceId}) deletada com sucesso`)
      return true
    } catch (e: any) {
      console.warn(`[maturador/delete] Erro ao deletar instância ${instanceName}:`, e?.message)
      return false
    }
  }

  // Deletar instância A
  await deleteInstanceByName(maturation.instance_a_id)

  // Deletar instância B
  await deleteInstanceByName(maturation.instance_b_id)

  // Deletar maturação do banco de dados
  const { error: deleteError } = await supabase
    .from('maturacoes')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('[maturador/delete] Erro ao deletar maturação:', deleteError)
    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao apagar maturação'
    })
  }

  return {
    success: true,
    message: 'Maturação apagada com sucesso'
  }
})
