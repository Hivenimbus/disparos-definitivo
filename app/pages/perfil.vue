<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-4xl mx-auto px-6 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-8">Meu Perfil</h1>

      <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
        {{ successMessage }}
      </div>

      <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
        {{ errorMessage }}
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div class="flex items-center space-x-3 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800">Dados Pessoais</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-1 flex flex-col items-center">
            <div class="relative">
              <div v-if="previewUrl" class="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
                <img :src="previewUrl" alt="Foto de perfil" class="w-full h-full object-cover">
              </div>
              <div v-else class="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center border-4 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" class="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            
            <label class="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
              Alterar Foto
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg" 
                @change="handleFileChange"
                class="hidden"
              >
            </label>
            <p class="mt-2 text-xs text-gray-500 text-center">JPG ou PNG. Máx 2MB</p>
          </div>

          <div class="md:col-span-2 space-y-6">
            <div>
              <label class="block text-gray-700 font-medium mb-2">Nome</label>
              <input
                v-model="profileForm.name"
                type="text"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Seu nome completo"
              >
            </div>

            <div>
              <label class="block text-gray-700 font-medium mb-2">Email</label>
              <input
                :value="profileForm.email"
                type="email"
                disabled
                class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
              >
              <p class="mt-1 text-sm text-gray-500">O email não pode ser alterado</p>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button
                @click="cancelProfileChanges"
                class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                @click="saveProfileChanges"
                class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div class="flex items-center space-x-3 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 class="text-xl font-semibold text-gray-800">Segurança</h2>
        </div>

        <div class="space-y-4">
          <div>
            <label class="block text-gray-700 font-medium mb-2">Senha Atual</label>
            <input
              v-model="passwordForm.currentPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua senha atual"
            >
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Nova Senha</label>
            <input
              v-model="passwordForm.newPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Digite sua nova senha"
            >
            <p class="mt-1 text-sm text-gray-500">Mínimo de 8 caracteres</p>
          </div>

          <div>
            <label class="block text-gray-700 font-medium mb-2">Confirmar Nova Senha</label>
            <input
              v-model="passwordForm.confirmPassword"
              type="password"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Confirme sua nova senha"
            >
          </div>

          <div class="flex justify-end space-x-3 pt-4">
            <button
              @click="cancelPasswordChanges"
              class="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="changePassword"
              class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Alterar Senha
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const profileForm = ref({
  name: 'João Silva',
  email: 'joao.silva@example.com',
  photo: null
})

const originalProfile = ref({
  name: 'João Silva',
  email: 'joao.silva@example.com',
  photo: null
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const previewUrl = ref(null)
const successMessage = ref('')
const errorMessage = ref('')

const handleFileChange = (event) => {
  const file = event.target.files[0]
  
  if (!file) return
  
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    showError('Por favor, selecione uma imagem JPG ou PNG')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    showError('A imagem deve ter no máximo 2MB')
    return
  }
  
  profileForm.value.photo = file
  
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const saveProfileChanges = () => {
  if (!profileForm.value.name.trim()) {
    showError('O nome não pode estar vazio')
    return
  }
  
  originalProfile.value.name = profileForm.value.name
  originalProfile.value.photo = profileForm.value.photo
  
  showSuccess('Dados pessoais atualizados com sucesso!')
  
  console.log('Perfil atualizado:', {
    name: profileForm.value.name,
    photo: profileForm.value.photo
  })
}

const cancelProfileChanges = () => {
  profileForm.value.name = originalProfile.value.name
  profileForm.value.photo = originalProfile.value.photo
  
  if (!profileForm.value.photo) {
    previewUrl.value = null
  }
}

const changePassword = () => {
  if (!passwordForm.value.currentPassword) {
    showError('Digite sua senha atual')
    return
  }
  
  if (!passwordForm.value.newPassword) {
    showError('Digite sua nova senha')
    return
  }
  
  if (passwordForm.value.newPassword.length < 8) {
    showError('A nova senha deve ter no mínimo 8 caracteres')
    return
  }
  
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    showError('As senhas não coincidem')
    return
  }
  
  showSuccess('Senha alterada com sucesso!')
  
  console.log('Senha alterada')
  
  passwordForm.value.currentPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
}

const cancelPasswordChanges = () => {
  passwordForm.value.currentPassword = ''
  passwordForm.value.newPassword = ''
  passwordForm.value.confirmPassword = ''
}

const showSuccess = (message) => {
  successMessage.value = message
  errorMessage.value = ''
  setTimeout(() => {
    successMessage.value = ''
  }, 5000)
}

const showError = (message) => {
  errorMessage.value = message
  successMessage.value = ''
  setTimeout(() => {
    errorMessage.value = ''
  }, 5000)
}
</script>
