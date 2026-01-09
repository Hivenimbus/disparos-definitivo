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
        
        <div class="mt-4 flex items-center text-sm text-blue-600 font-medium">
          <span>Ver detalhes</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
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
            <div class="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">{{ selectedUpdate.content }}</div>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: ['auth']
})

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
</style>
