<template>
  <v-row class="mb-6">
    <v-col cols="12">
      <div class="d-flex align-center justify-space-between">
        <span class="header-title">{{ title }}</span>
        <span>{{ userName }}</span>
      </div>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';

defineProps<{
  title: string;
  subtitle?: string;
  showActions?: boolean;
}>();

const userName = computed(() => {
  return localStorage.getItem('sea_userName') || 'Usuario';
});
</script>

<style scoped>
.header-title {
  font-family: 'Roboto', sans-serif !important;
  font-size: 32px !important;
  font-weight: 700 !important;
  line-height: 1.2 !important;
  letter-spacing: -0.5px !important;
}
</style>
