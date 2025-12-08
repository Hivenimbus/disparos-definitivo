<template>
  <div class="space-y-6">
    <section class="bg-white rounded-lg shadow p-4 md:p-6">
    <div class="flex items-center space-x-2 mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      <h2 class="text-xl font-semibold text-gray-800">Composição da Mensagem</h2>
    </div>

    <div v-if="isLoadingInitial" class="mb-4 text-sm text-gray-500">
      Carregando mensagem salva...
    </div>

    <div class="mb-6">
      <label class="block text-gray-700 font-medium mb-2">Mensagem</label>
      <textarea
        ref="messageTextarea"
        v-model="message"
        placeholder="Digite sua mensagem..."
        rows="6"
        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
      ></textarea>
    </div>

    <div class="mb-4 flex flex-col md:flex-row md:justify-end gap-2 md:space-x-4">
      <button
        @click="saveMessage()"
        :disabled="isSubmitting"
        class="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 12h14m-9 8h4m-8-4h12a2 2 0 002-2V6a2 2 0 00-2-2H7a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{{ isSubmitting ? 'Salvando...' : 'Salvar Mensagem' }}</span>
      </button>

      <button
        @click="openSpintaxModal"
        class="flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors w-full md:w-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span>Spintax</span>
      </button>

      <div class="relative w-full md:w-auto">
        <button
          ref="variableButtonRef"
          @click="toggleVariableMenu"
          class="flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Variável</span>
        </button>

        <div
          v-if="isVariableMenuOpen"
          ref="variableMenuRef"
          class="absolute right-0 mt-2 w-full md:w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-2"
        >
          <button
            v-for="variable in variableOptions"
            :key="variable.key"
            @click="insertVariable(variable.key)"
            class="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
          >
            <div class="flex items-start space-x-3">
              <div
                :class="[
                  'flex h-9 w-9 items-center justify-center rounded-full',
                  variable.bgClass,
                  variable.textClass
                ]"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">{{ variable.title }}</p>
                <p class="text-xs text-gray-500">{{ variable.description }}</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div class="relative w-full md:w-auto">
        <button
          ref="nameButtonRef"
          @click="toggleNameMenu"
          class="flex items-center justify-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Nome</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          v-if="isNameMenuOpen"
          ref="nameMenuRef"
          class="absolute right-0 mt-2 w-full md:w-64 bg-white border border-gray-200 rounded-xl shadow-xl z-10 py-2"
        >
          <button
            @click="insertNamePlaceholder('nome')"
            class="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
          >
            <div class="flex items-start space-x-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A4 4 0 019 16h6a4 4 0 013.879 1.804M15 11a3 3 0 10-6 0 3 3 0 006 0z" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">Primeiro nome</p>
                <p class="text-xs text-gray-500">Insere apenas o primeiro nome do contato.</p>
              </div>
            </div>
          </button>
          <button
            @click="insertNamePlaceholder('nome_completo')"
            class="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
          >
            <div class="flex items-start space-x-3">
              <div class="flex h-9 w-9 items-center justify-center rounded-full bg-purple-50 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM5 21a7 7 0 0114 0" />
                </svg>
              </div>
              <div>
                <p class="text-sm font-semibold text-gray-800">Nome completo</p>
                <p class="text-xs text-gray-500">Insere o nome completo do contato.</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>

    <div class="mb-6">
      <h3 class="text-gray-700 font-medium mb-4">Anexos</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          v-for="option in attachmentOptions"
          :key="option.type"
          @click="handleAttachment(option.type)"
          class="bg-gray-100 hover:bg-gray-200 rounded-lg p-6 md:p-8 flex flex-col items-center justify-center transition-colors cursor-pointer"
        >
          <svg v-if="option.icon === 'image'" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
          </svg>
          <svg v-else-if="option.icon === 'video'" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
          </svg>
          <svg v-else-if="option.icon === 'audio'" xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3v9.28c-.47-.17-.97-.28-1.5-.28C8.01 12 6 14.01 6 16.5S8.01 21 10.5 21c2.31 0 4.2-1.75 4.45-4H15V6h4V3h-7z" />
          </svg>
          <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 md:w-12 md:h-12 text-blue-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
          </svg>
          <span class="text-gray-700 font-medium text-sm md:text-base">{{ option.label }}</span>
        </button>
      </div>
    </div>

    <div v-if="attachments.length > 0" class="bg-gray-100 rounded-lg p-4 mb-6">
      <div class="flex flex-wrap gap-3">
        <div
          v-for="(attachment, index) in attachments"
          :key="attachment.id || index"
          class="bg-white px-4 py-3 rounded-lg text-sm flex items-start space-x-3 w-full md:max-w-xs"
        >
          <div class="flex-1 flex space-x-3 min-w-0">
              <div v-if="getAttachmentPreview(attachment)" class="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                <img :src="getAttachmentPreview(attachment)" alt="Preview" class="w-full h-full object-cover">
              </div>
            <div class="min-w-0 flex-1">
              <p class="font-medium text-gray-800 break-all">{{ attachment.name }}</p>
              <p class="text-xs text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
              <p
                v-if="attachment.caption"
                class="text-gray-600 mt-2 text-xs break-all"
              >
                "{{ truncateCaption(attachment.caption) }}"
              </p>
              </div>
          </div>
          <div class="flex items-center space-x-2 ml-2">
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
                :disabled="isAttachmentUploading(attachment.id) || (attachment.persisted && deletingAttachmentIds.has(attachment.id))"
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

    <div class="flex flex-col-reverse md:flex-row md:items-center justify-end gap-3 md:space-x-3">
      <button
        @click="openClearConfirmModal"
        :disabled="!canClearMessage"
        class="flex items-center justify-center space-x-2 px-6 py-3 text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 6L6 18M6 6l12 12" />
        </svg>
        <span>Limpar</span>
      </button>

      <button
        @click="previewMessage"
        class="flex items-center justify-center space-x-2 px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors w-full md:w-auto"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span>Visualizar</span>
      </button>

      <button
        @click="sendMessage"
        :disabled="isCheckingSendReadiness || isJobActive || isSavingBeforeSend"
        class="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-full md:w-auto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          :class="['w-5 h-5', { 'animate-spin origin-center': isCheckingSendReadiness || isSavingBeforeSend }]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        <span>
          {{
            isJobActive
              ? 'Disparo em andamento'
              : isSavingBeforeSend
                ? 'Salvando...'
                : isCheckingSendReadiness
                  ? 'Verificando...'
                  : 'Enviar Mensagem'
          }}
        </span>
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
          <p v-if="attachmentModalError" class="text-sm text-red-600 mt-3">
            {{ attachmentModalError }}
          </p>
        </div>

        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <label class="block text-gray-700 font-medium">Legenda (opcional)</label>
            <div class="flex space-x-2">
              <button
                @click="openSpintaxModal('caption')"
                class="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Spintax</span>
              </button>
              
              <div class="relative">
                <button
                  @click="toggleCaptionVariableMenu"
                  class="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Variável</span>
                </button>

                <div
                  v-if="isCaptionVariableMenuOpen"
                  class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1"
                >
                  <button
                    v-for="variable in variableOptions"
                    :key="variable.key"
                    @click="insertVariable(variable.key, 'caption')"
                    class="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div class="flex items-start space-x-2">
                      <div
                        :class="[
                          'flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0',
                          variable.bgClass,
                          variable.textClass
                        ]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-800">{{ variable.title }}</p>
                        <p class="text-[10px] text-gray-500">{{ variable.description }}</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="relative">
                <button
                  @click="toggleCaptionNameMenu"
                  class="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Nome</span>
                </button>

                <div
                  v-if="isCaptionNameMenuOpen"
                  class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1"
                >
                  <button
                    @click="insertNamePlaceholder('nome', 'caption')"
                    class="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-xs"
                  >
                    <p class="font-semibold text-gray-800">Primeiro nome</p>
                  </button>
                  <button
                    @click="insertNamePlaceholder('nome_completo', 'caption')"
                    class="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-xs"
                  >
                    <p class="font-semibold text-gray-800">Nome completo</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <textarea
            ref="captionTextarea"
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
          <div class="flex justify-between items-center mb-2">
            <label class="block text-gray-700 font-medium">Legenda</label>
            <div class="flex space-x-2">
              <button
                @click="openSpintaxModal('editCaption')"
                class="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Spintax</span>
              </button>
              
              <div class="relative">
                <button
                  @click="toggleEditCaptionVariableMenu"
                  class="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Variável</span>
                </button>

                <div
                  v-if="isEditCaptionVariableMenuOpen"
                  class="absolute right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1"
                >
                  <button
                    v-for="variable in variableOptions"
                    :key="variable.key"
                    @click="insertVariable(variable.key, 'editCaption')"
                    class="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors"
                  >
                    <div class="flex items-start space-x-2">
                      <div
                        :class="[
                          'flex h-6 w-6 items-center justify-center rounded-full flex-shrink-0',
                          variable.bgClass,
                          variable.textClass
                        ]"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v12m6-6H6" />
                        </svg>
                      </div>
                      <div>
                        <p class="text-xs font-semibold text-gray-800">{{ variable.title }}</p>
                        <p class="text-[10px] text-gray-500">{{ variable.description }}</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div class="relative">
                <button
                  @click="toggleEditCaptionNameMenu"
                  class="text-xs px-2 py-1 text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors flex items-center space-x-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Nome</span>
                </button>

                <div
                  v-if="isEditCaptionNameMenuOpen"
                  class="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-20 py-1"
                >
                  <button
                    @click="insertNamePlaceholder('nome', 'editCaption')"
                    class="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-xs"
                  >
                    <p class="font-semibold text-gray-800">Primeiro nome</p>
                  </button>
                  <button
                    @click="insertNamePlaceholder('nome_completo', 'editCaption')"
                    class="w-full px-3 py-2 text-left hover:bg-blue-50 transition-colors text-xs"
                  >
                    <p class="font-semibold text-gray-800">Nome completo</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <textarea
            ref="editCaptionTextarea"
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
                  <p class="font-medium text-gray-800 break-all">{{ attachment.name }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
                  <p
                    v-if="attachment.caption"
                    class="text-gray-700 mt-3 p-3 bg-gray-50 rounded-lg text-sm break-all"
                  >
                    "{{ truncateCaption(attachment.caption, 80) }}"
                  </p>
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

    <div
      v-if="isSendConfirmationOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeSendConfirmationModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Confirmar disparo</h3>
          <button @click="closeSendConfirmationModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">WhatsApp</p>
              <p :class="isWhatsappReady ? 'text-green-600 font-semibold' : 'text-yellow-600 font-semibold'">
                {{ isWhatsappReady ? 'Conectado' : 'Aguardando conexão' }}
              </p>
            </div>
            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">Contatos configurados</p>
              <p class="text-gray-800 font-semibold">{{ contactsSummary.total }}</p>
            </div>
            <div class="border rounded-lg p-4">
              <p class="text-sm text-gray-500 mb-1">Conteúdo preparado</p>
              <p :class="hasSendableContent ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'">
                {{ hasSendableContent ? 'Sim' : 'Não' }}
              </p>
            </div>
          </div>

          <div v-if="message || attachments.length > 0" class="space-y-4">
            <div v-if="message" class="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <h4 class="text-sm font-semibold text-gray-700 mb-2">Mensagem</h4>
              <p class="text-gray-800 whitespace-pre-wrap">{{ message }}</p>
            </div>

            <div v-if="attachments.length" class="space-y-3">
              <h4 class="text-sm font-semibold text-gray-700">Mídias ({{ attachments.length }})</h4>
              <div
                v-for="(attachment, index) in attachments"
                :key="attachment.id || index"
                class="bg-white border border-gray-200 rounded-lg p-4 flex items-start space-x-4"
              >
                <div v-if="getAttachmentPreview(attachment)" class="flex-shrink-0">
                  <img :src="getAttachmentPreview(attachment)" alt="Preview" class="w-20 h-20 object-cover rounded-lg">
                </div>
                <div v-else class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path :d="getAttachmentIcon(attachment.type)" />
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-medium text-gray-800 break-all">{{ attachment.name }}</p>
                  <p class="text-sm text-gray-500 mt-1">{{ formatFileSize(attachment.size) }}</p>
                  <p
                    v-if="attachment.caption"
                    class="text-gray-700 mt-2 text-sm break-all"
                  >
                    "{{ truncateCaption(attachment.caption, 80) }}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="text-sm text-gray-500">
            Nenhum conteúdo disponível para pré-visualizar.
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeSendConfirmationModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmSendFromModal"
            :disabled="isStartingJob"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isStartingJob ? 'Iniciando...' : 'Confirmar disparo' }}
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

  <Teleport to="body">
    <div
      v-if="isClearConfirmOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-[999] flex items-center justify-center p-4"
      @click.self="closeClearConfirmModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Limpar mensagem</h3>
          <button @click="closeClearConfirmModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class="text-gray-700 mb-4">
          Tem certeza de que deseja remover o texto atual e {{ attachments.length || 'todos os' }} anexo(s)? Esta ação não pode ser desfeita.
        </p>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeClearConfirmModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmClearMessage"
            class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Limpar tudo
          </button>
        </div>
      </div>
    </div>
  </Teleport>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, nextTick } from 'vue'

type DashboardAttachment = {
  id: string
  type: string
  name: string
  size: number
  caption: string
  file: File | null
  mimeType: string
  previewUrl: string | null
  publicUrl: string | null
  persisted: boolean
}

type SaveMessageOptions = {
  attachments?: DashboardAttachment[]
  auto?: boolean
  successMessage?: string
}

type SpintaxField = { value: string }

const createDefaultSpintaxFields = (): SpintaxField[] => ([
  { value: '' },
  { value: '' },
  { value: '' }
])

const messageTextarea = ref<HTMLTextAreaElement | null>(null)
const captionTextarea = ref<HTMLTextAreaElement | null>(null)
const editCaptionTextarea = ref<HTMLTextAreaElement | null>(null)
const message = ref('')
const lastSavedMessageBody = ref('')
const attachments = ref<DashboardAttachment[]>([])
const deletingAttachmentIds = ref(new Set<string>())
const uploadingAttachmentIds = ref(new Set<string>())
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
const isClearConfirmOpen = ref(false)
const isSendConfirmationOpen = ref(false)
const isCheckingSendReadiness = ref(false)
const isSavingBeforeSend = ref(false)
type WhatsappStatus = {
  connected: boolean
  loggedIn: boolean
}
const lastWhatsappStatus = ref<WhatsappStatus | null>(null)
const contactsSummary = ref({
  total: 0,
  validTotal: 0
})
const isSpintaxModalOpen = ref(false)
const spintaxTarget = ref<'message' | 'caption' | 'editCaption'>('message')
const spintaxFields = ref<SpintaxField[]>(createDefaultSpintaxFields())
const MAX_ATTACHMENTS = 3
const MAX_FILE_BYTES = 50 * 1024 * 1024
const attachmentModalError = ref('')

const isSubmitting = ref(false)
const isLoadingInitial = ref(true)
const isVariableMenuOpen = ref(false)
const isCaptionVariableMenuOpen = ref(false)
const isEditCaptionVariableMenuOpen = ref(false)
const variableMenuRef = ref<HTMLElement | null>(null)
const variableButtonRef = ref<HTMLElement | null>(null)
const isNameMenuOpen = ref(false)
const isCaptionNameMenuOpen = ref(false)
const isEditCaptionNameMenuOpen = ref(false)
const nameMenuRef = ref<HTMLElement | null>(null)
const nameButtonRef = ref<HTMLElement | null>(null)
const toast = useToast()

const {
  isJobActive,
  isStartingJob,
  startJobAndRedirect,
  fetchStatus: fetchSendStatus
} = useSendJob()

type VariableKey = 'var1' | 'var2' | 'var3'
type VariableOption = {
  key: VariableKey
  title: string
  description: string
  bgClass: string
  textClass: string
}

const variableOptions: VariableOption[] = [
  {
    key: 'var1',
    title: 'Variável 1',
    description: 'Campo personalizado 1',
    bgClass: 'bg-emerald-50',
    textClass: 'text-emerald-600'
  },
  {
    key: 'var2',
    title: 'Variável 2',
    description: 'Campo personalizado 2',
    bgClass: 'bg-indigo-50',
    textClass: 'text-indigo-600'
  },
  {
    key: 'var3',
    title: 'Variável 3',
    description: 'Campo personalizado 3',
    bgClass: 'bg-amber-50',
    textClass: 'text-amber-600'
  }
]

const generateAttachmentId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `att-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const attachmentOptions = [
  {
    type: 'image',
    label: 'Imagem',
    icon: 'image'
  },
  {
    type: 'video',
    label: 'Vídeo',
    icon: 'video'
  },
  {
    type: 'audio',
    label: 'Áudio',
    icon: 'audio'
  },
  {
    type: 'document',
    label: 'Documento',
    icon: 'document'
  }
]

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
  const option = attachmentOptions.find((opt) => opt.type === currentAttachmentType.value)
  return option?.label || 'Anexo'
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
  attachmentModalError.value = ''
  if (attachments.value.length >= MAX_ATTACHMENTS) {
    toast.warning(`Limite de ${MAX_ATTACHMENTS} anexos atingido`)
    return
  }
  currentAttachmentType.value = type
  isModalOpen.value = true
}

const handleFileSelect = (event) => {
  const input = event?.target
  const file = input?.files?.[0]
  if (file) {
    if (file.size > MAX_FILE_BYTES) {
      attachmentModalError.value = 'Cada arquivo deve ter no máximo 50MB'
      if (input) {
        input.value = ''
      }
      return
    }
    attachmentModalError.value = ''
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

const confirmAttachment = async () => {
  const file = selectedFile.value

  if (!file) {
    return
  }

  const attachmentId = generateAttachmentId()
  const attachmentType = currentAttachmentType.value || deriveTypeFromMime(file.type)
  const newAttachment: DashboardAttachment = {
    id: attachmentId,
    type: attachmentType,
    name: file.name,
    size: file.size,
    caption: caption.value,
    file,
    mimeType: file.type,
    previewUrl: file.type?.startsWith('image/') ? URL.createObjectURL(file) : null,
    publicUrl: null,
    persisted: false
  }

  attachments.value.push(newAttachment)
  if (attachments.value.length > MAX_ATTACHMENTS) {
    attachments.value.pop()
    toast.warning(`Limite de ${MAX_ATTACHMENTS} anexos atingido`)
    return
  }
  uploadingAttachmentIds.value.add(attachmentId)
  closeModal()

  try {
    await saveMessage({
      attachments: [newAttachment],
      auto: true,
      successMessage: 'Anexo salvo automaticamente!'
    })
  } finally {
    uploadingAttachmentIds.value.delete(attachmentId)
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedFile.value = null
  caption.value = ''
  currentAttachmentType.value = ''
  attachmentModalError.value = ''
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
    toast.success('Anexo removido com sucesso')
  } catch (error) {
    console.error('[dashboard/messages] delete attachment error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao remover anexo')
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
    toast.success('Legenda atualizada')
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

    const normalized = normalizeAttachmentPayload(response.attachment as Record<string, any>)

    const updatedAttachment: DashboardAttachment = {
      ...attachment,
      id: normalized.id || attachment.id,
      name: normalized.fileName || attachment.name,
      size:
        typeof normalized.fileSizeBytes === 'number' && normalized.fileSizeBytes > 0
          ? normalized.fileSizeBytes
          : attachment.size,
      caption: normalized.caption || newCaption,
      mimeType: normalized.mimeType || attachment.mimeType,
      previewUrl:
        normalized.mimeType?.startsWith?.('image/') && normalized.publicUrl
          ? normalized.publicUrl
          : attachment.previewUrl,
      publicUrl: normalized.publicUrl ?? attachment.publicUrl,
      persisted: true,
      file: attachment.file
    }
    attachments.value.splice(editingAttachmentIndex.value, 1, updatedAttachment)
    toast.success('Legenda atualizada')
    closeEditAttachmentModal()
  } catch (error: any) {
    console.error('[dashboard/messages] update attachment error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao atualizar legenda')
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

const truncateCaption = (text: string, maxLength = 50) => {
  if (!text) {
    return ''
  }
  const caption = text.trim()
  if (caption.length <= maxLength) {
    return caption
  }
  return `${caption.slice(0, maxLength)}...`
}

const isAttachmentUploading = (id?: string) => {
  if (!id) return false
  return uploadingAttachmentIds.value.has(id)
}

const canClearMessage = computed(() => {
  return message.value.trim().length > 0 || attachments.value.length > 0
})

const hasSendableContent = computed(() => canClearMessage.value)
const hasPendingContentToSave = computed(() => {
  const trimmedMessage = message.value.trim()
  const messageChanged = trimmedMessage !== lastSavedMessageBody.value
  const hasUnsavedAttachments = attachments.value.some((attachment) => !attachment.persisted)
  return messageChanged || hasUnsavedAttachments
})
const isWhatsappReady = computed(
  () => Boolean(lastWhatsappStatus.value?.connected && lastWhatsappStatus.value?.loggedIn)
)
const hasContactsConfigured = computed(() => contactsSummary.value.total > 0)

const openClearConfirmModal = () => {
  if (!canClearMessage.value) return
  isClearConfirmOpen.value = true
}

const closeClearConfirmModal = () => {
  isClearConfirmOpen.value = false
}

const confirmClearMessage = async () => {
  isClearConfirmOpen.value = false
  await clearMessage()
}

const openSendConfirmationModal = () => {
  isSendConfirmationOpen.value = true
}

const closeSendConfirmationModal = () => {
  isSendConfirmationOpen.value = false
}

const confirmSendFromModal = async () => {
  if (isStartingJob.value) {
    return
  }
  closeSendConfirmationModal()
  try {
    await startJobAndRedirect()
  } catch (error) {
    console.error('[dashboard/messages] erro ao iniciar disparo', error)
  }
}

const validateSendReadiness = async () => {
  const errors: string[] = []
  isCheckingSendReadiness.value = true

  try {
    const data = await $fetch<WhatsappStatus>('/api/dashboard/whatsapp/state')
    const status: WhatsappStatus = {
      connected: Boolean(data?.connected),
      loggedIn: Boolean(data?.loggedIn)
    }
    lastWhatsappStatus.value = status
    if (!status.connected || !status.loggedIn) {
      errors.push('Conecte o WhatsApp para realizar o disparo.')
    }
  } catch (error) {
    console.error('[dashboard/messages] validação estado whatsapp', error)
    lastWhatsappStatus.value = null
    errors.push('Não foi possível confirmar a conexão do WhatsApp.')
  }

  try {
    const contactsData = await $fetch<{ meta?: { total?: number; validTotal?: number } }>('/api/dashboard/contacts', {
      query: { limit: 1, page: 1 }
    })
    const total = contactsData?.meta?.total ?? 0
    const validTotal = contactsData?.meta?.validTotal ?? 0
    contactsSummary.value = { total, validTotal }
    if (total <= 0) {
      errors.push('Cadastre pelo menos um contato para iniciar o disparo.')
    }
  } catch (error) {
    console.error('[dashboard/messages] validação contatos', error)
    contactsSummary.value = { total: 0, validTotal: 0 }
    errors.push('Não foi possível validar os contatos cadastrados.')
  }

  if (!hasSendableContent.value) {
    errors.push('Informe uma mensagem ou adicione mídias para enviar.')
  }

  isCheckingSendReadiness.value = false

  if (errors.length > 0) {
    const message = ['Não foi possível iniciar o disparo:', ...errors.map((err) => `• ${err}`)].join('\n')
    toast.error(message, { timeout: 6000 })
  }

  return errors.length === 0
}

const clearMessage = async () => {
  try {
    if (currentMessageId.value) {
      await $fetch('/api/dashboard/messages/clear', {
        method: 'DELETE',
        body: {
          messageId: currentMessageId.value
        }
      })
    }
  } catch (error: any) {
    console.error('[dashboard/messages] clear message error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao limpar a mensagem')
    return
  }

  attachments.value.forEach((attachment) => {
    if (attachment.previewUrl && attachment.previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(attachment.previewUrl)
    }
  })

  attachments.value = []
  message.value = ''
  currentMessageId.value = null
  lastSavedMessageBody.value = ''
  toast.success('Mensagem limpa com sucesso')
}

const normalizeAttachmentPayload = (payload: Record<string, any>) => ({
  id: payload.id ?? payload?.attachmentId ?? '',
  fileName: payload.file_name ?? payload.fileName ?? payload.name ?? '',
  mimeType: payload.mime_type ?? payload.mimeType ?? '',
  fileSizeBytes: payload.file_size_bytes ?? payload.fileSizeBytes ?? payload.size ?? 0,
  publicUrl: payload.public_url ?? payload.publicUrl ?? null,
  caption: payload.caption ?? ''
})

const mapApiAttachment = (
  apiAttachment:
    | DashboardAttachment
    | {
        id?: string
        file_name?: string
        fileName?: string
        file_size_bytes?: number
        fileSizeBytes?: number
        mime_type?: string
        mimeType?: string
        public_url?: string
        publicUrl?: string
        caption?: string | null
      }
): DashboardAttachment => {
  if ('persisted' in apiAttachment && apiAttachment.persisted) {
    return apiAttachment
  }

  const normalized = normalizeAttachmentPayload(apiAttachment as Record<string, any>)

  return {
    id: normalized.id,
    type: deriveTypeFromMime(normalized.mimeType),
    name: normalized.fileName || 'arquivo',
    size: typeof normalized.fileSizeBytes === 'number' ? normalized.fileSizeBytes : 0,
    caption: normalized.caption || '',
    file: null,
    mimeType: normalized.mimeType || '',
    previewUrl: normalized.mimeType?.startsWith?.('image/') ? normalized.publicUrl ?? null : null,
    publicUrl: normalized.publicUrl || null,
    persisted: true
  }
}

const normalizeApiAttachments = (raw: any[]) => {
  if (!Array.isArray(raw)) {
    return []
  }

  const seen = new Set<string>()

  return raw.reduce<DashboardAttachment[]>((acc, attachment) => {
    const key = attachment.id || attachment.storage_path || `${attachment.file_name}-${attachment.created_at}`
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
  try {
    const response = await $fetch('/api/dashboard/messages', {
      query: { limit: 1, page: 1 }
    })
    const lastMessage = response?.messages?.[0]
    if (lastMessage) {
      currentMessageId.value = lastMessage.id || null
      const loadedBody = lastMessage.body || ''
      message.value = loadedBody
      attachments.value = normalizeApiAttachments(lastMessage.attachments ?? [])
      lastSavedMessageBody.value = loadedBody.trim()
    } else {
      currentMessageId.value = null
      message.value = ''
      attachments.value = []
      lastSavedMessageBody.value = ''
    }
  } catch (error) {
    console.error('[dashboard/messages] load error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao carregar mensagem salva')
  } finally {
    if (showLoader) {
      isLoadingInitial.value = false
    }
  }
}

const handleVariableMenuClickOutside = (event: MouseEvent) => {
  if (!isVariableMenuOpen.value) return
  const target = event.target as Node
  if (
    variableMenuRef.value?.contains(target) ||
    variableButtonRef.value?.contains(target)
  ) {
    return
  }
  isVariableMenuOpen.value = false
}

const handleNameMenuClickOutside = (event: MouseEvent) => {
  if (!isNameMenuOpen.value) return
  const target = event.target as Node
  if (
    nameMenuRef.value?.contains(target) ||
    nameButtonRef.value?.contains(target)
  ) {
    return
  }
  isNameMenuOpen.value = false
}

onMounted(() => {
  loadLastMessage()
  fetchSendStatus().catch(() => {
    // erros já tratados no composable
  })
  document.addEventListener('click', handleVariableMenuClickOutside)
  document.addEventListener('click', handleNameMenuClickOutside)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleVariableMenuClickOutside)
  document.removeEventListener('click', handleNameMenuClickOutside)
})

const saveMessage = async (options: SaveMessageOptions = {}) => {
  const isAutoSave = options.auto ?? false

  if (!isAutoSave) {
    isSubmitting.value = true
  }

  const formData = new FormData()
  formData.append('body', message.value.trim())
  if (currentMessageId.value) {
    formData.append('message_id', currentMessageId.value)
  }

  const attachmentsToProcess = (options.attachments ?? attachments.value).filter((attachment) => !!attachment.file)

  if (!message.value.trim() && attachmentsToProcess.length === 0) {
    toast.warning('Adicione texto ou anexos para salvar.')
    if (!isAutoSave) {
      isSubmitting.value = false
    }
    return false
  }

  if (attachmentsToProcess.length > 0) {
    const attachmentsMeta = attachmentsToProcess.map((attachment) => {
      const file = attachment.file as File
      const attachmentId = attachment.id || generateAttachmentId()
      attachment.id = attachmentId
      formData.append(`file-${attachmentId}`, file, file.name)
      return {
        id: attachmentId,
        caption: attachment.caption || '',
        mimeType: attachment.mimeType || file.type,
        fileName: file.name,
        type: attachment.type
      }
    })
    formData.append('attachments_meta', JSON.stringify(attachmentsMeta))
  }

  try {
    const response = await $fetch('/api/dashboard/messages', {
      method: 'POST',
      body: formData
    })

    currentMessageId.value = response?.message?.id || currentMessageId.value
    await loadLastMessage(false)

    const successMessage = options.successMessage || (isAutoSave ? 'Anexo salvo automaticamente!' : 'Mensagem salva com sucesso!')
    if (successMessage) {
      toast.success(successMessage)
    }
    return true
  } catch (error: any) {
    console.error('[dashboard/messages] send error', error)
    toast.error(error?.data?.statusMessage || (isAutoSave ? 'Erro ao salvar anexo automaticamente' : 'Erro ao salvar mensagem'))
    return false
  } finally {
    if (!isAutoSave) {
      isSubmitting.value = false
    }
  }
}

const sendMessage = async () => {
  if (isJobActive.value) {
    toast.info('Aguarde o disparo atual finalizar antes de iniciar outro.')
    return
  }

  if (hasPendingContentToSave.value) {
    isSavingBeforeSend.value = true
    try {
      const saveSuccess = await saveMessage({
        auto: true,
        successMessage: 'Mensagem salva automaticamente!'
      })
      if (!saveSuccess) {
        return
      }
    } finally {
      isSavingBeforeSend.value = false
    }
  }

  const isReady = await validateSendReadiness()

  if (!isReady) {
    return
  }

  openSendConfirmationModal()
}

// Spintax methods
const openSpintaxModal = (target: 'message' | 'caption' | 'editCaption' = 'message') => {
  const actualTarget = (typeof target === 'string') ? target : 'message'
  spintaxTarget.value = actualTarget
  isSpintaxModalOpen.value = true
  // Reset fields to initial 3 empty fields
  spintaxFields.value = createDefaultSpintaxFields()
}

const closeSpintaxModal = () => {
  isSpintaxModalOpen.value = false
  spintaxFields.value = createDefaultSpintaxFields()
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

const insertTextAtCursor = async (text: string, target: 'message' | 'caption' | 'editCaption' = 'message') => {
  let textarea: HTMLTextAreaElement | null = null
  let contentValue = ''
  
  if (target === 'caption') {
    textarea = captionTextarea.value
    contentValue = caption.value
  } else if (target === 'editCaption') {
    textarea = editCaptionTextarea.value
    contentValue = editingCaption.value
  } else {
    textarea = messageTextarea.value
    contentValue = message.value
  }

  if (!textarea) {
    if (target === 'caption') caption.value += text
    else if (target === 'editCaption') editingCaption.value += text
    else message.value += text
    return
  }

  const start = textarea.selectionStart
  const end = textarea.selectionEnd
  const scrollTop = textarea.scrollTop

  const newText = contentValue.substring(0, start) + text + contentValue.substring(end)
  
  if (target === 'caption') caption.value = newText
  else if (target === 'editCaption') editingCaption.value = newText
  else message.value = newText
  
  await nextTick()
  
  textarea.focus({ preventScroll: true })
  textarea.scrollTop = scrollTop
  textarea.setSelectionRange(start + text.length, start + text.length)
}

const generateSpintax = () => {
  const validFields = spintaxFields.value
    .filter(field => field.value.trim() !== '')
    .map(field => field.value.trim())

  if (validFields.length < 2) {
    toast.warning('Por favor, preencha pelo menos 2 campos para gerar a spintax.')
    return
  }

  const spintaxText = `{${validFields.join('|')}}`

  insertTextAtCursor(spintaxText, spintaxTarget.value)

  closeSpintaxModal()
}

const toggleVariableMenu = () => {
  isVariableMenuOpen.value = !isVariableMenuOpen.value
}

const toggleCaptionVariableMenu = () => {
  isCaptionVariableMenuOpen.value = !isCaptionVariableMenuOpen.value
}

const toggleEditCaptionVariableMenu = () => {
  isEditCaptionVariableMenuOpen.value = !isEditCaptionVariableMenuOpen.value
}

const insertPlaceholder = (placeholder: string, target: 'message' | 'caption' | 'editCaption' = 'message') => {
  const trimmed = placeholder.trim()
  if (!trimmed) return
  insertTextAtCursor(trimmed, target)
}

const insertVariable = (key: VariableKey, target: 'message' | 'caption' | 'editCaption' = 'message') => {
  insertPlaceholder(`{${key}}`, target)
  isVariableMenuOpen.value = false
  isCaptionVariableMenuOpen.value = false
  isEditCaptionVariableMenuOpen.value = false
}

const toggleNameMenu = () => {
  isNameMenuOpen.value = !isNameMenuOpen.value
}

const toggleCaptionNameMenu = () => {
  isCaptionNameMenuOpen.value = !isCaptionNameMenuOpen.value
}

const toggleEditCaptionNameMenu = () => {
  isEditCaptionNameMenuOpen.value = !isEditCaptionNameMenuOpen.value
}

const insertNamePlaceholder = (key: 'nome' | 'nome_completo', target: 'message' | 'caption' | 'editCaption' = 'message') => {
  insertPlaceholder(`{${key}}`, target)
  isNameMenuOpen.value = false
  isCaptionNameMenuOpen.value = false
  isEditCaptionNameMenuOpen.value = false
}
</script>
