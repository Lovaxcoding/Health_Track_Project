<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api, { type HealthRecord, type User } from "@/lib/api";
import AIChatBot from '@/components/AIChatBot.vue';


// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ModeToggle from "@/components/ModeToggle.vue";
import AddHealthRecord from "@/components/AddHealthRecord.vue";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarIcon, Trash2 } from "lucide-vue-next";
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

// Icons
import { Activity, LogOut, Heart, Flame, Footprints } from "lucide-vue-next";

import HeartRateChart from "@/components/HeartRateChart.vue";

// Assets - Vite va gérer le chemin correctement ici
import heart3d from "@/assets/heart-3d.png";

const router = useRouter();
const user = ref<User | null>(null);
const records = ref<HealthRecord[]>([]);
const isLoading = ref(true);

// --- LOGIQUE DE DONNÉES ---

const lastWeight = computed(() => {
  const weightRecord = [...records.value]
    .filter((r) => r.type.toLowerCase() === "poids")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return weightRecord ? `${weightRecord.value} ${weightRecord.unit}` : "--";
});

const lastBPM = computed(() => {
  const bpmRecord = [...records.value]
    .filter((r) => r.type.toLowerCase() === "bpm" || r.type.toLowerCase() === "rythme cardiaque")
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  return bpmRecord ? bpmRecord.value : "0";
});

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

function handleLogout() {
  localStorage.removeItem("user");
  router.push("/login");
}
// Calcul des statistiques cardiaques
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
// Récupération des pas (Steps) - On peut simuler ou sommer si tu as plusieurs entrées
const totalSteps = computed(() => {
  const stepRecords = records.value.filter(r => r.type.toLowerCase() === 'steps' || r.type.toLowerCase() === 'pas');
  return stepRecords.reduce((acc, curr) => acc + curr.value, 0).toLocaleString();
});

// Récupération des Calories
const totalCalories = computed(() => {
  const calorieRecords = records.value.filter(r => r.type.toLowerCase() === 'calories');
  return calorieRecords.reduce((acc, curr) => acc + curr.value, 0);
});
// --- LOGIQUE DU CALENDRIER DYNAMIQUE ---

const currentWeek = computed(() => {
  const today = new Date();
  const week = [];

  // On récupère le lundi de la semaine actuelle
  const startOfWeek = new Date(today);
  const dayIndex = today.getDay(); // 0 (dim) à 6 (sam)
  const diff = today.getDate() - dayIndex + (dayIndex === 0 ? -6 : 1); // Ajustement pour lundi
  startOfWeek.setDate(diff);

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);

    week.push({
      dayName: date.toLocaleDateString('fr-FR', { weekday: 'short' }).replace('.', ''),
      dayNumber: date.getDate(),
      isToday: date.toDateString() === today.toDateString(),
      fullDate: date
    });
  }
  return week;
});
async function DeleteRecord(recordId: number) {
  try {
    await api.delete(`/health/${recordId}`);
    records.value = records.value.filter(record => record.id !== recordId);
    await fetchHealthData(); // Rafraîchir les données après suppression
  } catch (error) {
    console.error("Erreur de suppression :", error);
  }
}

</script>

<template>
  <div class="min-h-screen px-4 py-4 font-sans">
    <header class="flex items-center justify-between  backdrop-blur-md p-4 rounded-2xl mb-8 shadow-sm border ">
      <div class="flex items-center gap-2 font-bold text-xl ml-4">
        <div class="w-8 h-8 rounded-full flex items-center justify-center  text-[10px]">HP</div>
        HealthPulse
      </div>

      <nav class="hidden md:flex p-1 rounded-2xl ">
        <Button variant="ghost" class="rounded-xl px-6">Home</Button>
        <Button class="rounded-xl bg-pink-600 hover:bg-pink-700 px-6 shadow-md ">Dashboard</Button>
        <Button variant="ghost" class="rounded-xl px-6 text-slate-500">History</Button>
      </nav>

      <div class="flex items-center gap-4 mr-4">
        <AddHealthRecord v-if="user" :user-id="user.id" @record-added="fetchHealthData" />
        <ModeToggle />
        <div class="flex items-center gap-3 border-l pl-4 ml-2">
          <div class="text-right hidden sm:block">
            <p class="text-sm font-bold">{{ user?.name || 'User' }}</p>
            <p class="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Premium Member</p>
          </div>
          <button @click="handleLogout" class="relative group">
            <img src="https://github.com/shadcn.png"
              class="w-10 h-10 rounded-full border-2 border-white shadow-md group-hover:opacity-50 transition-opacity" />
            <LogOut
              class="absolute inset-0 m-auto opacity-0 group-hover:opacity-100 text-red-600 w-5 h-5 transition-opacity" />
          </button>
        </div>
      </div>
    </header>

    <main class="grid grid-cols-12 gap-8">
      <AIChatBot />
      <section class="col-span-12 lg:col-span-8 space-y-8">
        <div
          class="flex flex-col sm:flex-row sm:justify-between items-center justify-between sm:items-end gap-4 my-4 py-2">
          <div class="space-y-1">
            <h2 class="text-3xl font-extrabold tracking-tight ">
              Votre aperçu santé
            </h2>
            <p class="text-sm text-muted-foreground max-w-md">
              Prenez un instant pour suivre votre équilibre, renforcer votre bien-être
              et rester en harmonie avec votre corps.
            </p>
          </div>

          <Button variant="outline" class="rounded-full px-6 border-none shadow-sm hover:shadow-md transition-all">
            Affiner l’analyse
            <Activity class="ml-2 w-4 h-4" />
          </Button>
        </div>


        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card class="rounded-[2.5rem] border-none shadow-sm p-6  transition-transform hover:scale-[1.02]">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-purple-100 rounded-2xl text-purple-600 ">
                <Activity class="w-5 h-5" />
              </div>
              <span class="font-bold ">Poids Actuel</span>
            </div>
            <div class="text-4xl font-black">{{ lastWeight }}</div>
            <div class="text-[10px] font-bold  mt-2 flex items-center gap-1">
              <span class="">↑ 100%</span> + 53% This day
            </div>
          </Card>

          <Card class="rounded-[2.5rem] border-none shadow-sm p-6  transition-transform hover:scale-[1.02]">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-indigo-100 rounded-2xl text-indigo-600 ">
                <Footprints class="w-5 h-5" />
              </div>
              <span class="font-bold ">Steps</span>
            </div>
            <div class="text-4xl font-black">1,524</div>
            <div class="text-[10px] font-bold  mt-2 flex items-center gap-1">
              <span class="">↑ 50%</span> This day
            </div>
          </Card>

          <Card class="rounded-[2.5rem] border-none shadow-sm p-6   transition-transform hover:scale-[1.02]">
            <div class="flex items-center gap-4 mb-6">
              <div class="p-3 bg-orange-100 rounded-2xl text-orange-600">
                <Flame class="w-5 h-5" />
              </div>
              <span class="font-bold text-slate-600">Calories</span>
            </div>
            <div class="text-4xl font-black">129</div>
            <div class="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
              <span class="text-orange-500">↑ 50%</span> This day
            </div>
          </Card>
        </div>

        <Card class="rounded-[2.5rem] border-none shadow-sm p-8 ">
          <div class="flex justify-between items-center mb-4">
            <h3 class="font-bold text-xl">Planning des mesures</h3>
            <button class="text-pink-600 font-bold text-sm hover:underline">Voir plus</button>
          </div>
          <!-- <p v-if="user" class="text-lg text-slate-400">
            Aujourd'hui, nous sommes le {{ new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }) }}.
            C'est le moment idéal pour checker votre forme !
          </p> -->

          <div class="flex justify-between gap-2 overflow-x-auto pb-2 no-scrollbar">
            <div v-for="day in currentWeek" :key="day.dayNumber" :class="[
              'flex-1 min-w-17.5 p-4 rounded-3xl text-center transition-all duration-300',
              day.isToday
                ? 'bg-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-pink-900/20 scale-105'
                : 'border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            ]">
              <p :class="['text-xs font-bold uppercase', day.isToday ? 'text-pink-100' : 'text-slate-400']">
                {{ day.dayName }}
              </p>
              <p
                :class="['text-lg font-black mt-1', day.isToday ? 'text-white' : 'text-slate-700 dark:text-slate-200']">
                {{ day.dayNumber }}
              </p>
              <div v-if="day.isToday" class="w-1 h-1 bg-white rounded-full mx-auto mt-1"></div>
            </div>
          </div>
        </Card>
        <Card class="rounded-[2.5rem] border-none shadow-sm overflow-hidden  mt-8">
          <div class="p-8 flex justify-between items-center border-b border-slate-50 dark:border-slate-800">
            <div>
              <h3 class="font-bold text-xl">Historique détaillé</h3>
              <p class="text-xs text-slate-400 mt-1">Gérez vos derniers enregistrements</p>
            </div>
            <div class="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
              <CalendarIcon class="w-5 h-5 text-slate-400" />
            </div>
          </div>

          <div class="px-4 pb-4">
            <Table>
              <TableHeader>
                <TableRow class="border-none hover:bg-transparent">
                  <TableHead class="font-bold text-slate-400">Date</TableHead>
                  <TableHead class="font-bold text-slate-400">Type</TableHead>
                  <TableHead class="font-bold text-slate-400">Valeur</TableHead>
                  <TableHead class="text-right font-bold text-slate-400">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow v-for="record in records" :key="record.id"
                  class="group border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                  <TableCell class="font-medium">
                    {{ new Date(record.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) }}
                  </TableCell>
                  <TableCell>
                    <span :class="[
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                      record.type.toLowerCase() === 'poids' ? 'bg-purple-100 text-purple-600' : 'bg-indigo-100 text-indigo-600'
                    ]">
                      {{ record.type }}
                    </span>
                  </TableCell>
                  <TableCell class="font-bold text-slate-700 dark:text-slate-200">
                    {{ record.value }} <span class="text-[10px] font-normal text-slate-400">{{ record.unit }}</span>
                  </TableCell>
                  <TableCell class="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger as-child>
                        <Button variant="ghost" size="icon"
                          class=" group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500 rounded-xl">
                          <Trash2 class="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent class="rounded-4xl border-none">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Cela supprimera définitivement votre mesure de santé
                            de nos serveurs.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel class="rounded-full">Annuler</AlertDialogCancel>
                          <AlertDialogAction @click="DeleteRecord(record.id)"
                            class="bg-red-500 hover:bg-red-600 rounded-full">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>

                <TableRow v-if="records.length === 0">
                  <TableCell colspan="4" class="text-center py-12 text-slate-400 italic">
                    Aucune donnée disponible pour le moment.
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </section>

      <aside class="col-span-12 lg:col-span-4">
        <Card class="rounded-[3.5rem] border-none shadow-xl p-8   h-full relative overflow-hidden">
          <div class="flex justify-between items-center mb-10">
            <h3 class="font-black text-2xl ">Your Heart Statistic</h3>
            <Button variant="ghost" size="icon" class="rounded-full ">
              <Heart class="w-4 h-4" />
            </Button>
          </div>

          <div class="relative flex justify-center py-6">
            <div class="absolute w-64 h-64 bg-red-50/50 rounded-full blur-3xl -z-10 animate-pulse"></div>
            <img :src="heart3d" alt="Heart 3D"
              class="w-56 h-auto drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
          </div>

          <div class="grid grid-cols-3 gap-2 mt-10">
            <div class="text-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Average</p>
              <p class="text-xl font-black">{{ heartStats.avg }} <span class="text-xs font-normal">BPM</span></p>
            </div>
            <div class="text-center border-x border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Min</p>
              <p class="text-xl font-black">{{ heartStats.min }}</p>
            </div>
            <div class="text-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Max</p>
              <p class="text-xl font-black">{{ heartStats.max }}</p>
            </div>
          </div>
          <div class="mt-12">
            <div class="flex justify-between items-end mb-4">
              <p class="font-bold text-slate-800 dark:text-white">Heart Rate</p>
              <p class="text-[10px] font-bold text-chart-2 bg-indigo-50 px-2 py-1 rounded-md">Real Time</p>
            </div>

            <HeartRateChart :records="records" />
          </div>
        </Card>
      </aside>
    </main>
  </div>
</template>

<style scoped>
/* On utilise Tailwind pour 99% du style, mais on peut ajouter des détails ici */
main {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar invisible pour le calendrier horizontal */
.overflow-x-auto::-webkit-scrollbar {
  display: none;
}

.overflow-x-auto {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>