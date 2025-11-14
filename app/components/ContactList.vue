<template>
  <section id="contatos" class="bg-white rounded-lg shadow p-6 scroll-mt-24">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Lista de Contatos</h2>
      </div>

      <div class="flex items-center space-x-3">
        <button @click="openImportModal" class="flex items-center space-x-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>Importar Manualmente</span>
        </button>
        <button @click="openFileImportModal" class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Importar Arquivo</span>
        </button>
        <button @click="openCountryCodeModal" class="flex items-center space-x-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>Adicionar Código do País</span>
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
            <th v-if="hasVar1Data" class="px-4 py-3 text-gray-700 font-semibold">Var1</th>
            <th v-if="hasVar2Data" class="px-4 py-3 text-gray-700 font-semibold">Var2</th>
            <th v-if="hasVar3Data" class="px-4 py-3 text-gray-700 font-semibold">Var3</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Status</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="contacts.length === 0">
            <td :colspan="visibleColumnsCount" class="px-4 py-8 text-center text-gray-500">
              Nenhum contato cadastrado
            </td>
          </tr>
          <tr
            v-for="contact in contacts"
            :key="contact.id"
            class="border-b border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-800">{{ contact.name }}</td>
            <td class="px-4 py-3 text-gray-600">{{ contact.whatsapp }}</td>
            <td v-if="hasVar1Data" class="px-4 py-3 text-gray-600 text-sm">{{ contact.var1 || '-' }}</td>
            <td v-if="hasVar2Data" class="px-4 py-3 text-gray-600 text-sm">{{ contact.var2 || '-' }}</td>
            <td v-if="hasVar3Data" class="px-4 py-3 text-gray-600 text-sm">{{ contact.var3 || '-' }}</td>
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
            Formato: Nome, WhatsApp, Var1, Var2, Var3 (variáveis são opcionais)
          </p>
          <p class="text-xs text-gray-400 mb-3">
            <strong>Exemplos:</strong><br>
            • 5511999999999 (apenas número)<br>
            • João Silva, 5511988888888 (nome e número)<br>
            • Maria Santos, 5511977777777, Cliente VIP, 25 anos, São Paulo (completo)
          </p>
          <textarea
            v-model="contactListText"
            placeholder="João Silva, 5511988888888, Cliente VIP, 25 anos, São Paulo&#10;Maria Santos, 5511977777777, Premium&#10;5511999999999"
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
              placeholder="Variável personalizada 1"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Variável 2</label>
            <input
              v-model="editForm.var2"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Variável personalizada 2"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Variável 3</label>
            <input
              v-model="editForm.var3"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Variável personalizada 3"
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
          
          <div class="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              id="fileInput"
              accept=".txt,.csv,.xls,.xlsx"
              @change="handleFileSelect"
              class="hidden"
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

        <div class="flex justify-end space-x-3">
          <button
            @click="closeFileImportModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="processFile"
            :disabled="!selectedFile"
            class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Importar
          </button>
        </div>
      </div>
    </div>

    <!-- Country Code Modal -->
    <div v-if="isCountryCodeModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" @click.self="closeCountryCodeModal">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-semibold text-gray-800">Adicionar Código do País</h3>
          <button @click="closeCountryCodeModal" class="text-gray-400 hover:text-gray-600">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 font-medium mb-2">Código do País</label>
          <input
            v-model="countryCode"
            type="text"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            placeholder="Ex: 55, 1, 44"
            @input="validateCountryCode"
          >
          <p class="text-sm text-gray-500 mt-2">Digite apenas os números do código do país (sem +)</p>
        </div>

        <div v-if="countryCode && !countryCodeError" class="mb-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p class="text-sm font-semibold text-amber-800 mb-1">Preview das alterações:</p>
          <p class="text-sm text-amber-700">
            {{ contactsAffectedCount }} contato(s) serão atualizados
          </p>
          <p class="text-xs text-amber-600 mt-1">
            O código "{{ countryCode }}" será adicionado ao início dos números que ainda não possuem código
          </p>
        </div>

        <div v-if="countryCodeError" class="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
          <p class="text-sm text-red-700">{{ countryCodeError }}</p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            @click="closeCountryCodeModal"
            class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            @click="addCountryCodeToContacts"
            :disabled="!countryCode || countryCodeError || contactsAffectedCount === 0"
            class="px-6 py-2 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Adicionar Código
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import * as XLSX from 'xlsx'

const contacts = ref([])
const isImportModalOpen = ref(false)
const contactListText = ref('')
const isEditModalOpen = ref(false)
const isFileImportModalOpen = ref(false)
const selectedFile = ref(null)
const isCountryCodeModalOpen = ref(false)
const countryCode = ref('')
const countryCodeError = ref('')
const editForm = ref({
  id: null,
  name: '',
  whatsapp: '',
  var1: '',
  var2: '',
  var3: ''
})

const totalContacts = computed(() => contacts.value.length)
const validContacts = computed(() => contacts.value.filter(c => c.status === 'valid').length)

// Computed properties for conditional column display
const hasVar1Data = computed(() =>
  contacts.value.some(contact => contact.var1 && contact.var1.trim())
)

const hasVar2Data = computed(() =>
  contacts.value.some(contact => contact.var2 && contact.var2.trim())
)

const hasVar3Data = computed(() =>
  contacts.value.some(contact => contact.var3 && contact.var3.trim())
)

const visibleColumnsCount = computed(() => {
  let count = 4 // Name, WhatsApp, Status, Actions (always visible)
  if (hasVar1Data.value) count++
  if (hasVar2Data.value) count++
  if (hasVar3Data.value) count++
  return count
})

const contactsAffectedCount = computed(() => {
  if (!countryCode.value || countryCodeError.value) return 0
  return contacts.value.filter(contact => {
    if (!contact.whatsapp) return false
    // Check if contact already has a country code (starts with 2-4 digits followed by phone-like digits)
    const cleanNumber = contact.whatsapp.replace(/\D/g, '')
    return !cleanNumber.match(/^([2-9]\d{1,3})[2-9]\d+/)
  }).length
})

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
    name: contact.name || '',
    whatsapp: contact.whatsapp || '',
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

const saveEdit = () => {
  const index = contacts.value.findIndex(c => c.id === editForm.value.id)
  if (index !== -1) {
    const isValid = validateWhatsApp(editForm.value.whatsapp)
    contacts.value[index] = {
      ...contacts.value[index],
      name: editForm.value.name,
      whatsapp: editForm.value.whatsapp,
      var1: editForm.value.var1,
      var2: editForm.value.var2,
      var3: editForm.value.var3,
      status: isValid ? 'valid' : 'invalid'
    }
  }
  closeEditModal()
}

const parseContactLine = (line, delimiter = ',') => {
  line = line.trim()
  if (!line) return null

  // Split by provided delimiter and trim whitespace
  const parts = line.split(delimiter).map(part => part.trim())

  // Handle different formats
  if (parts.length === 1) {
    // Only WhatsApp number
    const whatsapp = parts[0].replace(/\D/g, '')
    if (whatsapp) {
      return {
        name: `Contato ${whatsapp.slice(-4)}`,
        whatsapp: whatsapp,
        var1: '',
        var2: '',
        var3: ''
      }
    }
  } else if (parts.length === 2) {
    // Name, WhatsApp (backward compatibility)
    const name = parts[0]
    const whatsapp = parts[1].replace(/\D/g, '')
    if (whatsapp) {
      return {
        name: name,
        whatsapp: whatsapp,
        var1: '',
        var2: '',
        var3: ''
      }
    }
  } else if (parts.length >= 3) {
    // Name, WhatsApp, Var1, Var2, Var3 (new format)
    const name = parts[0]
    const whatsapp = parts[1].replace(/\D/g, '')
    if (whatsapp) {
      return {
        name: name,
        whatsapp: whatsapp,
        var1: parts[2] || '',
        var2: parts[3] || '',
        var3: parts[4] || ''
      }
    }
  }

  return null
}

const validateWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

const detectDelimiter = (text) => {
  // Analyze first 10 lines to determine delimiter
  const lines = text.split('\n').slice(0, 10).filter(line => line.trim())
  let tabCount = 0
  let commaCount = 0

  lines.forEach(line => {
    tabCount += (line.match(/\t/g) || []).length
    commaCount += (line.match(/,/g) || []).length
  })

  // Use tab if more tabs than commas, otherwise use comma
  return tabCount > commaCount ? '\t' : ','
}

const importContacts = () => {
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

  contacts.value = [...contacts.value, ...newContacts]
  closeImportModal()

  console.log(`Importados ${newContacts.length} contatos`)
}

const deleteContact = (id) => {
  contacts.value = contacts.value.filter(contact => contact.id !== id)
}

const openFileImportModal = () => {
  isFileImportModalOpen.value = true
  selectedFile.value = null
}

const closeFileImportModal = () => {
  isFileImportModalOpen.value = false
  selectedFile.value = null
}

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
  }
}

const processFile = async () => {
  if (!selectedFile.value) return

  const file = selectedFile.value
  const fileName = file.name.toLowerCase()
  const newContacts = []

  try {
    if (fileName.endsWith('.txt') || fileName.endsWith('.csv')) {
      const text = await file.text()

      // Detect delimiter for TXT/CSV files
      const delimiter = detectDelimiter(text)
      console.log(`Delimitador detectado: ${delimiter === '\t' ? 'TAB' : 'Vírgula'}`)

      const lines = text.split('\n')

      lines.forEach((line, index) => {
        const parsed = parseContactLine(line, delimiter)
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
          whatsapp = String(row[0]).trim()
          name = `Contato ${whatsapp.slice(-4)}`
        } else {
          name = String(row[0] || '').trim()
          whatsapp = String(row[1] || '').trim()
          var1 = String(row[2] || '').trim()
          var2 = String(row[3] || '').trim()
          var3 = String(row[4] || '').trim()
        }

        if (whatsapp) {
          const isValid = validateWhatsApp(whatsapp)
          newContacts.push({
            id: Date.now() + index,
            name: name || `Contato ${whatsapp.slice(-4)}`,
            whatsapp: whatsapp,
            var1: var1,
            var2: var2,
            var3: var3,
            status: isValid ? 'valid' : 'invalid'
          })
        }
      })
    }

    contacts.value = [...contacts.value, ...newContacts]
    closeFileImportModal()
    console.log(`Importados ${newContacts.length} contatos do arquivo`)
  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    alert('Erro ao processar arquivo. Verifique o formato e tente novamente.')
  }
}

// Country Code Modal Functions
const openCountryCodeModal = () => {
  isCountryCodeModalOpen.value = true
  countryCode.value = ''
  countryCodeError.value = ''
}

const closeCountryCodeModal = () => {
  isCountryCodeModalOpen.value = false
  countryCode.value = ''
  countryCodeError.value = ''
}

const validateCountryCode = () => {
  const value = countryCode.value.trim()
  countryCodeError.value = ''

  if (!value) {
    return
  }

  // Remove any non-digit characters for validation
  const digitsOnly = value.replace(/\D/g, '')

  if (digitsOnly.length === 0) {
    countryCodeError.value = 'Digite apenas números'
    return
  }

  if (digitsOnly.length < 1 || digitsOnly.length > 4) {
    countryCodeError.value = 'Código do país deve ter entre 1 e 4 dígitos'
    return
  }

  // Valid country codes (basic validation)
  const validPrefixes = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  if (!validPrefixes.includes(digitsOnly[0])) {
    countryCodeError.value = 'Código do país inválido'
    return
  }

  // Update the input to show only digits
  countryCode.value = digitsOnly
}

const addCountryCodeToContacts = () => {
  if (!countryCode.value || countryCodeError.value) {
    return
  }

  let updatedCount = 0

  contacts.value = contacts.value.map(contact => {
    if (!contact.whatsapp) return contact

    const cleanNumber = contact.whatsapp.replace(/\D/g, '')

    // Check if number already has a country code
    const hasCountryCode = cleanNumber.match(/^([2-9]\d{1,3})[2-9]\d+/)

    if (!hasCountryCode) {
      updatedCount++
      const newWhatsapp = countryCode.value + cleanNumber
      const isValid = validateWhatsApp(newWhatsapp)

      return {
        ...contact,
        whatsapp: newWhatsapp,
        status: isValid ? 'valid' : 'invalid'
      }
    }

    return contact
  })

  alert(`Código do país "${countryCode.value}" adicionado a ${updatedCount} contato(s) com sucesso!`)
  closeCountryCodeModal()
}
</script>
