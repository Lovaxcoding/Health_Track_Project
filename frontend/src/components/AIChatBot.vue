<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-vue-next';
import api from '@/lib/api';

const isOpen = ref(false);
const userInput = ref('');
const messages = ref<any[]>([]);
const isLoading = ref(false); // État de chargement
const userId = 1;

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-scroll');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

onMounted(async () => {
  try {
    const response = await api.get(`/chat/${userId}`);
    messages.value = response.data;
    scrollToBottom();
  } catch (error) {
    console.error("Erreur historique chat", error);
  }
});

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  
  const text = userInput.value;
  userInput.value = '';
  isLoading.value = true; // On commence à charger

  try {
    const response = await api.post('/chat', { userId, content: text });
    messages.value.push(...response.data);
    scrollToBottom();
  } catch (error) {
    console.error("Erreur envoi", error);
  } finally {
    isLoading.value = false; // On arrête de charger
  }
};

const toggleChat = () => { isOpen.value = !isOpen.value; if(isOpen.value) scrollToBottom(); };
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <Transition name="fade-slide">
      <Card v-if="isOpen" class="mb-4 w-80 sm:w-96 h-125 shadow-2xl rounded-3xl border-none flex flex-col overflow-hidden">
        <div class="p-4 bg-pink-600 text-white flex justify-between items-center">
          <div class="flex items-center gap-2">
            <Bot class="w-5 h-5" />
            <span class="font-bold">Assistant HealthPulse</span>
          </div>
          <Button variant="ghost" size="icon" @click="toggleChat" class="text-white hover:bg-pink-700 rounded-full">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll no-scrollbar ">
          <div v-for="(msg, index) in messages" :key="index" 
            :class="['max-w-[85%] p-3 rounded-2xl text-sm shadow-sm', 
              msg.role === 'user' 
                ? 'bg-pink-600 text-white ml-auto rounded-tr-none' 
                : 'bg-white text-slate-800 mr-auto rounded-tl-none border border-slate-100']"
          >
            {{ msg.content }}
          </div>
          
          <div v-if="isLoading" class=" border border-slate-100 mr-auto p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-pink-600" />
            <span class="text-xs text-slate-500">L'IA analyse vos données...</span>
          </div>
        </div>

        <div class="p-4">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input 
              v-model="userInput"
              :disabled="isLoading"
              placeholder="Posez une question sur votre santé..." 
              class="flex-1  border  rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50"
            />
            <Button type="submit" :disabled="isLoading" size="icon" class="rounded-xl bg-pink-600 hover:bg-pink-700">
              <Send v-if="!isLoading" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
            </Button>
          </form>
        </div>
      </Card>
    </Transition>

    <Button @click="toggleChat" class="w-14 h-14 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 text-white">
      <MessageCircle v-if="!isOpen" class="w-6 h-6" />
      <X v-else class="w-6 h-6" />
    </Button>
  </div>
</template>