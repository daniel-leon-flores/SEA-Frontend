<template>
  <v-dialog :model-value="modelValue" max-width="480" scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="detail-card" rounded="xl" elevation="0">
      <div class="d-flex align-start justify-space-between mb-4">
        <div class="d-flex align-center ga-3">
          <div class="icon-wrap">
            <v-icon color="#0f766e">mdi-book-open-variant</v-icon>
          </div>
          <h2 class="detail-title">Detalle de la materia</h2>
        </div>
        <v-btn icon variant="text" size="small" @click="$emit('update:modelValue', false)">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <template v-if="subject">
        <p class="text-h6 font-weight-bold mb-1">{{ subject.name }}</p>
        <p class="text-body-2 text-medium-emphasis mb-4">Nivel académico {{ subject.level_number }}</p>

        <v-chip :color="subject.status ? '#10b981' : '#f59e0b'" size="small" class="mb-4">
          {{ subject.status ? 'Activa' : 'Inactiva' }}
        </v-chip>

        <p class="text-subtitle-2 font-weight-bold mb-2">Unidades ({{ subject.units?.length ?? 0 }})</p>
        <v-list v-if="(subject.units?.length ?? 0) > 0" density="compact" class="rounded-lg border pa-0">
          <v-list-item v-for="u in sortedUnits" :key="u.id_unit" :title="u.unit_name" :subtitle="`Unidad ${u.unit_number}`" />
        </v-list>
        <p v-else class="text-body-2 text-medium-emphasis">No hay unidades registradas.</p>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Subject } from '../../entities/subject';

const props = defineProps<{
  modelValue: boolean;
  subject: Subject | null;
}>();

defineEmits<{
  'update:modelValue': [v: boolean];
}>();

const sortedUnits = computed(() =>
  [...(props.subject?.units ?? [])].sort((a, b) => a.unit_number - b.unit_number),
);
</script>

<style scoped>
.detail-card {
  padding: 20px 20px 24px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ecfeff;
  display: grid;
  place-items: center;
}

.detail-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: #0f172a;
}
</style>
