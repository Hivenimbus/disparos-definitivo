<template>
  <div v-if="hasJob" class="space-y-6">
    <section class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800">Disparos em Andamento</h2>
        </div>
        <div v-if="jobStatus" class="flex items-center space-x-3">
          <span :class="['px-3 py-1 rounded-full text-xs font-semibold', jobStatusBadgeClass]">
            {{ jobStatusLabel }}
          </span>
          <span v-if="jobStatus.requestedStop" class="text-xs font-semibold text-yellow-600">Cancelamento solicitado</span>
          <button
            v-if="isJobActive"
            @click="handleStopJob"
            :disabled="isStoppingJob"
            class="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {{ isStoppingJob ? 'Parando...' : 'Parar disparos' }}
          </button>
          <button
            v-else
            @click="handleFinishJob"
            :disabled="isFinishingJob"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {{ isFinishingJob ? 'Finalizando...' : 'Finalizar disparo' }}
          </button>
        </div>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700">Progresso</span>
          <span class="text-sm font-semibold text-gray-900">{{ disparosRealizados }} / {{ totalDisparos }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div class="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out" :style="{ width: progressPercentage + '%' }"></div>
        </div>
        <div class="text-right mt-2">
          <span class="text-sm text-gray-600">{{ progressPercentage }}% concluído</span>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-blue-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-blue-600 font-medium">Total</p>
              <p class="text-2xl font-bold text-blue-700">{{ totalDisparos }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>

        <div class="bg-green-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-green-600 font-medium">Sucesso</p>
              <p class="text-2xl font-bold text-green-700">{{ sucessoCount }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div class="bg-red-50 rounded-lg p-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-red-600 font-medium">Falhas</p>
              <p class="text-2xl font-bold text-red-700">{{ falhaCount }}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div v-if="nextPending" class="mt-6 border rounded-lg p-4 bg-yellow-50 border-yellow-200">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <div class="flex items-center space-x-3 mb-2">
              <div class="flex flex-col">
                <span class="font-semibold text-gray-800">{{ nextPending.contactName || nextPending.whatsappDisplay }}</span>
                <span class="text-xs text-gray-500">{{ nextPending.contactName ? nextPending.whatsappDisplay : '' }}</span>
              </div>
              <span class="text-xs text-gray-500">{{ nextPending.timestamp }}</span>
            </div>
            <p class="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{{ nextPending.mensagem }}</p>
            <div v-if="nextPending.anexos.length > 0" class="flex items-center space-x-2">
              <span class="text-xs text-gray-600">Anexos:</span>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(anexo, idx) in nextPending.anexos"
                  :key="idx"
                  class="flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs"
                >
                  <svg v-if="anexo.tipo === 'imagem'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                  <svg v-else-if="anexo.tipo === 'video'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                  </svg>
                  <svg v-else-if="anexo.tipo === 'audio'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                  </svg>
                  <span class="text-gray-700">{{ anexo.nome }}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="ml-4">
            <div class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
              <span>Pendente</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Histórico de Disparos</h3>
        <span class="text-sm text-gray-500">Atualizando em tempo real</span>
      </div>

      <div class="space-y-3">
        <div v-if="isLoadingLogs" class="text-center py-12 text-gray-500">Carregando histórico...</div>
        <template v-else>
          <div
            v-for="disparo in paginatedDisparos"
            :key="disparo.id"
            class="border rounded-lg p-4 transition-all hover:shadow-md"
            :class="disparo.status === 'sucesso' ? 'border-green-200 bg-green-50' : disparo.status === 'falha' ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center space-x-3 mb-2">
                  <div class="flex flex-col">
                    <span class="font-semibold text-gray-800">{{ disparo.contactName || disparo.whatsappDisplay }}</span>
                    <span class="text-xs text-gray-500">{{ disparo.contactName ? disparo.whatsappDisplay : '' }}</span>
                  </div>
                  <span class="text-xs text-gray-500">{{ disparo.timestamp }}</span>
                </div>

                <p class="text-sm text-gray-700 mb-3 whitespace-pre-wrap">{{ disparo.mensagem }}</p>

                <div v-if="disparo.anexos.length > 0" class="flex items-center space-x-2">
                  <span class="text-xs text-gray-600">Anexos:</span>
                  <div class="flex flex-wrap gap-2">
                    <div
                      v-for="(anexo, idx) in disparo.anexos"
                      :key="idx"
                      class="flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs"
                    >
                      <svg v-if="anexo.tipo === 'imagem'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                      </svg>
                      <svg v-else-if="anexo.tipo === 'video'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                      </svg>
                      <svg v-else-if="anexo.tipo === 'audio'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                      </svg>
                      <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                      </svg>
                      <span class="text-gray-700">{{ anexo.nome }}</span>
                    </div>
                  </div>
                </div>

                <p v-if="disparo.error" class="text-xs text-red-600 mt-3">{{ disparo.error }}</p>
              </div>

              <div class="ml-4">
                <div
                  class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium"
                  :class="disparo.status === 'sucesso' ? 'bg-green-100 text-green-700' : disparo.status === 'falha' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'"
                >
                  <svg v-if="disparo.status === 'sucesso'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else-if="disparo.status === 'falha'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M12 5a7 7 0 100 14 7 7 0 000-14z" />
                  </svg>
                  <span class="capitalize">{{ disparo.status }}</span>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!isLoadingLogs && paginatedDisparos.length === 0" class="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p class="text-gray-500">Nenhum disparo registrado ainda</p>
          </div>
        </template>
      </div>

      <div v-if="totalLogs > 0" class="mt-6 flex items-center justify-between border-t pt-4">
        <div class="text-sm text-gray-600">
          Mostrando {{ startIndex }} a {{ endIndex }} de {{ totalLogs }} disparos
        </div>

        <div class="flex items-center space-x-2">
          <button
            @click="previousPage"
            :disabled="currentPage === 1"
            class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
            :class="currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div class="flex items-center space-x-1">
            <button
              v-for="page in visiblePages"
              :key="page"
              @click="goToPage(page)"
              class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
              :class="currentPage === page ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 hover:bg-gray-50'"
            >
              {{ page }}
            </button>
          </div>

          <button
            @click="nextPage"
            :disabled="currentPage === totalPages"
            class="px-3 py-2 border rounded-lg text-sm font-medium transition-colors"
            :class="currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  </div>
  <div v-else class="bg-white rounded-lg shadow p-8 text-center">
    <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
    <h2 class="text-xl font-semibold text-gray-800 mb-2">Nenhum disparo em andamento</h2>
    <p class="text-gray-500 mb-6">Inicie um disparo na página de mensagens para acompanhar o progresso aqui.</p>
    <div class="flex items-center justify-center space-x-3">
      <NuxtLink
        to="/dashboard"
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
      >
        Voltar ao dashboard
      </NuxtLink>
      <NuxtLink
        to="/dashboard"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Ir para mensagens
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

definePageMeta({
  middleware: ['auth']
})

type AttachmentBadge = {
  tipo: string
  nome: string
}

type DisparoItem = {
  id: string
  contactName: string | null
  whatsapp: string
  whatsappDisplay: string
  mensagem: string
  anexos: AttachmentBadge[]
  status: 'sucesso' | 'falha' | 'pendente'
  timestamp: string
  error: string | null
}

type SendJobLog = {
  id: string
  contactName: string | null
  whatsapp: string
  status: 'pending' | 'success' | 'failed'
  messagePreview: string | null
  attachments: Array<{ type?: string; nome?: string; name?: string }>
  error: string | null
  processedAt: string | null
}

const toast = useToast()

const {
  jobStatus,
  isJobActive,
  isStoppingJob,
  isFinishingJob,
  startPolling,
  stopPolling,
  fetchStatus,
  stopJob,
  finishJob: finalizeSendJob
} = useSendJob()

const listaDisparos = ref<DisparoItem[]>([])
const nextPending = ref<DisparoItem | null>(null)
const totalLogs = ref(0)
const isLoadingLogs = ref(false)
const currentPage = ref(1)
const itemsPerPage = 10
const logPollingHandle = ref<number | null>(null)

const hasJob = computed(() => !!jobStatus.value)

const jobStatusLabel = computed(() => {
  const status = jobStatus.value?.status
  if (!status) return 'Sem disparo'
  switch (status) {
    case 'queued':
      return 'Na fila'
    case 'processing':
      return 'Enviando'
    case 'completed':
      return 'Concluído'
    case 'failed':
      return 'Falhou'
    case 'stopped':
      return 'Interrompido'
    default:
      return status
  }
})

const jobStatusBadgeClass = computed(() => {
  const status = jobStatus.value?.status
  if (!status) return 'text-gray-600 bg-gray-100'
  if (status === 'queued' || status === 'processing') return 'text-blue-700 bg-blue-100'
  if (status === 'completed') return 'text-green-700 bg-green-100'
  if (status === 'failed') return 'text-red-700 bg-red-100'
  return 'text-yellow-700 bg-yellow-100'
})

const totalDisparos = computed(() => jobStatus.value?.totalContacts ?? 0)
const disparosRealizados = computed(() => jobStatus.value?.processedContacts ?? 0)
const progressPercentage = computed(() => {
  if (!jobStatus.value || jobStatus.value.totalContacts === 0) return 0
  return Math.round((jobStatus.value.processedContacts / jobStatus.value.totalContacts) * 100)
})
const sucessoCount = computed(() => jobStatus.value?.successContacts ?? 0)
const falhaCount = computed(() => jobStatus.value?.failedContacts ?? 0)

const totalPages = computed(() => {
  if (totalLogs.value === 0) return 1
  return Math.max(1, Math.ceil(totalLogs.value / itemsPerPage))
})

const startIndex = computed(() => {
  if (totalLogs.value === 0) return 0
  return (currentPage.value - 1) * itemsPerPage + 1
})

const endIndex = computed(() => {
  if (totalLogs.value === 0) return 0
  return Math.min(currentPage.value * itemsPerPage, totalLogs.value)
})

const paginatedDisparos = computed(() => listaDisparos.value)

const visiblePages = computed(() => {
  const pages: number[] = []
  const maxVisible = 5
  const total = totalPages.value

  if (total <= maxVisible) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else if (currentPage.value <= 3) {
    for (let i = 1; i <= maxVisible; i++) {
      pages.push(i)
    }
  } else if (currentPage.value >= total - 2) {
    for (let i = total - maxVisible + 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
      pages.push(i)
    }
  }

  return pages
})

const mapAttachmentType = (type?: string | null) => {
  const normalized = type?.toLowerCase()
  if (normalized === 'image' || normalized === 'imagem') return 'imagem'
  if (normalized === 'video' || normalized === 'vídeo') return 'video'
  if (normalized === 'audio') return 'audio'
  return 'documento'
}

const formatTimestamp = (value?: string | null) => {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'medium'
    }).format(new Date(value))
  } catch {
    return value
  }
}

const formatWhatsapp = (value: string) => {
  if (!value) return ''
  if (value.startsWith('+')) {
    return value
  }
  return `+${value}`
}

const mapStatus = (status?: string): 'sucesso' | 'falha' | 'pendente' => {
  switch (status) {
    case 'success':
      return 'sucesso'
    case 'failed':
      return 'falha'
    default:
      return 'pendente'
  }
}

const transformLog = (log: SendJobLog): DisparoItem => ({
  id: log.id,
  contactName: log.contactName,
  whatsapp: log.whatsapp,
  whatsappDisplay: formatWhatsapp(log.whatsapp),
  mensagem: log.messagePreview || '—',
  anexos: Array.isArray(log.attachments)
    ? log.attachments.map((attachment) => ({
        tipo: mapAttachmentType(attachment?.type || (attachment as any)?.tipo),
        nome: attachment?.name || (attachment as any)?.nome || 'arquivo'
      }))
    : [],
  status: mapStatus(log.status),
  timestamp: formatTimestamp(log.processedAt),
  error: log.error
})

const fetchLogs = async () => {
  if (!jobStatus.value) {
    listaDisparos.value = []
    totalLogs.value = 0
    nextPending.value = null
    return
  }

  isLoadingLogs.value = true
  try {
    const [finalResponse, pendingResponse] = await Promise.all([
      $fetch<{ logs: SendJobLog[]; meta: { total: number } }>('/api/dashboard/send/logs', {
        query: { page: currentPage.value, limit: itemsPerPage, status: 'finalized', order: 'desc' }
      }),
      $fetch<{ logs: SendJobLog[] }>('/api/dashboard/send/logs', {
        query: { page: 1, limit: 1, status: 'pending', order: 'asc' }
      })
    ])

    const newTotal = finalResponse.meta.total ?? finalResponse.logs.length ?? 0
    totalLogs.value = newTotal
    const computedPages = Math.max(1, Math.ceil(newTotal / itemsPerPage))

    if (currentPage.value > computedPages) {
      currentPage.value = computedPages
      return
    }

    listaDisparos.value = (finalResponse.logs ?? []).map(transformLog)

    const sortedPending = pendingResponse.logs ?? []
    sortedPending.sort((a, b) => {
      const dateA = a.processedAt ?? a.createdAt
      const dateB = b.processedAt ?? b.createdAt
      return new Date(dateA || 0).getTime() - new Date(dateB || 0).getTime()
    })

    nextPending.value = sortedPending.length > 0 ? transformLog(sortedPending[0]) : null
  } catch (error: any) {
    console.error('[disparos] fetch logs error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao carregar histórico de disparos')
    nextPending.value = null
  } finally {
    isLoadingLogs.value = false
  }
}

const startLogPolling = () => {
  if (!process.client || logPollingHandle.value !== null) {
    return
  }
  logPollingHandle.value = window.setInterval(() => {
    fetchLogs().catch(() => {})
  }, 4000)
}

const stopLogPolling = () => {
  if (process.client && logPollingHandle.value !== null) {
    window.clearInterval(logPollingHandle.value)
    logPollingHandle.value = null
  }
}

const handleStopJob = async () => {
  if (!jobStatus.value || !isJobActive.value || isStoppingJob.value) {
    return
  }

  try {
    await stopJob()
    await fetchLogs()
  } catch (error: any) {
    console.error('[disparos] stop job error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao interromper disparo')
  }
}

const handleFinishJob = async () => {
  if (!jobStatus.value || isJobActive.value || isFinishingJob.value) {
    return
  }

  try {
    await finalizeSendJob()
    stopLogPolling()
    listaDisparos.value = []
    totalLogs.value = 0
  } catch (error: any) {
    console.error('[disparos] finish job error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao finalizar disparo')
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
}

onMounted(async () => {
  await fetchStatus().catch(() => {})
  await fetchLogs()
  startPolling()
  if (jobStatus.value) {
    startLogPolling()
  }
})

onBeforeUnmount(() => {
  stopLogPolling()
  stopPolling()
})

watch(jobStatus, (state) => {
  if (state) {
    fetchLogs()
    startLogPolling()
  } else {
    stopLogPolling()
    listaDisparos.value = []
    totalLogs.value = 0
    nextPending.value = null
  }
})

watch(currentPage, () => {
  if (jobStatus.value) {
    fetchLogs()
  }
})
</script>