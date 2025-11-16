<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <NuxtLink to="/" class="inline-block h-16">
          <img
            src="/Logo.png"
            alt="Logo HiveConnect"
            class="h-full w-auto object-contain mx-auto"
            decoding="async"
            loading="lazy"
          />
        </NuxtLink>
      </div>
      
      <slot />
    </div>
  </div>
</template>

<script setup>
</script>
