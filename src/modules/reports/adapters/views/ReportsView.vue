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
    </v-alert>

    <!-- Empty / initial state -->
    <div v-if="!loading && !errorMsg && !reportData" class="text-center py-16">
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

    <!-- ===== BY PERIOD ===== -->
    <template v-if="!loading && activeType === 'by-period' && periodReport">
      <MetricCards :metrics="periodMetrics" />
      <v-row class="mb-4">
        <v-col cols="12" md="6">
          <ReportChart
            title="Distribución de Calificaciones del Periodo"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="periodGradeChartData"
            :chart-options="barOptions"
          />
        </v-col>
        <v-col cols="12" md="6">
          <ReportChart
            title="Promedio por Examen"
            icon="mdi-chart-bar"
            type="bar"
            :chart-data="periodExamAvgChartData"
            :chart-options="barOptions"
          />
        </v-col>
      </v-row>
      <ReportTable
        title="Exámenes del Periodo"
        :columns="periodColumns"
        :rows="periodReport.exams"
        @export-pdf="exportPeriodPdf"
        @export-excel="exportPeriodExcel"
      />
    </template>

    <!-- ===== BY GROUP ===== -->
    <template v-if="!loading && activeType === 'by-group' && groupReport">
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
        :rows="groupReport.students"
        @export-pdf="exportGroupPdf"
        @export-excel="exportGroupExcel"
      >
        <template #cell-averageGrade="{ value }">
          <v-chip :color="gradeColor(value)" size="small" variant="flat">
            {{ value }}
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
            :chart-options="barOptions"
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
  PeriodReportData,
  GroupReportData,
  StudentReportData,
  StudentExamDetailData,
  SummaryMetrics,
  GradeDistribution,
} from '../../entities/report-data';
import { exportToPdf } from '../utils/export-pdf';
import { exportToExcel } from '../utils/export-excel';

const controller = new ReportController();
const userRole = computed(() => localStorage.getItem('sea_selectedRole') || 'TEACHER');

// State
const filtersLoading = ref(true);
const reportLoading = ref(false);
const loading = computed(() => filtersLoading.value || reportLoading.value);
const loaderMessage = computed(() =>
  filtersLoading.value ? 'Cargando filtros...' : 'Generando reporte...'
);
const errorMsg = ref('');
const activeType = ref<ReportType | null>(null);
const reportData = ref<any>(null);

// Typed report references
const examReport = computed(() => activeType.value === 'by-exam' ? reportData.value as ExamReportData : null);
const periodReport = computed(() => activeType.value === 'by-period' ? reportData.value as PeriodReportData : null);
const groupReport = computed(() => activeType.value === 'by-group' ? reportData.value as GroupReportData : null);
const studentReport = computed(() => activeType.value === 'by-student' ? reportData.value as StudentReportData : null);
const detailReport = computed(() => activeType.value === 'student-exam-detail' ? reportData.value as StudentExamDetailData : null);

// --- Filters loading handler ---
function onFiltersLoading(value: boolean) {
  filtersLoading.value = value;
}

// --- Generate handler ---
async function handleGenerate(filters: ReportFiltersDto) {
  reportLoading.value = true;
  errorMsg.value = '';
  reportData.value = null;
  activeType.value = filters.reportType;

  try {
    let response;
    switch (filters.reportType) {
      case 'by-exam':
        response = await controller.getExamReport(filters);
        break;
      case 'by-period':
        response = await controller.getPeriodReport(filters);
        break;
      case 'by-group':
        response = await controller.getGroupReport(filters);
        break;
      case 'by-student':
        response = await controller.getStudentReport(filters);
        break;
      case 'student-exam-detail':
        response = await controller.getStudentExamDetail(filters);
        break;
    }
    if (response?.success && response?.data) {
      reportData.value = response.data;
    } else {
      errorMsg.value = response?.message || 'Error al generar el reporte';
    }
  } catch (err: any) {
    errorMsg.value = err.message || 'Error inesperado';
  } finally {
    reportLoading.value = false;
  }
}

// --- Helpers ---
function buildMetrics(m: SummaryMetrics) {
  return [
    { label: 'Total Alumnos', value: m.totalStudents, icon: 'mdi-account-group', iconColor: '#069574' },
    { label: 'Total Exámenes', value: m.totalExams, icon: 'mdi-file-document-multiple', iconColor: '#081e53' },
    { label: 'Promedio', value: m.averageGrade.toFixed(1), icon: 'mdi-chart-line', iconColor: '#FFC107' },
    { label: '% Aprobación', value: `${m.approvalRate.toFixed(1)}%`, icon: 'mdi-check-decagram', iconColor: '#4CAF50' },
    { label: 'Más Alta', value: m.highestGrade, icon: 'mdi-arrow-up-bold', iconColor: '#4CAF50' },
    { label: 'Más Baja', value: m.lowestGrade, icon: 'mdi-arrow-down-bold', iconColor: '#FF5252' },
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

const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

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

// --- By Exam computed ---
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

// --- By Period computed ---
const periodMetrics = computed(() => periodReport.value ? buildMetrics(periodReport.value.metrics) : []);
const periodGradeChartData = computed(() => periodReport.value ? buildGradeChart(periodReport.value.gradeDistribution) : { labels: [], datasets: [] });
const periodExamAvgChartData = computed(() => {
  if (!periodReport.value) return { labels: [], datasets: [] };
  return {
    labels: periodReport.value.exams.map((e) => e.examTitle),
    datasets: [{ label: 'Promedio', data: periodReport.value.exams.map((e) => e.averageGrade), backgroundColor: '#069574', borderRadius: 6 }],
  };
});
const periodColumns = [
  { key: 'examTitle', label: 'Examen', minWidth: '200px' },
  { key: 'subjectName', label: 'Materia', minWidth: '150px' },
  { key: 'groupLetter', label: 'Grupo', minWidth: '80px' },
  { key: 'averageGrade', label: 'Promedio', minWidth: '100px' },
  { key: 'approvalRate', label: '% Aprobación', minWidth: '120px' },
  { key: 'totalStudents', label: 'Alumnos', minWidth: '90px' },
];

// --- By Group computed ---
const groupMetrics = computed(() => groupReport.value ? buildMetrics(groupReport.value.metrics) : []);
const groupGradeChartData = computed(() => groupReport.value ? buildGradeChart(groupReport.value.gradeDistribution) : { labels: [], datasets: [] });
const groupApprovalChartData = computed(() => {
  if (!groupReport.value) return { labels: [], datasets: [] };
  const sorted = [...groupReport.value.students].sort((a, b) => b.approvalRate - a.approvalRate).slice(0, 15);
  return {
    labels: sorted.map((s) => s.fullName),
    datasets: [{ label: '% Aprobación', data: sorted.map((s) => s.approvalRate), backgroundColor: '#069574', borderRadius: 6 }],
  };
});
const groupColumns = [
  { key: 'matricula', label: 'Matrícula', minWidth: '120px' },
  { key: 'fullName', label: 'Nombre', minWidth: '200px' },
  { key: 'totalExams', label: 'Exámenes', minWidth: '100px' },
  { key: 'averageGrade', label: 'Promedio', minWidth: '120px' },
  { key: 'approvalRate', label: '% Aprobación', minWidth: '120px' },
];

// --- By Student computed ---
const studentMetrics = computed(() => studentReport.value ? buildMetrics(studentReport.value.metrics) : []);
const studentGradeChartData = computed(() => studentReport.value ? buildGradeChart(studentReport.value.gradeDistribution) : { labels: [], datasets: [] });
const studentExamChartData = computed(() => {
  if (!studentReport.value) return { labels: [], datasets: [] };
  return {
    labels: studentReport.value.exams.map((e) => e.examTitle),
    datasets: [{ label: 'Calificación', data: studentReport.value.exams.map((e) => e.grade ?? 0), backgroundColor: '#081e53', borderRadius: 6 }],
  };
});
const studentColumns = [
  { key: 'examTitle', label: 'Examen', minWidth: '200px' },
  { key: 'subjectName', label: 'Materia', minWidth: '150px' },
  { key: 'grade', label: 'Calificación', minWidth: '120px' },
  { key: 'status', label: 'Estado', minWidth: '140px' },
];

// --- Student-Exam detail ---
const detailColumns = [
  { key: 'questionOrder', label: '#', minWidth: '50px' },
  { key: 'statement', label: 'Pregunta', minWidth: '300px' },
  { key: 'bloomLevel', label: 'Nivel Bloom', minWidth: '120px' },
  { key: 'selectedAnswer', label: 'Respuesta Alumno', minWidth: '200px' },
  { key: 'correctAnswer', label: 'Respuesta Correcta', minWidth: '200px' },
  { key: 'isCorrect', label: 'Correcto', minWidth: '90px' },
];

// ===== EXPORT FUNCTIONS =====

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

function exportPeriodPdf() {
  if (!periodReport.value) return;
  const r = periodReport.value;
  exportToPdf({
    title: `Reporte: ${r.periodName} ${r.year}`,
    columns: ['Examen', 'Materia', 'Grupo', 'Promedio', '% Aprobación', 'Alumnos'],
    rows: r.exams.map((e) => [e.examTitle, e.subjectName, e.groupLetter, e.averageGrade, `${e.approvalRate}%`, e.totalStudents]),
    fileName: `reporte_periodo_${r.periodId}`,
  });
}

function exportPeriodExcel() {
  if (!periodReport.value) return;
  const r = periodReport.value;
  exportToExcel({
    sheetName: 'Por Periodo',
    columns: ['Examen', 'Materia', 'Grupo', 'Promedio', '% Aprobación', 'Alumnos'],
    rows: r.exams.map((e) => [e.examTitle, e.subjectName, e.groupLetter, e.averageGrade, e.approvalRate, e.totalStudents]),
    fileName: `reporte_periodo_${r.periodId}`,
  });
}

function exportGroupPdf() {
  if (!groupReport.value) return;
  const r = groupReport.value;
  exportToPdf({
    title: `Reporte Grupo: ${r.groupLetter} — Nivel ${r.academicLevel}`,
    subtitle: `Generación ${r.generationYear}`,
    columns: ['Matrícula', 'Nombre', 'Exámenes', 'Promedio', '% Aprobación'],
    rows: r.students.map((s) => [s.matricula, s.fullName, s.totalExams, s.averageGrade, `${s.approvalRate}%`]),
    fileName: `reporte_grupo_${r.groupId}`,
  });
}

function exportGroupExcel() {
  if (!groupReport.value) return;
  const r = groupReport.value;
  exportToExcel({
    sheetName: 'Por Grupo',
    columns: ['Matrícula', 'Nombre', 'Exámenes', 'Promedio', '% Aprobación'],
    rows: r.students.map((s) => [s.matricula, s.fullName, s.totalExams, s.averageGrade, s.approvalRate]),
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
