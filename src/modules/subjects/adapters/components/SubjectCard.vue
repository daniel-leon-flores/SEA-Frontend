<template>
  <v-card class="subject-card" rounded="xl" elevation="0">
    <div class="d-flex align-start justify-space-between mb-6">
      <div class="d-flex align-center ga-3 flex-grow-1 min-w-0">
        <div class="icon-wrap flex-shrink-0">
          <v-icon size="24" color="#0f766e">mdi-book-open-variant</v-icon>
        </div>
        <div class="min-w-0">
          <h3 class="card-title">{{ subject.name }}</h3>
          <p class="card-subtitle">{{ subtitle }}</p>
        </div>
      </div>
      <v-chip :color="subject.status ? '#10b981' : '#f59e0b'" size="small" class="status-chip flex-shrink-0">
        {{ subject.status ? 'Activa' : 'Inactiva' }}
      </v-chip>
    </div>

    <div class="d-flex align-center ga-2 text-medium-emphasis mb-5 flex-wrap">
      <v-icon size="18" color="#64748b">mdi-view-list-outline</v-icon>
      <span>{{ unitsCount }} {{ unitsCount === 1 ? 'unidad' : 'unidades' }}</span>
      <span class="mx-1 text-disabled">·</span>
      <v-icon size="18" color="#64748b">mdi-stairs</v-icon>
      <span>Nivel {{ subject.level_number }}</span>
    </div>

    <v-divider class="mb-4" />

    <div class="d-flex align-center justify-space-between ga-4 flex-wrap">
      <div class="d-flex align-center ga-2">
        <span class="text-medium-emphasis">Estado</span>
        <v-switch
          :model-value="subject.status"
          hide-details
          density="compact"
          color="success"
          :loading="statusLoading"
          @update:model-value="$emit('toggle-status', !!$event)"
        />
      </div>

      <div class="d-flex align-center ga-1">
        <v-btn icon variant="text" size="small" @click="$emit('view')">
          <v-icon>mdi-eye-outline</v-icon>
        </v-btn>
        <v-btn icon variant="text" size="small" @click="$emit('edit')">
          <v-icon>mdi-pencil-outline</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Subject } from '../../entities/subject';

const props = defineProps<{
  subject: Subject;
  subtitle: string;
  statusLoading?: boolean;
}>();

defineEmits<{
  (e: 'view'): void;
  (e: 'edit'): void;
  (e: 'toggle-status', value: boolean): void;
}>();

const unitsCount = computed(() => props.subject.units?.length ?? 0);
</script>

<style scoped>
.subject-card {
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
  font-size: 1.375rem;
  line-height: 1.2;
  margin: 0;
  font-weight: 700;
  color: #0f172a;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 15px;
}

.status-chip {
  font-weight: 600;
}

.min-w-0 {
  min-width: 0;
}
</style>
