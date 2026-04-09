<template>
  <v-card class="generation-card" rounded="xl" elevation="0">
    <div class="d-flex align-start justify-space-between mb-6">
      <div class="d-flex align-center ga-3">
        <div class="icon-wrap">
          <v-icon size="24" color="#0f766e">mdi-calendar</v-icon>
        </div>
        <div>
          <h3 class="card-title">{{ generation.year }}</h3>
          <p class="card-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <v-chip :color="generation.status ? '#10b981' : '#f59e0b'" size="small" class="status-chip">
        {{ generation.status ? 'Activa' : 'Inactiva' }}
      </v-chip>
    </div>

    <div class="d-flex align-center ga-2 text-medium-emphasis mb-5">
      <v-icon size="18" color="#64748b">mdi-account-group</v-icon>
      <span>{{ groupsCount }} grupos</span>
    </div>

    <v-divider class="mb-4" />

    <div class="d-flex align-center justify-space-between ga-4 flex-wrap">
      <div class="d-flex align-center ga-2">
        <span class="text-medium-emphasis">Estado</span>
        <v-switch
          :model-value="generation.status"
          hide-details
          density="compact"
          color="success"
          @update:model-value="$emit('toggle-status', !!$event)"
        />
      </div>

      <div class="d-flex align-center ga-1">
        <v-btn color="primary" variant="tonal" size="small" rounded="lg" @click="$emit('view')">
          Ver grupos
        </v-btn>
        <v-btn icon variant="text" size="small" @click="$emit('edit')">
          <v-icon>mdi-pencil-outline</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { Generation } from '../../entities/generation';

defineProps<{
  generation: Generation;
  subtitle: string;
  groupsCount: number;
}>();

defineEmits<{
  (e: 'view'): void;
  (e: 'edit'): void;
  (e: 'toggle-status', value: boolean): void;
}>();
</script>

<style scoped>
.generation-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 18px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ecfeff;
  display: grid;
  place-items: center;
}

.card-title {
  font-size: 34px;
  line-height: 1;
  margin: 0;
  font-weight: 700;
  color: #0f172a;
}

.card-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 15px;
}

.status-chip {
  font-weight: 600;
}
</style>
