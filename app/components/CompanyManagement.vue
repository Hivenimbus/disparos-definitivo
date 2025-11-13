<template>
  <section class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Gerenciamento de Empresas</h2>
      </div>

      <button @click="openAddModal" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Adicionar Empresa</span>
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-blue-600 mb-2">{{ totalCompanies }}</div>
        <div class="text-gray-600 text-sm">Total de Empresas</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-green-600 mb-2">{{ activeCompanies }}</div>
        <div class="text-gray-600 text-sm">Empresas Ativas</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-red-600 mb-2">{{ expiredCompanies }}</div>
        <div class="text-gray-600 text-sm">Empresas Vencidas</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-purple-600 mb-2">{{ totalAvailableSlots }}</div>
        <div class="text-gray-600 text-sm">Vagas Disponíveis</div>
      </div>
    </div>

    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome da empresa..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-4 py-3 text-gray-700 font-semibold">Nome</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Data de Vencimento</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Usuários</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Celular</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">CPF/CNPJ</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Status</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredCompanies.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              Nenhuma empresa cadastrada
            </td>
          </tr>
          <tr
            v-for="company in filteredCompanies"
            :key="company.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-800">{{ company.nome }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(company.dataVencimento) }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center space-x-2">
                <span class="text-gray-700 font-medium">{{ company.usuariosAtuais }}/{{ company.maxUsuarios }}</span>
                <div class="flex-1 max-w-[100px] bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all"
                    :class="{
                      'bg-green-500': company.usuariosAtuais < company.maxUsuarios * 0.7,
                      'bg-yellow-500': company.usuariosAtuais >= company.maxUsuarios * 0.7 && company.usuariosAtuais < company.maxUsuarios,
                      'bg-red-500': company.usuariosAtuais >= company.maxUsuarios
                    }"
                    :style="{ width: `${(company.usuariosAtuais / company.maxUsuarios) * 100}%` }"
                  ></div>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600">{{ company.celular || '-' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ company.cpfCnpj || '-' }}</td>
            <td class="px-4 py-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': company.status === 'ativo',
                  'bg-red-100 text-red-700': company.status === 'vencido'
                }"
              >
                {{ company.status.charAt(0).toUpperCase() + company.status.slice(1) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center space-x-2">
                <button @click="openEditModal(company)" class="text-blue-600 hover:text-blue-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="openDeleteModal(company)" class="text-red-600 hover:text-red-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">{{ isEditMode ? 'Editar Empresa' : 'Adicionar Empresa' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Nome da Empresa</label>
            <input
              v-model="companyForm.nome"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome da empresa"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Data de Vencimento</label>
            <input
              v-model="companyForm.dataVencimento"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Número Máximo de Usuários</label>
            <input
              v-model.number="companyForm.maxUsuarios"
              type="number"
              min="1"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 10"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Celular (opcional)</label>
            <input
              v-model="companyForm.celular"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(00) 00000-0000"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">CPF ou CNPJ (opcional)</label>
            <input
              v-model="companyForm.cpfCnpj"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000.000.000-00 ou 00.000.000/0000-00"
            >
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveCompany"
            :disabled="!isFormValid"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>

    <div v-if="isDeleteModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeDeleteModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Confirmar Exclusão</h3>
        <p v-if="companyToDelete?.usuariosAtuais > 0" class="text-red-600 text-center mb-6">
          Esta empresa possui <strong>{{ companyToDelete?.usuariosAtuais }} usuário(s)</strong> vinculado(s). 
          Desvincule-os antes de excluir a empresa.
        </p>
        <p v-else class="text-gray-600 text-center mb-6">
          Tem certeza que deseja deletar a empresa <strong>{{ companyToDelete?.nome }}</strong>?
          Esta ação não pode ser desfeita.
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeDeleteModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            v-if="companyToDelete?.usuariosAtuais === 0"
            @click="confirmDelete"
            class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirmar Exclusão
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const supabase = useSupabase()
const companies = ref([])
const loading = ref(false)
const searchQuery = ref('')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isEditMode = ref(false)
const companyToDelete = ref(null)
const companyForm = ref({
  id: null,
  nome: '',
  dataVencimento: '',
  maxUsuarios: 1,
  celular: '',
  cpfCnpj: ''
})

const fetchCompanies = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('companies_with_stats')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) throw error
    
    companies.value = data.map(c => ({
      id: c.id,
      nome: c.nome,
      dataVencimento: c.data_vencimento,
      maxUsuarios: c.max_usuarios,
      usuariosAtuais: c.usuarios_atuais,
      celular: c.celular,
      cpfCnpj: c.cpf_cnpj,
      status: c.status,
      dataCriacao: c.created_at
    }))
  } catch (error) {
    console.error('Erro ao buscar empresas:', error)
    alert('Erro ao carregar empresas. Verifique a conexão com o Supabase.')
  } finally {
    loading.value = false
  }
}

const totalCompanies = computed(() => companies.value.length)
const activeCompanies = computed(() => companies.value.filter(c => c.status === 'ativo').length)
const expiredCompanies = computed(() => companies.value.filter(c => c.status === 'vencido').length)
const totalAvailableSlots = computed(() => {
  return companies.value.reduce((sum, company) => {
    return sum + (company.maxUsuarios - company.usuariosAtuais)
  }, 0)
})

const filteredCompanies = computed(() => {
  if (!searchQuery.value) return companies.value
  const query = searchQuery.value.toLowerCase()
  return companies.value.filter(c => c.nome.toLowerCase().includes(query))
})

const isFormValid = computed(() => {
  return companyForm.value.nome.trim() && 
         companyForm.value.dataVencimento && 
         companyForm.value.maxUsuarios > 0
})

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const openAddModal = () => {
  isEditMode.value = false
  companyForm.value = {
    id: null,
    nome: '',
    dataVencimento: '',
    maxUsuarios: 1,
    celular: '',
    cpfCnpj: ''
  }
  isModalOpen.value = true
}

const openEditModal = (company) => {
  isEditMode.value = true
  companyForm.value = {
    id: company.id,
    nome: company.nome,
    dataVencimento: company.dataVencimento,
    maxUsuarios: company.maxUsuarios,
    celular: company.celular || '',
    cpfCnpj: company.cpfCnpj || ''
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  companyForm.value = {
    id: null,
    nome: '',
    dataVencimento: '',
    maxUsuarios: 1,
    celular: '',
    cpfCnpj: ''
  }
}

const saveCompany = async () => {
  try {
    if (isEditMode.value) {
      const { error } = await supabase
        .from('companies')
        .update({
          nome: companyForm.value.nome,
          data_vencimento: companyForm.value.dataVencimento,
          max_usuarios: companyForm.value.maxUsuarios,
          celular: companyForm.value.celular,
          cpf_cnpj: companyForm.value.cpfCnpj
        })
        .eq('id', companyForm.value.id)
      
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('companies')
        .insert({
          nome: companyForm.value.nome,
          data_vencimento: companyForm.value.dataVencimento,
          max_usuarios: companyForm.value.maxUsuarios,
          celular: companyForm.value.celular,
          cpf_cnpj: companyForm.value.cpfCnpj
        })
      
      if (error) throw error
    }
    
    await fetchCompanies()
    closeModal()
  } catch (error) {
    console.error('Erro ao salvar empresa:', error)
    alert('Erro ao salvar empresa: ' + error.message)
  }
}

const openDeleteModal = (company) => {
  companyToDelete.value = company
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  companyToDelete.value = null
}

const confirmDelete = async () => {
  try {
    const { error } = await supabase
      .from('companies')
      .delete()
      .eq('id', companyToDelete.value.id)
    
    if (error) throw error
    
    await fetchCompanies()
    closeDeleteModal()
  } catch (error) {
    console.error('Erro ao deletar empresa:', error)
    alert('Erro ao deletar empresa: ' + error.message)
  }
}

onMounted(() => {
  fetchCompanies()
})

defineExpose({
  companies,
  fetchCompanies
})
</script>
