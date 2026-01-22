<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n"; // Importation pour la traduction
import api, { type HealthRecord, type User } from "@/lib/api";
import AIChatBot from '@/components/AIChatBot.vue';
import Navbar from "@/components/Navbar.vue";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Trash2, Activity, Heart, Flame, Droplets } from "lucide-vue-next";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import HeartRateChart from "@/components/HeartRateChart.vue";
import heart3d from "@/assets/heart-3d.png";
import GlucoseChart from "@/components/GlucodeChart.vue";
import CaloriesChart from "@/components/CaloriesChart.vue";

const { t } = useI18n(); // Initialisation de la fonction de traduction
const router = useRouter();
const user = ref<User | null>(null);
const records = ref<HealthRecord[]>([]);
const isLoading = ref(true);

// --- LOGIQUE DE DONNÉES (Inchangée) ---

const lastWeight = computed(() => {
  const weightRecord = [...records.value]
    .filter((r) => r.type.toLowerCase() === "poids")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return weightRecord ? `${weightRecord.value} ${weightRecord.unit}` : "--";
});

const lastGlucose = computed(() => {
  const glucoseRecord = [...records.value]
    .filter((r) => r.type.toLowerCase() === "glycémie" || r.type.toLowerCase() === "glucose")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return glucoseRecord ? `${glucoseRecord.value} ${glucoseRecord.unit || 'g/L'}` : "--";
});

const totalCalories = computed(() => {
  const today = new Date().toDateString();
  return records.value
    .filter(r =>
      r.type.toLowerCase() === 'calories' &&
      new Date(r.createdAt).toDateString() === today
    )
    .reduce((acc, curr) => acc + curr.value, 0);
});

const glucoseStatus = computed(() => {
  const val = parseFloat(lastGlucose.value);
  if (isNaN(val)) return { label: t('status.pending'), color: "text-slate-400" };
  if (val < 0.7) return { label: "Hypo", color: "text-blue-500" };
  if (val > 1.1) return { label: "Hyper", color: "text-red-500" };
  return { label: "Normal", color: "text-green-500" };
});

const heartStats = computed(() => {
  const bpmValues = records.value
    .filter(r => r.type.toLowerCase() === 'bpm' || r.type.toLowerCase() === 'rythme cardiaque')
    .map(r => r.value);
  if (bpmValues.length === 0) return { min: 0, max: 0, avg: 0 };
  const min = Math.min(...bpmValues);
  const max = Math.max(...bpmValues);
  const avg = Math.round(bpmValues.reduce((a, b) => a + b, 0) / bpmValues.length);
  return { min, max, avg };
});

// --- LIFECYCLE & ACTIONS ---

onMounted(async () => {
  const savedUser = localStorage.getItem("user");
  if (!savedUser) {
    router.push("/login");
    return;
  }
  user.value = JSON.parse(savedUser);
  await fetchHealthData();
});

async function fetchHealthData() {
  if (!user.value) return;
  try {
    isLoading.value = true;
    const { data } = await api.get<HealthRecord[]>(`/health/${user.value.id}`);
    records.value = data;
  } catch (error) {
    console.error("Erreur", error);
  } finally {
    isLoading.value = false;
  }
}

async function DeleteRecord(recordId: number) {
  try {
    await api.delete(`/health/${recordId}`);
    records.value = records.value.filter(record => record.id !== recordId);
  } catch (error) {
    console.error("Erreur de suppression :", error);
  }
}

const currentWeek = computed(() => {
  const today = new Date();
  const week = [];
  const startOfWeek = new Date(today);
  const dayIndex = today.getDay();
  const diff = today.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    week.push({
      dayName: date.toLocaleDateString(undefined, { weekday: 'short' }).replace('.', ''),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString()
    });
  }
  return week;
});
</script>

<template>
  <div class="min-h-screen px-4 py-4 font-sans">
    <Navbar :user="user" @refresh="fetchHealthData" />

    <main class="grid grid-cols-12 gap-8">
      <AIChatBot />

      <section class="col-span-12 lg:col-span-8 space-y-8">
        <div class="flex flex-col sm:flex-row justify-between items-center gap-4 my-4">
          <div class="space-y-1">
            <h2 class="text-3xl font-extrabold tracking-tight">{{ t('status.title') }}</h2>
            <p class="text-sm text-muted-foreground max-w-md">{{ t('status.subtitle', { name: user?.name || 'Jean' }) }}</p>
          </div>
          <Button variant="outline" class="rounded-full px-6 rounded-[2.5rem] backdrop-blur-md p-4  shadow-sm border bg-white/50 dark:bg-slate-900/50hover:shadow-md transition-all">
            {{ t('actions.report') }} <Activity class="ml-2 w-4 h-4" />
          </Button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card class="rounded-[2.5rem] backdrop-blur-md p-4 mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50 p-6 transition-transform hover:scale-[1.02]">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-purple-100 rounded-2xl text-purple-600"><Activity class="w-5 h-5" /></div>
              <span class="font-bold">{{ t('status.weight') }}</span>
            </div>
            <div class="text-4xl font-black">{{ lastWeight }}</div>
          </Card>

          <Card class="rounded-[2.5rem] backdrop-blur-md p-4 mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50 p-6 transition-transform hover:scale-[1.02]">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-blue-100 rounded-2xl text-blue-600"><Droplets class="w-5 h-5" /></div>
              <span class="font-bold">{{ t('status.glucose') }}</span>
            </div>
            <div class="text-4xl font-black">{{ lastGlucose }}</div>
            <div :class="['text-[10px] font-bold mt-2 uppercase flex items-center gap-1', glucoseStatus.color]">
              <span class="w-2 h-2 rounded-full bg-current"></span> {{ glucoseStatus.label }}
            </div>
          </Card>

          <Card class="rounded-[2.5rem]  backdrop-blur-md mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50 p-6 transition-transform hover:scale-[1.02]">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-orange-100 rounded-2xl text-orange-600"><Flame class="w-5 h-5" /></div>
              <span class="font-bold">{{ t('status.calories') }}</span>
            </div>
            <div class="text-4xl font-black">{{ totalCalories }} <span class="text-sm">kcal</span></div>
          </Card>
        </div>

        <Card class="rounded-[2.5rem] backdrop-blur-md shadow-sm border bg-white/50 dark:bg-slate-900/50 p-8">
          <h3 class="font-bold text-xl mb-4">{{ t('nav.planning') }}</h3>
          <div class="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
            <div v-for="day in currentWeek" :key="day.dayNumber" :class="[
              'flex-1 min-w-17.5 p-4 rounded-3xl text-center transition-all duration-300',
              day.isToday ? 'bg-pink-600 text-white shadow-lg scale-105' : 'border border-slate-50 hover:bg-slate-50 dark:hover:bg-slate-800'
            ]">
              <p :class="['text-xs font-bold uppercase', day.isToday ? 'text-pink-100' : 'text-slate-400']">{{ day.dayName }}</p>
              <p :class="['text-lg font-black mt-1', day.isToday ? 'text-white' : 'text-slate-700 dark:text-slate-200']">{{ day.dayNumber }}</p>
            </div>
          </div>
        </Card>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card class="rounded-[2.5rem] backdrop-blur-md p-4 mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-lg">{{ t('charts.glucose') }}</h3>
              <span class="text-[9px] bg-blue-50 text-blue-600 px-2 py-1 rounded-lg font-black uppercase">{{ t('charts.range_7d') }}</span>
            </div>
            <GlucoseChart :records="records" />
          </Card>

          <Card class="rounded-[2.5rem] backdrop-blur-md p-4 mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-bold text-lg">{{ t('charts.calories') }}</h3>
              <span class="text-[9px] bg-orange-50 text-orange-600 px-2 py-1 rounded-lg font-black uppercase">{{ t('charts.trend') }}</span>
            </div>
            <CaloriesChart :records="records" />
          </Card>
        </div>

        <Card class="rounded-[2.5rem] backdrop-blur-md p-4 mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50 overflow-hidden">
          <div class="p-8 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
            <h3 class="font-bold text-xl">{{ t('table.history') }}</h3>
            <CalendarIcon class="w-5 h-5 text-slate-400" />
          </div>
          <div class="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow class="border-none hover:bg-transparent">
                  <TableHead>{{ t('table.date') }}</TableHead>
                  <TableHead>{{ t('table.type') }}</TableHead>
                  <TableHead>{{ t('table.value') }}</TableHead>
                  <TableHead class="text-right">{{ t('table.action') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="record in records" :key="record.id" class="group border-slate-50 dark:border-slate-800 hover:bg-slate-50/50">
                  <TableCell>{{ new Date(record.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short' }) }}</TableCell>
                  <TableCell>
                    <span :class="['px-3 py-1 rounded-full text-[10px] font-bold uppercase', 
                      record.type.toLowerCase() === 'glycémie' ? 'bg-blue-100 text-blue-600' : 
                      record.type.toLowerCase() === 'calories' ? 'bg-orange-100 text-orange-600' : 'bg-purple-100 text-purple-600']">
                      {{ record.type }}
                    </span>
                  </TableCell>
                  <TableCell class="font-bold">{{ record.value }} {{ record.unit }}</TableCell>
                  <TableCell class="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger as-child><Button variant="ghost" size="icon" class="hover:text-red-500"><Trash2 class="w-4 h-4" /></Button></AlertDialogTrigger>
                      <AlertDialogContent class="rounded-3xl border-none shadow-2xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle>{{ t('actions.delete_title') }}</AlertDialogTitle>
                          <AlertDialogDescription>{{ t('actions.delete_desc') }}</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel class="rounded-full">{{ t('actions.cancel') }}</AlertDialogCancel>
                          <AlertDialogAction @click="DeleteRecord(record.id)" class="bg-red-500 hover:bg-red-600 rounded-full text-white">{{ t('actions.confirm') }}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <aside class="col-span-12 lg:col-span-4 h-fit sticky top-4">
        <Card class="rounded-[2.5rem] backdrop-blur-md p-4 mb-8 shadow-sm border bg-white/50 dark:bg-slate-900/50 h-full relative overflow-hidden ">
          <div class="flex justify-between items-center mb-10">
            <h3 class="font-black text-2xl">{{ t('charts.heart') }}</h3>
            <Heart class="w-6 h-6 text-pink-600 fill-pink-600 animate-pulse" />
          </div>

          <div class="relative flex justify-center py-6">
            <div class="absolute w-64 h-64 bg-red-50/50 dark:bg-red-900/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <img :src="heart3d" alt="Heart 3D" class="w-48 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>

          <div class="grid grid-cols-3 gap-2 mt-10">
            <div class="text-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase">{{ t('status.avg') }}</p>
              <p class="text-xl font-black">{{ heartStats.avg }}</p>
            </div>
            <div class="text-center border-x border-slate-100 dark:border-slate-800">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Min</p>
              <p class="text-xl font-black">{{ heartStats.min }}</p>
            </div>
            <div class="text-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Max</p>
              <p class="text-xl font-black">{{ heartStats.max }}</p>
            </div>
          </div>
          <div class="mt-12">
            <HeartRateChart :records="records" />
          </div>
        </Card>
      </aside>
    </main>
  </div>
</template>