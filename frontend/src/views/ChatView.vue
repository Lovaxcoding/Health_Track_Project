<script setup lang="ts">
import { ref } from 'vue'
import { Sparkles } from 'lucide-vue-next' // Ou n'importe quel icône d'IA

const messages = ref([]) // Initialement vide pour tester
</script>
<template>
  <div class="chat-container flex flex-col h-150 w-full max-w-2xl mx-auto border rounded-xl bg-background/50 backdrop-blur-md shadow-xl">
    
    <div class="flex-1 overflow-y-auto p-6 space-y-4">
      
      <div v-if="messages.length === 0" class="h-full flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20 shadow-inner">
          <Sparkles class="w-10 h-10 text-primary animate-pulse" />
        </div>

        <div class="space-y-2">
          <h2 class="text-2xl font-bold tracking-tight">HealthPulse AI</h2>
          <p class="text-muted-foreground max-w-70 text-sm leading-relaxed">
            Votre assistant intelligent pour analyser vos constantes et vous accompagner vers vos objectifs bien-être.
          </p>
        </div>

        <div class="bg-primary/5 px-4 py-2 rounded-full border border-primary/10 text-xs font-medium text-primary">
          👋 Bonjour Jean ! Comment puis-je vous aider aujourd'hui ?
        </div>
      </div>

      <!-- <div v-else v-for="msg in messages" :key="msg.id" :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']">
        <div :class="['max-w-[80%] p-3 rounded-2xl', msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground']">
          {{ msg.content }}
        </div>
      </div> -->
    </div>

    </div>
</template>

