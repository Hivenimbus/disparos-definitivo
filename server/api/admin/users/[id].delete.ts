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
  const evolutionApiUrl = config.evolutionApiUrl?.replace(/\/$/, '')
  const evolutionApiKey = config.evolutionApiKey

  if (!evolutionApiUrl || !evolutionApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Configurações da Evolution API não encontradas'
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
    await $fetch(`/instance/delete/${id}`, {
      baseURL: evolutionApiUrl,
      method: 'DELETE',
      headers: {
        apikey: evolutionApiKey
      }
    })
  } catch (e: any) {
    console.error('[admin/users] Erro ao remover instância no Evolution', {
      message: e?.message,
      status: e?.response?.status,
      data: e?.data || e?.response?._data || null
    })

    throw createError({
      statusCode: 500,
      statusMessage: 'Erro ao remover instância no Evolution'
    })
  }

  setResponseStatus(event, 204)
})


