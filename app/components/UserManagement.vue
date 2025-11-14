<template>
  <section class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Gerenciamento de Usuários</h2>
      </div>

      <button @click="openAddModal" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>Adicionar Usuário</span>
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

    <div class="overflow-x-auto">
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
          <tr v-if="loadingTable">
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              Carregando usuários...
            </td>
          </tr>
          <tr v-else-if="listError">
            <td colspan="8" class="px-4 py-8 text-center text-red-600">
              Ocorreu um erro ao carregar os usuários.
            </td>
          </tr>
          <tr v-else-if="filteredUsers.length === 0">
            <td colspan="8" class="px-4 py-8 text-center text-gray-500">
              Nenhum usuário cadastrado
            </td>
          </tr>
          <template v-else>
            <tr
              v-for="user in filteredUsers"
              :key="user.id"
              class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <td class="px-4 py-3 text-gray-800">{{ user.nome }}</td>
              <td class="px-4 py-3 text-gray-600">{{ getCompanyName(user) }}</td>
              <td class="px-4 py-3 text-gray-600">{{ user.email }}</td>
              <td class="px-4 py-3 text-gray-600">{{ user.celular || '-' }}</td>
              <td class="px-4 py-3 text-gray-600">{{ formatDate(user.dataVencimento) }}</td>
              <td class="px-4 py-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="{
                    'bg-green-100 text-green-700': user.statusLabel === 'ativo',
                    'bg-yellow-100 text-yellow-700': user.statusLabel === 'vencido',
                    'bg-red-100 text-red-700': user.statusLabel === 'bloqueado'
                  }"
                >
                  {{ user.statusLabel.charAt(0).toUpperCase() + user.statusLabel.slice(1) }}
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
                <div class="flex items-center space-x-2">
                  <button @click="openEditModal(user)" class="text-blue-600 hover:text-blue-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button @click="openDeleteModal(user)" class="text-red-600 hover:text-red-800 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">{{ isEditMode ? 'Editar Usuário' : 'Adicionar Usuário' }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div
            v-if="formError"
            class="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm"
          >
            {{ formError }}
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Nome</label>
            <input
              v-model="userForm.nome"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome completo"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Empresa</label>
            <select
              v-model="userForm.empresaId"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option :value="null">Sem empresa</option>
              <option
                v-for="company in companies"
                :key="company.id"
                :value="company.id"
                :disabled="!canSelectCompany(company.id)"
              >
                {{ company.nome }} ({{ company.usuariosAtuais }}/{{ company.maxUsuarios }})
                <span v-if="!canSelectCompany(company.id) && originalCompanyId !== company.id"> - Lotado</span>
              </option>
            </select>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Email</label>
            <input
              v-model="userForm.email"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="email@exemplo.com"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Celular (opcional)</label>
            <input
              v-model="userForm.celular"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="(00) 00000-0000"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">CPF (opcional)</label>
            <input
              v-model="userForm.cpf"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="000.000.000-00"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Senha{{ isEditMode ? ' (deixe vazio para manter)' : '' }}</label>
            <input
              v-model="userForm.senha"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :placeholder="isEditMode ? 'Nova senha (opcional)' : 'Digite a senha'"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Data de Vencimento</label>
            <input
              v-model="userForm.dataVencimento"
              type="date"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Role</label>
            <select
              v-model="userForm.role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="usuario">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div v-if="isEditMode">
            <label class="block text-gray-700 font-medium mb-2">Status</label>
            <select
              v-model="userForm.status"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ativo">Ativo</option>
              <option value="bloqueado">Bloqueado</option>
            </select>
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
            @click="saveUser"
            :disabled="!isFormValid || isSaving"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isSaving">Salvar</span>
            <span v-else>Salvando...</span>
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
        <p class="text-gray-600 text-center mb-6">
          Tem certeza que deseja deletar o usuário <strong>{{ userToDelete?.nome }}</strong>?
          Esta ação não pode ser desfeita.
        </p>
        <p v-if="deleteError" class="text-red-600 text-center mb-4">
          {{ deleteError }}
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeDeleteModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!isDeleting">Confirmar Exclusão</span>
            <span v-else>Excluindo...</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

type UiRole = 'admin' | 'usuario'
type UiStatus = 'ativo' | 'bloqueado'
type StatusLabel = 'ativo' | 'bloqueado' | 'vencido'

type AdminUserItem = {
  id: string
  nome: string
  email: string
  empresaId: string | null
  empresaNome: string | null
  celular: string | null
  cpf: string | null
  dataVencimento: string | null
  status: UiStatus
  statusLabel: StatusLabel
  role: UiRole
  createdAt: string | null
}

type CompanyItem = {
  id: string
  nome: string
  maxUsuarios: number
  usuariosAtuais: number
}

type UserFormState = {
  id: string | null
  nome: string
  empresaId: string | null
  email: string
  celular: string
  cpf: string
  senha: string
  dataVencimento: string
  status: UiStatus
  role: UiRole
}

const searchQuery = ref('')
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isEditMode = ref(false)
const userToDelete = ref<AdminUserItem | null>(null)
const formError = ref('')
const deleteError = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const originalCompanyId = ref<string | null>(null)

const defaultForm = (): UserFormState => ({
  id: null,
  nome: '',
  empresaId: null,
  email: '',
  celular: '',
  cpf: '',
  senha: '',
  dataVencimento: '',
  status: 'ativo',
  role: 'usuario'
})

const userForm = ref<UserFormState>(defaultForm())

const {
  data: usersData,
  pending: usersPending,
  error: usersError,
  refresh: refreshUsers
} = await useAsyncData<AdminUserItem[]>('admin-users-list', async () => {
  const response = await $fetch('/api/admin/users')
  return response.users
})

const {
  data: companiesData,
  pending: companiesPending,
  error: companiesError,
  refresh: refreshCompanies
} = await useAsyncData<CompanyItem[]>('admin-users-companies', async () => {
  const response = await $fetch('/api/companies')
  return response.companies
})

const users = computed<AdminUserItem[]>(() => usersData.value ?? [])
const companies = computed<CompanyItem[]>(() => companiesData.value ?? [])

const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter((u) => u.statusLabel === 'ativo').length)
const expiredUsers = computed(() => users.value.filter((u) => u.statusLabel === 'vencido').length)
const newUsersThisMonth = computed(() => {
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()
  return users.value.filter((u) => {
    if (!u.createdAt) return false
    const createdDate = new Date(u.createdAt)
    return createdDate.getMonth() === currentMonth && createdDate.getFullYear() === currentYear
  }).length
})

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  const query = searchQuery.value.toLowerCase()
  return users.value.filter((u) => u.nome.toLowerCase().includes(query) || u.email.toLowerCase().includes(query))
})

const loadingTable = computed(() => usersPending.value || companiesPending.value)
const listError = computed(() => usersError.value || companiesError.value)

const isFormValid = computed(() => {
  if (!userForm.value.nome.trim()) return false
  if (!userForm.value.email.trim()) return false
  if (!userForm.value.dataVencimento) return false
  if (!isEditMode.value && userForm.value.senha.trim().length < 8) return false
  if (isEditMode.value && userForm.value.senha && userForm.value.senha.length < 8) return false
  return true
})

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR')
}

const findCompany = (companyId: string | null) => {
  if (!companyId) return null
  return companies.value.find((company) => company.id === companyId) || null
}

const getCompanyName = (user: AdminUserItem) => {
  return findCompany(user.empresaId)?.nome || user.empresaNome || 'Sem empresa'
}

const resetForm = () => {
  userForm.value = defaultForm()
  originalCompanyId.value = null
  formError.value = ''
}

const canSelectCompany = (companyId: string) => {
  const company = findCompany(companyId)
  if (!company) return false
  if (isEditMode.value && originalCompanyId.value === companyId) {
    return true
  }
  return company.usuariosAtuais < company.maxUsuarios
}

const openAddModal = () => {
  isEditMode.value = false
  resetForm()
  isModalOpen.value = true
}

const openEditModal = (user: AdminUserItem) => {
  isEditMode.value = true
  formError.value = ''
  originalCompanyId.value = user.empresaId || null
  userForm.value = {
    id: user.id,
    nome: user.nome,
    empresaId: user.empresaId || null,
    email: user.email,
    celular: user.celular || '',
    cpf: user.cpf || '',
    senha: '',
    dataVencimento: user.dataVencimento || '',
    status: user.status,
    role: user.role
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const ensureCapacity = () => {
  if (!userForm.value.empresaId) {
    return true
  }
  const company = findCompany(userForm.value.empresaId)
  if (!company) {
    formError.value = 'Empresa selecionada não foi encontrada.'
    return false
  }
  if (isEditMode.value && originalCompanyId.value === userForm.value.empresaId) {
    return true
  }
  if (company.usuariosAtuais >= company.maxUsuarios) {
    formError.value = `Limite de usuários atingido para a empresa ${company.nome}.`
    return false
  }
  return true
}

const buildPayload = (isEdit: boolean) => {
  const payload: Record<string, any> = {
    nome: userForm.value.nome,
    email: userForm.value.email,
    role: userForm.value.role,
    status: userForm.value.status,
    companyId: userForm.value.empresaId,
    dataVencimento: userForm.value.dataVencimento,
    celular: userForm.value.celular || null,
    cpf: userForm.value.cpf || null
  }

  if (!isEdit || userForm.value.senha.trim()) {
    payload.password = userForm.value.senha
  }

  return payload
}

const saveUser = async () => {
  if (!isFormValid.value) {
    return
  }

  formError.value = ''

  if (!ensureCapacity()) {
    return
  }

  isSaving.value = true

  try {
    const payload = buildPayload(isEditMode.value)

    if (isEditMode.value && userForm.value.id) {
      await $fetch(`/api/admin/users/${userForm.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      await $fetch('/api/admin/users', {
        method: 'POST',
        body: payload
      })
    }

    await Promise.all([refreshUsers(), refreshCompanies()])
    closeModal()
  } catch (error) {
    const message = error?.statusMessage || 'Erro ao salvar usuário.'
    formError.value = message
  } finally {
    isSaving.value = false
  }
}

const openDeleteModal = (user: AdminUserItem) => {
  deleteError.value = ''
  userToDelete.value = user
  isDeleteModalOpen.value = true
}

const closeDeleteModal = () => {
  isDeleteModalOpen.value = false
  userToDelete.value = null
  deleteError.value = ''
}

const confirmDelete = async () => {
  if (!userToDelete.value) return

  isDeleting.value = true
  deleteError.value = ''

  try {
    await $fetch(`/api/admin/users/${userToDelete.value.id}`, {
      method: 'DELETE'
    })
    await Promise.all([refreshUsers(), refreshCompanies()])
    closeDeleteModal()
  } catch (error) {
    deleteError.value = error?.statusMessage || 'Erro ao excluir usuário.'
  } finally {
    isDeleting.value = false
  }
}
</script>
