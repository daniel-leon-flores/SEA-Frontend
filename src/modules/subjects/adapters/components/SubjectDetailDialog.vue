<template>
  <v-dialog :model-value="modelValue" max-width="600" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-book-open-variant</v-icon>
        Detalle de la materia
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4">
        <template v-if="subject">
          <p class="text-h6 font-weight-bold mb-1">{{ subject.name }}</p>
          <p class="text-body-2 text-medium-emphasis mb-4">Nivel académico {{ subject.level_number }}</p>

          <v-chip :color="subject.status ? '#10b981' : '#f59e0b'" size="small" variant="tonal" class="mb-4">
            {{ subject.status ? 'Activa' : 'Inactiva' }}
          </v-chip>

          <p class="text-subtitle-2 font-weight-bold mb-2">Unidades ({{ subject.units?.length ?? 0 }})</p>
          <v-list v-if="(subject.units?.length ?? 0) > 0" density="compact" class="rounded-lg border pa-0">
            <v-list-item v-for="u in sortedUnits" :key="u.id_unit" :title="u.unit_name" :subtitle="`Unidad ${u.unit_number}`" />
          </v-list>
          <p v-else class="text-body-2 text-medium-emphasis">No hay unidades registradas.</p>
        </template>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="$emit('update:modelValue', false)">Cerrar</v-btn>
      </v-card-actions>
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

