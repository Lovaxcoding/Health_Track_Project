<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Bot, Loader2, Sparkles } from 'lucide-vue-next'; // Ajout Sparkles
import api from '@/lib/api';

const isOpen = ref(false);
const userInput = ref('');
const messages = ref<any[]>([]);
const isLoading = ref(false);

// ✅ Récupération dynamique de l'utilisateur (pour le nom et la sécurité)
const userRaw = localStorage.getItem('user');
const currentUser = userRaw ? JSON.parse(userRaw) : { name: 'Utilisateur' };

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-scroll');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

onMounted(async () => {
  try {
    // ✅ On appelle juste /chat (le middleware backend fera le reste avec le token)
    const response = await api.get('/chat');
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
  isLoading.value = true;

  try {
    // ✅ On n'envoie plus le userId dans le body, le JWT s'en occupe !
    const response = await api.post('/chat', { content: text });
    messages.value.push(...response.data);
    scrollToBottom();
  } catch (error) {
    console.error("Erreur envoi", error);
  } finally {
    isLoading.value = false;
  }
};

const toggleChat = () => { 
  isOpen.value = !isOpen.value; 
  if(isOpen.value) scrollToBottom(); 
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <Transition name="fade-slide">
      <Card v-if="isOpen" class="mb-4 w-80 sm:w-96 h-125 shadow-2xl rounded-3xl border-none flex flex-col overflow-hidden bg-slate-50">
        <div class="p-4 bg-pink-600 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2">
            <div class="bg-white/20 p-1.5 rounded-lg">
              <Bot class="w-5 h-5" />
            </div>
            <span class="font-bold">Assistant HealthPulse</span>
          </div>
          <Button variant="ghost" size="icon" @click="toggleChat" class="text-white hover:bg-pink-700 rounded-full">
            <X class="w-4 h-4" />
          </Button>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll no-scrollbar">
          
          <div v-if="messages.length === 0 && !isLoading" class="h-full flex flex-col items-center justify-center text-center p-4 animate-in fade-in zoom-in duration-700">
            <div class="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Sparkles class="w-8 h-8 text-pink-600 animate-pulse" />
            </div>
            <h3 class="text-lg font-bold text-slate-800">HealthPulse AI</h3>
            <p class="text-xs text-slate-500 mb-4 px-6">
              Je suis votre assistant santé. Je peux analyser vos données cardiaques ou répondre à vos questions bien-être.
            </p>
            <div class="bg-white px-4 py-2 rounded-2xl border border-pink-100 text-[11px] font-medium text-pink-600 shadow-sm">
              👋 Bonjour {{ currentUser.name }} ! Que puis-je faire pour vous ?
            </div>
          </div>

          <div v-for="(msg, index) in messages" :key="index" 
            :class="['max-w-[85%] p-3 rounded-2xl text-sm shadow-sm transition-all', 
              msg.role === 'user' 
                ? 'bg-pink-600 text-white ml-auto rounded-tr-none' 
                : 'bg-white text-slate-800 mr-auto rounded-tl-none border border-slate-100']"
          >
            {{ msg.content }}
          </div>
          
          <div v-if="isLoading" class="bg-white border border-slate-100 mr-auto p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-pink-600" />
            <span class="text-[11px] text-slate-500">L'IA réfléchit...</span>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-slate-100">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input 
              v-model="userInput"
              :disabled="isLoading"
              placeholder="Posez votre question..." 
              class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50"
            />
            <Button type="submit" :disabled="isLoading || !userInput.trim()" size="icon" class="rounded-xl bg-pink-600 hover:bg-pink-700 transition-all">
              <Send v-if="!isLoading" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
            </Button>
          </form>
        </div>
      </Card>
    </Transition>

    <Button @click="toggleChat" class="w-14 h-14 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 text-white transition-transform active:scale-95">
      <MessageCircle v-if="!isOpen" class="w-6 h-6" />
      <X v-else class="w-6 h-6" />
    </Button>
  </div>
</template>