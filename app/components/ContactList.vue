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
        <button class="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span>Importar Arquivo</span>
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
            <th class="px-4 py-3 text-gray-700 font-semibold">Status</th>
            <th class="px-4 py-3 text-gray-700 font-semibold">Ações</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="contacts.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-500">
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
              <button class="text-blue-600 hover:text-blue-800 transition-colors">
                Editar
              </button>
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
            Formato: Número, Nome ou Número
          </p>
          <textarea
            v-model="contactListText"
            placeholder="Ex: 5511999999999&#10;João Silva, 551198888888&#10;Maria Santos      5511977777777"
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
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

const contacts = ref([])
const isImportModalOpen = ref(false)
const contactListText = ref('')

const totalContacts = computed(() => contacts.value.length)
const validContacts = computed(() => contacts.value.filter(c => c.status === 'valid').length)

const openImportModal = () => {
  isImportModalOpen.value = true
}

const closeImportModal = () => {
  isImportModalOpen.value = false
  contactListText.value = ''
}

const parseContactLine = (line) => {
  line = line.trim()
  if (!line) return null
  
  const commaMatch = line.match(/^(.+?),\s*(\d+)$/)
  if (commaMatch) {
    return {
      name: commaMatch[1].trim(),
      whatsapp: commaMatch[2].trim()
    }
  }
  
  const spaceMatch = line.match(/^(.+?)\s+(\d+)$/)
  if (spaceMatch) {
    return {
      name: spaceMatch[1].trim(),
      whatsapp: spaceMatch[2].trim()
    }
  }
  
  const numberOnly = line.match(/^(\d+)$/)
  if (numberOnly) {
    return {
      name: `Contato ${numberOnly[1].slice(-4)}`,
      whatsapp: numberOnly[1].trim()
    }
  }
  
  return null
}

const validateWhatsApp = (number) => {
  const cleaned = number.replace(/\D/g, '')
  return cleaned.length >= 10 && cleaned.length <= 15
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
        status: isValid ? 'valid' : 'invalid'
      })
    }
  })
  
  contacts.value = [...contacts.value, ...newContacts]
  closeImportModal()
  
  console.log(`Importados ${newContacts.length} contatos`)
}
</script>
