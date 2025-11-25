import { createError, setResponseStatus } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../../utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do usuário é obrigatório' })
  }

  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso restrito a administradores' })
  }

  const config = useRuntimeConfig()
  const evolutionApiUrl = config.evolutionApiUrl?.replace(/\/$/, '')
  const evolutionApiKey = config.evolutionApiKey

  if (!evolutionApiUrl || !evolutionApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da Evolution API não encontradas'
    })
  }

  // Tentar remover a instância existente se houver
  try {
    const instancesResponse = await $fetch<{ data?: Array<{ id?: string; name?: string }> }>('/instance/all', {
      baseURL: evolutionApiUrl,
      method: 'GET',
      headers: {
        apikey: evolutionApiKey
      }
    })

    const targetInstance = instancesResponse?.data?.find((instance) => instance?.name === id)

    if (targetInstance?.id) {
      await $fetch(`/instance/delete/${targetInstance.id}`, {
        baseURL: evolutionApiUrl,
        method: 'DELETE',
        headers: {
          apikey: evolutionApiKey
        }
      })
    }
  } catch (e: any) {
    // Se der erro ao listar ou deletar (ex: não existe), apenas loga e continua para criar
    console.warn('[admin/users/recreate] Erro ao tentar remover instância antiga (pode não existir)', e.message)
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
        name: id,
        token: id
      }
    })
  } catch (e: any) {
    console.error('[admin/users/recreate] Erro ao recriar instância no Evolution', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao recriar instância no Evolution'
    })
  }

  setResponseStatus(event, 200)
  return { message: 'Instância recriada com sucesso' }
})

