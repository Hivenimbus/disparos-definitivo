<template>
  <section class="bg-white rounded-lg shadow p-4 md:p-6 mb-6">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Conexão WhatsApp</h2>
      </div>
      <span :class="statusWrapperClass">
        <span class="w-2 h-2 rounded-full" :class="statusDotClass"></span>
        <span>{{ statusLabel }}</span>
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="flex items-center justify-center bg-gray-100 rounded-lg p-6 md:p-8">
        <div class="text-center">
          <div class="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto border border-dashed border-gray-200 overflow-hidden">
            <template v-if="isConnected">
              <div class="w-full h-full bg-gradient-to-br from-green-50 via-white to-green-100 flex flex-col items-center justify-center text-green-700">
                <div class="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white shadow-lg mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="w-6 h-6" fill="currentColor" aria-hidden="true">
                    <path d="M173.9 439.4c-15.9 0-31.8-5.9-44-17.7L7 299.8C-8.8 284-8.8 257.9 7 242.1s41.9-15.9 57.7 0L173.9 351.3 447.3 77.9c15.8-15.8 41.9-15.8 57.7 0s15.8 41.9 0 57.7L217.9 421.7c-12.1 11.9-28 17.7-44 17.7z"/>
                  </svg>
                </div>
                <p class="text-sm font-semibold">Dispositivo conectado</p>
                <p class="text-xs text-green-600 mt-1">Tudo pronto para disparar mensagens</p>
              </div>
            </template>
            <template v-else>
              <img
                v-if="qrCodeData"
                :src="qrCodeData"
                alt="QR Code do WhatsApp"
                class="w-full h-full object-contain"
              >
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                class="w-full h-full text-gray-300 p-6"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M160 224L224 224L224 160L160 160L160 224zM96 144C96 117.5 117.5 96 144 96L240 96C266.5 96 288 117.5 288 144L288 240C288 266.5 266.5 288 240 288L144 288C117.5 288 96 266.5 96 240L96 144zM160 480L224 480L224 416L160 416L160 480zM96 400C96 373.5 117.5 352 144 352L240 352C266.5 352 288 373.5 288 400L288 496C288 522.5 266.5 544 240 544L144 544C117.5 544 96 522.5 96 496L96 400zM416 160L416 224L480 224L480 160L416 160zM400 96L496 96C522.5 96 544 117.5 544 144L544 240C544 266.5 522.5 288 496 288L400 288C373.5 288 352 266.5 352 240L352 144C352 117.5 373.5 96 400 96zM384 416C366.3 416 352 401.7 352 384C352 366.3 366.3 352 384 352C401.7 352 416 366.3 416 384C416 401.7 401.7 416 384 416zM384 480C401.7 480 416 494.3 416 512C416 529.7 401.7 544 384 544C366.3 544 352 529.7 352 512C352 494.3 366.3 480 384 480zM480 512C480 494.3 494.3 480 512 480C529.7 480 544 494.3 544 512C544 529.7 529.7 544 512 544C494.3 544 480 529.7 480 512zM512 416C494.3 416 480 401.7 480 384C480 366.3 494.3 352 512 352C529.7 352 544 366.3 544 384C544 401.7 529.7 416 512 416zM480 448C480 465.7 465.7 480 448 480C430.3 480 416 465.7 416 448C416 430.3 430.3 416 448 416C465.7 416 480 430.3 480 448z" />
              </svg>
            </template>
          </div>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Como conectar:</h3>
        <ol class="space-y-3 mb-6">
          <li class="flex items-start">
            <span class="text-gray-600 font-medium mr-2">1.</span>
            <span class="text-gray-700">Abra o WhatsApp no seu celular</span>
          </li>
          <li class="flex items-start">
            <span class="text-gray-600 font-medium mr-2">2.</span>
            <span class="text-gray-700">Toque em Menu ou Configurações e selecione WhatsApp Web</span>
          </li>
          <li class="flex items-start">
            <span class="text-gray-600 font-medium mr-2">3.</span>
            <span class="text-gray-700">Aponte seu celular para esta tela para capturar o código QR</span>
          </li>
        </ol>

        <div class="space-y-2 text-sm text-gray-600 mb-6">
          <p v-if="pairingCode" class="flex items-center justify-between">
            <span class="font-semibold text-gray-800">Código de pareamento:</span>
            <span class="font-mono text-base text-gray-900">{{ pairingCode }}</span>
          </p>
        </div>

        <p v-if="errorMessage" class="text-sm text-red-600 mb-4">
          {{ errorMessage }}
        </p>

        <button
          v-if="!isConnected"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          :disabled="isStartDisabled"
          @click="startConnection"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            :class="{ 'animate-spin': isConnecting }"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>{{ buttonLabel }}</span>
        </button>

        <button
          v-else
          class="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          :disabled="isDisconnecting"
          @click="disconnectInstance"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 640 640"
            class="w-5 h-5"
            fill="currentColor"
            :class="{ 'animate-spin': isDisconnecting }"
          >
            <path d="M224 32C241.7 32 256 46.3 256 64L256 160L384 160L384 64C384 46.3 398.3 32 416 32C433.7 32 448 46.3 448 64L448 160L512 160C529.7 160 544 174.3 544 192C544 209.7 529.7 224 512 224L512 288C512 383.1 442.8 462.1 352 477.3L352 544C352 561.7 337.7 576 320 576C302.3 576 288 561.7 288 544L288 477.3C197.2 462.1 128 383.1 128 288L128 224C110.3 224 96 209.7 96 192C96 174.3 110.3 160 128 160L192 160L192 64C192 46.3 206.3 32 224 32z" />
          </svg>
          <span>{{ isDisconnecting ? 'Desconectando...' : 'Desconectar' }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

type InstanceStatus = {
  connected: boolean
  loggedIn: boolean
  name?: string | null
  myJid?: string | null
}

const qrCodeData = ref<string | null>(null)
const pairingCode = ref<string | null>(null)
const lastInstanceStatus = ref<InstanceStatus | null>(null)
const hasRequestedConnection = ref(false)
const errorMessage = ref<string | null>(null)
const isConnecting = ref(false)
const isDisconnecting = ref(false)
const isFetchingState = ref(false)
const pollingHandle = ref<ReturnType<typeof setInterval> | null>(null)
const qrRefreshHandle = ref<ReturnType<typeof setInterval> | null>(null)

const isConnected = computed(
  () => Boolean(lastInstanceStatus.value?.connected && lastInstanceStatus.value?.loggedIn)
)
const isAwaitingQrScan = computed(() =>
  Boolean(
    hasRequestedConnection.value &&
      lastInstanceStatus.value?.connected &&
      !lastInstanceStatus.value?.loggedIn
  )
)
const isReconnecting = computed(
  () => Boolean(!lastInstanceStatus.value?.connected && lastInstanceStatus.value?.loggedIn)
)

const statusLabel = computed(() => {
  if (isConnected.value) return 'Conectado'
  if (isAwaitingQrScan.value) return 'Aguardando leitura do QR'
  if (isReconnecting.value) return 'Reconectando...'
  if (isConnecting.value || isFetchingState.value) return 'Conectando...'
  if (errorMessage.value) return 'Erro'
  return 'Desconectado'
})

const statusWrapperClass = computed(() => {
  const base = 'flex items-center space-x-2 font-medium transition-all duration-200 rounded-full'

  if (isConnected.value) {
    return `${base} text-green-700 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 shadow-sm px-4 py-2 text-base`
  }

  if (errorMessage.value) {
    return `${base} text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 text-sm`
  }

  if (isConnecting.value || isFetchingState.value) {
    return `${base} text-yellow-600 bg-yellow-50 border border-yellow-200 px-3 py-1.5 text-sm`
  }

  return `${base} text-gray-600 bg-gray-100 border border-gray-200 px-3 py-1 text-sm`
})

const statusDotClass = computed(() => {
  if (isConnected.value) return 'bg-green-500 ring-4 ring-green-100'
  if (errorMessage.value) return 'bg-red-500 ring-4 ring-red-100'
  if (isAwaitingQrScan.value || isReconnecting.value || isConnecting.value || isFetchingState.value) {
    return 'bg-yellow-400 ring-4 ring-yellow-100 animate-pulse'
  }
  return 'bg-gray-400 ring-4 ring-gray-100'
})

const qrPlaceholder = computed(() => {
  if (qrCodeData.value) return 'Escaneie o QR Code acima'
  if (isConnected.value) return 'Dispositivo conectado'
  if (isConnecting.value) return 'Gerando QR Code...'
  return 'Aguardando QR Code'
})

const qrHelperText = computed(() => {
  if (isConnected.value) {
    return 'Conexão ativa com o WhatsApp.'
  }
  if (qrCodeData.value) {
    return 'Abra o WhatsApp e aponte a câmera para este QR Code.'
  }
  return 'Clique em "Iniciar Conexão" para gerar um novo QR Code.'
})

const isStartDisabled = computed(() => isConnecting.value)

const buttonLabel = computed(() => {
  if (isConnecting.value) return 'Gerando QR Code...'
  return 'Iniciar Conexão'
})

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

const ensurePolling = () => {
  if (pollingHandle.value || isConnected.value) return
  pollingHandle.value = setInterval(() => {
    fetchConnectionState({ silent: true })
  }, 5000)
}

const ensureQrRefresh = () => {
  if (qrRefreshHandle.value || isConnected.value || !qrCodeData.value) return

  qrRefreshHandle.value = setInterval(async () => {
    if (isConnected.value) {
      stopQrRefresh()
      return
    }

    try {
      await fetchQrCode({ silent: true })
    } catch (error) {
      console.error('[WhatsAppConnection] Erro ao renovar QR Code', error)
    }
  }, 30000)
}

const applyState = (state: InstanceStatus | undefined | null) => {
  if (!state) return
  const normalized: InstanceStatus = {
    connected: Boolean(state.connected),
    loggedIn: Boolean(state.loggedIn),
    name: state.name ?? null,
    myJid: state.myJid ?? null
  }

  lastInstanceStatus.value = normalized
  if (normalized.connected && normalized.loggedIn) {
    errorMessage.value = null
    qrCodeData.value = null
    pairingCode.value = null
    hasRequestedConnection.value = false
    stopPolling()
    stopQrRefresh()
  } else {
    ensurePolling()
  }
}

const fetchConnectionState = async ({ silent = false }: { silent?: boolean } = {}) => {
  if (!silent) {
    isFetchingState.value = true
  }

  try {
    const data = await $fetch<InstanceStatus>('/api/dashboard/whatsapp/state')
    applyState(data)
    errorMessage.value = null
  } catch (error: any) {
    if (error?.statusCode === 404) {
      lastInstanceStatus.value = null
    }
    errorMessage.value = error?.data?.statusMessage || 'Não foi possível consultar o estado da conexão.'
  } finally {
    if (!silent) {
      isFetchingState.value = false
    }
  }
}

const fetchQrCode = async ({ silent = false }: { silent?: boolean } = {}) => {
  try {
    const data = await $fetch<{ base64?: string; qrcode?: string | null }>('/api/dashboard/whatsapp/connect')
    qrCodeData.value = data.base64 ?? null
    pairingCode.value = null
    if (qrCodeData.value) {
      hasRequestedConnection.value = true
    }
    if (!silent) {
      errorMessage.value = null
    }
    return data
  } catch (error: any) {
    if (!silent) {
      // Não define erro aqui se for silent, deixa quem chamou tratar
       // Mas se não for silent, definimos o erro, porém o startConnection vai limpar se tentar o fallback
      errorMessage.value = error?.data?.statusMessage || 'Não foi possível obter o QR Code.'
    }
    throw error
  }
}

const recreateInstance = async () => {
  try {
    await $fetch('/api/dashboard/whatsapp/recreate', {
      method: 'POST'
    })
    return true
  } catch (error) {
    console.error('[WhatsAppConnection] Falha ao recriar instância', error)
    return false
  }
}

const startConnection = async () => {
  if (isStartDisabled.value || isConnected.value) return

  isConnecting.value = true
  errorMessage.value = null
  stopQrRefresh()

  // Função auxiliar para delay
  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  // Fase 1: Tentar obter QR Code (3 tentativas)
  let attempts = 0
  const maxAttempts = 3
  let qrCodeSuccess = false

  while (attempts < maxAttempts && !qrCodeSuccess) {
    attempts++
    try {
      // Tentativa silenciosa
      await fetchQrCode({ silent: true })
      qrCodeSuccess = true
    } catch (error) {
      console.warn(`[WhatsAppConnection] Tentativa ${attempts}/${maxAttempts} falhou:`, error)
      if (attempts < maxAttempts) {
        await delay(1500) // Espera 1.5s entre tentativas
      }
    }
  }

  // Se conseguiu o QR Code nas tentativas iniciais, segue o fluxo normal
  if (qrCodeSuccess) {
    try {
      await fetchConnectionState({ silent: true })
      ensurePolling()
      ensureQrRefresh()
    } catch (error) {
      console.error('[WhatsAppConnection] Erro ao buscar estado após QR Code', error)
    } finally {
      isConnecting.value = false
    }
    return
  }

  // Fase 2: Fallback - Recriar Instância
  console.warn('[WhatsAppConnection] Falha após tentativas. Iniciando recriação da instância...')
  const recreated = await recreateInstance()
  
  if (recreated) {
    try {
      // Aguarda um pouco para a instância inicializar após recriação
      await delay(2000)
      
      // Tentativa final após recriação
      await fetchQrCode()
      
      await fetchConnectionState({ silent: true })
      ensurePolling()
      ensureQrRefresh()
    } catch (retryError: any) {
      errorMessage.value = retryError?.data?.statusMessage || 'Não foi possível conectar (falha após recriação).'
    }
  } else {
    // Se a recriação falhar, definimos uma mensagem de erro genérica pois as tentativas anteriores foram silenciosas
    errorMessage.value = 'Não foi possível iniciar a conexão após múltiplas tentativas.'
  }

  isConnecting.value = false
}

const disconnectInstance = async () => {
  if (!isConnected.value || isDisconnecting.value) return

  isDisconnecting.value = true
  errorMessage.value = null
  stopQrRefresh()

  try {
    await $fetch('/api/dashboard/whatsapp/logout', {
      method: 'DELETE'
    })

    lastInstanceStatus.value = null
    hasRequestedConnection.value = false
    qrCodeData.value = null
    pairingCode.value = null
    await fetchConnectionState()
    ensurePolling()
    stopQrRefresh()
  } catch (error: any) {
    errorMessage.value = error?.data?.statusMessage || 'Não foi possível desconectar.'
  } finally {
    isDisconnecting.value = false
  }
}

onMounted(async () => {
  await fetchConnectionState()
  if (!isConnected.value) {
    ensurePolling()
  }
})

onBeforeUnmount(() => {
  stopPolling()
  stopQrRefresh()
})
</script>
