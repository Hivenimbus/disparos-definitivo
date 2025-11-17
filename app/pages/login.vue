<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
      <p class="text-gray-600">Faça login para continuar</p>
    </div>

    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Email</label>
        <input
          v-model="form.email"
          type="email"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="seu@email.com"
        >
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Senha</label>
        <input
          v-model="form.password"
          type="password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Digite sua senha"
        >
      </div>

      <div class="flex items-center justify-between">
        <label class="flex items-center">
          <input
            v-model="form.remember"
            type="checkbox"
            class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          >
          <span class="ml-2 text-sm text-gray-700">Lembrar-me</span>
        </label>
        <a href="#" class="text-sm text-blue-600 hover:text-blue-700">Esqueceu a senha?</a>
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">Entrar</span>
        <span v-else>Entrando...</span>
      </button>
    </form>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'auth',
  middleware: ['guest']
})

const form = ref({
  email: '',
  password: '',
  remember: false
})

const errorMessage = ref('')
const isLoading = ref(false)

const nuxtApp = useNuxtApp()
const request = nuxtApp.$fetch ?? $fetch

const handleLogin = async () => {
  errorMessage.value = ''
  
  if (!form.value.email || !form.value.password) {
    errorMessage.value = 'Por favor, preencha todos os campos'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errorMessage.value = 'Por favor, insira um email válido'
    return
  }

  isLoading.value = true

  try {
    const { user } = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: form.value.email,
        password: form.value.password
      }
    })

    const authUser = useAuthUser()
    authUser.value = user

    const destination = user.mustChangePassword ? '/definir-senha' : '/dashboard'

    await navigateTo(destination, { replace: true })
  } catch (error) {
    const statusError = error as { status?: number; statusMessage?: string }
    if (statusError?.status === 403) {
      errorMessage.value = statusError.statusMessage || 'Sua conta está desativada. Entre em contato com o suporte.'
    } else {
      errorMessage.value = statusError?.statusMessage || 'Email ou senha incorretos'
    }
  } finally {
    isLoading.value = false
  }
}
</script>
