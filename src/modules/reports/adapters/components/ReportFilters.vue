<template>
  <v-card variant="outlined" class="pa-4 rounded-lg mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold pb-3">
      <v-icon start size="20">mdi-filter-variant</v-icon>
      Filtros del Reporte
    </v-card-title>
    <v-row dense>

      <!-- REPORT TYPE -->
      <v-col cols="12" md="4">
        <v-select
          v-model="localFilters.reportType"
          :items="availableTypes"
          item-title="label"
          item-value="value"
          label="Tipo de Reporte"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-file-chart"
        />
      </v-col>

      <!-- GENERATION -->
      <v-col cols="12" md="4">
        <v-select
          v-model="selectedGeneration"
          :items="generations"
          item-title="label"
          item-value="id_generation"
          label="Generación"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-calendar"
          :loading="loadingGenerations"
          clearable
          :disabled="loadingGroups"
        />
      </v-col>

      <!-- GROUP -->
      <v-col v-if="showGroup" cols="12" md="4">
        <v-select
          v-model="localFilters.groupId"
          :items="groups"
          item-title="label"
          item-value="id_group"
          label="Grupo"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-account-group"
          clearable
          :loading="loadingGroups"
        />
      </v-col>

      <!-- SUBJECT -->
      <v-col v-if="showSubject" cols="12" md="4">
        <v-select
          v-model="localFilters.subjectId"
          :items="subjects"
          item-title="label"
          item-value="id"
          label="Materia"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-book-open-variant"
          clearable
        />
      </v-col>

      <!-- EXAM -->
      <v-col v-if="showExam" cols="12" md="4">
        <v-select
          v-model="localFilters.examId"
          :items="exams"
          item-title="label"
          item-value="id"
          label="Examen"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-file-document-outline"
          clearable
          :loading="loadingExams"
        />
      </v-col>

      <!-- STUDENT -->
      <v-col v-if="showStudent" cols="12" md="4">
        <v-select
          v-model="localFilters.studentId"
          :items="studentOptions"
          item-title="label"
          item-value="id"
          label="Alumno"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-account-school"
          :placeholder="studentPlaceholder"
          persistent-placeholder
          :disabled="studentDisabled"
          :loading="loadingStudents"
        />
      </v-col>
    </v-row>

    <v-alert
      v-if="groupLoadError"
      type="error"
      variant="tonal"
      density="comfortable"
      class="mt-4"
    >
      {{ groupLoadError }}
      <template #append>
        <v-btn variant="text" size="small" @click="retryGroupLoad">
          Reintentar
        </v-btn>
      </template>
    </v-alert>

    <v-alert
      v-if="showStudent && localFilters.reportType === 'by-group' && localFilters.groupId && !loadingStudents && students.length === 0 && !groupLoadError"
      type="info"
      variant="tonal"
      density="comfortable"
      class="mt-4"
    >
      No hay alumnos en el reporte para el grupo seleccionado.
    </v-alert>

    <div class="d-flex justify-end mt-4">
      <v-btn
        color="success"
        size="large"
        rounded="lg"
        class="text-none"
        prepend-icon="mdi-magnify"
        :disabled="!canGenerate"
        @click="emit('generate', { ...localFilters })"
      >
        Generar reporte
      </v-btn>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted, watch } from 'vue';
import { ReportFiltersDto } from '../../entities/report-filters.dto';
import { REPORT_TYPE_OPTIONS, ReportTypeOption } from '../../entities/report-types';
import { ReportController } from '../report.controller';
import { UserController } from '@/modules/users/adapters/user.controller';
import { getGenerationGroupsInteractor } from '@/modules/groups/adapters/generation-group.controller';

/* =========================
   CONTROLLERS
========================= */
const reportController = new ReportController();
const userController = new UserController();

/* =========================
   EMIT / PROPS
========================= */
const props = defineProps<{ userRole: string }>();

const emit = defineEmits<{
  (e: 'generate', filters: ReportFiltersDto): void;
  (e: 'loading', value: boolean): void;
}>();

/* =========================
   STATE
========================= */
const selectedGeneration = ref<number | null>(null);

const generations = ref<any[]>([]);
const allGroups = ref<any[]>([]);
const groups = ref<any[]>([]);
const subjects = ref<any[]>([]);
const exams = ref<any[]>([]);
const students = ref<any[]>([]);

/* loading */
const loadingGenerations = ref(false);
const loadingGroups = ref(false);
const loadingExams = ref(false);
const loadingStudents = ref(false);
const groupLoadError = ref('');

/* =========================
   FILTERS
========================= */
const localFilters = reactive<ReportFiltersDto>({
  reportType: 'by-exam',
  groupId: undefined,
  subjectId: undefined,
  examId: undefined,
  studentId: undefined,
});

/* =========================
   TYPES
========================= */
const availableTypes = computed<ReportTypeOption[]>(() =>
  REPORT_TYPE_OPTIONS.filter((t) => t.roles.includes(props.userRole))
);

/* =========================
   VISIBILITY
========================= */
const showGroup = computed(() =>
  ['by-group', 'by-student', 'by-exam', 'student-exam-detail'].includes(localFilters.reportType)
);

const showSubject = computed(() =>
  ['by-exam', 'student-exam-detail'].includes(localFilters.reportType)
);

const showExam = computed(() =>
  ['by-exam', 'student-exam-detail'].includes(localFilters.reportType)
);

const showStudent = computed(() =>
  ['by-student', 'student-exam-detail'].includes(localFilters.reportType)
);

const studentOptions = computed(() => {
  return students.value;
});

const studentPlaceholder = computed(() => {
  if (!localFilters.groupId) return 'Selecciona un grupo primero';
  return 'Selecciona un alumno';
});

const studentDisabled = computed(() => {
  if (!showStudent.value) return true;
  if (!localFilters.groupId) return true;
  if (loadingStudents.value) return true;
  return false;
});

/* =========================
   VALIDATION
========================= */
const canGenerate = computed(() => {
  switch (localFilters.reportType) {
    case 'by-exam':
      return !!localFilters.examId;
    case 'by-group':
      return !!localFilters.groupId;
    case 'by-student':
      return !!localFilters.studentId;
    case 'student-exam-detail':
      return !!localFilters.studentId && !!localFilters.examId;
    default:
      return false;
  }
});

/* =========================
   LOAD EXAMS
========================= */
async function loadExams(subjectId?: number) {
  loadingExams.value = true;

  try {
    if (!subjectId || !localFilters.groupId) {
      exams.value = [];
      return;
    }

    const subjectAllowed = subjects.value.some((subject: any) => Number(subject.id) === Number(subjectId));
    if (!subjectAllowed) {
      exams.value = [];
      return;
    }

    const res = await reportController.getExams(subjectId, localFilters.groupId);
    const list = Array.isArray(res?.data) ? res.data : (res?.data as any)?.results ?? [];

    if (res?.success) {
      const mapped = list.map((e: any) => ({
        id: e.id ?? e.id_exam,
        label: e.label ?? e.name ?? e.title,
        subjectId: e.subject_id ?? e.id_subject ?? e.subject?.id_subject,
      }));

      // Safety check: backend should already return exams for subject+group,
      // but we enforce it client-side if subject info is present.
      exams.value = mapped.filter((exam: any) => {
        if (!exam.subjectId) return true;
        return Number(exam.subjectId) === Number(subjectId);
      });
    } else {
      exams.value = [];
    }
  } catch (error) {
    console.error('loadExams error:', error);
    exams.value = [];
  } finally {
    loadingExams.value = false;
  }
}

function applyGroupFilter(idGeneration?: number | null) {
  if (!idGeneration) {
    groups.value = [...allGroups.value];
    return;
  }

  groups.value = allGroups.value.filter((g) => Number(g.generation_year) === Number(idGeneration));
}

async function resolveGroupAssignments(groupId: number) {
  const selectedGroup = allGroups.value.find((group) => Number(group.id_group) === Number(groupId));
  const inlineAssignments = Array.isArray(selectedGroup?.assignments) ? selectedGroup.assignments : [];

  if (inlineAssignments.length > 0) {
    return inlineAssignments;
  }

  const idGeneration = Number((selectedGroup as any)?.id_generation);
  if (!Number.isFinite(idGeneration)) {
    return [];
  }

  try {
    const response = await getGenerationGroupsInteractor.execute({
      idGeneration,
      page: 1,
      pageSize: 100,
    });

    const generationGroups = response?.data?.results ?? [];
    const matchedGroup = generationGroups.find((group: any) => Number(group.id_group) === Number(groupId));
    return Array.isArray(matchedGroup?.assignments) ? matchedGroup.assignments : [];
  } catch {
    return [];
  }
}

async function loadSubjectsForGroup(groupId?: number) {
  try {
    if (!groupId) {
      subjects.value = [];
      return;
    }

    const assignments = await resolveGroupAssignments(groupId);

    if (assignments.length > 0) {
      const unique = new Map<number, { id: number; label: string }>();

      assignments.forEach((assignment: any) => {
        const subject = assignment?.subject;
        const subjectId = Number(subject?.id_subject ?? subject?.id);
        const subjectLabel = subject?.name ?? subject?.label;

        if (Number.isFinite(subjectId) && subjectLabel) {
          unique.set(subjectId, { id: subjectId, label: subjectLabel });
        }
      });

      subjects.value = Array.from(unique.values());
      return;
    }

    // Strict behavior: only subjects assigned to this group.
    subjects.value = [];
  } catch {
    subjects.value = [];
  }
}

async function loadStudentsByGroup(groupId?: number) {
  loadingStudents.value = true;

  try {
    if (!groupId) {
      students.value = [];
      return;
    }

    const res: any = await userController.getUsers({
      pagination: {
        page: 1,
        limit: 100,
      },
      role: 'student',
      group: groupId,
    });

    const list = Array.isArray(res?.data)
      ? res.data
      : (res?.data as any)?.results ?? res?.results ?? [];

    students.value = list.map((student: any) => {
      const firstName = student.first_name || '';
      const lastName = student.last_name || '';
      const fullName = student.full_name || `${firstName} ${lastName}`.trim();

      return {
        id: student.id_user,
        label: `${student.matricula} - ${fullName}`,
      };
    });
  } catch (error) {
    console.error('loadStudentsByGroup error:', error);
    students.value = [];
  } finally {
    loadingStudents.value = false;
  }
}

async function retryGroupLoad() {
  if (!localFilters.groupId) return;

  await loadStudentsByGroup(localFilters.groupId);
}

/* =========================
   WATCH REPORT TYPE
========================= */
watch(() => localFilters.reportType, () => {
  localFilters.groupId = undefined;
  localFilters.subjectId = undefined;
  localFilters.examId = undefined;
  localFilters.studentId = undefined;

  subjects.value = [];
  exams.value = [];
  students.value = [];
  groupLoadError.value = '';

  // Aplicar filtro de grupo si hay generación seleccionada
  if (selectedGeneration.value) {
    applyGroupFilter(selectedGeneration.value);
  }
});

/* =========================
   WATCH GENERATION
========================= */
watch(selectedGeneration, (val) => {
  localFilters.groupId = undefined;
  localFilters.subjectId = undefined;
  localFilters.examId = undefined;
  localFilters.studentId = undefined;

  subjects.value = [];
  exams.value = [];
  students.value = [];
  groupLoadError.value = '';

  applyGroupFilter(val);
});

/* =========================
   WATCH GROUP ID - MAIN TRIGGER
========================= */
watch(() => localFilters.groupId, async (groupId) => {
  // Limpiar los filtros dependientes
  localFilters.subjectId = undefined;
  localFilters.examId = undefined;
  localFilters.studentId = undefined;

  subjects.value = [];
  exams.value = [];
  students.value = [];
  groupLoadError.value = '';

  if (!groupId) return;

  // Según el tipo de reporte, cargar los datos necesarios
  if (showSubject.value) {
    // by-exam o student-exam-detail necesitan materias
    await loadSubjectsForGroup(groupId);
  }

  if (showStudent.value) {
    // by-student o student-exam-detail cargan alumnos por grupo
    await loadStudentsByGroup(groupId);
  }
});

/* =========================
   WATCH SUBJECT ID → LOAD EXAMS
========================= */
watch(() => localFilters.subjectId, async (subjectId) => {
  localFilters.examId = undefined;
  exams.value = [];

  if (!subjectId || !localFilters.groupId) {
    exams.value = [];
    return;
  }

  await loadExams(subjectId);
});

/* =========================
   INIT - Load all groups and generate years
========================= */
onMounted(async () => {
  emit('loading', true);
  try {
    // Cargar todos los grupos primero
    const res = await reportController.getGroups();
    const list = Array.isArray(res?.data) ? res.data : [];

    allGroups.value = list.map((g: any) => ({
      id_group: g.id,
      id_generation: g.idGeneration,
      group_letter: g.groupLetter,
      academic_level: g.academicLevel,
      generation_year: g.generationYear,
      label: g.label,
      assignments: Array.isArray(g.assignments) ? g.assignments : [],
    }));

    // Extraer años únicos y ordenarlos
    const years = [...new Set(allGroups.value
      .map((g) => Number(g.generation_year))
      .filter((y) => Number.isFinite(y)))].sort((a, b) => b - a);

    generations.value = years.map((year) => ({
      id_generation: year,
      label: String(year),
    }));

    // Mostrar todos los grupos al inicio (sin generation seleccionada)
    groups.value = [...allGroups.value];
  } finally {
    emit('loading', false);
  }
});
</script>