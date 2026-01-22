<script setup lang="ts">
import { ref, watch } from 'vue'
import { useColorMode } from '@vueuse/core'
import { Icon } from '@iconify/vue'

const mode = useColorMode()
const isAnimating = ref(false)

function toggleTheme() {
  isAnimating.value = true
  mode.value = mode.value === 'dark' ? 'light' : 'dark'
  setTimeout(() => (isAnimating.value = false), 700)
}
</script>

<template>
  <button
    @click="toggleTheme"
    class="relative h-[2.4rem] w-[4.6rem] rounded-2xl overflow-hidden
           flex items-center justify-center
           transition-all duration-500
           bg-slate-100 dark:bg-slate-900
           hover:scale-110 active:scale-95
           shadow-md dark:shadow-xl"
  >
    <!-- Ripple -->
    <span
      v-if="isAnimating"
      class="absolute inset-0 rounded-full animate-ripple
             bg-yellow-300/30 dark:bg-indigo-400/30"
    />

    <!-- Sun -->
    <Icon
      icon="radix-icons:sun"
      class="absolute h-6 w-6 text-yellow-500 transition-all duration-700
             rotate-0 scale-100 opacity-100
             dark:rotate-90 dark:scale-0 dark:opacity-0"
    />

    <!-- Moon -->
    <Icon
      icon="radix-icons:moon"
      class="absolute h-6 w-6 text-indigo-400 transition-all duration-700
             -rotate-90 scale-0 opacity-0
             dark:rotate-0 dark:scale-100 dark:opacity-100"
    />
  </button>
</template>

<style scoped>
@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 0.6;
  }
  100% {
    transform: scale(2.5);
    opacity: 0;
  }
}

.animate-ripple {
  animation: ripple 700ms ease-out;
}
</style>
