<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="handleClose"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">{{ isReconnecting ? 'Conectar WhatsApp' : 'Nova Maturação' }}</h2>
              <p class="text-sm text-gray-500">{{ isReconnecting ? 'Continue conectando os números' : 'Conecte dois números para iniciar' }}</p>
            </div>
          </div>
          <button
            @click="handleClose"
            class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="p-6">
          <!-- Error Message -->
          <div v-if="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {{ errorMessage }}
          </div>

          <!-- QR Codes Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- QR Code A -->
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                  <span class="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">A</span>
                  <span class="font-semibold text-gray-800">Número 1</span>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="instanceAConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ instanceAConnected ? 'Conectado' : 'Aguardando' }}
                </span>
              </div>
              
              <div class="aspect-square bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
                <template v-if="instanceAConnected">
                  <div class="text-center p-6">
                    <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="font-semibold text-gray-800">Conectado!</p>
                    <p v-if="phoneA" class="text-sm text-gray-500 mt-1">{{ formatPhone(phoneA) }}</p>
                  </div>
                </template>
                <template v-else-if="qrCodeA">
                  <img :src="qrCodeA" alt="QR Code Número A" class="w-full h-full object-contain p-2" />
                </template>
                <template v-else>
                  <div class="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p class="text-sm text-gray-400">Carregando QR Code...</p>
                  </div>
                </template>
              </div>
            </div>

            <!-- QR Code B -->
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                  <span class="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">B</span>
                  <span class="font-semibold text-gray-800">Número 2</span>
                </div>
                <span
                  class="px-3 py-1 rounded-full text-xs font-medium"
                  :class="instanceBConnected ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  {{ instanceBConnected ? 'Conectado' : 'Aguardando' }}
                </span>
              </div>
              
              <div class="aspect-square bg-white rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden">
                <template v-if="instanceBConnected">
                  <div class="text-center p-6">
                    <div class="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p class="font-semibold text-gray-800">Conectado!</p>
                    <p v-if="phoneB" class="text-sm text-gray-500 mt-1">{{ formatPhone(phoneB) }}</p>
                  </div>
                </template>
                <template v-else-if="qrCodeB">
                  <img :src="qrCodeB" alt="QR Code Número B" class="w-full h-full object-contain p-2" />
                </template>
                <template v-else>
                  <div class="text-center p-6">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h2M4 12h2m10 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p class="text-sm text-gray-400">Carregando QR Code...</p>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Options Section -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <!-- Maturation Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Tipo de Maturação</label>
              <select
                v-model="selectedMaturationType"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60"
                :disabled="isCreating || isReconnecting"
              >
                <option value="rapida">Rápida - 30 repetições (60 mensagens)</option>
                <option value="media">Média - 60 repetições (120 mensagens)</option>
                <option value="completa">Completa - 120 repetições (240 mensagens)</option>
              </select>
            </div>

            <!-- Interval Type -->
            <div>
              <label class="block text-sm font-semibold text-gray-700 mb-2">Intervalo entre Mensagens</label>
              <select
                v-model="selectedIntervalType"
                class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-60"
                :disabled="isCreating || isReconnecting"
              >
                <option value="15-30">15 - 30 segundos</option>
                <option value="30-45">30 - 45 segundos</option>
                <option value="45-60">45 - 60 segundos</option>
              </select>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <div class="flex items-start space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div class="text-sm text-blue-700">
                <p class="font-semibold mb-1">Como funciona:</p>
                <ol class="list-decimal list-inside space-y-1 text-blue-600">
                  <li>Escaneie os QR Codes com os dois números que deseja maturar</li>
                  <li>Aguarde ambos ficarem conectados (verde)</li>
                  <li>Clique em "Iniciar Maturação" para começar o processo</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="sticky bottom-0 bg-gray-50 border-t border-gray-100 px-6 py-4 flex items-center justify-between rounded-b-2xl">
          <button
            @click="handleClose"
            class="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            :disabled="isStarting"
          >
            Cancelar
          </button>
          <button
            @click="handleStartMaturation"
            :disabled="!canStart || isStarting"
            class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg shadow-green-500/25 disabled:shadow-none transition-all flex items-center space-x-2"
          >
            <svg v-if="isStarting" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>{{ isStarting ? 'Iniciando...' : 'Iniciar Maturação' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from 'vue'

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

const props = defineProps<{
  isOpen: boolean
  existingMaturation?: ExistingMaturation | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'started'): void
  (e: 'updated'): void
}>()

// State
const maturationId = ref<string | null>(null)
const isCreating = ref(false)
const isStarting = ref(false)
const errorMessage = ref<string | null>(null)

const qrCodeA = ref<string | null>(null)
const qrCodeB = ref<string | null>(null)
const instanceAConnected = ref(false)
const instanceBConnected = ref(false)
const phoneA = ref<string | null>(null)
const phoneB = ref<string | null>(null)

const selectedMaturationType = ref<'rapida' | 'media' | 'completa'>('rapida')
const selectedIntervalType = ref<'15-30' | '30-45' | '45-60'>('15-30')

const pollingHandle = ref<ReturnType<typeof setInterval> | null>(null)
const qrRefreshHandle = ref<ReturnType<typeof setInterval> | null>(null)

// Computed
const isReconnecting = computed(() => Boolean(props.existingMaturation))

const canStart = computed(() => {
  return maturationId.value && instanceAConnected.value && instanceBConnected.value && !isStarting.value
})

// Methods
const formatPhone = (phone: string) => {
  if (!phone) return ''
  // Format: +55 11 99999-9999
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 13) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 9)}-${cleaned.slice(9)}`
  }
  return phone
}

const stopPolling = () => {
  if (pollingHandle.value) {
    clearInterval(pollingHandle.value)
    pollingHandle.value = null
  }
}

const stopQrRefresh = () => {
  if (qrRefreshHandle.value) {
    clearInterval(qrRefreshHandle.value)
    qrRefreshHandle.value = null
  }
}

const resetState = () => {
  maturationId.value = null
  qrCodeA.value = null
  qrCodeB.value = null
  instanceAConnected.value = false
  instanceBConnected.value = false
  phoneA.value = null
  phoneB.value = null
  errorMessage.value = null
  isCreating.value = false
  isStarting.value = false
  stopPolling()
  stopQrRefresh()
}

const createMaturation = async () => {
  isCreating.value = true
  errorMessage.value = null

  try {
    const response = await $fetch<{ success: boolean; maturation: { id: string } }>('/api/maturador', {
      method: 'POST',
      body: {
        maturation_type: selectedMaturationType.value,
        interval_type: selectedIntervalType.value
      }
    })

    if (response.success && response.maturation.id) {
      maturationId.value = response.maturation.id
      await fetchQrCodes()
      startPolling()
      startQrRefresh()
    }
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'Erro ao criar maturação'
  } finally {
    isCreating.value = false
  }
}

const fetchQrCodes = async () => {
  if (!maturationId.value) return

  try {
    const response = await $fetch<{
      instanceA: { qrCode: string | null; connected: boolean }
      instanceB: { qrCode: string | null; connected: boolean }
    }>(`/api/maturador/${maturationId.value}/qrcode`)

    if (!instanceAConnected.value) {
      qrCodeA.value = response.instanceA.qrCode
    }
    if (!instanceBConnected.value) {
      qrCodeB.value = response.instanceB.qrCode
    }
  } catch (error: any) {
    console.warn('[MaturationModal] Erro ao buscar QR Codes:', error?.message)
  }
}

const fetchState = async () => {
  if (!maturationId.value) return

  try {
    const response = await $fetch<{
      instanceA: { connected: boolean; phone: string | null }
      instanceB: { connected: boolean; phone: string | null }
      bothConnected: boolean
    }>(`/api/maturador/${maturationId.value}/state`)

    instanceAConnected.value = response.instanceA.connected
    instanceBConnected.value = response.instanceB.connected
    phoneA.value = response.instanceA.phone
    phoneB.value = response.instanceB.phone

    // Se ambos conectados, parar polling de QR
    if (response.bothConnected) {
      stopQrRefresh()
    }
  } catch (error: any) {
    console.warn('[MaturationModal] Erro ao verificar estado:', error?.message)
  }
}

const startPolling = () => {
  if (pollingHandle.value) return
  pollingHandle.value = setInterval(fetchState, 3000)
}

const startQrRefresh = () => {
  if (qrRefreshHandle.value) return
  qrRefreshHandle.value = setInterval(fetchQrCodes, 25000)
}

const handleStartMaturation = async () => {
  if (!canStart.value || !maturationId.value) return

  isStarting.value = true
  errorMessage.value = null

  try {
    await $fetch(`/api/maturador/${maturationId.value}/start`, {
      method: 'POST'
    })

    emit('started')
    handleClose()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'Erro ao iniciar maturação'
  } finally {
    isStarting.value = false
  }
}

const handleClose = async () => {
  // Não deletar a maturação ao fechar - deixar salva para reconexão posterior
  // O usuário pode usar o botão "Parar" na lista se quiser cancelar de vez
  resetState()
  emit('close')
  emit('updated')
}

const loadExistingMaturation = async () => {
  if (!props.existingMaturation) return

  const existing = props.existingMaturation
  maturationId.value = existing.id
  instanceAConnected.value = existing.instanceAConnected
  instanceBConnected.value = existing.instanceBConnected
  phoneA.value = existing.phoneA
  phoneB.value = existing.phoneB
  selectedMaturationType.value = existing.maturationType
  selectedIntervalType.value = existing.intervalType

  // Buscar QR codes e iniciar polling
  await fetchQrCodes()
  startPolling()
  startQrRefresh()
}

// Watchers
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    if (props.existingMaturation) {
      loadExistingMaturation()
    } else {
      createMaturation()
    }
  } else {
    resetState()
  }
})

// Lifecycle
onBeforeUnmount(() => {
  stopPolling()
  stopQrRefresh()
})
</script>
