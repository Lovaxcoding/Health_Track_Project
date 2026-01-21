<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api, { type HealthRecord, type User } from "@/lib/api";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ModeToggle from "@/components/ModeToggle.vue";
import AddHealthRecord from "@/components/AddHealthRecord.vue";

// Icons
import { Activity, Scale, LogOut, Heart, Flame, Footprints } from "lucide-vue-next";

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
  return bpmRecord ? weightRecord.value : "0";
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
      <section class="col-span-12 lg:col-span-8 space-y-8">
        <div class="flex flex-col sm:flex-row sm:justify-between items-center justify-between sm:items-end gap-4 my-4 py-2">
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

        <Card class="rounded-[2.5rem] border-none shadow-sm p-8  ">
          <div class="flex justify-between items-center mb-8">
            <h3 class="font-bold text-xl">Checkup Schedule</h3>
            <button class="text-chart-2 font-bold text-sm hover:underline">Show More</button>
          </div>
          <div class="flex justify-between gap-2 overflow-x-auto pb-2">
            <div v-for="d in ['Thr 15', 'Thr 16', 'Fri 17', 'Sat 18', 'Sun 19']" :key="d"
              class="flex-1 min-w-[80px] p-4 rounded-3xl text-center border border-slate-50 ">
              <p class="text-xs font-bold">{{ d.split(' ')[0] }}</p>
              <p class="text-lg font-black text-slate-400 dark:text-slate-500">{{ d.split(' ')[1] }}</p>
            </div>
            <div class="flex-1 min-w-[80px] p-4 rounded-3xl text-center bg-chart-2 text-white shadow-md">
              <p class="text-xs font-bold">Mon</p>
              <p class="text-lg font-black">20</p>
            </div>
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
              <p class="text-xl font-black">{{ lastBPM }} <span class="text-xs font-normal">BPM</span></p>
            </div>
            <div class="text-center border-x border-slate-100">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Min</p>
              <p class="text-xl font-black">48</p>
            </div>
            <div class="text-center">
              <p class="text-[10px] font-bold text-slate-400 uppercase">Max</p>
              <p class="text-xl font-black">118</p>
            </div>
          </div>

          <div class="mt-12">
            <div class="flex justify-between items-end mb-4">
              <p class="font-bold text-slate-800 dark:text-white">Heart Rate</p>
              <p class="text-[10px] font-bold text-chart-2 bg-indigo-50 px-2 py-1 rounded-md">Real Time</p>
            </div>
            <div
              class="h-40 w-full bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 flex items-center justify-center">
              <p class="text-slate-300 text-xs font-bold uppercase tracking-widest">Recharts Area</p>
            </div>
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