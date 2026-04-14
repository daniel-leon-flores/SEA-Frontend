<template>
  <v-card variant="outlined" class="pa-4 rounded-lg">
    <v-card-title class="text-subtitle-1 font-weight-bold pb-2">
      <v-icon start size="20">{{ icon }}</v-icon>
      {{ title }}
    </v-card-title>
    <v-card-text class="pa-0" style="height: 300px;">
      <Bar v-if="type === 'bar'" :data="chartData" :options="chartOptions" />
      <Pie v-else-if="type === 'pie'" :data="chartData" :options="chartOptions" />
      <Doughnut v-else-if="type === 'doughnut'" :data="chartData" :options="chartOptions" />
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'vue-chartjs';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

defineProps<{
  title: string;
  icon: string;
  type: 'bar' | 'pie' | 'doughnut';
  chartData: any;
  chartOptions?: any;
}>();
</script>
