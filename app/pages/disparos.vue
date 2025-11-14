<template>
  <div class="space-y-6">
    <section class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center space-x-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Disparos em Andamento</h2>
      </div>

      <div class="mb-6">
        <div class="flex items-center justify-between mb-3">
          <span class="text-sm font-medium text-gray-700">Progresso</span>
          <span class="text-sm font-semibold text-gray-900">{{ disparosRealizados }} / {{ totalDisparos }}</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            class="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
            :style="{ width: progressPercentage + '%' }"
          ></div>
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
    </section>

    <section class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-semibold text-gray-800">Histórico de Disparos</h3>
        <span class="text-sm text-gray-500">Atualizando em tempo real</span>
      </div>

      <div class="space-y-3">
        <div
          v-for="(disparo, index) in paginatedDisparos"
          :key="index"
          class="border rounded-lg p-4 transition-all hover:shadow-md"
          :class="disparo.status === 'sucesso' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'"
        >
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center space-x-3 mb-2">
                <div class="flex items-center space-x-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span class="font-semibold text-gray-800">{{ disparo.numero }}</span>
                </div>
                <span class="text-xs text-gray-500">{{ disparo.timestamp }}</span>
              </div>

              <p class="text-sm text-gray-700 mb-3">{{ disparo.mensagem }}</p>

              <div v-if="disparo.anexos.length > 0" class="flex items-center space-x-2">
                <span class="text-xs text-gray-600">Anexos:</span>
                <div class="flex space-x-2">
                  <div
                    v-for="(anexo, idx) in disparo.anexos"
                    :key="idx"
                    class="flex items-center space-x-1 bg-white px-2 py-1 rounded text-xs"
                  >
                    <svg v-if="anexo.tipo === 'imagem'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                    </svg>
                    <svg v-if="anexo.tipo === 'video'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
                    </svg>
                    <svg v-if="anexo.tipo === 'audio'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
                    </svg>
                    <svg v-if="anexo.tipo === 'documento'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
                    </svg>
                    <span class="text-gray-700">{{ anexo.nome }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="ml-4">
              <div
                class="flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium"
                :class="disparo.status === 'sucesso' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
              >
                <svg v-if="disparo.status === 'sucesso'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ disparo.status === 'sucesso' ? 'Sucesso' : 'Falha' }}</span>
              </div>
            </div>
          </div>
        </div>

        <div v-if="paginatedDisparos.length === 0" class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-gray-500">Nenhum disparo realizado ainda</p>
        </div>
      </div>

      <div v-if="listaDisparos.length > 0" class="mt-6 flex items-center justify-between border-t pt-4">
        <div class="text-sm text-gray-600">
          Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ listaDisparos.length }} disparos
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
</template>

<script setup>
import { ref, computed } from 'vue'

const totalDisparos = ref(150)
const disparosRealizados = ref(0)
const currentPage = ref(1)
const itemsPerPage = 10

const listaDisparos = ref([
  {
    numero: '+55 11 98765-4321',
    mensagem: 'Olá! Esta é uma mensagem de teste para demonstração do sistema de disparos.',
    anexos: [
      { tipo: 'imagem', nome: 'foto.jpg' },
      { tipo: 'documento', nome: 'catalogo.pdf' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:15'
  },
  {
    numero: '+55 21 99876-5432',
    mensagem: 'Bem-vindo ao nosso sistema! Confira as novidades.',
    anexos: [
      { tipo: 'video', nome: 'apresentacao.mp4' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:18'
  },
  {
    numero: '+55 85 91234-5678',
    mensagem: 'Promoção especial para você! Não perca.',
    anexos: [],
    status: 'falha',
    timestamp: '12/11/2025 14:32:21'
  },
  {
    numero: '+55 41 97654-3210',
    mensagem: 'Agradecemos sua preferência. Aqui está seu pedido.',
    anexos: [
      { tipo: 'documento', nome: 'pedido_123.pdf' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:24'
  },
  {
    numero: '+55 31 98888-7777',
    mensagem: 'Lembrete: Sua consulta está agendada para amanhã.',
    anexos: [],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:27'
  },
  {
    numero: '+55 11 91234-5678',
    mensagem: 'Sua encomenda foi despachada e está a caminho.',
    anexos: [
      { tipo: 'imagem', nome: 'rastreio.jpg' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:30'
  },
  {
    numero: '+55 47 99999-8888',
    mensagem: 'Obrigado pela sua compra! Avalie nosso atendimento.',
    anexos: [],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:33'
  },
  {
    numero: '+55 19 97777-6666',
    mensagem: 'Promoção relâmpago! 50% de desconto até meia-noite.',
    anexos: [
      { tipo: 'imagem', nome: 'promo.jpg' }
    ],
    status: 'falha',
    timestamp: '12/11/2025 14:32:36'
  },
  {
    numero: '+55 62 95555-4444',
    mensagem: 'Confirmação de pagamento recebida. Pedido #4567.',
    anexos: [
      { tipo: 'documento', nome: 'comprovante.pdf' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:39'
  },
  {
    numero: '+55 71 93333-2222',
    mensagem: 'Feliz aniversário! Aproveite seu desconto especial.',
    anexos: [],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:42'
  },
  {
    numero: '+55 81 91111-0000',
    mensagem: 'Novo produto disponível! Confira agora em nossa loja.',
    anexos: [
      { tipo: 'imagem', nome: 'produto.jpg' },
      { tipo: 'video', nome: 'demo.mp4' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:45'
  },
  {
    numero: '+55 51 98888-9999',
    mensagem: 'Lembrete: Sua assinatura vence em 3 dias.',
    anexos: [],
    status: 'falha',
    timestamp: '12/11/2025 14:32:48'
  },
  {
    numero: '+55 27 97777-8888',
    mensagem: 'Obrigado por participar da nossa pesquisa!',
    anexos: [
      { tipo: 'documento', nome: 'resultado.pdf' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:51'
  },
  {
    numero: '+55 48 96666-7777',
    mensagem: 'Seu pedido foi entregue com sucesso!',
    anexos: [],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:54'
  },
  {
    numero: '+55 61 95555-6666',
    mensagem: 'Nova mensagem do suporte técnico.',
    anexos: [
      { tipo: 'audio', nome: 'mensagem.mp3' }
    ],
    status: 'sucesso',
    timestamp: '12/11/2025 14:32:57'
  }
])

const progressPercentage = computed(() => {
  if (totalDisparos.value === 0) return 0
  return Math.round((listaDisparos.value.length / totalDisparos.value) * 100)
})

const sucessoCount = computed(() => {
  return listaDisparos.value.filter(d => d.status === 'sucesso').length
})

const falhaCount = computed(() => {
  return listaDisparos.value.filter(d => d.status === 'falha').length
})

const totalPages = computed(() => {
  return Math.ceil(listaDisparos.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  const end = startIndex.value + itemsPerPage
  return end > listaDisparos.value.length ? listaDisparos.value.length : end
})

const paginatedDisparos = computed(() => {
  return listaDisparos.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const maxVisible = 5
  
  if (totalPages.value <= maxVisible) {
    for (let i = 1; i <= totalPages.value; i++) {
      pages.push(i)
    }
  } else {
    if (currentPage.value <= 3) {
      for (let i = 1; i <= maxVisible; i++) {
        pages.push(i)
      }
    } else if (currentPage.value >= totalPages.value - 2) {
      for (let i = totalPages.value - maxVisible + 1; i <= totalPages.value; i++) {
        pages.push(i)
      }
    } else {
      for (let i = currentPage.value - 2; i <= currentPage.value + 2; i++) {
        pages.push(i)
      }
    }
  }
  
  return pages
})

definePageMeta({
  middleware: 'auth'
})

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

const goToPage = (page) => {
  currentPage.value = page
}
</script>
