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
      </div>
    </div>

    <div v-if="errorMessage" class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="mb-4 rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
      {{ successMessage }}
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
            <td class="px-4 py-3 text-gray-800">{{ contact.name }}</td>
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
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import * as XLSX from 'xlsx'

const contacts = ref([])
const isLoadingContacts = ref(false)
const isSavingContacts = ref(false)
const errorMessage = ref('')
const successMessage = ref('')
const isImportModalOpen = ref(false)
const contactListText = ref('')
const isEditModalOpen = ref(false)
const isFileImportModalOpen = ref(false)
const selectedFile = ref(null)
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

const resetFeedback = () => {
  errorMessage.value = ''
  successMessage.value = ''
}

const openImportModal = () => {
  resetFeedback()
  isImportModalOpen.value = true
}

const closeImportModal = () => {
  isImportModalOpen.value = false
  contactListText.value = ''
}

const openEditModal = (contact) => {
  resetFeedback()
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
  resetFeedback()

  try {
    const { contact } = await $fetch('/api/dashboard/contacts', {
      method: 'PUT',
      body: {
        id: editForm.value.id,
        name: editForm.value.name,
        whatsapp: editForm.value.whatsapp,
        var1: editForm.value.var1,
        var2: editForm.value.var2,
        var3: editForm.value.var3
      }
    })

    const index = contacts.value.findIndex(c => c.id === editForm.value.id)
    if (index !== -1 && contact) {
      contacts.value[index] = {
        ...contact,
        status: validateWhatsApp(contact.whatsapp) ? 'valid' : 'invalid'
      }
      successMessage.value = 'Contato atualizado com sucesso'
    }
    closeEditModal()
  } catch (error) {
    console.error('[dashboard/contacts] edit error', error)
    errorMessage.value = error?.data?.statusMessage || 'Erro ao atualizar o contato'
  } finally {
    isSavingContacts.value = false
  }
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
    result.name = `Contato ${result.whatsapp.slice(-4)}`
  } else if (fields.length === 2) {
    // Name and WhatsApp
    result.name = fields[0]
    result.whatsapp = fields[1].replace(/\D/g, '')
  } else {
    // Name, WhatsApp, and variables
    result.name = fields[0]
    result.whatsapp = fields[1].replace(/\D/g, '')
    if (fields[2]) result.var1 = fields[2]
    if (fields[3]) result.var2 = fields[3]
    if (fields[4]) result.var3 = fields[4]
  }

  return result.whatsapp ? result : null
}

const validateWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
}

const fetchContacts = async () => {
  isLoadingContacts.value = true
  resetFeedback()
  try {
    const { contacts: apiContacts } = await $fetch('/api/dashboard/contacts')
    contacts.value = (apiContacts ?? []).map((contact) => ({
      ...contact,
      status: validateWhatsApp(contact.whatsapp) ? 'valid' : 'invalid'
    }))
  } catch (error) {
    console.error('[dashboard/contacts] fetch error', error)
    errorMessage.value = error?.data?.statusMessage || 'Erro ao carregar contatos'
  } finally {
    isLoadingContacts.value = false
  }
}

onMounted(fetchContacts)

const saveContactsToApi = async (newContacts) => {
  if (!newContacts.length) {
    return []
  }
  isSavingContacts.value = true
  const created = []
  try {
    for (const contact of newContacts) {
      try {
        const { contact: createdContact } = await $fetch('/api/dashboard/contacts', {
          method: 'POST',
          body: {
            name: contact.name,
            whatsapp: contact.whatsapp,
            var1: contact.var1,
            var2: contact.var2,
            var3: contact.var3
          }
        })
        if (createdContact) {
          created.push({
            ...createdContact,
            status: contact.status
          })
        }
      } catch (error) {
        console.error('[dashboard/contacts] save error', error)
        errorMessage.value = error?.data?.statusMessage || 'Erro ao salvar alguns contatos'
      }
    }
  } finally {
    isSavingContacts.value = false
  }
  return created
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
    errorMessage.value = 'Nenhum contato válido encontrado'
    return
  }

  const savedContacts = await saveContactsToApi(newContacts)

  if (savedContacts.length) {
    contacts.value = [...savedContacts, ...contacts.value]
    successMessage.value = `Importados ${savedContacts.length} contatos`
    closeImportModal()
  }
}

const deleteContact = async (id) => {
  resetFeedback()
  try {
    await $fetch('/api/dashboard/contacts', {
      method: 'DELETE',
      body: { contactId: id }
    })
    contacts.value = contacts.value.filter(contact => contact.id !== id)
    successMessage.value = 'Contato removido'
  } catch (error) {
    console.error('[dashboard/contacts] delete error', error)
    errorMessage.value = error?.data?.statusMessage || 'Erro ao remover contato'
  }
}

const openFileImportModal = () => {
  resetFeedback()
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
          whatsapp = String(row[0]).trim()
          name = `Contato ${whatsapp.slice(-4)}`
        } else {
          name = String(row[0] || '').trim()
          whatsapp = String(row[1] || '').trim()
          if (row[2]) var1 = String(row[2]).trim()
          if (row[3]) var2 = String(row[3]).trim()
          if (row[4]) var3 = String(row[4]).trim()
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

    if (newContacts.length === 0) {
      errorMessage.value = 'Nenhum contato válido encontrado no arquivo'
      return
    }

    const savedContacts = await saveContactsToApi(newContacts)

    if (savedContacts.length) {
      contacts.value = [...savedContacts, ...contacts.value]
      successMessage.value = `Importados ${savedContacts.length} contatos`
      closeFileImportModal()
    }
  } catch (error) {
    console.error('Erro ao processar arquivo:', error)
    alert('Erro ao processar arquivo. Verifique o formato e tente novamente.')
  }
}
</script>
