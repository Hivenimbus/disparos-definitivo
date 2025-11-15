<template>
  <div class="space-y-6">
    <section class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center space-x-2 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      <h2 class="text-xl font-semibold text-gray-800">Composição da Mensagem</h2>
    </div>

    <div v-if="isLoadingInitial" class="mb-4 text-sm text-gray-500">
      Carregando mensagem salva...
    </div>
    <div v-else-if="loadError" class="mb-4 rounded border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
      {{ loadError }}
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

    <div v-if="formError" class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ formError }}
    </div>

    <div v-if="formSuccess" class="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      {{ formSuccess }}
    </div>

    <div class="mb-4 flex justify-end space-x-4">
      <button
        @click="openSpintaxModal"
        class="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Spintax</span>
      </button>

      <button
        @click="insertNome"
        class="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span>Nome</span>
      </button>
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
            :key="attachment.id || index"
            class="bg-white px-4 py-3 rounded-lg text-sm flex items-start space-x-3 max-w-xs"
          >
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ attachment.name }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
              <p v-if="attachment.caption" class="text-gray-600 mt-2 text-xs italic">"{{ attachment.caption }}"</p>
            </div>
            <div class="flex items-center space-x-2">
              <button
                @click="openEditAttachment(index)"
                class="text-blue-500 hover:text-blue-700 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 4H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-4" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
              <button
                @click="removeAttachment(index)"
                :disabled="attachment.persisted && deletingAttachmentIds.has(attachment.id)"
                class="text-red-500 hover:text-red-700 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
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
        class="flex items-center space-x-2 px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>Enviar Mensagem</span>
      </button>

      <button
        @click="saveMessage"
        :disabled="isSubmitting"
        class="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 12h14m-9 8h4m-8-4h12a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ isSubmitting ? 'Salvando...' : 'Salvar Mensagem' }}</span>
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
              ref="fileInputRef"
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

    <div
      v-if="isEditAttachmentModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeEditAttachmentModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Editar legenda</h3>
          <button @click="closeEditAttachmentModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2">Legenda</label>
          <textarea
            v-model="editingCaption"
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Atualize a legenda do anexo"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeEditAttachmentModal"
            class="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveAttachmentEdit"
            :disabled="isSavingAttachmentEdit"
            class="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSavingAttachmentEdit ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="isPreviewModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closePreviewModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Preview da Mensagem</h3>
          <button @click="closePreviewModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div v-if="message || attachments.length > 0" class="space-y-4">
          <div v-if="message" class="bg-gray-50 rounded-lg p-4">
            <h4 class="text-sm font-semibold text-gray-700 mb-2">Texto da Mensagem</h4>
            <p class="text-gray-800 whitespace-pre-wrap">{{ message }}</p>
          </div>

          <div v-if="attachments.length > 0" class="space-y-3">
            <h4 class="text-sm font-semibold text-gray-700">Anexos ({{ attachments.length }})</h4>
            <div
              v-for="(attachment, index) in attachments"
              :key="index"
              class="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div class="flex items-start space-x-4">
                <div v-if="getAttachmentPreview(attachment)" class="flex-shrink-0">
                  <img :src="getAttachmentPreview(attachment)" alt="Preview" class="w-24 h-24 object-cover rounded-lg">
                </div>
                <div v-else class="flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="getAttachmentIcon(attachment.type)" />
                  </svg>
                </div>
                <div class="flex-1">
                  <div class="flex items-center space-x-2 mb-1">
                    <span class="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">{{ attachment.type }}</span>
                  </div>
                  <p class="font-medium text-gray-800">{{ attachment.name }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
                  <p v-if="attachment.caption" class="text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg italic text-sm">"{{ attachment.caption }}"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-12">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p class="text-gray-500 font-medium">Nenhuma mensagem ou anexo para visualizar</p>
          <p class="text-gray-400 text-sm mt-2">Adicione texto ou anexos para ver o preview</p>
        </div>

        <div class="flex justify-end mt-6">
          <button
            @click="closePreviewModal"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Spintax -->
    <div v-if="isSpintaxModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeSpintaxModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 class="text-xl font-semibold text-gray-800">Gerar Spintax</h3>
          </div>
          <button @click="closeSpintaxModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <p class="text-gray-600 text-sm">Adicione variações de palavras para criar mensagens dinâmicas. Cada campo receberá uma única palavra.</p>
        </div>

        <div class="mb-6">
          <div class="flex items-center justify-between mb-4">
            <label class="text-gray-700 font-medium">Variações de Palavras</label>
            <span class="text-sm text-gray-500">{{ spintaxFields.length }} de 9 campos utilizados</span>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div
              v-for="(field, index) in spintaxFields"
              :key="index"
              class="space-y-2"
            >
              <label class="block text-sm text-gray-600">Spintax {{ index + 1 }}</label>
              <input
                v-model="field.value"
                type="text"
                :placeholder="`Opção ${index + 1}`"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                @input="handleFieldInput(index)"
              >
            </div>
          </div>

          <button
            v-if="spintaxFields.length < 9"
            @click="addSpintaxField"
            class="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            <span>Adicionar campo</span>
          </button>
        </div>

        <div v-if="spintaxPreview" class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p class="text-sm text-blue-700 font-medium mb-2">Preview da Spintax:</p>
          <code class="text-blue-800">{{ spintaxPreview }}</code>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeSpintaxModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="generateSpintax"
            :disabled="!hasValidSpintaxFields"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gerar Spintax
          </button>
        </div>
      </div>
    </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

const message = ref('')
const attachments = ref<any[]>([])
const deletingAttachmentIds = ref(new Set<string>())
const currentMessageId = ref<string | null>(null)
const isEditAttachmentModalOpen = ref(false)
const editingAttachmentIndex = ref(-1)
const editingCaption = ref('')
const isSavingAttachmentEdit = ref(false)
const isModalOpen = ref(false)
const isPreviewModalOpen = ref(false)
const currentAttachmentType = ref('')
const selectedFile = ref(null)
const caption = ref('')
const fileInputRef = ref(null)

const isSubmitting = ref(false)
const formError = ref('')
const formSuccess = ref('')
const isLoadingInitial = ref(true)
const loadError = ref('')

const generateAttachmentId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `att-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

// Spintax states
const isSpintaxModalOpen = ref(false)
const spintaxFields = ref([
  { value: '' },
  { value: '' },
  { value: '' }
])

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

// Spintax computed properties
const hasValidSpintaxFields = computed(() => {
  return spintaxFields.value.filter(field => field.value.trim() !== '').length >= 2
})

const spintaxPreview = computed(() => {
  const validFields = spintaxFields.value
    .filter(field => field.value.trim() !== '')
    .map(field => field.value.trim())

  if (validFields.length < 2) return ''

  return `{${validFields.join('|')}}`
})

const handleAttachment = (type) => {
  currentAttachmentType.value = type
  isModalOpen.value = true
}

const handleFileSelect = (event) => {
  const input = event?.target
  const file = input?.files?.[0]
  if (file) {
    selectedFile.value = file
  }
  if (input) {
    input.value = ''
  }
}

const formatFileSize = (bytes = 0) => {
  if (!bytes) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${Math.round((bytes / Math.pow(k, i)) * 100) / 100} ${sizes[i]}`
}

const deriveTypeFromMime = (mime = '') => {
  if (mime?.startsWith?.('image/')) return 'image'
  if (mime?.startsWith?.('video/')) return 'video'
  if (mime?.startsWith?.('audio/')) return 'audio'
  return 'document'
}

const confirmAttachment = () => {
  if (selectedFile.value) {
    const attachmentId = generateAttachmentId()
    attachments.value.push({
      id: attachmentId,
      type: currentAttachmentType.value || deriveTypeFromMime(selectedFile.value.type),
      name: selectedFile.value.name,
      size: selectedFile.value.size,
      caption: caption.value,
      file: selectedFile.value,
      mimeType: selectedFile.value.type,
      previewUrl: selectedFile.value.type?.startsWith('image/') ? URL.createObjectURL(selectedFile.value) : null,
      publicUrl: null,
      persisted: false
    })
    closeModal()
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedFile.value = null
  caption.value = ''
  currentAttachmentType.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

const removeAttachment = async (index) => {
  const attachment = attachments.value[index]

  if (!attachment) {
    return
  }

  if (!attachment.persisted) {
    attachments.value.splice(index, 1)
    return
  }

  if (deletingAttachmentIds.value.has(attachment.id)) {
    return
  }

  deletingAttachmentIds.value.add(attachment.id)

  try {
    await $fetch('/api/dashboard/messages/attachments', {
      method: 'DELETE',
      body: {
        attachmentId: attachment.id
      }
    })

    attachments.value.splice(index, 1)
    formSuccess.value = 'Anexo removido com sucesso'
  } catch (error) {
    console.error('[dashboard/messages] delete attachment error', error)
    formError.value = error?.data?.statusMessage || 'Erro ao remover anexo'
  } finally {
    deletingAttachmentIds.value.delete(attachment.id)
  }
}

const openEditAttachment = (index: number) => {
  const attachment = attachments.value[index]
  if (!attachment) {
    return
  }
  editingAttachmentIndex.value = index
  editingCaption.value = attachment.caption || ''
  isEditAttachmentModalOpen.value = true
}

const closeEditAttachmentModal = () => {
  isEditAttachmentModalOpen.value = false
  editingAttachmentIndex.value = -1
  editingCaption.value = ''
  isSavingAttachmentEdit.value = false
}

const saveAttachmentEdit = async () => {
  if (editingAttachmentIndex.value < 0) {
    return
  }

  const attachment = attachments.value[editingAttachmentIndex.value]

  if (!attachment) {
    closeEditAttachmentModal()
    return
  }

  const newCaption = editingCaption.value.trim()

  if (!attachment.persisted) {
    attachment.caption = newCaption
    attachments.value.splice(editingAttachmentIndex.value, 1, { ...attachment })
    formSuccess.value = 'Legenda atualizada'
    closeEditAttachmentModal()
    return
  }

  isSavingAttachmentEdit.value = true

  try {
    const response = await $fetch(`/api/dashboard/messages/attachments/${attachment.id}`, {
      method: 'PUT',
      body: {
        caption: newCaption
      }
    })

    const updatedAttachment = {
      ...attachment,
      ...mapApiAttachment(response.attachment),
      name: response.attachment.file_name ?? attachment.name,
      size: typeof response.attachment.file_size_bytes === 'number' ? response.attachment.file_size_bytes : attachment.size,
      file: attachment.file
    }
    attachments.value.splice(editingAttachmentIndex.value, 1, updatedAttachment)
    formSuccess.value = 'Legenda atualizada'
    closeEditAttachmentModal()
  } catch (error: any) {
    console.error('[dashboard/messages] update attachment error', error)
    formError.value = error?.data?.statusMessage || 'Erro ao atualizar legenda'
    isSavingAttachmentEdit.value = false
  }
}

const previewMessage = () => {
  isPreviewModalOpen.value = true
}

const closePreviewModal = () => {
  isPreviewModalOpen.value = false
}

const getAttachmentIcon = (type) => {
  const icons = {
    image: 'M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z',
    video: 'M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z',
    audio: 'M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z',
    document: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z'
  }
  return icons[type] || icons.document
}

const getAttachmentPreview = (attachment) => {
  if (!attachment) return null
  if (attachment.previewUrl) return attachment.previewUrl
  if (attachment.publicUrl && (attachment.mimeType?.startsWith?.('image/') ?? false)) {
    return attachment.publicUrl
  }
  return null
}

const mapApiAttachment = (apiAttachment: {
  id?: string
  messageId?: string
  bucketId?: string
  storagePath?: string
  publicUrl?: string
  fileName?: string
  mimeType?: string
  fileSizeBytes?: number
  caption?: string | null
  createdAt?: string
}) => ({
  id: apiAttachment.id || '',
  type: deriveTypeFromMime(apiAttachment.mimeType ?? ''),
  name: apiAttachment.fileName || 'arquivo',
  size: typeof apiAttachment.fileSizeBytes === 'number' ? apiAttachment.fileSizeBytes : 0,
  caption: apiAttachment.caption || '',
  file: null,
  mimeType: apiAttachment.mimeType || '',
  previewUrl: apiAttachment.mimeType?.startsWith?.('image/') ? apiAttachment.publicUrl : null,
  publicUrl: apiAttachment.publicUrl || null,
  persisted: true
})

const normalizeApiAttachments = (raw) => {
  if (!Array.isArray(raw)) {
    return []
  }

  const seen = new Set<string>()

  return raw.reduce((acc, attachment) => {
    const key = attachment.id || attachment.storagePath || `${attachment.fileName}-${attachment.createdAt}`
    if (seen.has(key)) {
      return acc
    }
    seen.add(key)
    acc.push(mapApiAttachment(attachment))
    return acc
  }, [])
}

const loadLastMessage = async (showLoader = true) => {
  if (showLoader) {
    isLoadingInitial.value = true
  }
  loadError.value = ''
  try {
    const response = await $fetch('/api/dashboard/messages', {
      query: { limit: 1, page: 1 }
    })
    const lastMessage = response?.messages?.[0]
    if (lastMessage) {
      currentMessageId.value = lastMessage.id || null
      message.value = lastMessage.body || ''
      attachments.value = normalizeApiAttachments(lastMessage.attachments ?? [])
    } else {
      currentMessageId.value = null
      message.value = ''
      attachments.value = []
    }
  } catch (error) {
    console.error('[dashboard/messages] load error', error)
    loadError.value = error?.data?.statusMessage || 'Erro ao carregar mensagem salva'
  } finally {
    if (showLoader) {
      isLoadingInitial.value = false
    }
  }
}

onMounted(loadLastMessage)

const saveMessage = async () => {
  formError.value = ''
  formSuccess.value = ''

  if (!message.value.trim()) {
    formError.value = 'Mensagem é obrigatória'
    return
  }

  isSubmitting.value = true
  const formData = new FormData()
  formData.append('body', message.value.trim())
  if (currentMessageId.value) {
    formData.append('message_id', currentMessageId.value)
  }

  const attachmentsMeta = []
  attachments.value.forEach((attachment) => {
    if (!attachment.file) {
      return
    }
    const attachmentId = attachment.id || generateAttachmentId()
    attachment.id = attachmentId
    formData.append(`file-${attachmentId}`, attachment.file, attachment.file.name)
    attachmentsMeta.push({
      id: attachmentId,
      caption: attachment.caption || '',
      mimeType: attachment.file.type,
      fileName: attachment.file.name,
      type: attachment.type
    })
  })

  if (attachmentsMeta.length) {
    formData.append('attachments_meta', JSON.stringify(attachmentsMeta))
  }

  try {
    await $fetch('/api/dashboard/messages', {
      method: 'POST',
      body: formData
    })
    await loadLastMessage(false)
    formSuccess.value = 'Mensagem salva com sucesso!'
  } catch (error) {
    console.error('[dashboard/messages] send error', error)
    formError.value = error?.data?.statusMessage || 'Erro ao salvar mensagem'
  } finally {
    isSubmitting.value = false
  }
}

const sendMessage = () => {
  console.log('Enviar mensagem:', message.value, attachments.value)
}

// Spintax methods
const openSpintaxModal = () => {
  isSpintaxModalOpen.value = true
  // Reset fields to initial 3 empty fields
  spintaxFields.value = [
    { value: '' },
    { value: '' },
    { value: '' }
  ]
}

const closeSpintaxModal = () => {
  isSpintaxModalOpen.value = false
  spintaxFields.value = [
    { value: '' },
    { value: '' },
    { value: '' }
  ]
}

const addSpintaxField = () => {
  if (spintaxFields.value.length < 9) {
    spintaxFields.value.push({ value: '' })
  }
}

const handleFieldInput = (index) => {
  // Auto-focus next field if current field is filled and not the last field
  if (spintaxFields.value[index].value.trim() && index < spintaxFields.value.length - 1) {
    // Focus next input after a small delay
    setTimeout(() => {
      const nextInput = document.querySelector(`input:nth-of-type(${index + 2})`)
      if (nextInput) {
        nextInput.focus()
      }
    }, 100)
  }
}

const generateSpintax = () => {
  const validFields = spintaxFields.value
    .filter(field => field.value.trim() !== '')
    .map(field => field.value.trim())

  if (validFields.length < 2) {
    alert('Por favor, preencha pelo menos 2 campos para gerar a spintax.')
    return
  }

  const spintaxText = `{${validFields.join('|')}}`

  // Add spintax to message with proper spacing
  if (message.value && !message.value.endsWith(' ') && !message.value.endsWith('\n')) {
    message.value += ' ' + spintaxText
  } else {
    message.value += spintaxText
  }

  closeSpintaxModal()
}

const insertNome = () => {
  // Add {nome} variable to message with proper spacing
  if (message.value && !message.value.endsWith(' ') && !message.value.endsWith('\n')) {
    message.value += ' {nome}'
  } else {
    message.value += '{nome}'
  }
}
</script>
