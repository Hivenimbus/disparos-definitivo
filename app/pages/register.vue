<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Criar conta</h2>
      <p class="text-gray-600">Preencha os dados para começar</p>
    </div>

    <div v-if="errorMessage" class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Nome completo</label>
        <input
          v-model="form.name"
          type="text"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Seu nome completo"
        >
      </div>

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
          placeholder="Mínimo 8 caracteres"
        >
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Confirmar senha</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Digite a senha novamente"
        >
      </div>

      <button
        type="submit"
        :disabled="isLoading"
        class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isLoading">Criar conta</span>
        <span v-else>Criando conta...</span>
      </button>
    </form>

    <div class="mt-6 text-center">
      <p class="text-sm text-gray-600">
        Já tem uma conta? 
        <NuxtLink to="/login" class="text-blue-600 hover:text-blue-700 font-medium">Faça login</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const supabase = useSupabaseClient()

const form = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errorMessage = ref('')
const isLoading = ref(false)

const handleRegister = async () => {
  errorMessage.value = ''
  
  if (!form.value.name || !form.value.email || !form.value.password || !form.value.confirmPassword) {
    errorMessage.value = 'Por favor, preencha todos os campos'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(form.value.email)) {
    errorMessage.value = 'Por favor, insira um email válido'
    return
  }

  if (form.value.password.length < 8) {
    errorMessage.value = 'A senha deve ter no mínimo 8 caracteres'
    return
  }

  if (form.value.password !== form.value.confirmPassword) {
    errorMessage.value = 'As senhas não coincidem'
    return
  }

  isLoading.value = true

  try {
    const { data, error } = await supabase.auth.signUp({
      email: form.value.email,
      password: form.value.password,
      options: {
        data: {
          full_name: form.value.name
        }
      }
    })

    if (error) throw error

    navigateTo('/')
  } catch (error) {
    errorMessage.value = error.message || 'Erro ao criar conta. Tente novamente.'
  } finally {
    isLoading.value = false
  }
}
</script>
