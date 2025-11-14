<template>
  <div class="space-y-6">
    <section class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center space-x-2 mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Histórico de Campanhas</h2>
      </div>

      <div class="space-y-6">
        <div
          v-for="campanha in paginatedCampanhas"
          :key="campanha.id"
          class="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="flex items-center space-x-3">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <h3 class="text-lg font-semibold text-gray-800">Campanha #{{ campanha.id }}</h3>
            </div>
            <div
              class="px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1"
              :class="campanha.status === 'concluida' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
            >
              <svg v-if="campanha.status === 'concluida'" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ campanha.status === 'concluida' ? 'Concluída' : 'Cancelada' }}</span>
            </div>
          </div>

          <div class="flex items-center space-x-6 mb-4 text-sm text-gray-600">
            <div class="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ campanha.data }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ campanha.duracao }}</span>
            </div>
          </div>

          <div class="mb-4">
            <p class="text-sm text-gray-700 mb-2"><span class="font-medium">Mensagem:</span> {{ campanha.mensagem }}</p>
            
            <div v-if="campanha.anexos.length > 0" class="flex items-center space-x-2">
              <span class="text-sm text-gray-600">Anexos:</span>
              <div class="flex flex-wrap gap-2">
                <div
                  v-for="(anexo, idx) in campanha.anexos"
                  :key="idx"
                  class="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded text-xs"
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

          <div class="flex items-center space-x-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span class="font-semibold text-gray-800">{{ campanha.totalDisparos }} disparos enviados</span>
          </div>
        </div>

        <div v-if="paginatedCampanhas.length === 0" class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <p class="text-gray-500">Nenhuma campanha encontrada</p>
        </div>
      </div>

      <div v-if="campanhas.length > 0" class="mt-6 flex items-center justify-between border-t pt-4">
        <div class="text-sm text-gray-600">
          Mostrando {{ startIndex + 1 }} a {{ endIndex }} de {{ campanhas.length }} campanhas
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

definePageMeta({
  middleware: ['auth']
})

const currentPage = ref(1)
const itemsPerPage = 10

const campanhas = ref([
  {
    id: 1,
    mensagem: 'Olá! Esta é uma mensagem de teste para demonstração do sistema de disparos em massa.',
    anexos: [
      { tipo: 'imagem', nome: 'foto.jpg' },
      { tipo: 'documento', nome: 'catalogo.pdf' }
    ],
    data: '12/11/2025 14:30',
    duracao: '2h 15min',
    status: 'concluida',
    totalDisparos: 150
  },
  {
    id: 2,
    mensagem: 'Promoção especial! Aproveite nossos descontos imperdíveis de até 50% off.',
    anexos: [
      { tipo: 'imagem', nome: 'promo.jpg' },
      { tipo: 'video', nome: 'apresentacao.mp4' }
    ],
    data: '11/11/2025 09:15',
    duracao: '1h 45min',
    status: 'concluida',
    totalDisparos: 230
  },
  {
    id: 3,
    mensagem: 'Lembrete importante sobre atualização de cadastro. Por favor, verifique seus dados.',
    anexos: [],
    data: '10/11/2025 16:20',
    duracao: '35min',
    status: 'cancelada',
    totalDisparos: 45
  },
  {
    id: 4,
    mensagem: 'Novo produto lançado! Confira agora em nossa loja online e garanta o seu.',
    anexos: [
      { tipo: 'imagem', nome: 'produto.jpg' },
      { tipo: 'documento', nome: 'ficha_tecnica.pdf' }
    ],
    data: '09/11/2025 11:00',
    duracao: '3h 20min',
    status: 'concluida',
    totalDisparos: 320
  },
  {
    id: 5,
    mensagem: 'Pesquisa de satisfação - Sua opinião é muito importante para nós!',
    anexos: [
      { tipo: 'documento', nome: 'questionario.pdf' }
    ],
    data: '08/11/2025 10:45',
    duracao: '1h 10min',
    status: 'concluida',
    totalDisparos: 180
  },
  {
    id: 6,
    mensagem: 'Black Friday chegando! Prepare-se para as melhores ofertas do ano.',
    anexos: [
      { tipo: 'imagem', nome: 'banner.jpg' },
      { tipo: 'video', nome: 'teaser.mp4' }
    ],
    data: '07/11/2025 08:30',
    duracao: '50min',
    status: 'cancelada',
    totalDisparos: 78
  },
  {
    id: 7,
    mensagem: 'Confirmação de pedido #4567. Seu produto será entregue em até 5 dias úteis.',
    anexos: [
      { tipo: 'documento', nome: 'comprovante.pdf' }
    ],
    data: '06/11/2025 15:00',
    duracao: '2h 05min',
    status: 'concluida',
    totalDisparos: 195
  },
  {
    id: 8,
    mensagem: 'Feliz aniversário! Aproveite seu desconto especial de 20% válido por 7 dias.',
    anexos: [
      { tipo: 'imagem', nome: 'cupom.jpg' }
    ],
    data: '05/11/2025 07:00',
    duracao: '4h 30min',
    status: 'concluida',
    totalDisparos: 420
  },
  {
    id: 9,
    mensagem: 'Atualização de sistema agendada para manutenção preventiva.',
    anexos: [
      { tipo: 'documento', nome: 'comunicado.pdf' }
    ],
    data: '04/11/2025 18:00',
    duracao: '1h 30min',
    status: 'concluida',
    totalDisparos: 280
  },
  {
    id: 10,
    mensagem: 'Novo curso disponível! Inscrições abertas para capacitação profissional.',
    anexos: [
      { tipo: 'imagem', nome: 'flyer.jpg' },
      { tipo: 'documento', nome: 'programacao.pdf' }
    ],
    data: '03/11/2025 09:00',
    duracao: '2h 40min',
    status: 'concluida',
    totalDisparos: 340
  },
  {
    id: 11,
    mensagem: 'Aviso importante sobre mudança de horário de atendimento.',
    anexos: [],
    data: '02/11/2025 12:00',
    duracao: '45min',
    status: 'cancelada',
    totalDisparos: 92
  },
  {
    id: 12,
    mensagem: 'Campanha de doação para causas sociais. Participe você também!',
    anexos: [
      { tipo: 'imagem', nome: 'campanha.jpg' }
    ],
    data: '01/11/2025 10:30',
    duracao: '3h 15min',
    status: 'concluida',
    totalDisparos: 410
  }
])

const totalPages = computed(() => {
  return Math.ceil(campanhas.value.length / itemsPerPage)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage
})

const endIndex = computed(() => {
  const end = startIndex.value + itemsPerPage
  return end > campanhas.value.length ? campanhas.value.length : end
})

const paginatedCampanhas = computed(() => {
  return campanhas.value.slice(startIndex.value, endIndex.value)
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
