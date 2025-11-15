<template>
  <div class="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
    <div class="mb-8 text-center">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">Defina sua nova senha</h2>
      <p class="text-gray-600">Para continuar usando o sistema, escolha uma senha pessoal.</p>
    </div>

    <div
      v-if="errorMessage"
      class="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm"
    >
      {{ errorMessage }}
    </div>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div>
        <label class="block text-gray-700 font-medium mb-2">Nova senha</label>
        <input
          v-model="form.newPassword"
          type="password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Mínimo de 8 caracteres"
        >
      </div>

      <div>
        <label class="block text-gray-700 font-medium mb-2">Confirme a nova senha</label>
        <input
          v-model="form.confirmPassword"
          type="password"
          required
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Repita a nova senha"
        >
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="!isSubmitting">Salvar nova senha</span>
        <span v-else>Salvando...</span>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

definePageMeta({
  layout: 'auth',
  middleware: ['auth']
})

const form = ref({
  newPassword: '',
  confirmPassword: ''
})

const isSubmitting = ref(false)
const errorMessage = ref('')
const authUser = useAuthUser()

watch(
  () => authUser.value?.mustChangePassword,
  (mustChange) => {
    if (mustChange === false) {
      navigateTo('/dashboard', { replace: true })
    }
  }
)

const handleSubmit = async () => {
  errorMessage.value = ''

  if (form.value.newPassword.length < 8) {
    errorMessage.value = 'A senha deve ter ao menos 8 caracteres.'
    return
  }

  if (form.value.newPassword !== form.value.confirmPassword) {
    errorMessage.value = 'As senhas não coincidem.'
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/auth/set-password', {
      method: 'POST',
      body: {
        newPassword: form.value.newPassword,
        confirmPassword: form.value.confirmPassword
      }
    })

    if (authUser.value) {
      authUser.value = {
        ...authUser.value,
        mustChangePassword: false
      }
    }

    await navigateTo('/dashboard', { replace: true })
  } catch (error: any) {
    errorMessage.value = error?.statusMessage || 'Não foi possível atualizar a senha.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

