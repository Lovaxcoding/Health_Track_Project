<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler
} from 'chart.js'
import type { HealthRecord } from '@/lib/api'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

const props = defineProps<{ records: HealthRecord[] }>()

const chartData = computed(() => {
  const labels = props.records
    .filter(r => r.type.toLowerCase() === 'bpm' || r.type.toLowerCase() === 'rythme cardiaque')
    .slice(-7)
    .map(r => new Date(r.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }))

  const data = props.records
    .filter(r => r.type.toLowerCase() === 'bpm' || r.type.toLowerCase() === 'rythme cardiaque')
    .slice(-7)
    .map(r => r.value)

  return {
    labels,
    datasets: [
      {
        label: 'Heart Rate (BPM)',
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return;
          }
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
gradient.addColorStop(1, 'rgba(99, 102, 241, 0.3)'); // Plus opaque en haut
gradient.addColorStop(0, 'rgba(99, 102, 241, 0)');   // Transparent en bas
          return gradient;
        },
        borderColor: '#6366f1',
        pointBackgroundColor: '#6366f1',
        data: data,
        tension: 0.4,
        fill: true,
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      grid: {
        display: false
      }
    }
  },
  plugins: {
    legend: {
      display: false
    },
    tooltip: {
      backgroundColor: 'white',
      titleColor: '#333',
      bodyColor: '#333',
      borderColor: '#e2e8f0',
      borderWidth: 1,
      cornerRadius: 12,
      displayColors: false,
      boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    }
  }
}
</script>

<template>
  <div class="h-40 w-full">
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>