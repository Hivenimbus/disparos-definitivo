<template>
  <div class="sticky top-0 z-50">
    <header class="bg-white shadow-sm border-b border-gray-200">
      <div class="px-8 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-16">
          <NuxtLink to="/" class="block h-12">
            <img
              src="/Logo.png"
              alt="Logo HiveConnect"
              class="h-full w-auto object-contain"
              decoding="async"
              loading="lazy"
            />
          </NuxtLink>
          
          <nav class="flex items-center space-x-8">
            <template v-for="item in availableMenuItems" :key="item.name">
              <NuxtLink
                v-if="item.name !== 'Configurações'"
                :to="item.path"
                class="flex items-center space-x-2.5 font-semibold transition-colors"
                :class="$route.path === item.path ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'"
              >
                <svg v-if="item.icon === 'IconDashboard'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
                <svg v-if="item.icon === 'IconContacts'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <svg v-if="item.icon === 'IconCampaigns'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <svg v-if="item.icon === 'IconDisparos'" xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span class="text-base">{{ item.name }}</span>
              </NuxtLink>

              <button
                v-else
                @click="toggleConfigPanel"
                class="flex items-center space-x-2.5 font-semibold transition-colors"
                :class="isConfigOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span class="text-base">{{ item.name }}</span>
              </button>
            </template>
          </nav>
        </div>

        <div class="relative">
          <button
            @click="toggleDropdown"
            class="flex items-center space-x-2.5 text-gray-800 hover:text-gray-900 focus:outline-none"
          >
            <div class="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span class="text-base font-normal">{{ displayName }}</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            v-if="isDropdownOpen"
            class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
          >
            <NuxtLink
              v-for="option in availableDropdownOptions"
              :key="option.name"
              :to="option.path"
              @click="isDropdownOpen = false"
              class="block px-4 py-2 text-base text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {{ option.name }}
            </NuxtLink>
          <button
            type="button"
            @click="handleLogout"
            class="w-full text-left px-4 py-2 text-base text-red-600 hover:bg-red-50 transition-colors"
          >
            Sair
          </button>
          </div>
        </div>
      </div>
    </header>

    <div
      v-if="isConfigOpen"
      class="bg-gray-50 transition-all duration-300"
    >
      <div class="max-w-7xl mx-auto px-6 py-8">
        <section class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center space-x-3 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 class="text-xl font-semibold text-gray-800">Configuração de Disparos</h2>
          </div>

          <div v-if="configError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {{ configError }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="bg-gray-50 rounded-lg p-5">
              <label class="block text-gray-800 font-medium mb-3">Intervalo entre mensagens</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="configForm.intervalo"
                  type="number"
                  min="1"
                  class="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="isConfigLoading"
                />
                <span class="text-gray-600">segundos</span>
              </div>
            </div>

            <div class="bg-gray-50 rounded-lg p-5">
              <label class="block text-gray-800 font-medium mb-3">Limite diário de mensagens</label>
              <div class="flex items-center space-x-3">
                <input
                  v-model.number="configForm.limite"
                  type="number"
                  min="1"
                  class="w-28 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="isConfigLoading"
                />
                <span class="text-gray-600">mensagens</span>
              </div>
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="saveConfigurations"
              :disabled="isConfigLoading"
              class="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>{{ isConfigLoading ? 'Salvando...' : 'Salvar Configurações' }}</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const logout = useLogout()
const authUser = useAuthUser()

const isDropdownOpen = ref(false)
const isConfigOpen = ref(false)

const isConfigLoading = ref(false)
const configError = ref('')
const configForm = ref({
  intervalo: 10,
  limite: 1000
})

const menuItems = [
  {
    name: 'Dashboard',
    path: '/dashboard',
    icon: 'IconDashboard'
  },
  {
    name: 'Contatos',
    path: '/dashboard#contatos',
    icon: 'IconContacts'
  },
  {
    name: 'Campanhas',
    path: '/campanhas',
    icon: 'IconCampaigns'
  },
  {
    name: 'Disparos',
    path: '/disparos',
    icon: 'IconDisparos'
  },
  {
    name: 'Configurações',
    path: '/configuracoes',
    icon: 'IconSettings'
  },
  {
    name: 'Painel Admin',
    path: '/admin',
    icon: 'IconDashboard',
    requiresAdmin: true
  },
  {
    name: 'Painel Gerente',
    path: '/gerente',
    icon: 'IconDashboard',
    requiresManager: true
  }
]

const dropdownOptions = [
  { name: 'Meu Perfil', path: '/perfil' },
  { name: 'Painel Admin', path: '/admin', requiresAdmin: true },
  { name: 'Painel Gerente', path: '/gerente', requiresManager: true }
]

const displayName = computed(() => {
  return authUser.value?.nome || authUser.value?.name || 'Usuário'
})

const availableMenuItems = computed(() => {
  return menuItems.filter((item) => {
    if (item.requiresAdmin) {
      return authUser.value?.role === 'admin'
    }
    if (item.requiresManager) {
      return authUser.value?.role === 'manager'
    }
    return true
  })
})

const availableDropdownOptions = computed(() => {
  return dropdownOptions.filter((option) => {
    if (option.requiresAdmin) {
      return authUser.value?.role === 'admin'
    }
    if (option.requiresManager) {
      return authUser.value?.role === 'manager'
    }
    return true
  })
})

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const toggleConfigPanel = () => {
  isConfigOpen.value = !isConfigOpen.value
}

const loadConfigurations = async () => {
  configError.value = ''
  isConfigLoading.value = true
  try {
    const { configuracoes } = await $fetch('/api/configuracoes')
    configForm.value.intervalo = configuracoes.intervalo
    configForm.value.limite = configuracoes.limite
  } catch (error) {
    configError.value = error?.statusMessage || 'Erro ao carregar configurações'
  } finally {
    isConfigLoading.value = false
  }
}

watch(
  () => isConfigOpen.value,
  (open) => {
    if (open) {
      loadConfigurations()
    }
  }
)

onMounted(() => {
  if (isConfigOpen.value) {
    loadConfigurations()
  }
})

const saveConfigurations = async () => {
  configError.value = ''
  isConfigLoading.value = true
  try {
    const { configuracoes } = await $fetch('/api/configuracoes', {
      method: 'PUT',
      body: {
        intervalo: Number(configForm.value.intervalo),
        limite: Number(configForm.value.limite)
      }
    })
    configForm.value.intervalo = configuracoes.intervalo
    configForm.value.limite = configuracoes.limite
  } catch (error) {
    configError.value = error?.statusMessage || 'Erro ao salvar configurações'
  } finally {
    isConfigLoading.value = false
  }
}

const handleLogout = async () => {
  isDropdownOpen.value = false
  await logout()
}

const IconDashboard = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
    </svg>
  `
}

const IconContacts = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  `
}

const IconCampaigns = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  `
}

const IconSettings = {
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  `
}
</script>
