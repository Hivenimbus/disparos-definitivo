<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
        <h1 class="text-2xl font-bold text-gray-800">Atualizações</h1>
      </div>
      
      <!-- Add Button (Admin Only) -->
      <button
        v-if="isAdmin"
        @click="openCreateModal"
        class="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span>Adicionar Nota</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center space-y-3">
        <div class="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        <span class="text-gray-500">Carregando atualizações...</span>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="errorMessage" class="bg-red-50 border border-red-200 text-red-800 px-6 py-4 rounded-lg">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="updates.length === 0" class="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
      <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhuma atualização disponível</h3>
      <p class="text-gray-500">As notas de atualização do sistema aparecerão aqui.</p>
    </div>

    <!-- Updates Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="update in updates"
        :key="update.id"
        @click="openDetailModal(update)"
        class="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group"
      >
        <div class="flex items-start justify-between mb-3">
          <div class="flex items-center space-x-2">
            <div class="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <span class="text-xs text-gray-400">{{ formatDate(update.created_at) }}</span>
        </div>
        
        <h3 class="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {{ update.title }}
        </h3>
        
        <p class="text-sm text-gray-600 line-clamp-3">
          {{ update.description }}
        </p>
        
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center text-sm text-blue-600 font-medium">
            <span>Ver detalhes</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          
          <!-- Admin Actions -->
          <div v-if="isAdmin" class="flex items-center space-x-1" @click.stop>
            <button
              @click="openEditModal(update)"
              class="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Editar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              @click="openDeleteModal(update)"
              class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Apagar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Detail Modal -->
    <Teleport to="body">
      <div
        v-if="showDetailModal && selectedUpdate"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeDetailModal"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <span class="text-sm text-gray-500">{{ formatDate(selectedUpdate.created_at) }}</span>
            </div>
            <button
              @click="closeDetailModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-120px)]">
            <h2 class="text-xl font-bold text-gray-800 mb-4">{{ selectedUpdate.title }}</h2>
            <div class="markdown-content text-gray-700" v-html="renderMarkdown(selectedUpdate.content)"></div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Create Modal (Admin Only) -->
    <Teleport to="body">
      <div
        v-if="showCreateModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeCreateModal"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-800">Nova Atualização</h2>
            </div>
            <button
              @click="closeCreateModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
            <div v-if="createError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {{ createError }}
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Título</label>
              <input
                v-model="createForm.title"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título da atualização"
                :disabled="isCreating"
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Descrição curta</label>
              <input
                v-model="createForm.description"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Breve descrição que aparece no card"
                :disabled="isCreating"
              />
              <p class="mt-1 text-xs text-gray-500">Esta descrição aparece no card da lista</p>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Conteúdo completo</label>
              <textarea
                v-model="createForm.content"
                rows="8"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Detalhes completos da atualização..."
                :disabled="isCreating"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">Este conteúdo aparece ao clicar no card</p>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              @click="closeCreateModal"
              :disabled="isCreating"
              class="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleCreate"
              :disabled="isCreating"
              class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ isCreating ? 'Salvando...' : 'Salvar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Edit Modal (Admin Only) -->
    <Teleport to="body">
      <div
        v-if="showEditModal && editingUpdate"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeEditModal"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-800">Editar Atualização</h2>
            </div>
            <button
              @click="closeEditModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="px-6 py-5 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
            <div v-if="editError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
              {{ editError }}
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Título</label>
              <input
                v-model="editForm.title"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Título da atualização"
                :disabled="isEditing"
              />
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Descrição curta</label>
              <input
                v-model="editForm.description"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Breve descrição que aparece no card"
                :disabled="isEditing"
              />
              <p class="mt-1 text-xs text-gray-500">Esta descrição aparece no card da lista</p>
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Conteúdo completo</label>
              <textarea
                v-model="editForm.content"
                rows="8"
                class="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Detalhes completos da atualização..."
                :disabled="isEditing"
              ></textarea>
              <p class="mt-1 text-xs text-gray-500">Suporta formatação Markdown</p>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              @click="closeEditModal"
              :disabled="isEditing"
              class="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleEdit"
              :disabled="isEditing"
              class="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {{ isEditing ? 'Salvando...' : 'Salvar Alterações' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div
        v-if="showDeleteModal && deletingUpdate"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        @click.self="closeDeleteModal"
      >
        <div class="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h2 class="text-lg font-semibold text-gray-800">Apagar Atualização</h2>
            </div>
            <button
              @click="closeDeleteModal"
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="px-6 py-5">
            <div v-if="deleteError" class="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm mb-4">
              {{ deleteError }}
            </div>

            <p class="text-gray-700 mb-2">Tem certeza que deseja apagar esta atualização?</p>
            <p class="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg font-medium">{{ deletingUpdate.title }}</p>
            <p class="text-sm text-red-600 mt-3">Esta ação não pode ser desfeita.</p>
          </div>

          <div class="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              @click="closeDeleteModal"
              :disabled="isDeleting"
              class="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="handleDelete"
              :disabled="isDeleting"
              class="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {{ isDeleting ? 'Apagando...' : 'Apagar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MarkdownIt from 'markdown-it'

const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true
})

definePageMeta({
  middleware: ['auth']
})

const renderMarkdown = (content: string) => {
  if (!content) return ''
  return md.render(content)
}

type Update = {
  id: string
  title: string
  description: string
  content: string
  created_at: string
  created_by: string | null
}

const authUser = useAuthUser()

const updates = ref<Update[]>([])
const isLoading = ref(true)
const errorMessage = ref('')

const showDetailModal = ref(false)
const selectedUpdate = ref<Update | null>(null)

const showCreateModal = ref(false)
const isCreating = ref(false)
const createError = ref('')
const createForm = ref({
  title: '',
  description: '',
  content: ''
})

const showEditModal = ref(false)
const editingUpdate = ref<Update | null>(null)
const isEditing = ref(false)
const editError = ref('')
const editForm = ref({
  title: '',
  description: '',
  content: ''
})

const showDeleteModal = ref(false)
const deletingUpdate = ref<Update | null>(null)
const isDeleting = ref(false)
const deleteError = ref('')

const isAdmin = computed(() => authUser.value?.role === 'admin')

const formatDate = (dateString: string) => {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

const fetchUpdates = async () => {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const { updates: data } = await $fetch<{ updates: Update[] }>('/api/updates')
    updates.value = data
  } catch (error: any) {
    console.error('[atualizacoes] fetch error', error)
    errorMessage.value = error?.data?.statusMessage || 'Erro ao carregar atualizações'
  } finally {
    isLoading.value = false
  }
}

const openDetailModal = (update: Update) => {
  selectedUpdate.value = update
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedUpdate.value = null
}

const openCreateModal = () => {
  createForm.value = { title: '', description: '', content: '' }
  createError.value = ''
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
  createForm.value = { title: '', description: '', content: '' }
  createError.value = ''
}

const handleCreate = async () => {
  if (isCreating.value) return

  createError.value = ''

  if (!createForm.value.title.trim()) {
    createError.value = 'Título é obrigatório'
    return
  }

  if (!createForm.value.description.trim()) {
    createError.value = 'Descrição é obrigatória'
    return
  }

  if (!createForm.value.content.trim()) {
    createError.value = 'Conteúdo é obrigatório'
    return
  }

  try {
    isCreating.value = true

    const { update } = await $fetch<{ update: Update }>('/api/updates', {
      method: 'POST',
      body: {
        title: createForm.value.title.trim(),
        description: createForm.value.description.trim(),
        content: createForm.value.content.trim()
      }
    })

    updates.value.unshift(update)
    closeCreateModal()
  } catch (error: any) {
    console.error('[atualizacoes] create error', error)
    createError.value = error?.data?.statusMessage || 'Erro ao criar atualização'
  } finally {
    isCreating.value = false
  }
}

const openEditModal = (update: Update) => {
  editingUpdate.value = update
  editForm.value = {
    title: update.title,
    description: update.description,
    content: update.content
  }
  editError.value = ''
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingUpdate.value = null
  editForm.value = { title: '', description: '', content: '' }
  editError.value = ''
}

const handleEdit = async () => {
  if (isEditing.value || !editingUpdate.value) return

  editError.value = ''

  if (!editForm.value.title.trim()) {
    editError.value = 'Título é obrigatório'
    return
  }

  if (!editForm.value.description.trim()) {
    editError.value = 'Descrição é obrigatória'
    return
  }

  if (!editForm.value.content.trim()) {
    editError.value = 'Conteúdo é obrigatório'
    return
  }

  try {
    isEditing.value = true

    const { update } = await $fetch<{ update: Update }>(`/api/updates/${editingUpdate.value.id}`, {
      method: 'PUT',
      body: {
        title: editForm.value.title.trim(),
        description: editForm.value.description.trim(),
        content: editForm.value.content.trim()
      }
    })

    const index = updates.value.findIndex(u => u.id === update.id)
    if (index !== -1) {
      updates.value[index] = update
    }

    closeEditModal()
  } catch (error: any) {
    console.error('[atualizacoes] edit error', error)
    editError.value = error?.data?.statusMessage || 'Erro ao editar atualização'
  } finally {
    isEditing.value = false
  }
}

const openDeleteModal = (update: Update) => {
  deletingUpdate.value = update
  deleteError.value = ''
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingUpdate.value = null
  deleteError.value = ''
}

const handleDelete = async () => {
  if (isDeleting.value || !deletingUpdate.value) return

  deleteError.value = ''

  try {
    isDeleting.value = true

    await $fetch(`/api/updates/${deletingUpdate.value.id}`, {
      method: 'DELETE'
    })

    updates.value = updates.value.filter(u => u.id !== deletingUpdate.value?.id)
    closeDeleteModal()
  } catch (error: any) {
    console.error('[atualizacoes] delete error', error)
    deleteError.value = error?.data?.statusMessage || 'Erro ao apagar atualização'
  } finally {
    isDeleting.value = false
  }
}

onMounted(() => {
  fetchUpdates()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.markdown-content :deep(p) {
  margin-bottom: 1rem;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  font-weight: 700;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.markdown-content :deep(h1) { font-size: 1.5rem; }
.markdown-content :deep(h2) { font-size: 1.25rem; }
.markdown-content :deep(h3) { font-size: 1.125rem; }

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin-left: 1.5rem;
  margin-bottom: 1rem;
}

.markdown-content :deep(ul) {
  list-style-type: disc;
}

.markdown-content :deep(ol) {
  list-style-type: decimal;
}

.markdown-content :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-content :deep(strong) {
  font-weight: 700;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(code) {
  background-color: #f3f4f6;
  padding: 0.2rem 0.4rem;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875rem;
}

.markdown-content :deep(pre) {
  background-color: #1f2937;
  color: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  margin-bottom: 1rem;
}

.markdown-content :deep(pre code) {
  background-color: transparent;
  padding: 0;
  color: inherit;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  font-style: italic;
  color: #4b5563;
  margin-bottom: 1rem;
}

.markdown-content :deep(a) {
  color: #2563eb;
  text-decoration: underline;
}

.markdown-content :deep(a:hover) {
  color: #1d4ed8;
}
</style>
