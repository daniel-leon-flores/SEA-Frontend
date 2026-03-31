<template>
  <v-row class="mb-4">
    <v-col v-for="metric in metrics" :key="metric.label" cols="12" sm="6" md="4" lg="2">
      <v-card variant="outlined" class="pa-4 text-center rounded-lg" :class="metric.colorClass">
        <v-icon size="28" :color="metric.iconColor" class="mb-2">{{ metric.icon }}</v-icon>
        <div class="text-h5 font-weight-bold">{{ metric.value }}</div>
        <div class="text-caption text-grey-darken-1">{{ metric.label }}</div>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
interface MetricCard {
  label: string;
  value: string | number;
  icon: string;
  iconColor: string;
  colorClass?: string;
}

defineProps<{
  metrics: MetricCard[];
}>();
</script>
