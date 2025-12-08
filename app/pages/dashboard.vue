<template>
  <div class="space-y-4 md:space-y-6">
    <WhatsAppConnection />
    <ContactList />
    <MessageComposer />
  </div>
  <ToastContainer />
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
})
</script>


