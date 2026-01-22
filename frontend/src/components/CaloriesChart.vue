<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js'
import type { HealthRecord } from '@/lib/api'

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale)

const props = defineProps<{ records: HealthRecord[] }>()

const chartData = computed(() => {
  const data = props.records
    .filter(r => r.type.toLowerCase() === 'calories')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .slice(-10)

  return {
    labels: data.map(r => new Date(r.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })),
    datasets: [{
      label: 'Calories (kcal)',
      data: data.map(r => r.value),
      borderColor: '#f97316', // Orange
      backgroundColor: '#fb923c',
      tension: 0.4,
      fill: true,
      pointRadius: 4
    }]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    y: { grid: { color: '#f1f5f9' } },
    x: { grid: { display: false } }
  }
}
</script>

<template>
  <div class="h-50">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>