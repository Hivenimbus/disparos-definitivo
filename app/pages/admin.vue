<template>
  <div>
    <div class="flex border-b border-gray-200 mb-6">
      <button
        @click="activeTab = 'usuarios'"
        class="px-6 py-3 font-semibold transition-colors border-b-2"
        :class="{
          'text-blue-600 border-blue-600': activeTab === 'usuarios',
          'text-gray-600 border-transparent hover:text-gray-800': activeTab !== 'usuarios'
        }"
      >
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>Usuários</span>
        </div>
      </button>
      <button
        @click="activeTab = 'empresas'"
        class="px-6 py-3 font-semibold transition-colors border-b-2"
        :class="{
          'text-blue-600 border-blue-600': activeTab === 'empresas',
          'text-gray-600 border-transparent hover:text-gray-800': activeTab !== 'empresas'
        }"
      >
        <div class="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Empresas</span>
        </div>
      </button>
    </div>

    <UserManagement v-if="activeTab === 'usuarios'" />
    <CompanyManagement v-if="activeTab === 'empresas'" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

definePageMeta({
  layout: 'admin'
})

const activeTab = ref('usuarios')
</script>
