<template>
  <section class="bg-white rounded-xl shadow-sm border border-gray-100">
    <!-- Header -->
    <div class="px-6 py-5 border-b border-gray-100">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">Maturações Ativas</h2>
            <p class="text-sm text-gray-500">{{ activeMaturations.length }} de {{ MAX_MATURATIONS }} slots em uso</p>
          </div>
        </div>
        <button
          @click="loadMaturations"
          :disabled="isLoading"
          class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Atualizar lista"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" :class="{ 'animate-spin': isLoading }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <div class="p-6">
      <!-- Loading -->
      <div v-if="isLoading && maturations.length === 0" class="text-center py-12">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-gray-300 mx-auto mb-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p class="text-gray-400">Carregando maturações...</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="maturations.length === 0" class="text-center py-12">
        <div class="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Nenhuma maturação ativa</h3>
        <p class="text-gray-500 mb-6">Clique em "Iniciar Maturação" para começar</p>
      </div>

      <!-- Maturation Cards -->
      <div v-else class="space-y-4">
        <div
          v-for="maturation in maturations"
          :key="maturation.id"
          class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200 transition-all hover:shadow-md"
        >
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <!-- Info Section -->
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-3">
                <!-- Status Badge -->
                <span
                  class="px-3 py-1 rounded-full text-xs font-semibold"
                  :class="getStatusClass(maturation.status)"
                >
                  {{ getStatusLabel(maturation.status) }}
                </span>
                <!-- Type Badge -->
                <span class="px-3 py-1 bg-gray-200 text-gray-700 rounded-full text-xs font-medium">
                  {{ getTypeLabel(maturation.maturationType) }}
                </span>
              </div>

              <!-- Phone Numbers -->
              <div class="flex items-center space-x-4 mb-3">
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">A</span>
                  <span class="text-sm text-gray-700 font-medium">{{ formatPhone(maturation.phoneA) || 'Aguardando...' }}</span>
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="maturation.instanceAConnected ? 'bg-green-500' : 'bg-yellow-500'"
                  ></span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <div class="flex items-center space-x-2">
                  <span class="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">B</span>
                  <span class="text-sm text-gray-700 font-medium">{{ formatPhone(maturation.phoneB) || 'Aguardando...' }}</span>
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="maturation.instanceBConnected ? 'bg-green-500' : 'bg-yellow-500'"
                  ></span>
                </div>
              </div>

              <!-- Progress Bar -->
              <div class="mb-2">
                <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
                  <span>Progresso</span>
                  <span>{{ maturation.messagesSent }} / {{ maturation.totalMessages }} mensagens</span>
                </div>
                <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    class="h-full transition-all duration-500 rounded-full"
                    :class="getProgressBarClass(maturation.status)"
                    :style="{ width: `${getProgressPercentage(maturation)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Meta Info -->
              <div class="flex items-center space-x-4 text-xs text-gray-500">
                <span>Intervalo: {{ getIntervalLabel(maturation.intervalType) }}</span>
                <span v-if="maturation.startedAt">Iniciado: {{ formatDate(maturation.startedAt) }}</span>
                <span v-if="maturation.completedAt && maturation.startedAt">Finalizado: {{ formatDate(maturation.completedAt) }}</span>
                <span v-else-if="maturation.completedAt && !maturation.startedAt">Cancelado: {{ formatDate(maturation.completedAt) }}</span>
                <span v-else-if="!maturation.startedAt && maturation.status === 'connecting'">Criado: {{ formatDate(maturation.createdAt) }}</span>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex items-center space-x-2">
              <button
                v-if="needsConnection(maturation)"
                @click="handleReconnect(maturation)"
                class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                </svg>
                <span>Conectar WhatsApp</span>
              </button>
              <button
                v-if="canStop(maturation.status)"
                @click="openDeleteConfirm(maturation.id)"
                :disabled="deletingId === maturation.id"
                class="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white text-sm font-medium rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg v-if="deletingId === maturation.id" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>{{ deletingId === maturation.id ? 'Apagando...' : 'Apagar' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Modal de Confirmação de Exclusão -->
  <Teleport to="body">
    <div
      v-if="confirmDeleteId"
      class="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeDeleteConfirm"></div>
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div class="flex items-center space-x-4 mb-4">
          <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-gray-900">Apagar Maturação</h3>
            <p class="text-sm text-gray-500">Esta ação não pode ser desfeita</p>
          </div>
        </div>
        
        <p class="text-gray-600 mb-6">
          Tem certeza que deseja apagar esta maturação? As instâncias do WhatsApp serão desconectadas e todos os dados serão removidos permanentemente.
        </p>
        
        <div class="flex items-center justify-end space-x-3">
          <button
            @click="closeDeleteConfirm"
            class="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDelete"
            :disabled="deletingId !== null"
            class="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white font-semibold rounded-lg transition-colors flex items-center space-x-2"
          >
            <svg v-if="deletingId" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ deletingId ? 'Apagando...' : 'Apagar' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

type MaturationStatus = 'pending' | 'connecting' | 'running' | 'paused' | 'completed' | 'stopped'
type MaturationType = 'rapida' | 'media' | 'completa'
type IntervalType = '15-30' | '30-45' | '45-60'

type Maturation = {
  id: string
  instanceAId: string
  instanceBId: string
  instanceAConnected: boolean
  instanceBConnected: boolean
  phoneA: string | null
  phoneB: string | null
  maturationType: MaturationType
  intervalType: IntervalType
  totalMessages: number
  messagesSent: number
  status: MaturationStatus
  startedAt: string | null
  completedAt: string | null
  createdAt: string
}

const emit = defineEmits<{
  (e: 'refresh'): void
  (e: 'reconnect', maturation: Maturation): void
}>()

const MAX_MATURATIONS = 5

const maturations = ref<Maturation[]>([])
const isLoading = ref(false)
const deletingId = ref<string | null>(null)
const confirmDeleteId = ref<string | null>(null)
const pollingHandle = ref<ReturnType<typeof setInterval> | null>(null)

const activeMaturations = computed(() => {
  return maturations.value.filter(m => !['completed', 'stopped'].includes(m.status))
})

const formatPhone = (phone: string | null) => {
  if (!phone) return null
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  return phone
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusClass = (status: MaturationStatus) => {
  switch (status) {
    case 'running':
      return 'bg-green-100 text-green-700'
    case 'connecting':
    case 'pending':
      return 'bg-yellow-100 text-yellow-700'
    case 'paused':
      return 'bg-blue-100 text-blue-700'
    case 'completed':
      return 'bg-gray-100 text-gray-700'
    case 'stopped':
      return 'bg-red-100 text-red-700'
    default:
      return 'bg-gray-100 text-gray-700'
  }
}

const getStatusLabel = (status: MaturationStatus) => {
  switch (status) {
    case 'running':
      return 'Em execução'
    case 'connecting':
      return 'Conectando'
    case 'pending':
      return 'Pendente'
    case 'paused':
      return 'Pausado'
    case 'completed':
      return 'Concluído'
    case 'stopped':
      return 'Parado'
    default:
      return status
  }
}

const getTypeLabel = (type: MaturationType) => {
  switch (type) {
    case 'rapida':
      return 'Rápida'
    case 'media':
      return 'Média'
    case 'completa':
      return 'Completa'
    default:
      return type
  }
}

const getIntervalLabel = (interval: IntervalType) => {
  switch (interval) {
    case '15-30':
      return '15-30s'
    case '30-45':
      return '30-45s'
    case '45-60':
      return '45-60s'
    default:
      return interval
  }
}

const getProgressPercentage = (maturation: Maturation) => {
  if (maturation.totalMessages === 0) return 0
  return Math.round((maturation.messagesSent / maturation.totalMessages) * 100)
}

const getProgressBarClass = (status: MaturationStatus) => {
  switch (status) {
    case 'running':
      return 'bg-gradient-to-r from-green-400 to-green-500'
    case 'completed':
      return 'bg-gradient-to-r from-gray-400 to-gray-500'
    case 'stopped':
      return 'bg-gradient-to-r from-red-400 to-red-500'
    default:
      return 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  }
}

const canStop = (status: MaturationStatus) => {
  return ['pending', 'connecting', 'running', 'paused'].includes(status)
}

const needsConnection = (maturation: Maturation) => {
  return maturation.status === 'connecting' && (!maturation.instanceAConnected || !maturation.instanceBConnected)
}

const handleReconnect = (maturation: Maturation) => {
  emit('reconnect', maturation)
}

const openDeleteConfirm = (id: string) => {
  confirmDeleteId.value = id
}

const closeDeleteConfirm = () => {
  confirmDeleteId.value = null
}

const confirmDelete = async () => {
  if (!confirmDeleteId.value) return
  await deleteMaturation(confirmDeleteId.value)
  closeDeleteConfirm()
}

const loadMaturations = async () => {
  isLoading.value = true
  try {
    const response = await $fetch<{ maturacoes: Maturation[] }>('/api/maturador')
    maturations.value = response.maturacoes
  } catch (error: any) {
    console.error('[MaturationList] Erro ao carregar maturações:', error)
  } finally {
    isLoading.value = false
  }
}

const deleteMaturation = async (id: string) => {
  deletingId.value = id
  try {
    await $fetch(`/api/maturador/${id}`, { method: 'DELETE' })
    await loadMaturations()
    emit('refresh')
  } catch (error: any) {
    console.error('[MaturationList] Erro ao apagar maturação:', error)
  } finally {
    deletingId.value = null
  }
}

const startPolling = () => {
  if (pollingHandle.value) return
  pollingHandle.value = setInterval(loadMaturations, 10000)
}

const stopPolling = () => {
  if (pollingHandle.value) {
    clearInterval(pollingHandle.value)
    pollingHandle.value = null
  }
}

// Expose method to parent
defineExpose({
  refresh: loadMaturations
})

onMounted(() => {
  loadMaturations()
  startPolling()
})

onBeforeUnmount(() => {
  stopPolling()
})
</script>
