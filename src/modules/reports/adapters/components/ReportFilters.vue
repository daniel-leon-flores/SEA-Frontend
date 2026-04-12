<template>
  <v-card variant="outlined" class="pa-4 rounded-lg mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold pb-3">
      <v-icon start size="20">mdi-filter-variant</v-icon>
      Filtros del Reporte
    </v-card-title>

    <v-row dense>
      <!-- Report type -->
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
          hide-details
          @update:model-value="onTypeChange"
        />
      </v-col>

      <!-- Period -->
      <v-col v-if="showPeriod" cols="12" md="4">
        <v-select
          v-model="localFilters.periodId"
          :items="periods"
          item-title="label"
          item-value="id"
          label="Periodo"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-calendar-range"
          hide-details
          clearable
          :loading="loadingPeriods"
          @update:model-value="onPeriodChange"
        />
      </v-col>

      <!-- Group -->
      <v-col v-if="showGroup" cols="12" md="4">
        <v-select
          v-model="localFilters.groupId"
          :items="groups"
          item-title="label"
          item-value="id"
          label="Grupo"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-account-group"
          hide-details
          clearable
          :loading="loadingGroups"
          @update:model-value="onGroupChange"
        />
      </v-col>

      <!-- Subject -->
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
          hide-details
          clearable
          :loading="loadingSubjects"
          @update:model-value="onSubjectChange"
        />
      </v-col>

      <!-- Exam -->
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
          hide-details
          clearable
          :loading="loadingExams"
        />
      </v-col>

      <!-- Student -->
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
          hide-details
          clearable
          :loading="loadingStudents"
        />
      </v-col>

      <!-- Date from -->
      <v-col v-if="showDates" cols="12" md="3">
        <v-text-field
          v-model="localFilters.dateFrom"
          label="Fecha desde"
          type="date"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-calendar-start"
          hide-details
          clearable
        />
      </v-col>

      <!-- Date to -->
      <v-col v-if="showDates" cols="12" md="3">
        <v-text-field
          v-model="localFilters.dateTo"
          label="Fecha hasta"
          type="date"
          variant="outlined"
          density="compact"
          prepend-inner-icon="mdi-calendar-end"
          hide-details
          clearable
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
import { ref, computed, onMounted } from 'vue';
import { ReportFiltersDto } from '../../entities/report-filters.dto';
import { REPORT_TYPE_OPTIONS, ReportTypeOption } from '../../entities/report-types';
import { ReportController } from '../report.controller';
import type { PeriodOption, GroupOption, SubjectOption, ExamOption, StudentOption } from '../../entities/report-data';

const props = defineProps<{
  userRole: string;
}>();

const emit = defineEmits<{
  (e: 'generate', filters: ReportFiltersDto): void;
  (e: 'loading', value: boolean): void;
}>();

const controller = new ReportController();

const localFilters = ref<ReportFiltersDto>({
  reportType: 'by-exam',
});

// Filter options data
const periods = ref<PeriodOption[]>([]);
const groups = ref<GroupOption[]>([]);
const subjects = ref<SubjectOption[]>([]);
const exams = ref<ExamOption[]>([]);
const students = ref<StudentOption[]>([]);

// Loading states
const loadingPeriods = ref(false);
const loadingGroups = ref(false);
const loadingSubjects = ref(false);
const loadingExams = ref(false);
const loadingStudents = ref(false);

// Available report types based on role
const availableTypes = computed<ReportTypeOption[]>(() =>
  REPORT_TYPE_OPTIONS.filter((t) => t.roles.includes(props.userRole))
);

// Visibility flags per report type
const reportType = computed(() => localFilters.value.reportType);
const showPeriod = computed(() => ['by-period', 'by-group', 'by-exam'].includes(reportType.value));
const showGroup = computed(() => ['by-group', 'by-student', 'by-exam', 'student-exam-detail'].includes(reportType.value));
const showSubject = computed(() => ['by-exam', 'student-exam-detail'].includes(reportType.value));
const showExam = computed(() => ['by-exam', 'student-exam-detail'].includes(reportType.value));
const showStudent = computed(() => ['by-student', 'student-exam-detail'].includes(reportType.value));
const showDates = computed(() => ['by-period', 'by-group'].includes(reportType.value));

// Validation
const canGenerate = computed(() => {
  const f = localFilters.value;
  switch (f.reportType) {
    case 'by-exam':
      return !!f.examId;
    case 'by-period':
      return !!f.periodId;
    case 'by-group':
      return !!f.groupId;
    case 'by-student':
      return !!f.studentId;
    case 'student-exam-detail':
      return !!f.studentId && !!f.examId;
    default:
      return false;
  }
});

// Data loading functions
async function loadPeriods() {
  loadingPeriods.value = true;
  try {
    const res = await controller.getPeriods();
    if (res.success && res.data) periods.value = res.data;
  } finally {
    loadingPeriods.value = false;
  }
}

async function loadGroups(periodId?: number) {
  loadingGroups.value = true;
  try {
    const res = await controller.getGroups(periodId);
    if (res.success && res.data) groups.value = res.data;
  } finally {
    loadingGroups.value = false;
  }
}

async function loadSubjects() {
  loadingSubjects.value = true;
  try {
    const res = await controller.getSubjects();
    if (res.success && res.data) subjects.value = res.data;
  } finally {
    loadingSubjects.value = false;
  }
}

async function loadExams(subjectId?: number, groupId?: number) {
  loadingExams.value = true;
  try {
    const res = await controller.getExams(subjectId, groupId);
    if (res.success && res.data) exams.value = res.data;
  } finally {
    loadingExams.value = false;
  }
}

async function loadStudents(groupId?: number) {
  loadingStudents.value = true;
  try {
    const res = await controller.getStudents(groupId);
    if (res.success && res.data) students.value = res.data;
  } finally {
    loadingStudents.value = false;
  }
}

// Event handlers
function onTypeChange() {
  // Reset dependent filters
  localFilters.value = { reportType: localFilters.value.reportType };
}

function onPeriodChange() {
  localFilters.value.groupId = undefined;
  localFilters.value.examId = undefined;
  loadGroups(localFilters.value.periodId);
}

function onGroupChange() {
  localFilters.value.examId = undefined;
  localFilters.value.studentId = undefined;
  loadExams(localFilters.value.subjectId, localFilters.value.groupId);
  loadStudents(localFilters.value.groupId);
}

function onSubjectChange() {
  localFilters.value.examId = undefined;
  loadExams(localFilters.value.subjectId, localFilters.value.groupId);
}

// Initial load — emit loading true/false so parent can show the global Loader
onMounted(async () => {
  emit('loading', true);
  await Promise.all([
    loadPeriods(),
    loadGroups(),
    loadSubjects(),
    loadExams(),
    loadStudents(),
  ]);
  emit('loading', false);
});
</script>
