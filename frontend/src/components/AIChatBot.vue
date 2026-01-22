<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog'; // ✅ Import de l'AlertDialog
import { MessageCircle, X, Send, Bot, Loader2, Sparkles, Trash2 } from 'lucide-vue-next';
import api from '@/lib/api';
import { useI18n } from 'vue-i18n';
import MarkdownIt from 'markdown-it';

const { t } = useI18n();
const md = new MarkdownIt({ breaks: true, linkify: true });

const isOpen = ref(false);
const userInput = ref('');
const messages = ref<any[]>([]);
const isLoading = ref(false);
const isDeleting = ref(false); // ✅ Loader pour la suppression

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
    const response = await api.get('/chat');
    messages.value = response.data;
    scrollToBottom();
  } catch (error) {
    console.error("Erreur historique chat", error);
  }
});

const renderMarkdown = (content: string) => md.render(content);

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return;
  const text = userInput.value;
  userInput.value = '';
  isLoading.value = true;

  try {
    const response = await api.post('/chat', { content: text });
    messages.value.push(...response.data);
    scrollToBottom();
  } catch (error) {
    console.error("Erreur envoi", error);
  } finally {
    isLoading.value = false;
  }
};

// ✅ Fonction de suppression liée au Backend
const clearChat = async () => {
  isDeleting.value = true;
  try {
    await api.delete('/chat');
    messages.value = []; // Vide l'écran
  } catch (error) {
    console.error("Erreur suppression", error);
  } finally {
    isDeleting.value = false;
  }
};

const toggleChat = () => {
  isOpen.value = !isOpen.value;
  if (isOpen.value) scrollToBottom();
};
</script>

<template>
  <div class="fixed bottom-6 right-6 z-50 flex flex-col items-end">
    <Transition name="fade-slide">
      <Card v-if="isOpen"
        class="mb-4 w-80 sm:w-96 h-[500px] shadow-2xl rounded-3xl border-none flex flex-col overflow-hidden bg-slate-50">

        <div class="p-4 bg-pink-600 text-white flex justify-between items-center shadow-md">
          <div class="flex items-center gap-2">
            <div class="bg-white/20 p-1.5 rounded-lg">
              <Bot class="w-5 h-5" />
            </div>
            <span class="font-bold">{{ t('chat.title') }}</span>
          </div>

          <div class="flex items-center gap-1">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" class="text-white hover:bg-pink-700 h-8 w-8 rounded-full">
                  <Trash2 class="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent class="rounded-3xl border-none">
                <AlertDialogHeader>
                  <AlertDialogTitle>{{ t('chat.confirmDeleteTitle') }}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {{ t('chat.confirmDeleteDesc') }}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel class="rounded-xl border-slate-200">
                    {{ t('chat.cancel') }}
                  </AlertDialogCancel>
                  <AlertDialogAction @click="clearChat" class="bg-pink-600 hover:bg-pink-700 rounded-xl text-white">
                    <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin mr-2" />
                    {{ t('chat.confirm') }}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button variant="ghost" size="icon" @click="toggleChat"
              class="text-white hover:bg-pink-700 h-8 w-8 rounded-full">
              <X class="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 space-y-4 chat-scroll no-scrollbar">
          <div v-if="messages.length === 0 && !isLoading"
            class="h-full flex flex-col items-center justify-center text-center p-4">
            <div class="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4">
              <Sparkles class="w-8 h-8 text-pink-600 animate-pulse" />
            </div>
            <h3 class="text-lg font-bold text-slate-800">HealthPulse AI</h3>
            <p class="text-xs text-slate-500 mb-4 px-6">{{ t('chat.description') }}</p>
            <div
              class="bg-white px-4 py-2 rounded-2xl border border-pink-100 text-[11px] font-medium text-pink-600 shadow-sm">
              {{ t('chat.welcome', { name: currentUser.name }) }}
            </div>
          </div>

          <div v-for="(msg, index) in messages" :key="index"
            :class="['max-w-[85%] p-3 rounded-2xl text-sm shadow-sm transition-all',
              msg.role === 'user' ? 'bg-pink-600 text-white ml-auto rounded-tr-none' : 'bg-white text-slate-800 mr-auto rounded-tl-none border border-slate-100']">
            <div v-if="msg.role === 'assistant'" class="markdown-body" v-html="renderMarkdown(msg.content)"></div>
            <div v-else>{{ msg.content }}</div>
          </div>

          <div v-if="isLoading"
            class="bg-white border border-slate-100 mr-auto p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
            <Loader2 class="w-4 h-4 animate-spin text-pink-600" />
            <span class="text-[11px] text-slate-500">{{ t('chat.thinking') }}</span>
          </div>
        </div>

        <div class="p-4 bg-white border-t border-slate-100">
          <form @submit.prevent="sendMessage" class="flex gap-2">
            <input v-model="userInput" :disabled="isLoading" :placeholder="t('chat.placeholder')"
              class="flex-1 bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-pink-500 outline-none disabled:opacity-50" />
            <Button type="submit" :disabled="isLoading || !userInput.trim()" size="icon"
              class="rounded-xl bg-pink-600 hover:bg-pink-700 transition-all">
              <Send v-if="!isLoading" class="w-4 h-4" />
              <Loader2 v-else class="w-4 h-4 animate-spin" />
            </Button>
          </form>
        </div>
      </Card>
    </Transition>

    <Button @click="toggleChat"
      class="w-14 h-14 rounded-full shadow-lg bg-pink-600 hover:bg-pink-700 text-white transition-transform active:scale-95">
      <MessageCircle v-if="!isOpen" class="w-6 h-6" />
      <X v-else class="w-6 h-6" />
    </Button>
  </div>
</template>

<style scoped>
.markdown-body :deep(strong) {
  font-weight: 800;
  color: #db2777;
}

.markdown-body :deep(ul) {
  list-style-type: disc;
  margin-left: 1rem;
  margin-top: 0.5rem;
}

.markdown-body :deep(li) {
  margin-bottom: 0.25rem;
}

.markdown-body :deep(p) {
  margin-bottom: 0.5rem;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.chat-scroll {
  scrollbar-width: none;
}
</style>