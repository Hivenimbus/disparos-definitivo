<template>
  <section class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Gerenciamento de Usuários</h2>
      </div>

      <button @click="openAddModal" class="flex items-center space-x-2 px-4 py-2 bg-gray-400 text-white rounded-lg cursor-not-allowed" disabled>
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Adicionar Usuário (Em breve)</span>
      </button>
    </div>

    <div class="grid grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-blue-600 mb-2">{{ totalUsers }}</div>
        <div class="text-gray-600 text-sm">Total de Usuários</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-green-600 mb-2">{{ activeUsers }}</div>
        <div class="text-gray-600 text-sm">Usuários Ativos</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-red-600 mb-2">{{ expiredUsers }}</div>
        <div class="text-gray-600 text-sm">Usuários Vencidos</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-purple-600 mb-2">{{ newUsersThisMonth }}</div>
        <div class="text-gray-600 text-sm">Novos Este Mês</div>
      </div>
    </div>

    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por nome ou email..."
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
    </div>

    <div v-if="loading" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="text-gray-600 mt-2">Carregando usuários...</p>
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-4 py-3 text-gray-700 font-semibold">Nome</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Empresa</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Email</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Celular</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Data de Vencimento</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Status</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Role</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredUsers.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              Nenhum usuário cadastrado
            </td>
          </tr>
          <tr
            v-for="user in filteredUsers"
            :key="user.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-800">{{ user.full_name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ getCompanyName(user.company_id) }}</td>
            <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
            <td class="px-4 py-3 text-gray-600">{{ user.celular || '-' }}</td>
            <td class="px-4 py-3 text-gray-600">{{ formatDate(user.data_vencimento) }}</td>
            <td class="px-4 py-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': user.status === 'ativo',
                  'bg-red-100 text-red-700': user.status === 'vencido',
                  'bg-gray-100 text-gray-700': user.status === 'bloqueado'
                }"
              >
                {{ user.status.charAt(0).toUpperCase() + user.status.slice(1) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-blue-100 text-blue-700': user.role === 'admin',
                  'bg-gray-100 text-gray-700': user.role === 'usuario'
                }"
              >
                {{ user.role === 'admin' ? 'Admin' : 'Usuário' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <span class="text-gray-400 text-sm">-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Import composables
const { companies } = useCompanies()
const { fetchUsers } = useUsers()

// Estado local
const users = ref([])
const loading = ref(false)
const searchQuery = ref('')

// Computed properties para estatísticas
const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter(u => u.status === 'ativo').length)
const expiredUsers = computed(() => users.value.filter(u => u.status === 'vencido').length)
const newUsersThisMonth = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return users.value.filter(u => {
    const createdDate = new Date(u.created_at)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(u =>
    u.full_name?.toLowerCase().includes(query) ||
    u.email.toLowerCase().includes(query)
  )
})

// Funções utilitárias
const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const getCompanyName = (empresaId) => {
  const company = companies.value.find(c => c.id === empresaId)
  return company ? company.nome : 'Sem empresa'
}

// Carregar usuários do banco
const loadUsers = async () => {
  loading.value = true
  try {
    users.value = await fetchUsers()
  } catch (error) {
    console.error('Erro ao carregar usuários:', error)
    alert('Erro ao carregar usuários')
  } finally {
    loading.value = false
  }
}

// Carregar dados iniciais
onMounted(() => {
  loadUsers()
})
</script>
