<template>
  <div class="space-y-6">
    <WhatsAppConnection />
    <ContactList />
    <MessageComposer />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: 'auth'
})
</script>
