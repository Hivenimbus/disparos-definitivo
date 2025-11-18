<template>
  <div>
    <ManagerUserManagement />
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'gerente']
})
</script>



