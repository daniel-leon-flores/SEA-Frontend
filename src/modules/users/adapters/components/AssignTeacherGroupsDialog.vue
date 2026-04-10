<template>
  <v-dialog :model-value="modelValue" max-width="640" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card class="dialog-card" rounded="xl" elevation="0">
      <!-- Header -->
      <div class="d-flex align-center justify-space-between mb-5">
        <div class="d-flex align-center ga-3">
          <div class="dialog-icon">
            <v-icon color="#0f766e">mdi-account-group</v-icon>
          </div>
          <div>
            <h2 class="dialog-title">Asignar a grupos</h2>
            <p v-if="teacher" class="dialog-subtitle">{{ teacher.first_name }} {{ teacher.last_name }}</p>
          </div>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div v-if="loading" class="d-flex justify-center align-center py-8">
        <v-progress-circular indeterminate color="#0f766e" size="36" />
      </div>

      <v-alert
        v-else-if="!loading && groups.length === 0"
        type="info"
        variant="tonal"
        rounded="lg"
        class="mb-2"
        density="compact"
      >
        No hay grupos activos cuyo nivel académico coincida con las materias del docente.
      </v-alert>

      <template v-else>
        <p class="section-label mb-3">
          Selecciona el grupo y la materia para asignar al docente
        </p>

        <div class="groups-list mb-1">
          <div v-for="group in groups" :key="group.id_group" class="group-item">
            <p class="group-name mb-2">
              Grupo {{ group.group_letter }} · Nivel {{ group.academic_level }} · Gen. {{ group.generation_year }}
            </p>
            <div class="subjects-grid">
              <div
                v-for="subj in group.subjects_at_level"
                :key="subj"
                class="subj-assignment-row"
              >
                <div class="d-flex align-center justify-space-between ga-2">
                  <div>
                    <span class="subj-name">{{ subj }}</span>
                    <div v-if="getGroupSubjectAssignment(group, subj)" class="d-flex align-center ga-1 mt-1">
                      <v-icon size="12" color="#0f766e">mdi-check-circle-outline</v-icon>
                      <span class="already-text">{{ getGroupSubjectAssignment(group, subj)!.teacher.full_name }}</span>
                    </div>
                    <div v-else class="d-flex align-center ga-1 mt-1">
                      <v-icon size="12" color="#94a3b8">mdi-minus-circle-outline</v-icon>
                      <span class="empty-text">Sin docente</span>
                    </div>
                  </div>
                  <v-btn
                    size="x-small"
                    :variant="isAlreadyMe(group, subj) ? 'tonal' : 'outlined'"
                    :color="isAlreadyMe(group, subj) ? 'error' : '#0f766e'"
                    rounded="lg"
                    :loading="pendingKey === makeKey(group.id_group, subj)"
                    @click="toggleAssignment(group, subj)"
                  >
                    {{ isAlreadyMe(group, subj) ? 'Quitar' : 'Asignar' }}
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <v-divider class="my-5" />
      <div class="d-flex justify-end">
        <v-btn variant="outlined" rounded="lg" @click="close">Cerrar</v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { User } from '../../entities/user';
import type { EligibleGroup } from '../../use-cases/ports/user.repository';
import { UserController } from '../user.controller';
import { createAssignmentInteractor, deleteAssignmentInteractor } from '@/modules/groups/adapters/generation-group.controller';
import { handleRequest } from '@/config/http-client.gateway';

const props = defineProps<{
  modelValue: boolean;
  teacher: User | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'assigned'): void;
}>();

const controller = new UserController();

const loading = ref(false);
const groups = ref<EligibleGroup[]>([]);
const pendingKey = ref<string | null>(null);

// We need the teacher's TeacherProfile pk to create assignments.
// We'll resolve it by checking an existing assignment or the available-teachers endpoint.
const teacherProfileId = ref<number | null>(null);

// Map subject name -> subject id, resolved when we load eligible groups.
// The eligible-groups endpoint returns subjects_at_level as names, not ids.
// We need to fetch subject ids from the subjects endpoint.
type SubjectMap = Record<string, number>;
const subjectMap = ref<SubjectMap>({});

function makeKey(groupId: number, subjName: string): string {
  return `${groupId}::${subjName}`;
}

function getGroupSubjectAssignment(group: EligibleGroup, subjName: string) {
  return group.assignments.find(a => a.subject.name === subjName);
}

function isAlreadyMe(group: EligibleGroup, subjName: string): boolean {
  const a = getGroupSubjectAssignment(group, subjName);
  if (!a) return false;
  return teacherProfileId.value !== null && a.teacher.id_teacher === teacherProfileId.value;
}

const resolveTeacherProfileId = async () => {
  if (!props.teacher) return;
  // Try to find from existing assignments
  for (const g of groups.value) {
    const tName = `${props.teacher.first_name} ${props.teacher.last_name}`;
    for (const a of g.assignments) {
      if (a.teacher.full_name === tName) {
        teacherProfileId.value = a.teacher.id_teacher;
        return;
      }
    }
  }
  // Fallback: ask eligible groups from user.subjects
  // We'll try to find via the subjects endpoint — but we don't have an explicit endpoint.
  // Leave null; toggleAssignment will attempt a lookup.
};

const fetchSubjectIds = async (levelNumbers: number[]) => {
  const uniqueLevels = [...new Set(levelNumbers)];
  for (const level of uniqueLevels) {
    try {
      const res = await handleRequest<{ results: { id_subject: number; name: string }[] }>(
        'get',
        `/api/academic/subjects/?academic_level=${level}&status=true&page_size=50`
      );
      if (res.success && res.data) {
        for (const s of (res.data as unknown as { results: { id_subject: number; name: string }[] }).results) {
          subjectMap.value[s.name] = s.id_subject;
        }
      }
    } catch {
      // ignore
    }
  }
};

const fetchGroups = async () => {
  if (!props.teacher) return;
  loading.value = true;
  teacherProfileId.value = null;
  subjectMap.value = {};
  try {
    const res = await controller.getEligibleGroups(props.teacher.id_user);
    if (res.success && res.data) {
      groups.value = res.data.results ?? [];
      await resolveTeacherProfileId();
      const levels = groups.value.map(g => g.academic_level);
      await fetchSubjectIds(levels);
    } else {
      groups.value = [];
    }
  } catch {
    groups.value = [];
  } finally {
    loading.value = false;
  }
};

const resolveTeacherProfileIdFromAvailableTeachers = async (groupId: number, subjectId: number): Promise<number | null> => {
  if (!props.teacher) return null;
  try {
    const res = await handleRequest<{ results: { id_teacher: number; full_name: string }[] }>(
      'get',
      `/api/academic/groups/${groupId}/available-teachers/?subject_id=${subjectId}`
    );
    if (res.success && res.data) {
      const tName = `${props.teacher.first_name} ${props.teacher.last_name}`;
      const found = (res.data as unknown as { results: { id_teacher: number; full_name: string }[] }).results.find(
        t => t.full_name === tName
      );
      if (found) {
        teacherProfileId.value = found.id_teacher;
        return found.id_teacher;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

const toggleAssignment = async (group: EligibleGroup, subjName: string) => {
  const key = makeKey(group.id_group, subjName);
  const existing = getGroupSubjectAssignment(group, subjName);
  const alreadyMe = isAlreadyMe(group, subjName);

  pendingKey.value = key;
  try {
    if (alreadyMe && existing) {
      // Remove my assignment
      await deleteAssignmentInteractor.execute(group.id_group, existing.id_assignment);
      group.assignments = group.assignments.filter(a => a.id_assignment !== existing.id_assignment);
      emit('assigned');
      return;
    }

    // Create / replace assignment
    const subjectId = subjectMap.value[subjName];
    if (!subjectId) {
      console.error('[AssignTeacherGroupsDialog] subject id not resolved for', subjName);
      return;
    }

    let profileId = teacherProfileId.value;
    if (!profileId) {
      profileId = await resolveTeacherProfileIdFromAvailableTeachers(group.id_group, subjectId);
    }
    if (!profileId) {
      console.error('[AssignTeacherGroupsDialog] Cannot resolve TeacherProfile pk');
      return;
    }

    const res = await createAssignmentInteractor.execute(group.id_group, {
      teacher_id: profileId,
      subject_id: subjectId,
    });
    if (res.success && res.data) {
      const idx = group.assignments.findIndex(a => a.subject.id_subject === subjectId);
      if (idx >= 0) {
        group.assignments[idx] = res.data;
      } else {
        group.assignments.push(res.data);
      }
      emit('assigned');
    }
  } finally {
    pendingKey.value = null;
  }
};

const close = () => emit('update:modelValue', false);

watch(() => props.modelValue, (open) => {
  if (open) void fetchGroups();
  else {
    groups.value = [];
    teacherProfileId.value = null;
  }
});
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

.section-label {
  font-size: 13px;
  font-weight: 600;
  color: #475569;
  margin: 0;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
}

.group-item {
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  padding: 12px 14px;
  background: #fafcff;
}

.group-name {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
}

.subjects-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.subj-assignment-row {
  background: #f8fafc;
  border: 1px solid #f1f5f9;
  border-radius: 8px;
  padding: 6px 10px;
}

.subj-name {
  font-size: 13px;
  font-weight: 600;
  color: #0f172a;
}

.already-text {
  font-size: 11px;
  color: #0f766e;
}

.empty-text {
  font-size: 11px;
  color: #94a3b8;
}
</style>
