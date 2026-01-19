<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import api, { type HealthRecord, type User } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity, Scale, LogOut, Plus } from "lucide-vue-next";
import ModeToggle from "@/components/ModeToggle.vue";
import { computed } from "vue";

const router = useRouter();
const user = ref<User | null>(null);
const records = ref<HealthRecord[]>([]);
const isLoading = ref(true);

// Récupère le dernier poids dynamiquement
const lastWeight = computed(() => {
  const weightRecord = [...records.value]
    .filter((r) => r.type.toLowerCase() === "poids")
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  return weightRecord ? `${weightRecord.value} ${weightRecord.unit}` : "--";
});

// Récupère le dernier BPM dynamiquement
const lastBPM = computed(() => {
  const bpmRecord = [...records.value]
    .filter(
      (r) =>
        r.type.toLowerCase() === "bpm" ||
        r.type.toLowerCase() === "rythme cardiaque",
    )
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )[0];
  return bpmRecord ? `${bpmRecord.value} ${bpmRecord.unit}` : "--";
});
// Charger les données au montage du composant
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
    // Utilisation de ta route backend : GET /api/health/:userId
    const { data } = await api.get<HealthRecord[]>(`/health/${user.value.id}`);
    records.value = data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données", error);
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
  <div class="p-8 max-w-6xl mx-auto space-y-8 dashboard-bg">
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Tableau de bord</h1>
        <p class="text-muted-foreground">
          Bienvenue, {{ user?.name || "Utilisateur" }}
        </p>
      </div>
      <div class="flex flex-row gap-4">
        <ModeToggle />
        <Button variant="destructive" @click="handleLogout">
          <LogOut class="mr-2 h-4 w-4" /> Déconnexion
        </Button>
      </div>
    </div>

    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card class="animate-delay-1">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Dernier Poids</CardTitle>
          <Scale class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ lastWeight }}</div>
          <p class="text-xs text-muted-foreground">
            -0.5kg depuis la dernière fois
          </p>
        </CardContent>
      </Card>

      <Card class="animate-delay-2">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">Rythme Cardiaque</CardTitle>
          <Activity class="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">{{ lastBPM }}</div>
          <p class="text-xs text-green-500">Stable</p>
        </CardContent>
      </Card>
    </div>

    <Card class="bg-white/10 dark:bg-black/40 backdrop-blur-md border-white/20 transition-all hover:-translate-y-1 hover:shadow-xl">
      <CardHeader>
        <CardTitle>Historique des mesures</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow v-if="isLoading">
              <TableCell colspan="4" class="text-center py-6">
                <span class="animate-pulse text-muted-foreground">
                  Chargement des données…
                </span>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead>Unité</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="record in records" :key="record.id">
              <TableCell>{{
                new Date(record.createdAt).toLocaleDateString()
              }}</TableCell>
              <TableCell class="font-medium">{{ record.type }}</TableCell>
              <TableCell>{{ record.value }}</TableCell>
              <TableCell>{{ record.unit }}</TableCell>
            </TableRow>
            <TableRow v-if="records.length === 0 && !isLoading">
              <TableCell
                colspan="4"
                class="text-center py-4 text-muted-foreground"
              >
                Aucune donnée enregistrée pour le moment.
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
<style scoped>
.dashboard-bg {
  min-height: 100vh;
  /* Correction : on s'assure que le gradient est visible par dessus le fond */
  background: 
    radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.15), transparent 40%),
    radial-gradient(circle at 80% 60%, rgba(244, 114, 182, 0.15), transparent 45%),
    hsl(var(--background));
  background-attachment: fixed;
}

/* Animation d'entrée pour tous les enfants du dashboard */
.dashboard-content > * {
  animation: fadeUp 0.6s ease forwards;
  opacity: 0; /* Commence invisible pour l'animation */
}

@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Ciblage des cartes Shadcn sans utiliser .card */
:deep(.rounded-xl) {
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

:deep(.rounded-xl:hover) {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px -10px rgba(236, 72, 153, 0.3);
}

.animate-delay-1 { animation-delay: 0.1s; }
.animate-delay-2 { animation-delay: 0.2s; }
</style>
