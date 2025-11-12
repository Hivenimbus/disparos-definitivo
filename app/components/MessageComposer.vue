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
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
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
      </div>
    </div>

    <div v-if="attachments.length > 0" class="bg-gray-100 rounded-lg p-4 mb-6">
      <div class="flex flex-wrap gap-2">
        <div
          v-for="(attachment, index) in attachments"
          :key="index"
          class="bg-white px-3 py-2 rounded-lg text-sm flex items-center space-x-2"
        >
          <span>{{ attachment.name }}</span>
          <button @click="removeAttachment(index)" class="text-red-500 hover:text-red-700">
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
  </section>
</template>

<script setup>
import { ref } from 'vue'

const message = ref('')
const attachments = ref([])

const handleAttachment = (type) => {
  console.log(`Anexar ${type}`)
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
