<template>
  <v-dialog v-model="visible" max-width="700" persistent>
    <v-card style="position: relative;">
      <Loader :visible="loadingGroups" :fullscreen="false" message="Cargando datos..." />
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-account-group</v-icon>
        Asignar grupos al examen
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <!-- Already assigned groups (closable = unassign) -->
        <div v-if="assignedGroups.length > 0" class="mb-4">
          <p class="text-body-2 font-weight-medium mb-2">Grupos asignados:</p>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="ag in assignedGroups"
              :key="ag.group_id"
              closable
              color="primary"
              variant="tonal"
              size="small"
              :disabled="submitting"
              @click:close="removeAssignedGroup(ag.group_id)"
            >
              <v-icon start size="14">mdi-check-circle</v-icon>
              {{ formatGroupLabel(ag.academic_level, ag.group_label) }}
              ({{ ag.students_assigned }} alumnos)
            </v-chip>
          </div>
        </div>

        <v-divider v-if="assignedGroups.length > 0" class="mb-4" />

        <!-- Group selector -->
        <v-select
          v-model="selectedGroupId"
          label="Seleccionar grupo"
          :items="availableGroupItems"
          item-title="label"
          item-value="id_group"
          variant="outlined"
          density="comfortable"
          hide-details
          :loading="loadingGroups"
          :disabled="submitting"
          no-data-text="No hay grupos disponibles"
          @update:model-value="addGroup"
        />

        <!-- Selected chips -->
        <div v-if="selectedGroups.length > 0" class="mt-3">
          <p class="text-body-2 font-weight-medium mb-2">Grupos seleccionados para asignar:</p>
          <div class="d-flex flex-wrap gap-2">
            <v-chip
              v-for="g in selectedGroups"
              :key="g.id_group"
              closable
              color="success"
              variant="tonal"
              :disabled="submitting"
              @click:close="removeGroup(g.id_group)"
            >
              {{ buildGroupChipLabel(g) }}
            </v-chip>
          </div>
        </div>

        <!-- Date range -->
        <v-row class="mt-4" dense>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="availableFrom"
              label="Disponible desde"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.futureDate]"
              :disabled="submitting"
              :min="minDateTimeLocal"
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field
              v-model="availableTo"
              label="Disponible hasta"
              type="datetime-local"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.endAfterStart]"
              :disabled="submitting"
              :min="availableFrom || minDateTimeLocal"
            />
          </v-col>
        </v-row>

        <!-- Validation messages -->
        <v-alert v-if="assignedGroups.length === 0 && selectedGroups.length === 0 && !loadingGroups" type="info" variant="tonal" density="compact" class="mt-2">
          Seleccione al menos un grupo para asignar.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" :disabled="submitting" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          :loading="submitting"
          :disabled="submitting || (assignedGroups.length === 0 && selectedGroups.length === 0) || !availableFrom || !availableTo"
          @click="handleAssign"
        >
          Asignar grupos
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Loader from '@/components/Loader.vue';
import { ExamController } from '../exam.controller';
import type { AcademicGroup, ExamGroupAssignment } from '../../entities/assign-exam.dto';
import { formatGroupLabel } from '../../entities/exam-constants';

const emit = defineEmits<{
  (e: 'assigned'): void;
  (e: 'error', message: string): void;
}>();

const controller = new ExamController();

const visible = ref(false);
const submitting = ref(false);
const loadingGroups = ref(false);
const examId = ref<number>(0);
const assignedGroups = ref<ExamGroupAssignment[]>([]);
const allGroups = ref<AcademicGroup[]>([]);
const selectedGroups = ref<AcademicGroup[]>([]);
const selectedGroupId = ref<number | null>(null);
const availableFrom = ref('');
const availableTo = ref('');

const minDateTimeLocal = computed(() => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
});

const assignedGroupIds = computed(() => new Set(assignedGroups.value.map(g => g.group_id)));
const selectedGroupIds = computed(() => new Set(selectedGroups.value.map(g => g.id_group)));

const availableGroupItems = computed(() =>
  allGroups.value
    .filter(g => g.status && !assignedGroupIds.value.has(g.id_group) && !selectedGroupIds.value.has(g.id_group))
    .map(g => ({
      ...g,
      label: buildGroupChipLabel(g),
    }))
);

function buildGroupChipLabel(g: AcademicGroup): string {
  return `${g.academic_level}${g.group_letter} - (${g.generation_year})`;
}

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  futureDate: (v: string) => {
    if (!v) return true;
    return new Date(v) >= new Date() || 'La fecha debe ser futura';
  },
  endAfterStart: (v: string) => {
    if (!v || !availableFrom.value) return true;
    return new Date(v) > new Date(availableFrom.value) || 'Debe ser posterior a la fecha de inicio';
  },
};

function addGroup(id: number | null) {
  if (!id) return;
  const group = allGroups.value.find(g => g.id_group === id);
  if (group && !selectedGroupIds.value.has(id)) {
    selectedGroups.value.push(group);
  }
  selectedGroupId.value = null;
}

function removeGroup(id: number) {
  selectedGroups.value = selectedGroups.value.filter(g => g.id_group !== id);
}

function removeAssignedGroup(id: number) {
  assignedGroups.value = assignedGroups.value.filter(g => g.group_id !== id);
}

function toDateTimeLocal(isoString: string): string {
  const d = new Date(isoString);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

async function loadData(eId: number) {
  loadingGroups.value = true;
  examId.value = eId;
  try {
    const [assignRes, groupsRes] = await Promise.all([
      controller.getExamAssignments(eId),
      controller.getAssignableGroups(),
    ]);

    if (assignRes.success && assignRes.data) {
      assignedGroups.value = Array.isArray(assignRes.data) ? assignRes.data : [];
      if (assignedGroups.value.length > 0) {
        availableFrom.value = toDateTimeLocal(assignedGroups.value[0].available_from);
        availableTo.value = toDateTimeLocal(assignedGroups.value[0].available_to);
      }
    }

    if (groupsRes.success && groupsRes.data) {
      allGroups.value = Array.isArray(groupsRes.data) ? groupsRes.data : [];
    }
  } finally {
    loadingGroups.value = false;
  }
}

function reset() {
  selectedGroups.value = [];
  selectedGroupId.value = null;
  assignedGroups.value = [];
  allGroups.value = [];
  availableFrom.value = '';
  availableTo.value = '';
  examId.value = 0;
}

async function open(eId: number) {
  reset();
  visible.value = true;
  await loadData(eId);
}

function close() {
  visible.value = false;
  reset();
}

async function handleAssign() {
  if ((assignedGroups.value.length === 0 && selectedGroups.value.length === 0) || !availableFrom.value || !availableTo.value) return;

  const fromDate = new Date(availableFrom.value);
  const toDate = new Date(availableTo.value);
  if (fromDate < new Date()) {
    emit('error', 'La fecha de inicio debe ser futura');
    return;
  }
  if (toDate <= fromDate) {
    emit('error', 'La fecha fin debe ser posterior a la fecha de inicio');
    return;
  }

  submitting.value = true;
  try {
    const res = await controller.assignExamToGroups({
      exam_id: examId.value,
      group_ids: [
        ...assignedGroups.value.map(g => g.group_id),
        ...selectedGroups.value.map(g => g.id_group),
      ],
      available_from: fromDate.toISOString(),
      available_to: toDate.toISOString(),
    });

    if (res.success) {
      emit('assigned');
      close();
    } else {
      emit('error', res.message || 'Error al asignar grupos');
    }
  } catch {
    emit('error', 'Error de conexión al asignar grupos');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ open });
</script>
