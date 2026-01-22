<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-vue-next';
import { useI18n } from 'vue-i18n';

// On définit les langues avec des liens vers des drapeaux vectoriels (SVG)
const languages = [
  { 
    code: 'FR', 
    label: 'Français', 
    flag: 'https://flagcdn.com/w40/fr.png' 
  },
  { 
    code: 'EN', 
    label: 'English', 
    flag: 'https://flagcdn.com/w40/gb.png' 
  }
];

const currentLang = ref(languages[0]);
const { locale } = useI18n();

function setLanguage(lang: typeof languages[0]) {
  currentLang.value = lang;
  localStorage.setItem('preferred_lang', lang.code);
  locale.value = lang.code; // <--- C'est ici que la magie opère !
}

onMounted(() => {
  const savedCode = localStorage.getItem('preferred_lang');
  if (savedCode) {
    const found = languages.find(l => l.code === savedCode);
    if (found) currentLang.value = found;
  }
});
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button 
        variant="ghost" 
        class="flex items-center gap-3 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800 shadow-sm"
      >
        <img 
          :src="currentLang.flag" 
          :alt="currentLang.code"
          class="w-5 h-5 rounded-full object-cover border border-slate-200"
        />
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ currentLang.code }}</span>
        <ChevronDown class="w-3 h-3 text-slate-400" />
      </Button>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" class="w-48 rounded-[1.5rem] p-2 shadow-2xl border-slate-100 dark:border-slate-800">
      <DropdownMenuItem 
        v-for="lang in languages" 
        :key="lang.code"
        @click="setLanguage(lang)"
        class="flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all focus:bg-pink-50 dark:focus:bg-pink-900/20 focus:text-pink-600 mb-1 last:mb-0"
      >
        <div class="flex items-center gap-3">
          <img 
            :src="lang.flag" 
            :alt="lang.label"
            class="w-6 h-6 rounded-full object-cover border border-slate-100 shadow-sm"
          />
          <span class="text-sm font-semibold">{{ lang.label }}</span>
        </div>
        <Check v-if="currentLang.code === lang.code" class="w-4 h-4 text-pink-600" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>