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
        <div class="text-gray-600 text-sm">Usuários Desativados</div>
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
                <div class="flex flex-col">
                  <select
                    :key="`${user.id}-${user.status}`"
                    @change="handleStatusChange(user, ($event.target as HTMLSelectElement).value as UiStatus)"
                    :disabled="statusUpdating[user.id]"
                    class="px-3 py-1 rounded-full text-xs font-medium border border-transparent focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    :class="{
                      'bg-green-100 text-green-700': user.status === 'ativo',
                      'bg-red-100 text-red-700': user.status === 'desativado',
                      'opacity-50 cursor-not-allowed': statusUpdating[user.id]
                    }"
                  >
                    <option value="ativo" :selected="user.status === 'ativo'">Ativo</option>
                    <option value="desativado" :selected="user.status === 'desativado'">Desativado</option>
                  </select>
                  <p v-if="statusUpdating[user.id]" class="text-[11px] text-gray-500 mt-1">Atualizando...</p>
                  <p v-else-if="statusErrors[user.id]" class="text-[11px] text-red-600 mt-1">
                    {{ statusErrors[user.id] }}
                  </p>
                </div>
              </td>
              <td class="px-4 py-3">
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="roleBadgeClasses[user.role]"
                >
                  {{ roleLabels[user.role] }}
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
            <div class="relative">
              <input
                v-model="companySearch"
                type="text"
                placeholder="Digite para buscar empresas"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @focus="openCompanyDropdown"
                @input="openCompanyDropdown"
                @blur="scheduleCloseCompanyDropdown"
                @keydown.escape.prevent="closeCompanyDropdown()"
            >
              <div
                v-if="isCompanyDropdownOpen"
                class="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                <button
                  type="button"
                  class="w-full text-left px-4 py-2 text-sm flex items-center justify-between"
                  @mousedown.prevent
                  @click="selectCompany(null)"
                  :disabled="roleRequiresCompany"
                  :class="{
                    'opacity-50 cursor-not-allowed text-gray-400': roleRequiresCompany,
                    'hover:bg-gray-50': !roleRequiresCompany
                  }"
                >
                  <span>Sem empresa</span>
                  <svg
                    v-if="!userForm.empresaId && !roleRequiresCompany"
                    xmlns="http://www.w3.org/2000/svg"
                    class="w-4 h-4 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <div class="border-t border-gray-100"></div>
                <template v-if="filteredCompanies.length">
                  <button
                    v-for="company in filteredCompanies"
                :key="company.id"
                    type="button"
                    class="w-full text-left px-4 py-2 text-sm flex items-center justify-between"
                    @mousedown.prevent
                    @click="selectCompany(company)"
                :disabled="!canSelectCompany(company.id)"
                    :class="{
                      'hover:bg-gray-50': canSelectCompany(company.id),
                      'opacity-50 cursor-not-allowed': !canSelectCompany(company.id),
                      'bg-blue-50 hover:bg-blue-50': userForm.empresaId === company.id
                    }"
                  >
                    <div>
                      <p class="font-medium text-gray-800">
                        {{ company.nome }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ company.usuariosAtuais }}/{{ company.maxUsuarios }} usuários
                        <span
                          v-if="!canSelectCompany(company.id) && originalCompanyId !== company.id"
                          class="text-red-600 font-semibold"
                        >
                          - Lotado
                        </span>
                      </p>
                    </div>
                    <svg
                      v-if="userForm.empresaId === company.id"
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5 text-blue-600 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                </template>
                <p v-else class="px-4 py-3 text-sm text-gray-500">Nenhuma empresa encontrada</p>
              </div>
            </div>
            <p
              v-if="roleRequiresCompany"
              class="text-xs mt-2"
              :class="userForm.empresaId ? 'text-gray-500' : 'text-blue-600'"
            >
              Gerentes precisam estar vinculados a uma empresa.
            </p>
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
              :disabled="isVencimentoLocked"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
            >
            <p v-if="isVencimentoLocked" class="text-xs text-gray-500 mt-1">
              A data de vencimento segue a data da empresa selecionada.
            </p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Role</label>
            <select
              v-model="userForm.role"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="usuario">Usuário</option>
              <option value="gerente">Gerente</option>
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
              <option value="desativado">Desativado</option>
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

    <div v-if="isAdminConfirmModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeAdminConfirmModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-red-100">
        <div class="flex items-center justify-center mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        <h3 class="text-xl font-semibold text-gray-800 text-center mb-2">Confirmar privilégios de administrador</h3>
        <p class="text-gray-600 text-center mb-6">
          Para atribuir a role <strong>admin</strong> ao usuário <strong>{{ userForm.nome || 'novo usuário' }}</strong>, confirme sua senha de administrador.
        </p>
        <p v-if="adminPasswordError" class="text-red-600 text-center mb-4">
          {{ adminPasswordError }}
        </p>

        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">Sua senha</label>
          <input
            v-model="adminPassword"
            type="password"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Digite sua senha atual"
            :disabled="adminPasswordLoading"
            @keyup.enter="confirmAdminRoleAssignment"
          >
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeAdminConfirmModal"
            :disabled="adminPasswordLoading"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            @click="confirmAdminRoleAssignment"
            :disabled="adminPasswordLoading"
            class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="!adminPasswordLoading">Confirmar</span>
            <span v-else>Validando...</span>
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
import { ref, computed, watch } from 'vue'

type UiRole = 'admin' | 'gerente' | 'usuario'
type UiStatus = 'ativo' | 'desativado'
type StatusLabel = 'ativo' | 'desativado'

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
  dataVencimento: string
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

type AdminUserResponse = {
  user: AdminUserItem
}

const searchQuery = ref('')
const authUser = useAuthUser()
const isModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isEditMode = ref(false)
const userToDelete = ref<AdminUserItem | null>(null)
const formError = ref('')
const deleteError = ref('')
const isSaving = ref(false)
const isDeleting = ref(false)
const originalCompanyId = ref<string | null>(null)
const originalRole = ref<UiRole | null>(null)
const statusUpdating = ref<Record<string, boolean>>({})
const statusErrors = ref<Record<string, string>>({})
const roleLabels: Record<UiRole, string> = {
  admin: 'Admin',
  gerente: 'Gerente',
  usuario: 'Usuário'
}
const roleBadgeClasses: Record<UiRole, string> = {
  admin: 'bg-blue-100 text-blue-700',
  gerente: 'bg-purple-100 text-purple-700',
  usuario: 'bg-gray-100 text-gray-700'
}
const companySearch = ref('')
const isCompanyDropdownOpen = ref(false)
let companyDropdownCloseTimeout: ReturnType<typeof setTimeout> | null = null
const isAdminConfirmModalOpen = ref(false)
const adminPassword = ref('')
const adminPasswordError = ref('')
const adminPasswordLoading = ref(false)
const adminPasswordConfirmed = ref(false)

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
const roleRequiresCompany = computed(() => userForm.value.role === 'gerente')
const requiresAdminRoleConfirmation = computed(() => {
  if (userForm.value.role !== 'admin') {
    return false
  }
  if (!isEditMode.value) {
    return true
  }
  return originalRole.value !== 'admin'
})

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
const filteredCompanies = computed<CompanyItem[]>(() => {
  const query = companySearch.value.trim().toLowerCase()
  if (!query) {
    return companies.value
  }
  return companies.value.filter((company) => company.nome.toLowerCase().includes(query))
})

const totalUsers = computed(() => users.value.length)
const activeUsers = computed(() => users.value.filter((u) => u.statusLabel === 'ativo').length)
const expiredUsers = computed(() => users.value.filter((u) => u.statusLabel === 'desativado').length)
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
  if (roleRequiresCompany.value && !userForm.value.empresaId) return false
  if (!isEditMode.value && userForm.value.senha.trim().length < 8) return false
  if (isEditMode.value && userForm.value.senha && userForm.value.senha.length < 8) return false
  return true
})

const formatDate = (dateString?: string | null) => {
  if (!dateString) return '-'
  const [year, month, day] = dateString.split('-')
  if (!year || !month || !day) return dateString
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`
}

const findCompany = (companyId: string | null) => {
  if (!companyId) return null
  return companies.value.find((company) => company.id === companyId) || null
}

const getCompanyName = (user: AdminUserItem) => {
  return findCompany(user.empresaId)?.nome || user.empresaNome || 'Sem empresa'
}

const updateCompanySearchFromSelection = (fallbackName = '') => {
  if (!userForm.value.empresaId) {
    companySearch.value = ''
    return
  }
  const company = findCompany(userForm.value.empresaId)
  companySearch.value = company?.nome || fallbackName || ''
}

const isVencimentoLocked = computed(() => Boolean(userForm.value.empresaId))

watch(
  () => userForm.value.empresaId,
  (newCompanyId) => {
    if (newCompanyId) {
      const company = findCompany(newCompanyId)
      if (company?.dataVencimento) {
        userForm.value.dataVencimento = company.dataVencimento
      }
    }
  }
)

watch(
  () => userForm.value.role,
  () => {
    adminPasswordConfirmed.value = false
  }
)

const openCompanyDropdown = () => {
  if (companyDropdownCloseTimeout) {
    clearTimeout(companyDropdownCloseTimeout)
    companyDropdownCloseTimeout = null
  }
  isCompanyDropdownOpen.value = true
}

const closeCompanyDropdown = () => {
  if (companyDropdownCloseTimeout) {
    clearTimeout(companyDropdownCloseTimeout)
    companyDropdownCloseTimeout = null
  }
  isCompanyDropdownOpen.value = false
  updateCompanySearchFromSelection()
}

const scheduleCloseCompanyDropdown = () => {
  if (companyDropdownCloseTimeout) {
    clearTimeout(companyDropdownCloseTimeout)
  }
  companyDropdownCloseTimeout = setTimeout(() => {
    closeCompanyDropdown()
  }, 150)
}

const resetAdminConfirmationState = () => {
  adminPassword.value = ''
  adminPasswordError.value = ''
  adminPasswordLoading.value = false
  adminPasswordConfirmed.value = false
  isAdminConfirmModalOpen.value = false
}

const openAdminConfirmModal = () => {
  adminPassword.value = ''
  adminPasswordError.value = ''
  isAdminConfirmModalOpen.value = true
}

const closeAdminConfirmModal = () => {
  isAdminConfirmModalOpen.value = false
  adminPassword.value = ''
  adminPasswordError.value = ''
}

const selectCompany = (company: CompanyItem | null) => {
  if (!company && roleRequiresCompany.value) {
    formError.value = 'Gerentes devem estar vinculados a uma empresa.'
    return
  }

  userForm.value.empresaId = company ? company.id : null
  if (formError.value === 'Gerentes devem estar vinculados a uma empresa.' && userForm.value.empresaId) {
    formError.value = ''
  }
  updateCompanySearchFromSelection(company?.nome || '')
  closeCompanyDropdown()
}

const setStatusUpdating = (id: string, value: boolean) => {
  statusUpdating.value = { ...statusUpdating.value, [id]: value }
}

const setStatusError = (id: string, message: string) => {
  if (!message) {
    const { [id]: _, ...rest } = statusErrors.value
    statusErrors.value = rest
  } else {
    statusErrors.value = { ...statusErrors.value, [id]: message }
  }
}

const resetForm = () => {
  userForm.value = defaultForm()
  originalCompanyId.value = null
  originalRole.value = null
  formError.value = ''
  companySearch.value = ''
  isCompanyDropdownOpen.value = false
  resetAdminConfirmationState()
}

const canSelectCompany = (companyId: string) => {
  const company = findCompany(companyId)
  if (!company) return false
  if (isEditMode.value && originalCompanyId.value === companyId) {
    return true
  }
  return company.usuariosAtuais < company.maxUsuarios
}

const updateUsersState = (updatedUser: AdminUserItem, prependWhenMissing = false) => {
  const currentUsers = usersData.value ?? []
  const existingIndex = currentUsers.findIndex((user) => user.id === updatedUser.id)

  if (existingIndex === -1) {
    if (prependWhenMissing) {
      usersData.value = [updatedUser, ...currentUsers]
    } else {
      usersData.value = [...currentUsers, updatedUser]
    }
    return
  }

  const nextUsers = [...currentUsers]
  nextUsers[existingIndex] = updatedUser
  usersData.value = nextUsers
}

const removeUserFromState = (userId: string) => {
  if (!usersData.value) return
  usersData.value = usersData.value.filter((user) => user.id !== userId)
}

const adjustCompanyUserCount = (companyId: string | null, delta: number) => {
  if (!companyId || !companiesData.value) return
  const currentCompanies = companiesData.value
  const targetIndex = currentCompanies.findIndex((company) => company.id === companyId)
  if (targetIndex === -1) return

  const nextCompanies = [...currentCompanies]
  const targetCompany = nextCompanies[targetIndex]
  nextCompanies[targetIndex] = {
    ...targetCompany,
    usuariosAtuais: Math.max(0, targetCompany.usuariosAtuais + delta)
  }
  companiesData.value = nextCompanies
}

const applyUserChanges = (savedUser: AdminUserItem, isEdit: boolean, previousCompanyId: string | null) => {
  updateUsersState(savedUser, !isEdit)

  const currentCompanyId = savedUser.empresaId

  if (!isEdit) {
    if (currentCompanyId) {
      adjustCompanyUserCount(currentCompanyId, 1)
    }
    return
  }

  if (previousCompanyId !== currentCompanyId) {
    if (previousCompanyId) {
      adjustCompanyUserCount(previousCompanyId, -1)
    }
    if (currentCompanyId) {
      adjustCompanyUserCount(currentCompanyId, 1)
    }
  }
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
  originalRole.value = user.role
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
  updateCompanySearchFromSelection(user.empresaNome || '')
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  resetForm()
}

const ensureCapacity = () => {
  if (roleRequiresCompany.value && !userForm.value.empresaId) {
    formError.value = 'Gerentes devem estar vinculados a uma empresa.'
    return false
  }

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

const performSaveUser = async () => {
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
    const previousCompanyId = originalCompanyId.value

    let response: AdminUserResponse

    if (isEditMode.value && userForm.value.id) {
      response = await $fetch<AdminUserResponse>(`/api/admin/users/${userForm.value.id}`, {
        method: 'PUT',
        body: payload
      })
    } else {
      response = await $fetch<AdminUserResponse>('/api/admin/users', {
        method: 'POST',
        body: payload
      })
    }

    applyUserChanges(response.user, isEditMode.value, previousCompanyId)
    closeModal()

    await Promise.allSettled([refreshUsers(), refreshCompanies()])
  } catch (error) {
    const message = error?.statusMessage || 'Erro ao salvar usuário.'
    formError.value = message
  } finally {
    isSaving.value = false
  }
}

const saveUser = async () => {
  if (requiresAdminRoleConfirmation.value && !adminPasswordConfirmed.value) {
    openAdminConfirmModal()
    return
  }

  try {
    await performSaveUser()
  } finally {
    adminPasswordConfirmed.value = false
  }
}

const confirmAdminRoleAssignment = async () => {
  if (adminPasswordLoading.value) {
    return
  }

  if (!adminPassword.value.trim()) {
    adminPasswordError.value = 'Informe sua senha para confirmar.'
    return
  }

  if (!authUser.value?.email) {
    adminPasswordError.value = 'Não foi possível validar o usuário autenticado.'
    return
  }

  adminPasswordError.value = ''
  adminPasswordLoading.value = true

  try {
    await $fetch('/api/auth/login', {
      method: 'POST',
      body: {
        email: authUser.value.email,
        password: adminPassword.value
      }
    })
    adminPasswordConfirmed.value = true
    closeAdminConfirmModal()
    adminPassword.value = ''
    await saveUser()
  } catch (error) {
    const statusMessage = (error as { statusMessage?: string })?.statusMessage
    adminPasswordError.value = statusMessage || 'Senha inválida. Tente novamente.'
  } finally {
    adminPasswordLoading.value = false
    adminPassword.value = ''
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
    const deletedUser = userToDelete.value
    removeUserFromState(deletedUser.id)
    if (deletedUser.empresaId) {
      adjustCompanyUserCount(deletedUser.empresaId, -1)
    }
    closeDeleteModal()
    await Promise.allSettled([refreshUsers(), refreshCompanies()])
  } catch (error) {
    deleteError.value = error?.statusMessage || 'Erro ao excluir usuário.'
  } finally {
    isDeleting.value = false
  }
}

const handleStatusChange = async (user: AdminUserItem, nextStatus: UiStatus) => {
  if (nextStatus === user.status) {
    return
  }

  setStatusError(user.id, '')
  setStatusUpdating(user.id, true)

  try {
    const response = await $fetch<AdminUserResponse>(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      body: {
        status: nextStatus
      }
    })
    updateUsersState(response.user)
  } catch (error) {
    const message = (error as { statusMessage?: string })?.statusMessage || 'Não foi possível atualizar o status.'
    setStatusError(user.id, message)
  } finally {
    setStatusUpdating(user.id, false)
  }
}
</script>
