<template>
  <v-dialog :model-value="modelValue" max-width="620" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="dialog-card" rounded="xl" elevation="0">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-5">
        <div class="d-flex align-center ga-3">
          <div class="dialog-icon">
            <v-icon color="#0f766e">mdi-account-tie</v-icon>
          </div>
          <div>
            <h2 class="dialog-title">Asignar docentes</h2>
            <p class="dialog-subtitle">Grupo {{ groupLetter }} · Nivel {{ academicLevel }}</p>
          </div>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div v-if="loadingSubjects" class="d-flex justify-center py-6">
        <v-progress-circular indeterminate color="#0f766e" size="32" />
      </div>

      <div v-else-if="subjects.length === 0" class="mb-2">
        <v-alert type="info" variant="tonal" rounded="lg" density="compact">
          No hay materias registradas para el nivel {{ academicLevel }}.
        </v-alert>
      </div>

      <div v-else class="subjects-list mb-2">
        <div v-for="subj in subjects" :key="subj.id_subject" class="subject-row">
          <div class="d-flex align-center justify-space-between ga-3">
            <div class="flex-1 min-w-0">
              <p class="subj-name">{{ subj.name }}</p>
              <template v-if="getAssignment(subj.id_subject)">
                <div class="d-flex align-center ga-1 mt-1">
                  <v-icon size="13" color="#0f766e">mdi-check-circle-outline</v-icon>
                  <span class="assigned-teacher-text">{{ getAssignmentTeacherName(subj.id_subject) }}</span>
                </div>
              </template>
              <template v-else>
                <div class="d-flex align-center ga-1 mt-1">
                  <v-icon size="13" color="#94a3b8">mdi-account-off-outline</v-icon>
                  <span class="no-teacher-text">Sin docente</span>
                </div>
              </template>
            </div>
            <div class="d-flex align-center ga-2">
              <v-btn
                v-if="getAssignment(subj.id_subject)"
                icon
                variant="text"
                size="small"
                color="error"
                :loading="removingId === getAssignmentId(subj.id_subject)"
                @click="removeAssignment(getAssignment(subj.id_subject))"
              >
                <v-icon size="18">mdi-close-circle-outline</v-icon>
              </v-btn>
              <v-btn
                size="small"
                variant="tonal"
                color="#0f766e"
                rounded="lg"
                :loading="pickingSubjectId === subj.id_subject"
                @click="openTeacherPicker(subj)"
              >
                <v-icon start size="15">mdi-account-plus-outline</v-icon>
                {{ getAssignment(subj.id_subject) ? 'Cambiar' : 'Asignar' }}
              </v-btn>
            </div>
          </div>
        </div>
      </div>

      <v-divider class="my-5" />
      <div class="d-flex justify-end">
        <v-btn variant="outlined" rounded="lg" @click="close">Cerrar</v-btn>
      </div>
    </v-card>
  </v-dialog>

  <!-- Teacher picker sub-dialog -->
  <v-dialog v-model="teacherPickerOpen" max-width="460" persistent>
    <v-card class="dialog-card" rounded="xl" elevation="0">
      <div class="d-flex align-center justify-space-between mb-4">
        <div>
          <h3 class="dialog-title" style="font-size:17px;">Seleccionar docente</h3>
          <p v-if="pickingSubject" class="dialog-subtitle">{{ pickingSubject.name }}</p>
        </div>
        <v-btn icon variant="text" @click="teacherPickerOpen = false">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div v-if="loadingTeachers" class="d-flex justify-center py-5">
        <v-progress-circular indeterminate color="#0f766e" size="28" />
      </div>
      <v-alert
        v-else-if="availableTeachers.length === 0"
        type="info"
        variant="tonal"
        rounded="lg"
        density="compact"
        class="mb-2"
      >
        No hay docentes que impartan esta materia.
      </v-alert>
      <div v-else class="teachers-list mb-3">
        <div
          v-for="t in availableTeachers"
          :key="t.id_teacher"
          class="teacher-item"
          :class="{ selected: selectedTeacherId === t.id_teacher }"
          @click="selectedTeacherId = t.id_teacher"
        >
          <div class="d-flex align-center ga-3">
            <div class="teacher-avatar">
              <v-icon size="18" color="#0f766e">mdi-account-tie</v-icon>
            </div>
            <div class="flex-1">
              <p class="teacher-name">{{ t.full_name }}</p>
              <p class="teacher-email">{{ t.email }}</p>
            </div>
            <v-icon v-if="selectedTeacherId === t.id_teacher" color="#0f766e" size="20">mdi-check-circle</v-icon>
          </div>
        </div>
      </div>

      <div class="d-flex justify-end ga-3">
        <v-btn variant="outlined" rounded="lg" @click="teacherPickerOpen = false">Cancelar</v-btn>
        <v-btn
          color="success"
          rounded="lg"
          :disabled="selectedTeacherId === null"
          :loading="savingAssignment"
          @click="confirmAssignment"
        >
          Confirmar
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { GroupTeacherAssignment, AvailableTeacher } from '../../entities/generation-group';
import {
  getAvailableTeachersInteractor,
  createAssignmentInteractor,
  deleteAssignmentInteractor,
} from '../generation-group.controller';
import { handleRequest } from '@/config/http-client.gateway';

type SubjectItem = { id_subject: number; name: string };

const props = defineProps<{
  modelValue: boolean;
  groupId: number;
  groupLetter: string;
  academicLevel: number;
  assignments: GroupTeacherAssignment[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'changed'): void;
}>();

const loadingSubjects = ref(false);
const subjects = ref<SubjectItem[]>([]);
const localAssignments = ref<GroupTeacherAssignment[]>([]);

const removingId = ref<number | null>(null);
const pickingSubjectId = ref<number | null>(null);

const teacherPickerOpen = ref(false);
const pickingSubject = ref<SubjectItem | null>(null);
const loadingTeachers = ref(false);
const availableTeachers = ref<AvailableTeacher[]>([]);
const selectedTeacherId = ref<number | null>(null);
const savingAssignment = ref(false);

function getAssignment(subjectId: number): GroupTeacherAssignment | undefined {
  return localAssignments.value.find(a => a.subject.id_subject === subjectId);
}

function getAssignmentTeacherName(subjectId: number): string {
  return getAssignment(subjectId)?.teacher.full_name ?? '';
}

function getAssignmentId(subjectId: number): number {
  return getAssignment(subjectId)?.id_assignment ?? -1;
}

const fetchSubjects = async () => {
  loadingSubjects.value = true;
  try {
    const res = await handleRequest<{ results: SubjectItem[] }>(
      'get',
      `/api/academic/subjects/?academic_level=${props.academicLevel}&status=true&page_size=50`
    );
    if (res.success && res.data) {
      subjects.value = (res.data as unknown as { results: SubjectItem[] }).results ?? [];
    }
  } finally {
    loadingSubjects.value = false;
  }
};

const openTeacherPicker = async (subj: SubjectItem) => {
  pickingSubject.value = subj;
  selectedTeacherId.value = null;
  availableTeachers.value = [];
  teacherPickerOpen.value = true;
  loadingTeachers.value = true;
  pickingSubjectId.value = subj.id_subject;
  try {
    const res = await getAvailableTeachersInteractor.execute(props.groupId, subj.id_subject);
    if (res.success && res.data) {
      availableTeachers.value = res.data.results ?? [];
    }
  } finally {
    loadingTeachers.value = false;
    pickingSubjectId.value = null;
  }
};

const confirmAssignment = async () => {
  if (!pickingSubject.value || selectedTeacherId.value === null) return;
  savingAssignment.value = true;
  try {
    const res = await createAssignmentInteractor.execute(props.groupId, {
      teacher_id: selectedTeacherId.value,
      subject_id: pickingSubject.value.id_subject,
    });
    if (res.success && res.data) {
      const idx = localAssignments.value.findIndex(
        a => a.subject.id_subject === pickingSubject.value!.id_subject
      );
      if (idx >= 0) {
        localAssignments.value[idx] = res.data;
      } else {
        localAssignments.value.push(res.data);
      }
      teacherPickerOpen.value = false;
      emit('changed');
    }
  } finally {
    savingAssignment.value = false;
  }
};

const removeAssignment = async (assignment: GroupTeacherAssignment | undefined) => {
  if (!assignment) return;
  removingId.value = assignment.id_assignment;
  try {
    const res = await deleteAssignmentInteractor.execute(props.groupId, assignment.id_assignment);
    if (res.success) {
      localAssignments.value = localAssignments.value.filter(
        a => a.id_assignment !== assignment.id_assignment
      );
      emit('changed');
    }
  } finally {
    removingId.value = null;
  }
};

const close = () => emit('update:modelValue', false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localAssignments.value = [...props.assignments];
      void fetchSubjects();
    } else {
      subjects.value = [];
      localAssignments.value = [];
    }
  },
);

watch(() => props.assignments, (val) => { localAssignments.value = [...val]; });
</script>

<style scoped>
.dialog-card {
  padding: 24px 24px 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06) !important;
}

.dialog-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ecfeff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.dialog-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.dialog-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #64748b;
}

.subjects-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 340px;
  overflow-y: auto;
  padding-right: 4px;
}

.subject-row {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 12px 14px;
  background: #fafcff;
}

.subj-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.assigned-teacher-text {
  font-size: 12px;
  color: #0f766e;
  font-weight: 600;
}

.no-teacher-text {
  font-size: 12px;
  color: #94a3b8;
}

.teachers-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 260px;
  overflow-y: auto;
  padding-right: 4px;
}

.teacher-item {
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  padding: 10px 12px;
  cursor: pointer;
  transition: border-color 0.18s, background 0.18s;
  background: #fafcff;
}

.teacher-item:hover {
  border-color: #0f766e;
  background: #f0fdfa;
}

.teacher-item.selected {
  border-color: #0f766e;
  background: #f0fdfa;
}

.teacher-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #ecfeff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.teacher-name {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
}

.teacher-email {
  margin: 0;
  font-size: 11px;
  color: #64748b;
}

.flex-1 { flex: 1; }
.min-w-0 { min-width: 0; }
</style>
