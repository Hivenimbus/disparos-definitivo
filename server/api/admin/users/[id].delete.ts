import { createError, setResponseStatus } from 'h3'
import { $fetch } from 'ofetch'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { fetchCompanyById, buildCompanyUpdatePayload } from '../../../utils/users'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do usuário é obrigatório' })
  }

  const supabase = getServiceSupabaseClient()
  const config = useRuntimeConfig()
  const uazapiApiUrl = config.uazapiApiUrl?.replace(/\/$/, '')
  const uazapiApiKey = config.uazapiApiKey

  if (!uazapiApiUrl || !uazapiApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da UAZAPI não encontradas'
    })
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, company_id')
    .eq('id', id)
    .single()

  if (userError || !user) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado' })
  }

  const { error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', id)

  if (deleteError) {
    console.error('[admin/users] DELETE error', deleteError)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir usuário' })
  }

  if (user.company_id) {
    try {
      const company = await fetchCompanyById(supabase, user.company_id)
      const updatePayload = buildCompanyUpdatePayload(company, -1)
      await supabase.from('companies').update(updatePayload).eq('id', company.id)
    } catch (companyError) {
      console.error('[admin/users] erro ao atualizar contagem da empresa', companyError)
    }
  }

  try {
    const instancesResponse = await $fetch<{ data?: Array<{ id?: string; name?: string }> }>('/instance/all', {
      baseURL: uazapiApiUrl,
      method: 'GET',
      headers: {
        apikey: uazapiApiKey
      }
    })

    const targetInstance = instancesResponse?.data?.find((instance) => instance?.name === id)

    if (!targetInstance?.id) {
      console.warn('[admin/users] Instância não encontrada para usuário', { userId: id })
      throw createError({
        statusCode: 404,
        statusMessage: 'Instância do usuário não encontrada na UAZAPI'
      })
    }

    await $fetch(`/instance/delete/${targetInstance.id}`, {
      baseURL: uazapiApiUrl,
      method: 'DELETE',
      headers: {
        apikey: uazapiApiKey
      }
    })
  } catch (e: any) {
    console.error('[admin/users] Erro ao remover instância na UAZAPI', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    if (e?.statusCode) {
      throw e
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao remover instância na UAZAPI'
    })
  }

  setResponseStatus(event, 204)
})


