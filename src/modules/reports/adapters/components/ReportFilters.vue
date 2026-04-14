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
          :items="students"
          item-title="label"
          item-value="id"
          label="Alumno"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-account-school"
          clearable
          :loading="loadingStudents"
        />
      </v-col>
    </v-row>

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
import { GenerationController } from '../../../generations/adapters/generation.controller';
import { getGenerationGroupsInteractor } from '@/modules/groups/adapters/generation-group.controller';
import { ExamController } from '@/modules/exams/adapters/exam.controller';
import { UserController } from '@/modules/users/adapters/user.controller';

/* =========================
   CONTROLLERS
========================= */
const reportController = new ReportController();
const generationController = new GenerationController();
const examController = new ExamController();
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
const groups = ref<any[]>([]);
const subjects = ref<any[]>([]);
const exams = ref<any[]>([]);
const students = ref<any[]>([]);

/* loading */
const loadingGenerations = ref(false);
const loadingGroups = ref(false);
const loadingExams = ref(false);
const loadingStudents = ref(false);

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
   LOAD GENERATIONS
========================= */
async function loadGenerations() {
  loadingGenerations.value = true;

  try {
    const res = await generationController.getGenerations(undefined, undefined, undefined, 1, 100);

    const results = res?.data?.results ?? [];

    generations.value = results.map((g: any) => {
      const start = g.year;
      const end = g.year + (g.total_levels ? Math.ceil(g.total_levels / 2) : 1);

      return {
        ...g,
        label: `${start} - ${end}`,
      };
    });
  } finally {
    loadingGenerations.value = false;
  }
}
/* =========================
   LOAD EXAMS ✅
========================= */
async function loadExams(subjectId?: number) {
  loadingExams.value = true;

  try {
    if (!subjectId) {
      exams.value = [];
      return;
    }

    const res = await examController.getAllExams({
      page: 1,
      page_size: 100,
      id_subject: subjectId, // 🔥 aquí está el filtro real
    });

    if (res?.success && res?.data?.results) {
      exams.value = res.data.results.map((e: any) => ({
        id: e.id_exam,
        label: e.name,
      }));
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

/* =========================
   LOAD GROUPS
========================= */
async function loadGroups(idGeneration: number) {
  loadingGroups.value = true;

  try {
    const res = await getGenerationGroupsInteractor.execute({
      idGeneration,
      page: 1,
      pageSize: 100,
    });

    const results = res?.data?.results ?? [];

    groups.value = results.map((g: any) => ({
      ...g,
      label: `${g.group_letter} - ${g.period_info ?? ''} (${g.generation_year ?? ''})`,
    }));
  } finally {
    loadingGroups.value = false;
  }
}

/* =========================
   WATCH GENERATION
========================= */
watch(selectedGeneration, async (val) => {
  localFilters.groupId = undefined;
  localFilters.subjectId = undefined;
  localFilters.examId = undefined;
  localFilters.studentId = undefined;

  groups.value = [];
  subjects.value = [];
  exams.value = [];

  if (!val) return;

  await loadGroups(val);
});
/* =========================
   LOAD STUDENTS ✅ NUEVO
========================= */
async function loadStudents(groupId?: number) {
  loadingStudents.value = true;

  try {
    if (!groupId) {
      students.value = [];
      return;
    }

    const res = await userController.getUsers({
      pagination: {
        page: 1,
        limit: 100,
      },
      role: 'student',
      group: groupId,
    });

    // 👇 soporta ambas respuestas
    const list =
      res?.results ??
      res?.data?.results ??
      [];

    students.value = list.map((s: any) => ({
      id: s.id_user,
      label: `${s.first_name} ${s.last_name}`, // 🔥 importante
    }));

  } catch (error) {
    console.error('loadStudents error:', error);
    students.value = [];
  } finally {
    loadingStudents.value = false;
  }
}

/* =========================
   GROUP → SUBJECTS
========================= */
watch(() => localFilters.groupId, async (groupId) => {
  localFilters.subjectId = undefined;
  localFilters.examId = undefined;
  localFilters.studentId = undefined;

  subjects.value = [];
  exams.value = [];
  students.value = []; // 👈 limpia primero

  if (!groupId) return;

  const group = groups.value.find(
    (g) => Number(g.id_group) === Number(groupId)
  );

  if (group?.assignments) {
    subjects.value = group.assignments.map((a: any) => ({
      id: a.subject.id_subject,
      label: a.subject.name,
    }));
  }

  await loadStudents(groupId); // 🔥 aquí sucede la magia
});

/* =========================
   SUBJECT → EXAMS
========================= */
watch(() => localFilters.subjectId, async (subjectId) => {
  localFilters.examId = undefined;

  if (!subjectId) return;

  await loadExams(subjectId);
});

/* =========================
   INIT
========================= */
onMounted(async () => {
  emit('loading', true);
  await loadGenerations();
  emit('loading', false);
});
</script>