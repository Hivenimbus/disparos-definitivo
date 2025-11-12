<template>
  <section class="bg-white rounded-lg shadow p-6 mb-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center space-x-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
        <h2 class="text-xl font-semibold text-gray-800">Conexão WhatsApp</h2>
      </div>
      <span class="flex items-center space-x-2 text-red-500 text-sm font-medium">
        <span class="w-2 h-2 bg-red-500 rounded-full"></span>
        <span>Desconectado</span>
      </span>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="flex items-center justify-center bg-gray-100 rounded-lg p-8">
        <div class="text-center">
          <div class="w-48 h-48 bg-white rounded-lg flex items-center justify-center mb-4 mx-auto">
            <div class="grid grid-cols-2 gap-2">
              <div class="w-16 h-16 bg-gray-300 rounded"></div>
              <div class="w-16 h-16 bg-gray-300 rounded"></div>
              <div class="w-16 h-16 bg-gray-300 rounded"></div>
              <div class="w-16 h-16 bg-gray-300 rounded"></div>
            </div>
          </div>
          <p class="text-gray-600 text-sm">Aguardando QR Code</p>
        </div>
      </div>

      <div class="flex flex-col justify-center">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Como conectar:</h3>
        <ol class="space-y-3 mb-6">
          <li class="flex items-start">
            <span class="text-gray-600 font-medium mr-2">1.</span>
            <span class="text-gray-700">Abra o WhatsApp no seu celular</span>
          </li>
          <li class="flex items-start">
            <span class="text-gray-600 font-medium mr-2">2.</span>
            <span class="text-gray-700">Toque em Menu ou Configurações e selecione WhatsApp Web</span>
          </li>
          <li class="flex items-start">
            <span class="text-gray-600 font-medium mr-2">3.</span>
            <span class="text-gray-700">Aponte seu celular para esta tela para capturar o código QR</span>
          </li>
        </ol>

        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span>Iniciar Conexão</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
</script>
