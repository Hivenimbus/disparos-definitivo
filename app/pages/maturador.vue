<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <div class="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Maturador de WhatsApp</h1>
            <p class="text-gray-500">Aqueça seus números com troca de mensagens automáticas</p>
          </div>
        </div>
        
        <button
          @click="openModal"
          :disabled="!canCreateNew"
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 disabled:shadow-none transition-all flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>Iniciar Maturação</span>
        </button>
      </div>

      <!-- Descrição do Maturador -->
      <div class="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <div class="flex items-start space-x-3">
          <div class="flex-shrink-0 mt-1">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-bold text-blue-900">O que é a maturação?</h3>
            <p class="text-sm text-blue-800 mt-1 leading-relaxed">
              O maturador é uma ferramenta essencial para <strong>aquecer novos números de WhatsApp</strong>. 
              Através da troca automatizada de mensagens entre dois chips, o sistema simula conversas humanas reais, 
              aumentando a reputação do seu número perante os servidores do WhatsApp e <strong>reduzindo drasticamente o risco de banimentos</strong> 
              antes de iniciar suas campanhas de disparos.
            </p>
          </div>
        </div>
      </div>
      
      <!-- Info Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-blue-600 font-medium">Rápida</p>
              <p class="text-xs text-blue-500">30 repetições (60 msgs)</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-purple-600 font-medium">Média</p>
              <p class="text-xs text-purple-500">60 repetições (120 msgs)</p>
            </div>
          </div>
        </div>
        
        <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p class="text-sm text-green-600 font-medium">Completa</p>
              <p class="text-xs text-green-500">120 repetições (240 msgs)</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Maturation List -->
    <MaturationList ref="maturationListRef" @refresh="handleRefresh" @reconnect="handleReconnect" />

    <!-- Modal -->
    <MaturationModal
      :is-open="isModalOpen"
      :existing-maturation="selectedMaturation"
      @close="closeModal"
      @started="handleMaturationStarted"
      @updated="handleModalUpdated"
    />
  </div>
  <ToastContainer />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

definePageMeta({
  middleware: ['auth']
})

const authUser = useAuthUser()
const router = useRouter()

// Verificar acesso ao maturador
watch(
  () => authUser.value,
  (user) => {
    if (user && !user.maturadorEnabled) {
      router.replace('/dashboard')
    }
  },
  { immediate: true }
)

// Se não tem acesso, redireciona
onMounted(() => {
  if (authUser.value && !authUser.value.maturadorEnabled) {
    router.replace('/dashboard')
  }
})

type ExistingMaturation = {
  id: string
  instanceAId: string
  instanceBId: string
  instanceAConnected: boolean
  instanceBConnected: boolean
  phoneA: string | null
  phoneB: string | null
  maturationType: 'rapida' | 'media' | 'completa'
  intervalType: '15-30' | '30-45' | '45-60'
}

const MAX_MATURATIONS = 5

const isModalOpen = ref(false)
const activeMaturationsCount = ref(0)
const maturationListRef = ref<{ refresh: () => Promise<void> } | null>(null)
const selectedMaturation = ref<ExistingMaturation | null>(null)

const canCreateNew = computed(() => {
  return activeMaturationsCount.value < MAX_MATURATIONS
})

const openModal = () => {
  if (canCreateNew.value) {
    selectedMaturation.value = null
    isModalOpen.value = true
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedMaturation.value = null
}

const handleReconnect = (maturation: ExistingMaturation) => {
  selectedMaturation.value = maturation
  isModalOpen.value = true
}

const handleMaturationStarted = async () => {
  isModalOpen.value = false
  selectedMaturation.value = null
  await maturationListRef.value?.refresh()
  await loadActiveMaturationsCount()
}

const handleModalUpdated = async () => {
  await maturationListRef.value?.refresh()
  await loadActiveMaturationsCount()
}

const handleRefresh = async () => {
  await loadActiveMaturationsCount()
}

const loadActiveMaturationsCount = async () => {
  try {
    const response = await $fetch<{ maturacoes: Array<{ status: string }> }>('/api/maturador')
    activeMaturationsCount.value = response.maturacoes.filter(
      m => !['completed', 'stopped'].includes(m.status)
    ).length
  } catch (error) {
    console.error('[maturador] Erro ao carregar contagem:', error)
  }
}

onMounted(() => {
  loadActiveMaturationsCount()
})
</script>
