<script setup lang="ts">
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import type { HealthRecord } from '@/lib/api'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{ records: HealthRecord[] }>()

const chartData = computed(() => {
  // On filtre et on trie par date
  const data = props.records
    .filter(r => r.type.toLowerCase() === 'glycémie' || r.type.toLowerCase() === 'glucose')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-7) // On prend les 7 dernières mesures

  return {
    labels: data.map(r => new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'Glycémie (g/L)',
      data: data.map(r => r.value),
      backgroundColor: '#3b82f6', // Bleu indigo
      borderRadius: 12,
      borderSkipped: false,
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { beginAtZero: true, grid: { display: false } },
    x: { grid: { display: false } }
  }
}
</script>

<template>
  <div class="h-50">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>