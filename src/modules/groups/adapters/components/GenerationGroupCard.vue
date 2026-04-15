<template>
  <v-card class="group-card" rounded="xl" elevation="0">
    <div class="d-flex align-start justify-space-between mb-5">
      <div class="d-flex align-center ga-3">
        <div class="icon-wrap">
          <span class="group-letter">{{ group.group_letter }}</span>
        </div>
        <div>
          <h3 class="card-title">Grupo {{ group.group_letter }}</h3>
          <p class="card-subtitle">{{ group.period_info || 'Sin periodo asignado' }}</p>
        </div>
      </div>
      <v-chip :color="group.status ? '#10b981' : '#f59e0b'" size="small" class="status-chip">
        {{ group.status ? 'Activo' : 'Inactivo' }}
      </v-chip>
    </div>

    <div class="d-flex align-center ga-2 text-medium-emphasis mb-3">
      <v-icon size="18" color="#64748b">mdi-school-outline</v-icon>
      <span>Nivel {{ group.academic_level }}</span>
    </div>

    <div class="d-flex align-center ga-2 text-medium-emphasis mb-3">
      <v-icon size="18" color="#64748b">mdi-account-group</v-icon>
      <span>{{ studentsCount }} alumnos</span>
    </div>

    <v-btn
      variant="outlined"
      block
      class="mb-3 add-students-btn"
      rounded="lg"
      :disabled="!group.status"
      @click="$emit('view-students')"
    >
      <v-icon start size="18">mdi-account-group-outline</v-icon>
      Ver alumnos
    </v-btn>

    <v-btn
      variant="tonal"
      color="#0f766e"
      block
      class="mb-4 assign-teacher-btn"
      rounded="lg"
      :disabled="!group.status"
      @click="$emit('assign-teacher')"
    >
      <v-icon start size="18">mdi-account-tie-outline</v-icon>
      Gestionar docentes
    </v-btn>

    <v-divider class="mb-4" />

    <div class="d-flex align-center justify-space-between ga-4 flex-wrap">
      <div class="d-flex align-center ga-2">
        <span class="text-medium-emphasis">Estado</span>
        <v-switch
          :model-value="group.status"
          hide-details
          density="compact"
          color="success"
          @update:model-value="$emit('toggle-status', !!$event)"
        />
      </div>

      <div class="d-flex align-center ga-1">
        <v-tooltip text="Ver docentes asignados" location="top">
          <template #activator="{ props: tipProps }">
            <v-btn icon variant="text" size="small" v-bind="tipProps" @click="$emit('view-details')">
              <v-icon>mdi-eye-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-tooltip v-if="!group.status" text="No se puede editar un registro desactivado" location="top">
          <template #activator="{ props: tipProps }">
            <v-btn icon variant="text" size="small" disabled v-bind="tipProps">
              <v-icon>mdi-pencil-outline</v-icon>
            </v-btn>
          </template>
        </v-tooltip>
        <v-btn v-else icon variant="text" size="small" @click="$emit('edit')">
          <v-icon>mdi-pencil-outline</v-icon>
        </v-btn>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { GenerationGroup } from '../../entities/generation-group';

defineProps<{
  group: GenerationGroup;
  studentsCount: number;
}>();

defineEmits<{
  (e: 'view-details'): void;
  (e: 'view-students'): void;
  (e: 'edit'): void;
  (e: 'assign-teacher'): void;
  (e: 'toggle-status', value: boolean): void;
}>();
</script>

<style scoped>
.group-card {
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

.group-letter {
  font-size: 24px;
  font-weight: 800;
  color: #0f766e;
}

.card-title {
  font-size: 30px;
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

.teacher-row {
  min-height: 40px;
}

.assignments-list {
  max-height: 80px;
  overflow-y: auto;
}

.teacher-name {
  font-size: 12px;
  font-weight: 700;
  color: #0f172a;
}

.subject-chip {
  font-size: 11px;
  color: #0f766e;
  font-weight: 500;
}

.no-teacher {
  color: #94a3b8;
  font-size: 13px;
}

.add-students-btn {
  border-style: dashed;
  font-size: 14px;
  min-height: 38px;
}

.assign-teacher-btn {
  font-size: 14px;
  min-height: 38px;
}
</style>
