<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Criar sua conta</h2>
      <p class="text-gray-600">Preencha os dados abaixo para se registrar</p>
    </div>

    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
      {{ errorMessage }}
    </div>

    <div v-if="successMessage" class="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
      {{ successMessage }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Nome completo</label>
        <input
          v-model="form.name"
          type="text"
          required
          :class="['w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                   errors.name ? 'border-red-300' : 'border-gray-300']"
          placeholder="Digite seu nome completo"
        >
        <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          :class="['w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                   errors.email ? 'border-red-300' : 'border-gray-300']"
          placeholder="seu@email.com"
        >
        <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Senha</label>
        <div class="relative">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            required
            :class="['w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10',
                     errors.password ? 'border-red-300' : 'border-gray-300']"
            placeholder="Digite sua senha"
          >
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg v-if="showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
        <div class="mt-2">
          <div class="flex items-center space-x-2">
            <div class="flex-1 bg-gray-200 rounded-full h-2">
              <div
                :class="['h-2 rounded-full transition-all duration-300', passwordStrengthColor]"
                :style="{ width: passwordStrengthPercentage + '%' }"
              ></div>
            </div>
            <span class="text-xs text-gray-600">{{ passwordStrengthText }}</span>
          </div>
        </div>
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Confirmar senha</label>
        <div class="relative">
          <input
            v-model="form.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            required
            :class="['w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10',
                     errors.confirmPassword ? 'border-red-300' : 'border-gray-300']"
            placeholder="Digite sua senha novamente"
          >
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            <svg v-if="showConfirmPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path>
            </svg>
            <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
          </button>
        </div>
        <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
      </div>

      <div class="flex items-center">
        <input
          v-model="form.terms"
          type="checkbox"
          :class="['w-4 h-4 border rounded focus:ring-blue-500',
                   errors.terms ? 'border-red-300' : 'border-gray-300']"
          class="text-blue-600"
        >
        <span class="ml-2 text-sm text-gray-700">
          Concordo com os
          <a href="#" class="text-blue-600 hover:text-blue-700">termos de uso</a> e
          <a href="#" class="text-blue-600 hover:text-blue-700">política de privacidade</a>
        </span>
      </div>
      <p v-if="errors.terms" class="text-sm text-red-600">{{ errors.terms }}</p>

      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">Criar conta</span>
        <span v-else>Criando conta...</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <span class="text-sm text-gray-600">
        Já tem uma conta?
        <NuxtLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">
          Faça login
        </NuxtLink>
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

definePageMeta({
  layout: 'auth'
})

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  terms: false
})

const errors = ref({})
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0

  let strength = 0

  if (password.length >= 8) strength++
  if (password.length >= 12) strength++
  if (/[a-z]/.test(password)) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[0-9]/.test(password)) strength++
  if (/[^A-Za-z0-9]/.test(password)) strength++

  return Math.min(strength, 4)
})

const passwordStrengthPercentage = computed(() => {
  return (passwordStrength.value / 4) * 100
})

const passwordStrengthColor = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return 'bg-gray-300'
  if (strength === 1) return 'bg-red-500'
  if (strength === 2) return 'bg-yellow-500'
  if (strength === 3) return 'bg-blue-500'
  return 'bg-green-500'
})

const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength === 0) return ''
  if (strength === 1) return 'Fraca'
  if (strength === 2) return 'Média'
  if (strength === 3) return 'Forte'
  return 'Muito forte'
})

const isFormValid = computed(() => {
  return form.value.name &&
         form.value.email &&
         form.value.password &&
         form.value.confirmPassword &&
         form.value.terms &&
         Object.keys(errors.value).length === 0
})

const validateForm = () => {
  errors.value = {}

  if (!form.value.name.trim()) {
    errors.value.name = 'Nome é obrigatório'
  } else if (form.value.name.trim().length < 3) {
    errors.value.name = 'Nome deve ter pelo menos 3 caracteres'
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.value.email) {
    errors.value.email = 'Email é obrigatório'
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'Por favor, insira um email válido'
  }

  if (!form.value.password) {
    errors.value.password = 'Senha é obrigatória'
  } else if (form.value.password.length < 8) {
    errors.value.password = 'Senha deve ter pelo menos 8 caracteres'
  } else if (passwordStrength.value < 2) {
    errors.value.password = 'Senha muito fraca. Adicione números, letras maiúsculas ou caracteres especiais'
  }

  if (!form.value.confirmPassword) {
    errors.value.confirmPassword = 'Confirmação de senha é obrigatória'
  } else if (form.value.password !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'As senhas não coincidem'
  }

  if (!form.value.terms) {
    errors.value.terms = 'Você precisa aceitar os termos de uso para continuar'
  }

  return Object.keys(errors.value).length === 0
}

const handleRegister = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    return
  }

  isLoading.value = true

  setTimeout(() => {
    console.log('Registration:', form.value)

    try {
      successMessage.value = 'Conta criada com sucesso! Redirecionando para o login...'

      setTimeout(() => {
        navigateTo('/login')
      }, 2000)

    } catch (error) {
      errorMessage.value = 'Ocorreu um erro ao criar sua conta. Tente novamente.'
    } finally {
      isLoading.value = false
    }
  }, 1500)
}
</script>