import { createError } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getEvolutionConfig } from '../../../utils/evolution'

export default defineEventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { evolutionApiUrl, evolutionApiKey } = getEvolutionConfig()

  // Tentar remover a instância existente se houver
  try {
    // Tenta buscar instância para garantir limpeza
    const instancesResponse = await $fetch<any>('/instance/fetchInstances', {
        baseURL: evolutionApiUrl,
        method: 'GET',
        headers: { apikey: evolutionApiKey }
    }).catch(() => null)
    
    // Fallback para /instance/all se fetchInstances falhar
    let allInstances = instancesResponse
    if (!allInstances) {
        allInstances = await $fetch<any>('/instance/all', {
            baseURL: evolutionApiUrl,
            method: 'GET',
            headers: { apikey: evolutionApiKey }
        }).catch(() => null)
    }

    let targetInstanceId = user.id

    // Tenta encontrar ID real se possível, senão usa o ID do usuário (que costuma ser o nome da instância)
    if (allInstances) {
        const list = Array.isArray(allInstances) ? allInstances : (Array.isArray(allInstances.data) ? allInstances.data : [])
        const found = list.find((i: any) => 
            (i.name === user.id) || 
            (i.instance?.name === user.id) || 
            (i.instanceName === user.id)
        )
        
        if (found) {
            targetInstanceId = found.id || found.instance?.id || found.instanceId || user.id
        }
    }

    await $fetch(`/instance/delete/${targetInstanceId}`, {
      baseURL: evolutionApiUrl,
      method: 'DELETE',
      headers: {
        apikey: evolutionApiKey
      }
    })

  } catch (e: any) {
    // Ignoramos 404 no delete (já não existe)
    if (e?.response?.status !== 404) {
        console.warn('[dashboard/whatsapp/recreate] Erro ao tentar remover instância antiga (pode não existir)', e.message)
    }
  }

  // Criar nova instância
  try {
    await $fetch('/instance/create', {
      baseURL: evolutionApiUrl,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: evolutionApiKey
      },
      body: {
        name: user.id, // Compatibilidade com versões antigas (v1.5-)
        instanceName: user.id, // Compatibilidade com versões novas (v1.6+)
        token: user.id,
        qrcode: true 
      }
    })
  } catch (e: any) {
    // Se já existe, consideramos sucesso (recuperação)
    if (e?.response?.status === 403 || e?.response?.data?.error?.includes('already exists')) {
       return { success: true, recreated: false }
    }

    console.error('[dashboard/whatsapp/recreate] Erro ao recriar instância no Evolution', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    throw createError({
      statusCode: 502,
      statusMessage: 'Erro ao recriar instância na Evolution API'
    })
  }

  return { success: true, recreated: true }
})
