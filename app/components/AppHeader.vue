<template>
  <header class="bg-[#f8f9fa] shadow-sm border-b border-gray-200">
    <div class="px-8 py-3 flex items-center justify-between">
      <div class="flex items-center space-x-16">
        <h1 class="text-2xl font-bold">
          <span class="text-gray-900">Hive</span><span class="text-blue-600">Connect</span>
        </h1>
        
        <nav class="flex items-center space-x-8">
          <a
            v-for="item in menuItems"
            :key="item.name"
            href="#"
            class="flex items-center space-x-2 font-normal transition-colors"
            :class="item.active ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'"
          >
            <component :is="item.icon" class="w-4 h-4" />
            <span class="text-sm">{{ item.name }}</span>
          </a>
        </nav>
      </div>

      <div class="relative">
        <button
          @click="toggleDropdown"
          class="flex items-center space-x-2 text-gray-800 hover:text-gray-900 focus:outline-none"
        >
          <div class="w-9 h-9 bg-gray-800 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <span class="text-sm font-normal">João Silva</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4 transition-transform" :class="{ 'rotate-180': isDropdownOpen }" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        <div
          v-if="isDropdownOpen"
          class="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10"
        >
          <a
            v-for="option in dropdownOptions"
            :key="option.name"
            href="#"
            class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            {{ option.name }}
          </a>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const isDropdownOpen = ref(false)

const menuItems = [
  {
    name: 'Dashboard',
    active: true,
    icon: 'IconDashboard'
  },
  {
    name: 'Contatos',
    active: false,
    icon: 'IconContacts'
  },
  {
    name: 'Campanhas',
    active: false,
    icon: 'IconCampaigns'
  },
  {
    name: 'Configurações',
    active: false,
    icon: 'IconSettings'
  }
]

const dropdownOptions = [
  { name: 'Meu Perfil' },
  { name: 'Configurações' },
  { name: 'Sair' }
]

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
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
