<template>
  <v-container fluid class="pa-8" style="background: #f9fbff; min-height: 100vh;">
    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title text-h4 font-weight-bold mb-2">Reportes</h1>
        <p class="page-subtitle text-body-1 text-grey-darken-1">
          Genera y visualiza reportes del sistema
        </p>
      </div>
    </div>

    <!-- Report type selector -->
    <ReportFilters :user-role="userRole" @generate="handleGenerate" @loading="onFiltersLoading" />

    <!-- Loading state -->
    <Loader :visible="loading" :message="loaderMessage" />

    <!-- Error state -->
    <v-alert v-if="!loading && errorMsg" type="error" variant="tonal" class="mb-4" closable @click:close="errorMsg = ''">
      {{ errorMsg }}
      <template #append>
        <v-btn variant="text" size="small" @click="lastFilters && handleGenerate(lastFilters)">Reintentar</v-btn>
      </template>
    </v-alert>

    <v-alert v-if="!loading && !errorMsg && noDataMsg" type="info" variant="tonal" class="mb-4" closable @click:close="noDataMsg = ''">
      {{ noDataMsg }}
    </v-alert>

    <!-- Empty / initial state -->
    <div v-if="!loading && !errorMsg && !noDataMsg && !hasVisibleReportData" class="text-center py-16">
      <v-icon size="100" color="grey-lighten-1" class="mb-4">mdi-chart-bar</v-icon>
      <h3 class="text-h5 text-grey-darken-1 mb-2">Selecciona un tipo de reporte</h3>
      <p class="text-body-2 text-grey">Elige los filtros y haz clic en "Generar Reporte" para visualizar los datos.</p>
    </div>

    <!-- ===== BY EXAM ===== -->
    <template v-if="!loading && activeType === 'by-exam' && examReport">
      <MetricCards :metrics="examMetrics" />
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <ReportChart
            title="Distribución de Calificaciones"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="examGradeChartData"
            :chart-options="barOptions"
          />
        </v-col>
        <v-col cols="12" md="6">
          <ReportChart
            title="Estado de Exámenes"
            icon="mdi-chart-donut"
            type="doughnut"
            :chart-data="examStatusChartData"
          />
        </v-col>
      </v-row>
      <ReportTable
        title="Resultados por Alumno"
        :columns="examColumns"
        :rows="examReport.students"
        @export-pdf="exportExamPdf"
        @export-excel="exportExamExcel"
      >
        <template #cell-grade="{ value }">
          <v-chip :color="gradeColor(value)" size="small" variant="flat">
            {{ value !== null ? value : '—' }}
          </v-chip>
        </template>
        <template #cell-status="{ value }">
          <v-chip :color="statusColor(value)" size="small" variant="tonal">
            {{ statusLabel(value) }}
          </v-chip>
        </template>
      </ReportTable>
    </template>

    <!-- ===== BY GROUP ===== -->
    <template v-if="!loading && activeType === 'by-group' && filteredGroupReport">
      <MetricCards :metrics="groupMetrics" />
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <ReportChart
            title="Distribución de Calificaciones del Grupo"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="groupGradeChartData"
            :chart-options="barOptions"
          />
        </v-col>
        <v-col cols="12" md="6">
          <ReportChart
            title="Tasa de Aprobación por Alumno"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="groupApprovalChartData"
            :chart-options="barOptions"
          />
        </v-col>
      </v-row>
      <ReportTable
        title="Alumnos del Grupo"
        :columns="groupColumns"
        :rows="filteredGroupReport.students"
        @export-pdf="exportGroupPdf"
        @export-excel="exportGroupExcel"
      >
        <template #cell-averageGrade="{ value }">
          <v-chip :color="gradeColor(value)" size="small" variant="flat">
            {{ formatNumber(value) }}
          </v-chip>
        </template>
        <template #cell-approvalRate="{ value }">
          <v-chip color="primary" size="small" variant="tonal">
            {{ formatPercent(value) }}
          </v-chip>
        </template>
      </ReportTable>
    </template>

    <!-- ===== BY STUDENT ===== -->
    <template v-if="!loading && activeType === 'by-student' && studentReport">
      <v-card variant="outlined" class="pa-4 rounded-lg mb-4">
        <div class="d-flex align-center ga-4 mb-2">
          <v-icon size="40" color="#069574">mdi-account-school</v-icon>
          <div>
            <div class="text-h6 font-weight-bold">{{ studentReport.fullName }}</div>
            <div class="text-body-2 text-grey">{{ studentReport.matricula }} — Grupo {{ studentReport.groupLetter }} (Nivel {{ studentReport.academicLevel }})</div>
          </div>
        </div>
      </v-card>
      <MetricCards :metrics="studentMetrics" />
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <ReportChart
            title="Distribución de Calificaciones"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="studentGradeChartData"
            :chart-options="barOptions"
          />
        </v-col>
        <v-col cols="12" md="6">
          <ReportChart
            title="Calificaciones por Examen"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="studentExamChartData"
            :chart-options="studentExamBarOptions"
          />
        </v-col>
      </v-row>
      <ReportTable
        title="Historial de Exámenes"
        :columns="studentColumns"
        :rows="studentReport.exams"
        @export-pdf="exportStudentPdf"
        @export-excel="exportStudentExcel"
      >
        <template #cell-grade="{ value }">
          <v-chip :color="gradeColor(value)" size="small" variant="flat">
            {{ value !== null ? value : '—' }}
          </v-chip>
        </template>
      </ReportTable>
    </template>

    <!-- ===== STUDENT-EXAM DETAIL ===== -->
    <template v-if="!loading && activeType === 'student-exam-detail' && detailReport">
      <v-card variant="outlined" class="pa-4 rounded-lg mb-4">
        <v-row>
          <v-col cols="12" md="6">
            <div class="text-h6 font-weight-bold">{{ detailReport.fullName }} ({{ detailReport.matricula }})</div>
            <div class="text-body-2 text-grey">Examen: {{ detailReport.examTitle }} — {{ detailReport.subjectName }}</div>
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center justify-end ga-4">
            <v-chip :color="gradeColor(detailReport.grade)" size="large" variant="flat" class="text-h6 px-6">
              {{ detailReport.grade !== null ? detailReport.grade : '—' }}
            </v-chip>
            <div class="text-body-2">{{ detailReport.correctAnswers }}/{{ detailReport.totalQuestions }} correctas</div>
          </v-col>
        </v-row>
      </v-card>
      <ReportTable
        title="Respuestas del Alumno"
        :columns="detailColumns"
        :rows="detailReport.answers"
        @export-pdf="exportDetailPdf"
        @export-excel="exportDetailExcel"
      >
        <template #cell-isCorrect="{ value }">
          <v-icon :color="value ? 'success' : 'error'" size="20">
            {{ value ? 'mdi-check-circle' : 'mdi-close-circle' }}
          </v-icon>
        </template>
      </ReportTable>
    </template>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Loader from '@/components/Loader.vue';
import ReportFilters from '../components/ReportFilters.vue';
import MetricCards from '../components/MetricCards.vue';
import ReportChart from '../components/ReportChart.vue';
import ReportTable from '../components/ReportTable.vue';
import { ReportController } from '../report.controller';
import { ReportFiltersDto } from '../../entities/report-filters.dto';
import { ReportType } from '../../entities/report-types';
import type {
  ExamReportData,
  GroupReportData,
  GroupStudentRow,
  StudentReportData,
  StudentExamDetailData,
  SummaryMetrics,
  GradeDistribution,
} from '../../entities/report-data';
import { exportToPdf } from '../utils/export-pdf';
import { exportToExcel } from '../utils/export-excel';

const controller = new ReportController();
const userRole = computed(() => localStorage.getItem('sea_selectedRole') || 'TEACHER');

const filtersLoading = ref(true);
const reportLoading = ref(false);
const loading = computed(() => filtersLoading.value || reportLoading.value);
const loaderMessage = computed(() => filtersLoading.value ? 'Cargando filtros...' : 'Generando reporte...');
const errorMsg = ref('');
const noDataMsg = ref('');
const activeType = ref<ReportType | null>(null);
const reportData = ref<any>(null);
const lastFilters = ref<ReportFiltersDto | null>(null);

const selectedGroupId = ref<number | undefined>(undefined);
const selectedStudentId = ref<number | undefined>(undefined);
const groupReportData = ref<GroupReportData | null>(null);

const examReport = computed(() => activeType.value === 'by-exam' ? reportData.value as ExamReportData : null);
const groupReport = computed(() => activeType.value === 'by-group' ? groupReportData.value : null);
const studentReport = computed(() => activeType.value === 'by-student' ? reportData.value as StudentReportData : null);
const detailReport = computed(() => activeType.value === 'student-exam-detail' ? reportData.value as StudentExamDetailData : null);
const hasVisibleReportData = computed(() => activeType.value === 'by-group' ? !!groupReportData.value : !!reportData.value);

function onFiltersLoading(value: boolean) {
  filtersLoading.value = value;
}

async function handleGenerate(filters: ReportFiltersDto) {
  reportLoading.value = true;
  errorMsg.value = '';
  noDataMsg.value = '';
  reportData.value = null;
  groupReportData.value = null;
  selectedGroupId.value = undefined;
  selectedStudentId.value = undefined;
  activeType.value = filters.reportType;
  lastFilters.value = { ...filters };

  try {
    const response = await requestReportByType(filters);

    if (response?.success && response?.data) {
      applyReportData(filters, response.data);
      return;
    }

    errorMsg.value = getResponseErrorMessage(response?.code, response?.message);
  } catch (err: any) {
    errorMsg.value = getExceptionErrorMessage(err);
  } finally {
    reportLoading.value = false;
  }
}

function requestReportByType(filters: ReportFiltersDto) {
  switch (filters.reportType) {
    case 'by-exam':
      return controller.getExamReport(filters);
    case 'by-group':
      return controller.getGroupReport(filters);
    case 'by-student':
      return controller.getStudentReport(filters);
    case 'student-exam-detail':
      return controller.getStudentExamDetail(filters);
    default:
      return Promise.resolve(null);
  }
}

function applyReportData(filters: ReportFiltersDto, data: ExamReportData | GroupReportData | StudentReportData | StudentExamDetailData) {
  if (filters.reportType === 'by-group') {
    const groupData = data as GroupReportData;
    groupReportData.value = groupData;
    selectedGroupId.value = filters.groupId;
    selectedStudentId.value = filters.studentId;

    if (Array.isArray(groupData.students) && groupData.students.length === 0) {
      noDataMsg.value = 'No hay datos de alumnos para el grupo seleccionado.';
    }
    return;
  }

  reportData.value = data;
}

function getResponseErrorMessage(code?: number, message?: string): string {
  if (code === 403) return 'No tienes permisos para generar este reporte con el rol actual.';
  if (code === 400) return message || 'La solicitud es invalida. Verifica los filtros seleccionados.';
  return message || 'Error al generar el reporte';
}

function getExceptionErrorMessage(err: any): string {
  const status = err?.response?.status;
  if (status === 403) return 'No tienes permisos para generar este reporte con el rol actual.';
  if (status === 400) return err?.response?.data?.message || 'La solicitud es invalida. Verifica los filtros seleccionados.';
  return err?.message || 'Error inesperado';
}

function formatNumber(value: number | null | undefined, digits = 1): string {
  if (value === null || value === undefined) return '—';
  return Number(value).toFixed(digits);
}

function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return `${Number(value).toFixed(1)}%`;
}

function buildMetrics(m: SummaryMetrics) {
  return [
    { label: 'Total Alumnos', value: m.totalStudents, icon: 'mdi-account-group', iconColor: '#069574' },
    { label: 'Total Exámenes', value: m.totalExams, icon: 'mdi-file-document-multiple', iconColor: '#081e53' },
    { label: 'Promedio', value: formatNumber(m.averageGrade), icon: 'mdi-chart-line', iconColor: '#FFC107' },
    { label: '% Aprobación', value: formatPercent(m.approvalRate), icon: 'mdi-check-decagram', iconColor: '#4CAF50' },
    { label: 'Más Alta', value: formatNumber(m.highestGrade), icon: 'mdi-arrow-up-bold', iconColor: '#4CAF50' },
    { label: 'Más Baja', value: formatNumber(m.lowestGrade), icon: 'mdi-arrow-down-bold', iconColor: '#FF5252' },
  ];
}

function buildGradeChart(dist: GradeDistribution[]) {
  return {
    labels: dist.map((d) => d.range),
    datasets: [
      {
        label: 'Alumnos',
        data: dist.map((d) => d.count),
        backgroundColor: ['#FF5252', '#FF9800', '#FFC107', '#8BC34A', '#4CAF50'],
        borderRadius: 6,
      },
    ],
  };
}

function buildGroupMetricsFromStudents(students: GroupStudentRow[]): SummaryMetrics {
  if (students.length === 0) {
    return {
      totalStudents: 0,
      totalExams: 0,
      averageGrade: null,
      approvalRate: null,
      highestGrade: null,
      lowestGrade: null,
    };
  }

  const validGrades = students
    .map((s) => s.averageGrade)
    .filter((grade): grade is number => grade !== null && grade !== undefined);
  const validApproval = students
    .map((s) => s.approvalRate)
    .filter((rate): rate is number => rate !== null && rate !== undefined);

  return {
    totalStudents: students.length,
    totalExams: students.reduce((sum, s) => sum + (s.totalExams ?? 0), 0),
    averageGrade: validGrades.length ? validGrades.reduce((sum, grade) => sum + grade, 0) / validGrades.length : null,
    approvalRate: validApproval.length ? validApproval.reduce((sum, rate) => sum + rate, 0) / validApproval.length : null,
    highestGrade: validGrades.length ? Math.max(...validGrades) : null,
    lowestGrade: validGrades.length ? Math.min(...validGrades) : null,
  };
}

function buildGroupGradeDistributionFromStudents(students: GroupStudentRow[]): GradeDistribution[] {
  const ranges = [
    { key: '0-59', min: 0, max: 59.999 },
    { key: '60-69', min: 60, max: 69.999 },
    { key: '70-79', min: 70, max: 79.999 },
    { key: '80-89', min: 80, max: 89.999 },
    { key: '90-100', min: 90, max: 100 },
  ];

  const validGrades = students
    .map((s) => s.averageGrade)
    .filter((grade): grade is number => grade !== null && grade !== undefined);

  const total = validGrades.length;

  return ranges.map((range) => {
    const count = validGrades.filter((grade) => grade >= range.min && grade <= range.max).length;
    return {
      range: range.key,
      count,
      percentage: total > 0 ? (count * 100) / total : 0,
    };
  });
}

const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

const studentExamBarOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: true },
  },
  scales: {
    x: {
      min: 0,
      max: 10,
      ticks: {
        stepSize: 1,
      },
      grid: {
        color: '#e5e7eb',
      },
    },
    y: {
      ticks: {
        autoSkip: false,
      },
      grid: {
        display: false,
      },
    },
  },
  datasets: {
    bar: {
      borderRadius: 6,
      barThickness: 14,
      maxBarThickness: 16,
      categoryPercentage: 0.9,
      barPercentage: 0.8,
    },
  },
};

function shortExamTitle(title: string): string {
  if (!title) return 'Sin titulo';
  const normalized = String(title).trim();
  if (normalized.length <= 28) return normalized;
  return `${normalized.slice(0, 28)}...`;
}

function gradeColor(grade: number | null): string {
  if (grade === null) return 'grey';
  if (grade >= 90) return 'success';
  if (grade >= 70) return 'warning';
  return 'error';
}

function statusColor(status: string): string {
  const map: Record<string, string> = { pending: 'grey', in_progress: 'info', finished: 'success', not_presented: 'error' };
  return map[status] || 'grey';
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { pending: 'Pendiente', in_progress: 'En progreso', finished: 'Finalizado', not_presented: 'No presentado' };
  return map[status] || status;
}

const examMetrics = computed(() => examReport.value ? buildMetrics(examReport.value.metrics) : []);
const examGradeChartData = computed(() => examReport.value ? buildGradeChart(examReport.value.gradeDistribution) : { labels: [], datasets: [] });
const examStatusChartData = computed(() => {
  if (!examReport.value) return { labels: [], datasets: [] };
  const s = examReport.value.statusBreakdown;
  return {
    labels: ['Pendiente', 'En progreso', 'Finalizado', 'No presentado'],
    datasets: [{ data: [s.pending, s.inProgress, s.finished, s.notPresented], backgroundColor: ['#9E9E9E', '#2196F3', '#4CAF50', '#FF5252'] }],
  };
});
const examColumns = [
  { key: 'matricula', label: 'Matrícula', minWidth: '120px' },
  { key: 'fullName', label: 'Nombre', minWidth: '200px' },
  { key: 'grade', label: 'Calificación', minWidth: '120px' },
  { key: 'status', label: 'Estado', minWidth: '140px' },
];

const filteredStudentsData = computed<GroupStudentRow[]>(() => {
  if (!groupReport.value) return [];
  if (!selectedStudentId.value) return groupReport.value.students;
  return groupReport.value.students.filter((student) => Number(student.studentId) === Number(selectedStudentId.value));
});

const filteredGroupReport = computed<GroupReportData | null>(() => {
  if (!groupReport.value) return null;

  const students = filteredStudentsData.value;
  return {
    ...groupReport.value,
    students,
    metrics: buildGroupMetricsFromStudents(students),
    gradeDistribution: buildGroupGradeDistributionFromStudents(students),
  };
});

const groupMetrics = computed(() => filteredGroupReport.value ? buildMetrics(filteredGroupReport.value.metrics) : []);
const groupGradeChartData = computed(() => filteredGroupReport.value ? buildGradeChart(filteredGroupReport.value.gradeDistribution) : { labels: [], datasets: [] });
const groupApprovalChartData = computed(() => {
  if (!filteredGroupReport.value) return { labels: [], datasets: [] };
  const sorted = [...filteredGroupReport.value.students]
    .sort((a, b) => (b.approvalRate ?? -1) - (a.approvalRate ?? -1))
    .slice(0, 15);
  return {
    labels: sorted.map((s) => s.fullName),
    datasets: [{ label: '% Aprobación', data: sorted.map((s) => s.approvalRate ?? 0), backgroundColor: '#069574', borderRadius: 6 }],
  };
});
const groupColumns = [
  { key: 'matricula', label: 'Matrícula', minWidth: '120px' },
  { key: 'fullName', label: 'Nombre', minWidth: '200px' },
  { key: 'totalExams', label: 'Exámenes', minWidth: '100px' },
  { key: 'averageGrade', label: 'Promedio', minWidth: '120px' },
  { key: 'approvalRate', label: '% Aprobación', minWidth: '120px' },
];

const studentMetrics = computed(() => studentReport.value ? buildMetrics(studentReport.value.metrics) : []);
const studentGradeChartData = computed(() => studentReport.value ? buildGradeChart(studentReport.value.gradeDistribution) : { labels: [], datasets: [] });
const studentExamChartData = computed(() => {
  if (!studentReport.value) return { labels: [], datasets: [] };
  const exams = studentReport.value.exams;
  return {
    labels: exams.map((e) => shortExamTitle(e.examTitle)),
    datasets: [{ label: 'Calificación', data: exams.map((e) => e.grade ?? 0), backgroundColor: '#081e53' }],
  };
});
const studentColumns = [
  { key: 'examTitle', label: 'Examen', minWidth: '200px' },
  { key: 'subjectName', label: 'Materia', minWidth: '150px' },
  { key: 'grade', label: 'Calificación', minWidth: '120px' },
  { key: 'status', label: 'Estado', minWidth: '140px' },
];

const detailColumns = [
  { key: 'questionOrder', label: '#', minWidth: '50px' },
  { key: 'statement', label: 'Pregunta', minWidth: '300px' },
  { key: 'bloomLevel', label: 'Nivel Bloom', minWidth: '120px' },
  { key: 'selectedAnswer', label: 'Respuesta Alumno', minWidth: '200px' },
  { key: 'correctAnswer', label: 'Respuesta Correcta', minWidth: '200px' },
  { key: 'isCorrect', label: 'Correcto', minWidth: '90px' },
];

function exportExamPdf() {
  if (!examReport.value) return;
  const r = examReport.value;
  exportToPdf({
    title: `Reporte: ${r.examTitle}`,
    subtitle: `${r.subjectName} — Prof. ${r.teacherName}`,
    columns: ['Matrícula', 'Nombre', 'Calificación', 'Estado'],
    rows: r.students.map((s) => [s.matricula, s.fullName, s.grade ?? '—', statusLabel(s.status)]),
    fileName: `reporte_examen_${r.examId}`,
  });
}

function exportExamExcel() {
  if (!examReport.value) return;
  const r = examReport.value;
  exportToExcel({
    sheetName: 'Por Examen',
    columns: ['Matrícula', 'Nombre', 'Calificación', 'Estado'],
    rows: r.students.map((s) => [s.matricula, s.fullName, s.grade, statusLabel(s.status)]),
    fileName: `reporte_examen_${r.examId}`,
  });
}

function exportGroupPdf() {
  if (!filteredGroupReport.value) return;
  const r = filteredGroupReport.value;
  exportToPdf({
    title: `Reporte Grupo: ${r.groupLetter} — Nivel ${r.academicLevel}`,
    subtitle: `Generación ${r.generationYear}`,
    columns: ['Matrícula', 'Nombre', 'Exámenes', 'Promedio', '% Aprobación'],
    rows: r.students.map((s) => [s.matricula, s.fullName, s.totalExams, formatNumber(s.averageGrade), formatPercent(s.approvalRate)]),
    fileName: `reporte_grupo_${r.groupId}`,
  });
}

function exportGroupExcel() {
  if (!filteredGroupReport.value) return;
  const r = filteredGroupReport.value;
  exportToExcel({
    sheetName: 'Por Grupo',
    columns: ['Matrícula', 'Nombre', 'Exámenes', 'Promedio', '% Aprobación'],
    rows: r.students.map((s) => [s.matricula, s.fullName, s.totalExams, s.averageGrade ?? null, s.approvalRate ?? null]),
    fileName: `reporte_grupo_${r.groupId}`,
  });
}

function exportStudentPdf() {
  if (!studentReport.value) return;
  const r = studentReport.value;
  exportToPdf({
    title: `Reporte Alumno: ${r.fullName}`,
    subtitle: `${r.matricula} — Grupo ${r.groupLetter}`,
    columns: ['Examen', 'Materia', 'Calificación', 'Estado'],
    rows: r.exams.map((e) => [e.examTitle, e.subjectName, e.grade ?? '—', statusLabel(e.status)]),
    fileName: `reporte_alumno_${r.studentId}`,
  });
}

function exportStudentExcel() {
  if (!studentReport.value) return;
  const r = studentReport.value;
  exportToExcel({
    sheetName: 'Por Alumno',
    columns: ['Examen', 'Materia', 'Calificación', 'Estado'],
    rows: r.exams.map((e) => [e.examTitle, e.subjectName, e.grade, statusLabel(e.status)]),
    fileName: `reporte_alumno_${r.studentId}`,
  });
}

function exportDetailPdf() {
  if (!detailReport.value) return;
  const r = detailReport.value;
  exportToPdf({
    title: `Detalle: ${r.fullName} — ${r.examTitle}`,
    subtitle: `Calificación: ${r.grade ?? '—'} | ${r.correctAnswers}/${r.totalQuestions} correctas`,
    columns: ['#', 'Pregunta', 'Bloom', 'Resp. Alumno', 'Resp. Correcta', '¿Correcto?'],
    rows: r.answers.map((a) => [a.questionOrder, a.statement, a.bloomLevel, a.selectedAnswer, a.correctAnswer, a.isCorrect ? 'Sí' : 'No']),
    fileName: `detalle_${r.studentId}_examen_${r.examId}`,
  });
}

function exportDetailExcel() {
  if (!detailReport.value) return;
  const r = detailReport.value;
  exportToExcel({
    sheetName: 'Detalle',
    columns: ['#', 'Pregunta', 'Bloom', 'Resp. Alumno', 'Resp. Correcta', '¿Correcto?'],
    rows: r.answers.map((a) => [a.questionOrder, a.statement, a.bloomLevel, a.selectedAnswer, a.correctAnswer, a.isCorrect ? 'Sí' : 'No']),
    fileName: `detalle_${r.studentId}_examen_${r.examId}`,
  });
}
</script>
