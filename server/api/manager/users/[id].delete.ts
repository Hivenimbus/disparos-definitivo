import { createError, setResponseStatus } from 'h3'
import { $fetch } from 'ofetch'
import { requireAuthUser } from '../../../utils/auth'
import { getServiceSupabaseClient } from '../../../utils/supabase'
import { buildCompanyUpdatePayload, fetchCompanyById } from '../../../utils/users'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'ID do usuário é obrigatório' })
  }

  const authUser = await requireAuthUser(event)

  if (authUser.role !== 'manager') {
    throw createError({ statusCode: 403, statusMessage: 'Acesso restrito aos gerentes' })
  }

  if (!authUser.company_id) {
    throw createError({ statusCode: 400, statusMessage: 'Gerente não vinculado a uma empresa' })
  }

  if (id === authUser.id) {
    throw createError({ statusCode: 400, statusMessage: 'Você não pode excluir a própria conta.' })
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

  if (userError || !user || user.company_id !== authUser.company_id) {
    throw createError({ statusCode: 404, statusMessage: 'Usuário não encontrado na sua empresa' })
  }

  const { error: deleteError } = await supabase.from('users').delete().eq('id', id)

  if (deleteError) {
    console.error('[manager/users] DELETE error', deleteError)
    throw createError({ statusCode: 500, statusMessage: 'Erro ao excluir usuário' })
  }

  if (user.company_id) {
    try {
      const company = await fetchCompanyById(supabase, user.company_id)
      const updatePayload = buildCompanyUpdatePayload(company, -1)
      await supabase.from('companies').update(updatePayload).eq('id', company.id)
    } catch (companyError) {
      console.error('[manager/users] erro ao atualizar contagem da empresa', companyError)
    }
  }

  try {
    await $fetch(`/instance/delete/${id}`, {
      baseURL: uazapiApiUrl,
      method: 'DELETE',
      headers: {
        apikey: uazapiApiKey
      }
    })
  } catch (e: any) {
    console.error('[manager/users] Erro ao remover instância na UAZAPI', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao remover instância na UAZAPI'
    })
  }

  setResponseStatus(event, 204)
})


