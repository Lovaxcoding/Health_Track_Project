<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { User } from '@/lib/api'

// UI Components
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import ModeToggle from "@/components/ModeToggle.vue"
import LanguageToggle from "@/components/LanguageToggle.vue"
import AddHealthRecord from "@/components/AddHealthRecord.vue"
import { LogOut, Menu, Home, LayoutDashboard, History } from "lucide-vue-next"
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const props = defineProps<{ user: User | null }>()
const emit = defineEmits(['refresh'])
const router = useRouter()

const isMenuOpen = ref(false)

function handleLogout() {
    localStorage.clear()
    router.push("/login")
}

function onRecordAdded() {
    emit('refresh')
}

const navigateTo = (path: string) => {
    isMenuOpen.value = false
    router.push(path)
}
</script>

<template>
    <header
        class="flex items-center justify-between backdrop-blur-md p-4 rounded-2xl mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50 sticky top-0 z-50">
        
        <div class="flex items-center gap-2 font-bold text-xl ml-2 cursor-pointer" @click="router.push('/')">
            <div class="w-8 h-8 rounded-full flex items-center justify-center bg-pink-600 text-white text-[10px]">HP</div>
            <span class="tracking-tight">HealthPulse</span>
        </div>

        <div class="flex items-center gap-2">
            
            <nav class="hidden min-[1200px]:flex items-center gap-1">
                <Button variant="ghost" class="rounded-xl px-4" @click="router.push('/')">
                    {{ t('nav.home') }}
                </Button>
                <Button class="rounded-xl bg-pink-600 hover:bg-pink-700 px-4 shadow-md text-white">
                    {{ t('nav.dashboard') }}
                </Button>
                <Button variant="ghost" class="rounded-xl px-4 text-slate-500">
                    {{ t('nav.history') }}
                </Button>
                
                <div class="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-2"></div>
                
                <AddHealthRecord v-if="user" :user-id="user.id" @record-added="onRecordAdded" />
                <LanguageToggle />
                <ModeToggle />

                <div class="flex items-center gap-3 pl-2">
                    <button @click="handleLogout"
                        class="relative group overflow-hidden rounded-full w-10 h-10 border-2 border-white shadow-sm transition-all active:scale-95">
                        <img src="https://github.com/shadcn.png" class="w-full h-full object-cover group-hover:opacity-20 transition-opacity" />
                        <LogOut class="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-red-600 w-5 h-5 transition-opacity" />
                    </button>
                </div>
            </nav>

            <div class="min-[1200px]:hidden flex items-center gap-2">
                <AddHealthRecord v-if="user" :user-id="user.id" @record-added="onRecordAdded" />
                
                <Sheet v-model:open="isMenuOpen">
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" class="rounded-xl hover:bg-pink-50 dark:hover:bg-pink-900/20">
                            <Menu class="w-6 h-6 text-pink-600" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" class="w-80 rounded-l-3xl border-none bg-white dark:bg-slate-900 p-0">
                        <div class="flex flex-col h-full">
                            <div class="p-6 bg-pink-600 text-white flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                                    <img src="https://github.com/shadcn.png" class="w-full h-full rounded-full" />
                                </div>
                                <div>
                                    <p class="font-bold leading-tight">{{ user?.name || 'Utilisateur' }}</p>
                                    <p class="text-[10px] uppercase tracking-widest opacity-80">Membre Premium</p>
                                </div>
                            </div>

                            <div class="flex flex-col gap-2 p-4">
                                <Button variant="ghost" class="justify-start gap-3 rounded-xl py-6" @click="navigateTo('/')">
                                    <Home class="w-5 h-5 text-slate-500" /> {{ t('nav.home') }}
                                </Button>
                                <Button variant="ghost" class="justify-start gap-3 rounded-xl py-6 bg-pink-50 text-pink-600 dark:bg-pink-900/10" @click="navigateTo('/')">
                                    <LayoutDashboard class="w-5 h-5" /> {{ t('nav.dashboard') }}
                                </Button>
                                <Button variant="ghost" class="justify-start gap-3 rounded-xl py-6 text-slate-500">
                                    <History class="w-5 h-5" /> {{ t('nav.history') }}
                                </Button>
                            </div>

                            <div class="mt-auto p-4 border-t bg-slate-50 dark:bg-slate-800/50">
                                <div class="flex items-center justify-between mb-4 px-2">
                                    <span class="text-sm font-medium">{{ t('nav.settings') || 'Réglages' }}</span>
                                    <div class="flex gap-2">
                                        <LanguageToggle />
                                        <ModeToggle />
                                    </div>
                                </div>
                                <Button @click="handleLogout" variant="destructive" class="w-full rounded-xl gap-2">
                                    <LogOut class="w-4 h-4" /> {{ t('nav.logout') || 'Déconnexion' }}
                                </Button>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    </header>
</template>