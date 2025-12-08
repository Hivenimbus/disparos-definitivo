<template>
  <section id="contatos" class="bg-white rounded-lg shadow p-4 md:p-6 scroll-mt-24">
    <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Lista de Contatos</h2>
      </div>

      <div class="flex flex-wrap items-center gap-2 md:space-x-3">
        <button
          @click="exportContacts"
          :disabled="isExporting || totalContacts === 0"
          class="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          <span class="whitespace-nowrap">{{ isExporting ? 'Exportando...' : 'Exportar' }}</span>
        </button>
        <div ref="importDropdownRef" class="relative flex-1 md:flex-none">
          <button
            @click="toggleImportDropdown"
            class="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full md:w-auto justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Importar</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div
            v-if="isImportDropdownOpen"
            class="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-10"
          >
            <button
              @click="handleManualImportClick"
              class="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Importar manualmente</span>
            </button>
            <button
              @click="handleFileImportClick"
              class="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Importar arquivo</span>
            </button>
            <button
              @click="handleWhatsAppImportClick"
              :disabled="isImportingWhatsApp"
              class="w-full flex items-center space-x-2 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m6 9h6m-3-3v6m-9 5a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
              <span>{{ isImportingWhatsApp ? 'Importando...' : 'Importar do WhatsApp' }}</span>
            </button>
          </div>
        </div>
        <button
          @click="openCountryCodeModal"
          class="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex-1 md:flex-none justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 0c2.5 2.5 4 5.5 4 9s-1.5 6.5-4 9m0-18c-2.5 2.5-4 5.5-4 9s1.5 6.5 4 9m-9-9h18" />
          </svg>
          <span class="whitespace-nowrap">Cód. País</span>
        </button>
        <button
          @click="deleteAllContacts"
          :disabled="isClearingContacts || contacts.length === 0"
          class="flex items-center space-x-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-1 md:flex-none justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span class="whitespace-nowrap">{{ isClearingContacts ? 'Apagando...' : 'Apagar' }}</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-blue-600 mb-2">{{ totalContacts }}</div>
        <div class="text-gray-600 text-sm">Total de Contatos</div>
      </div>
      <div class="bg-gray-100 rounded-lg p-6 text-center">
        <div class="text-4xl font-bold text-blue-600 mb-2">{{ validContacts }}</div>
        <div class="text-gray-600 text-sm">Contatos Válidos</div>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100 text-left">
            <th class="px-4 py-3 text-gray-700 font-semibold">Nome</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">WhatsApp</th>
            <th v-if="hasVar1" class="px-4 py-3 text-gray-700 font-semibold">Var 1</th>
            <th v-if="hasVar2" class="px-4 py-3 text-gray-700 font-semibold">Var 2</th>
            <th v-if="hasVar3" class="px-4 py-3 text-gray-700 font-semibold">Var 3</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Status</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="contacts.length === 0">
            <td :colspan="totalColumns" class="px-4 py-8 text-center text-gray-500">
              Nenhum contato cadastrado
            </td>
          </tr>
          <tr
            v-for="contact in contacts"
            :key="contact.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-800">{{ (contact.name || '').trim() }}</td>
            <td class="px-4 py-3 text-gray-600">{{ contact.whatsapp }}</td>
            <td v-if="hasVar1" class="px-4 py-3 text-gray-600">{{ contact.var1 || '-' }}</td>
            <td v-if="hasVar2" class="px-4 py-3 text-gray-600">{{ contact.var2 || '-' }}</td>
            <td v-if="hasVar3" class="px-4 py-3 text-gray-600">{{ contact.var3 || '-' }}</td>
            <td class="px-4 py-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="{
                  'bg-green-100 text-green-700': contact.status === 'valid',
                  'bg-red-100 text-red-700': contact.status === 'invalid'
                }"
              >
                {{ contact.status === 'valid' ? 'Válido' : 'Inválido' }}
              </span>
            </td>
            <td class="px-4 py-3">
              <div class="flex items-center space-x-2">
                <button @click="openEditModal(contact)" class="text-blue-600 hover:text-blue-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button @click="deleteContact(contact.id)" class="text-red-600 hover:text-red-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="flex items-center justify-center space-x-4 mt-6">
      <button
        @click="fetchContacts(currentPage - 1)"
        :disabled="currentPage === 1 || isLoadingContacts"
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Anterior
      </button>
      <span class="text-sm text-gray-600">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      <button
        @click="fetchContacts(currentPage + 1)"
        :disabled="currentPage === totalPages || isLoadingContacts"
        class="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Próxima
      </button>
    </div>

    <div v-if="isImportModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeImportModal">
      <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Importar Contatos Manualmente</h3>
          <button @click="closeImportModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2">
            Cole a lista de contatos (um por linha):
          </label>
          <p class="text-sm text-gray-500 mb-3">
            Formato: Nome, WhatsApp[, Var1, Var2, Var3]<br>
            Separadores aceitos: vírgula, ponto e vírgula, tabulação, barra vertical |
          </p>
          <textarea
            v-model="contactListText"
            placeholder="Ex: 5511999999999&#10;João Silva, 551198888888&#10;Maria Santos, 5511977777777, Gerente&#10;Carlos, 55119666666, Vendedor, SP, Ativo"
            rows="12"
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
          ></textarea>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeImportModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="importContacts"
            :disabled="!contactListText.trim()"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Importar
          </button>
        </div>
      </div>
    </div>

    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeEditModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Editar Contato</h3>
          <button @click="closeEditModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Nome</label>
            <input
              v-model="editForm.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nome do contato"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">WhatsApp</label>
            <input
              v-model="editForm.whatsapp"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Número do WhatsApp"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Variável 1</label>
            <input
              v-model="editForm.var1"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dados personalizados (opcional)"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Variável 2</label>
            <input
              v-model="editForm.var2"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dados personalizados (opcional)"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Variável 3</label>
            <input
              v-model="editForm.var3"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Dados personalizados (opcional)"
            >
          </div>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeEditModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="saveEdit"
            :disabled="!editForm.name.trim() || !editForm.whatsapp.trim()"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>

    <div v-if="isFileImportModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeFileImportModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Importar Arquivo</h3>
          <button @click="closeFileImportModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 font-medium mb-3">
            Selecione um arquivo para importar:
          </label>
          <p class="text-sm text-gray-500 mb-4">
            Formatos aceitos: TXT, CSV, XLS, XLSX
          </p>
          
          <div
            class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors"
            :class="{ 'opacity-60 pointer-events-none': isProcessingFile }"
          >
            <input
              type="file"
              id="fileInput"
              accept=".txt,.csv,.xls,.xlsx"
              @change="handleFileSelect"
              class="hidden"
              :disabled="isProcessingFile"
            >
            <label for="fileInput" class="cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span class="text-blue-600 hover:text-blue-700 font-medium">
                Clique para selecionar
              </span>
              <p class="text-gray-500 text-sm mt-1">ou arraste o arquivo aqui</p>
            </label>
          </div>

          <div v-if="selectedFile" class="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <div class="flex items-center space-x-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-sm text-gray-700">{{ selectedFile.name }}</span>
            </div>
            <button @click="selectedFile = null" class="text-red-500 hover:text-red-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="isProcessingFile" class="text-sm text-gray-600 mb-3">
          Processando arquivo, aguarde...
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeFileImportModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="processFile"
            :disabled="!selectedFile || isProcessingFile"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isProcessingFile ? 'Importando...' : 'Importar' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isCountryCodeModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="closeCountryCodeModal"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-sm w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Inserir código do país</h3>
          <button @click="closeCountryCodeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="space-y-4 mb-6">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Código do país (somente números)</label>
            <input
              v-model="countryCodeInput"
              type="text"
              inputmode="numeric"
              pattern="[0-9]*"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: 55"
            >
          </div>
          <p class="text-sm text-gray-500">
            O código será adicionado no início de cada número exibido na lista atual.
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeCountryCodeModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="applyCountryCodeToContacts"
            :disabled="!countryCodeInput.trim() || isSavingContacts"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isSavingContacts ? 'Aplicando...' : 'Aplicar' }}
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="isDeleteConfirmOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      @click.self="isDeleteConfirmOpen = false"
    >
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">Apagar todos os contatos</h3>
          <button @click="isDeleteConfirmOpen = false" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="text-gray-700 mb-4">
          Tem certeza de que deseja apagar todos os contatos? Essa ação não pode ser desfeita.
        </p>
        <div class="flex justify-end space-x-3">
          <button
            @click="isDeleteConfirmOpen = false"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="confirmDeleteAllContacts"
            :disabled="isClearingContacts"
            class="px-6 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isClearingContacts ? 'Apagando...' : 'Apagar tudo' }}
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import * as XLSX from 'xlsx'
import { normalizeContactVariable } from '~~/shared/normalize-contact-variable'

const contacts = ref([])
const currentPage = ref(1)
const totalPages = ref(1)
const limit = 10
const isLoadingContacts = ref(false)
const isSavingContacts = ref(false)
const isExporting = ref(false)
const isClearingContacts = ref(false)
const isImportModalOpen = ref(false)
const contactListText = ref('')
const isEditModalOpen = ref(false)
const isFileImportModalOpen = ref(false)
const selectedFile = ref(null)
const isImportDropdownOpen = ref(false)
const importDropdownRef = ref(null)
const isImportingWhatsApp = ref(false)
const isCountryCodeModalOpen = ref(false)
const countryCodeInput = ref('')
const editForm = ref({
  id: null,
  name: '',
  whatsapp: '',
  var1: '',
  var2: '',
  var3: ''
})

const totalContacts = ref(0)
const totalValidContacts = ref(0)
const validContacts = computed(() => totalValidContacts.value)
const isProcessingFile = ref(false)
const toast = useToast()

// Dynamic column detection
const hasVar1 = computed(() => contacts.value.some(c => c.var1 && c.var1.trim()))
const hasVar2 = computed(() => contacts.value.some(c => c.var2 && c.var2.trim()))
const hasVar3 = computed(() => contacts.value.some(c => c.var3 && c.var3.trim()))

// Table column count for colspan
const totalColumns = computed(() => {
  let count = 3 // Nome, WhatsApp, Status
  if (hasVar1.value) count++
  if (hasVar2.value) count++
  if (hasVar3.value) count++
  count++ // Ações column
  return count
})

const toggleImportDropdown = () => {
  isImportDropdownOpen.value = !isImportDropdownOpen.value
}

const closeImportDropdown = () => {
  isImportDropdownOpen.value = false
}

const openImportModal = () => {
  isImportModalOpen.value = true
}

const closeImportModal = () => {
  isImportModalOpen.value = false
  contactListText.value = ''
}

const openEditModal = (contact) => {
  editForm.value = {
    id: contact.id,
    name: contact.name,
    whatsapp: contact.whatsapp,
    var1: contact.var1 || '',
    var2: contact.var2 || '',
    var3: contact.var3 || ''
  }
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editForm.value = {
    id: null,
    name: '',
    whatsapp: '',
    var1: '',
    var2: '',
    var3: ''
  }
}

const saveEdit = async () => {
  if (!editForm.value.id) {
    return
  }

  isSavingContacts.value = true

  try {
    const sanitizedVar1 = normalizeContactVariable(editForm.value.var1)
    const sanitizedVar2 = normalizeContactVariable(editForm.value.var2)
    const sanitizedVar3 = normalizeContactVariable(editForm.value.var3)

    const { contact } = await $fetch('/api/dashboard/contacts', {
      method: 'PUT',
      body: {
        id: editForm.value.id,
        name: editForm.value.name,
        whatsapp: editForm.value.whatsapp,
        var1: sanitizedVar1,
        var2: sanitizedVar2,
        var3: sanitizedVar3
      }
    })

    if (contact) {
      toast.success('Contato atualizado com sucesso')
      await fetchContacts(currentPage.value)
    }
    closeEditModal()
  } catch (error) {
    console.error('[dashboard/contacts] edit error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao atualizar o contato')
  } finally {
    isSavingContacts.value = false
  }
}

const looksLikeWhatsApp = (value) => {
  if (!value) return false
  const digits = value.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

const parseContactLine = (line) => {
  line = line.trim()
  if (!line) return null

  // Try different separators: tab, comma, semicolon, pipe
  let fields = []

  // Tab separator
  if (line.includes('\t')) {
    fields = line.split('\t')
  }
  // Semicolon separator
  else if (line.includes(';')) {
    fields = line.split(';')
  }
  // Pipe separator
  else if (line.includes('|')) {
    fields = line.split('|')
  }
  // Comma separator (avoid matching decimal numbers)
  else if (line.match(/,/)) {
    fields = line.split(',')
  }
  // Space separator (only if we have at least 3 parts)
  else if (line.split(/\s+/).length >= 3) {
    fields = line.split(/\s+/)
  }
  // Try comma as last resort
  else {
    fields = line.split(',')
  }

  // Clean up fields
  fields = fields.map(f => f.trim()).filter(f => f !== '')

  if (fields.length === 0) return null

  let result = {
    name: '',
    whatsapp: '',
    var1: '',
    var2: '',
    var3: ''
  }

  if (fields.length === 1) {
    // Only WhatsApp number
    result.whatsapp = fields[0].replace(/\D/g, '')
  } else {
    const firstIsWhatsApp = looksLikeWhatsApp(fields[0])
    if (firstIsWhatsApp) {
      result.whatsapp = fields[0].replace(/\D/g, '')
      result.var1 = normalizeContactVariable(fields[1])
      result.var2 = normalizeContactVariable(fields[2])
      result.var3 = normalizeContactVariable(fields[3])
    } else {
      // Name, WhatsApp, and optional variables
      result.name = fields[0]
      result.whatsapp = fields[1].replace(/\D/g, '')
      result.var1 = normalizeContactVariable(fields[2])
      result.var2 = normalizeContactVariable(fields[3])
      result.var3 = normalizeContactVariable(fields[4])
    }
  }

  result.name = result.name?.trim?.() || ''

  return result.whatsapp ? result : null
}

const validateWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

const fetchContacts = async (page = 1) => {
  isLoadingContacts.value = true
  try {
    const { contacts: apiContacts, meta } = await $fetch('/api/dashboard/contacts', {
      query: { page, limit }
    })

    const mappedContacts = (apiContacts ?? []).map((contact) => ({
      ...contact,
      var1: normalizeContactVariable(contact.var1),
      var2: normalizeContactVariable(contact.var2),
      var3: normalizeContactVariable(contact.var3),
      status: validateWhatsApp(contact.whatsapp) ? 'valid' : 'invalid'
    }))

    const deduplicatedContacts = []
    const seenContactIds = new Set()

    mappedContacts.forEach((contact) => {
      const contactIdentifier = contact.id ?? contact.whatsapp ?? Symbol('contact')
      if (contact.id || contact.whatsapp) {
        if (seenContactIds.has(contactIdentifier)) {
          return
        }
        seenContactIds.add(contactIdentifier)
      }
      deduplicatedContacts.push(contact)
    })

    contacts.value = deduplicatedContacts
    currentPage.value = meta?.page || page
    totalContacts.value = meta?.total ?? contacts.value.length
    totalValidContacts.value = meta?.validTotal ?? totalValidContacts.value
    totalPages.value = Math.max(1, Math.ceil(totalContacts.value / limit))
  } catch (error) {
    console.error('[dashboard/contacts] fetch error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao carregar contatos')
  } finally {
    isLoadingContacts.value = false
  }
}

onMounted(() => {
  fetchContacts(currentPage.value)
  document.addEventListener('click', handleOutsideClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleOutsideClick)
})

const saveContactsToApi = async (newContacts) => {
  if (!newContacts.length) {
    return []
  }

  isSavingContacts.value = true
  try {
    const payload = newContacts.map((contact) => ({
      name: contact.name,
      whatsapp: contact.whatsapp,
      var1: normalizeContactVariable(contact.var1),
      var2: normalizeContactVariable(contact.var2),
      var3: normalizeContactVariable(contact.var3)
    }))

    const { contacts: createdContacts } = await $fetch('/api/dashboard/contacts', {
      method: 'POST',
      body: {
        contacts: payload
      }
    })

    return (createdContacts ?? []).map((contact) => ({
      ...contact,
      var1: normalizeContactVariable(contact.var1),
      var2: normalizeContactVariable(contact.var2),
      var3: normalizeContactVariable(contact.var3),
      status: validateWhatsApp(contact.whatsapp) ? 'valid' : 'invalid'
    }))
  } catch (error) {
    console.error('[dashboard/contacts] batch save error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao salvar os contatos')
    return []
  } finally {
    isSavingContacts.value = false
  }
}

const exportContacts = async () => {
  if (isExporting.value) return

  isExporting.value = true
  try {
    const { contacts: allContacts } = await $fetch('/api/dashboard/contacts', {
      query: { export: 'true' }
    })

    if (!allContacts || allContacts.length === 0) {
      toast.warning('Nenhum contato para exportar')
      return
    }

    const data = allContacts.map(c => ({
      'Nome': c.name || '',
      'WhatsApp': c.whatsapp,
      'Variável 1': c.var1 || '',
      'Variável 2': c.var2 || '',
      'Variável 3': c.var3 || '',
      'Status': validateWhatsApp(c.whatsapp) ? 'Válido' : 'Inválido'
    }))

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos')
    
    XLSX.writeFile(workbook, 'contatos.xlsx')
    toast.success('Exportação concluída')
  } catch (error) {
    console.error('[dashboard/contacts] export error', error)
    toast.error('Erro ao exportar contatos')
  } finally {
    isExporting.value = false
  }
}

const importContacts = async () => {
  const lines = contactListText.value.split('\n')
  const newContacts = []

  lines.forEach((line, index) => {
    const parsed = parseContactLine(line)
    if (parsed) {
      const isValid = validateWhatsApp(parsed.whatsapp)
      newContacts.push({
        id: Date.now() + index,
        name: parsed.name,
        whatsapp: parsed.whatsapp,
        var1: parsed.var1,
        var2: parsed.var2,
        var3: parsed.var3,
        status: isValid ? 'valid' : 'invalid'
      })
    }
  })

  if (newContacts.length === 0) {
    toast.warning('Nenhum contato válido encontrado')
    return
  }

  const savedContacts = await saveContactsToApi(newContacts)

  if (savedContacts.length) {
    toast.success(`Importados ${savedContacts.length} contatos`)
    await fetchContacts(currentPage.value)
    closeImportModal()
  }
}

const deleteContact = async (id) => {
  try {
    await $fetch('/api/dashboard/contacts', {
      method: 'DELETE',
      body: { contactId: id }
    })
    await fetchContacts(currentPage.value)
    toast.success('Contato removido')
  } catch (error) {
    console.error('[dashboard/contacts] delete error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao remover contato')
  }
}

const deleteAllContacts = async () => {
  if (!contacts.value.length) {
    return
  }

  if (isClearingContacts.value) {
    return
  }

  isDeleteConfirmOpen.value = true
}

const confirmDeleteAllContacts = async () => {
  if (isClearingContacts.value) {
    return
  }

  isClearingContacts.value = true

  try {
    const { deleted } = await $fetch('/api/dashboard/contacts/clear', {
      method: 'DELETE'
    })
    await fetchContacts(1)
    const removed = typeof deleted === 'number' ? deleted : contacts.value.length
    const message = removed
      ? `Removidos ${removed} contato${removed === 1 ? '' : 's'}`
      : 'Nenhum contato para remover'
    toast.success(message)
  } catch (error) {
    console.error('[dashboard/contacts] bulk delete error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao remover contatos')
  } finally {
    isClearingContacts.value = false
    isDeleteConfirmOpen.value = false
  }
}

const applyCountryCodeToContacts = async () => {
  const code = countryCodeInput.value.replace(/\D/g, '')
  if (!code) {
    toast.warning('Informe um código de país válido')
    return
  }

  isSavingContacts.value = true

  try {
    const { updated } = await $fetch('/api/dashboard/contacts/country-code', {
      method: 'POST',
      body: {
        countryCode: code
      }
    })

    await fetchContacts(currentPage.value)

    const message = updated
      ? `Código do país aplicado em ${updated} contato${updated === 1 ? '' : 's'}`
      : 'Nenhum contato precisava ser atualizado'
    toast.success(message)

    closeCountryCodeModal()
  } catch (error) {
    console.error('[dashboard/contacts] bulk country code error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao aplicar código do país')
  } finally {
    isSavingContacts.value = false
  }
}

const openFileImportModal = () => {
  isFileImportModalOpen.value = true
  selectedFile.value = null
}

const handleManualImportClick = () => {
  closeImportDropdown()
  openImportModal()
}

const handleFileImportClick = () => {
  closeImportDropdown()
  openFileImportModal()
}

const importContactsFromWhatsApp = async () => {
  if (isImportingWhatsApp.value) return

  isImportingWhatsApp.value = true

  try {
    const response = await $fetch('/api/dashboard/contacts/import-whatsapp', {
      method: 'POST'
    })

    const imported = response?.imported ?? 0

    if (imported === 0) {
      toast.warning('Nenhum contato válido encontrado no WhatsApp')
    } else {
      toast.success(`Importados ${imported} contato${imported === 1 ? '' : 's'} do WhatsApp`)
      await fetchContacts(currentPage.value)
    }
  } catch (error) {
    console.error('[dashboard/contacts] import whatsapp error', error)
    toast.error(error?.data?.statusMessage || 'Erro ao importar contatos do WhatsApp')
  } finally {
    isImportingWhatsApp.value = false
  }
}

const handleWhatsAppImportClick = async () => {
  closeImportDropdown()
  await importContactsFromWhatsApp()
}

const closeFileImportModal = () => {
  isFileImportModalOpen.value = false
  selectedFile.value = null
}

const openCountryCodeModal = () => {
  countryCodeInput.value = ''
  isCountryCodeModalOpen.value = true
}

const closeCountryCodeModal = () => {
  isCountryCodeModalOpen.value = false
  countryCodeInput.value = ''
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const handleOutsideClick = (event) => {
  const dropdownEl = importDropdownRef.value
  if (!dropdownEl) return
  if (!dropdownEl.contains(event.target)) {
    isImportDropdownOpen.value = false
  }
}

const processFile = async () => {
  if (!selectedFile.value || isProcessingFile.value) return

  isProcessingFile.value = true

  const file = selectedFile.value
  const fileName = file.name.toLowerCase()
  const newContacts = []

  try {
    if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      const text = await file.text()
      const lines = text.split('\n')

      lines.forEach((line, index) => {
        const parsed = parseContactLine(line)
        if (parsed) {
          const isValid = validateWhatsApp(parsed.whatsapp)
          newContacts.push({
            id: Date.now() + index,
            name: parsed.name,
            whatsapp: parsed.whatsapp,
            var1: parsed.var1,
            var2: parsed.var2,
            var3: parsed.var3,
            status: isValid ? 'valid' : 'invalid'
          })
        }
      })
    } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
      const data = await file.arrayBuffer()
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

      rows.forEach((row, index) => {
        if (!row || row.length === 0) return

        let name = ''
        let whatsapp = ''
        let var1 = ''
        let var2 = ''
        let var3 = ''

        if (row.length === 1) {
          whatsapp = String(row[0] ?? '').trim()
        } else {
          const firstCell = String(row[0] ?? '').trim()
          const secondCell = String(row[1] ?? '').trim()
          const firstIsWhatsApp = looksLikeWhatsApp(firstCell)

          if (firstIsWhatsApp) {
            whatsapp = firstCell
            var1 = secondCell
            if (row[2]) var2 = String(row[2]).trim()
            if (row[3]) var3 = String(row[3]).trim()
          } else {
            name = firstCell
            whatsapp = secondCell
            if (row[2]) var1 = String(row[2]).trim()
            if (row[3]) var2 = String(row[3]).trim()
            if (row[4]) var3 = String(row[4]).trim()
          }

          var1 = normalizeContactVariable(var1)
          var2 = normalizeContactVariable(var2)
          var3 = normalizeContactVariable(var3)
        }

        if (whatsapp) {
          const isValid = validateWhatsApp(whatsapp)
          newContacts.push({
            id: Date.now() + index,
            name,
            whatsapp: whatsapp,
            var1: var1,
            var2: var2,
            var3: var3,
            status: isValid ? 'valid' : 'invalid'
          })
        }
      })
    }

    if (newContacts.length === 0) {
      toast.warning('Nenhum contato válido encontrado no arquivo')
      return
    }

    const savedContacts = await saveContactsToApi(newContacts)

    if (savedContacts.length) {
      toast.success(`Importados ${savedContacts.length} contatos`)
      await fetchContacts(currentPage.value)
      closeFileImportModal()
    }
  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    toast.error('Erro ao processar arquivo. Verifique o formato e tente novamente.')
  } finally {
    isProcessingFile.value = false
  }
}

const isDeleteConfirmOpen = ref(false)
</script>
