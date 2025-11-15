<template>
  <Teleport to="body">
    <div v-if="toasts.length" class="fixed inset-0 pointer-events-none z-[1200]">
      <div class="absolute top-4 right-4 w-full max-w-sm flex flex-col space-y-3 ml-auto">
        <TransitionGroup
          tag="div"
          enter-active-class="transform transition duration-200"
          enter-from-class="translate-x-6 opacity-0"
          enter-to-class="translate-x-0 opacity-100"
          leave-active-class="transform transition duration-200"
          leave-from-class="translate-x-0 opacity-100"
          leave-to-class="translate-x-6 opacity-0"
        >
          <div
            v-for="toastItem in toasts"
            :key="toastItem.id"
            class="pointer-events-auto rounded-lg shadow-lg border px-4 py-3 flex items-start space-x-3"
            :class="typeClasses[toastItem.type]"
          >
            <div class="w-5 h-5 flex items-center justify-center mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  v-if="toastItem.type === 'success'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
                <path
                  v-else-if="toastItem.type === 'error'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
                <path
                  v-else-if="toastItem.type === 'warning'"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 8v4m0 4h.01M12 4L2 20h20L12 4z"
                />
                <path
                  v-else
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div class="flex-1 text-sm whitespace-pre-line text-gray-800">
              <p>{{ toastItem.message }}</p>
            </div>
            <button
              class="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
              @click="dismiss(toastItem.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { toasts, removeToast } = useToast()

const dismiss = (id: string) => {
  removeToast(id)
}

const typeClasses: Record<string, string> = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}
</script>

