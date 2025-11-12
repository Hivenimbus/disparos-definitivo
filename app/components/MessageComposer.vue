<template>
  <section class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center space-x-2 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      <h2 class="text-xl font-semibold text-gray-800">Composição da Mensagem</h2>
    </div>

    <div class="mb-6">
      <label class="block text-gray-700 font-medium mb-2">Mensagem</label>
      <textarea
        v-model="message"
        placeholder="Digite sua mensagem..."
        rows="6"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <div class="mb-6">
      <h3 class="text-gray-700 font-medium mb-4">Anexos</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          @click="handleAttachment('image')"
          class="bg-gray-100 hover:bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
          </svg>
          <span class="text-gray-700 font-medium">Imagem</span>
        </button>

        <button
          @click="handleAttachment('video')"
          class="bg-gray-100 hover:bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
          </svg>
          <span class="text-gray-700 font-medium">Vídeo</span>
        </button>

        <button
          @click="handleAttachment('audio')"
          class="bg-gray-100 hover:bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z"/>
          </svg>
          <span class="text-gray-700 font-medium">Áudio</span>
        </button>

        <button
          @click="handleAttachment('document')"
          class="bg-gray-100 hover:bg-gray-200 rounded-lg p-8 flex flex-col items-center justify-center transition-colors cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
          </svg>
          <span class="text-gray-700 font-medium">Documento</span>
        </button>
      </div>
    </div>

    <div v-if="attachments.length > 0" class="bg-gray-100 rounded-lg p-4 mb-6">
      <div class="flex flex-wrap gap-3">
        <div
          v-for="(attachment, index) in attachments"
          :key="index"
          class="bg-white px-4 py-3 rounded-lg text-sm flex items-start space-x-3 max-w-xs"
        >
          <div class="flex-1">
            <p class="font-medium text-gray-800">{{ attachment.name }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
            <p v-if="attachment.caption" class="text-gray-600 mt-2 text-xs italic">"{{ attachment.caption }}"</p>
          </div>
          <button @click="removeAttachment(index)" class="text-red-500 hover:text-red-700 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="flex items-center space-x-3">
      <button
        @click="previewMessage"
        class="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Visualizar</span>
      </button>

      <button
        @click="sendMessage"
        class="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>Enviar Mensagem</span>
      </button>
    </div>

    <div v-if="isModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Adicionar {{ attachmentTypeLabel }}</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2">Selecionar Arquivo</label>
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              :accept="acceptedFileTypes"
              @change="handleFileSelect"
              class="hidden"
              id="fileInput"
            >
            <label for="fileInput" class="cursor-pointer">
              <div v-if="!selectedFile">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p class="text-gray-600 font-medium">Clique para selecionar arquivo</p>
                <p class="text-gray-400 text-sm mt-1">ou arraste e solte aqui</p>
              </div>
              <div v-else class="text-left">
                <div class="flex items-center space-x-3 bg-blue-50 p-4 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div class="flex-1">
                    <p class="font-medium text-gray-800">{{ selectedFile.name }}</p>
                    <p class="text-sm text-gray-500">{{ formatFileSize(selectedFile.size) }}</p>
                  </div>
                  <button @click.prevent="selectedFile = null" class="text-red-500 hover:text-red-700">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-2">Legenda (opcional)</label>
          <textarea
            v-model="caption"
            placeholder="Adicione uma legenda ao seu arquivo..."
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmAttachment"
            :disabled="!selectedFile"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const message = ref('')
const attachments = ref([])
const isModalOpen = ref(false)
const currentAttachmentType = ref('')
const selectedFile = ref(null)
const caption = ref('')

const acceptedFileTypes = computed(() => {
  const types = {
    image: 'image/*',
    video: 'video/*',
    audio: 'audio/*',
    document: '.pdf,.doc,.docx,.txt,.xls,.xlsx'
  }
  return types[currentAttachmentType.value] || '*'
})

const attachmentTypeLabel = computed(() => {
  const labels = {
    image: 'Imagem',
    video: 'Vídeo',
    audio: 'Áudio',
    document: 'Documento'
  }
  return labels[currentAttachmentType.value] || 'Anexo'
})

const handleAttachment = (type) => {
  currentAttachmentType.value = type
  isModalOpen.value = true
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

const confirmAttachment = () => {
  if (selectedFile.value) {
    attachments.value.push({
      type: currentAttachmentType.value,
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      caption: caption.value,
      file: selectedFile.value
    })
    closeModal()
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedFile.value = null
  caption.value = ''
  currentAttachmentType.value = ''
}

const removeAttachment = (index) => {
  attachments.value.splice(index, 1)
}

const previewMessage = () => {
  console.log('Visualizar mensagem:', message.value)
}

const sendMessage = () => {
  console.log('Enviar mensagem:', message.value, attachments.value)
}
</script>
