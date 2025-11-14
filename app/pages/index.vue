<template></template>

<script setup>
definePageMeta({
  middleware: [
    'auth',
    () => navigateTo('/dashboard', { replace: true })
  ]
})
</script>

