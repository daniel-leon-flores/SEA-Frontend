<template>
  <v-container fluid class="pa-8 exam-grades-view">
    <Loader :visible="pageLoading" message="Cargando calificaciones..." />

    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
      <template #divider>
        <v-icon icon="mdi-chevron-right" />
      </template>
    </v-breadcrumbs>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="page-title text-h4 font-weight-bold mb-2">Calificaciones</h1>
      <p class="page-subtitle text-body-1">Consulta las calificaciones y estadísticas por grupo</p>
    </div>

    <!-- Error state -->
    <v-alert v-if="errorMsg && !pageLoading" type="error" variant="tonal" class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <!-- No groups -->
    <EmptyState
      v-if="!pageLoading && !errorMsg && groups.length === 0"
      title="Sin grupos asignados"
      description="Este examen no tiene grupos asignados todavía."
    />

    <!-- Content when groups exist -->
    <template v-if="groups.length > 0">
      <!-- Group tabs -->
      <v-tabs v-model="activeGroupIndex" class="mb-6" color="primary" @update:model-value="onGroupChange">
        <v-tab v-for="(g, i) in groups" :key="g.group_id" :value="i">
          {{ formatGroupLabel(g.academic_level, g.group_label) }}
        </v-tab>
      </v-tabs>

      <!-- Stats cards -->
      <v-row class="mb-6" dense>
        <v-col v-for="card in statsCards" :key="card.label" cols="6" sm="4" md="3" lg="auto" class="flex-grow-1">
          <v-card :color="card.color" variant="tonal" rounded="lg" class="pa-3 text-center" elevation="0">
            <v-icon size="28" class="mb-1">{{ card.icon }}</v-icon>
            <p class="text-h6 font-weight-bold">{{ card.value }}</p>
            <p class="text-caption">{{ card.label }}</p>
          </v-card>
        </v-col>
      </v-row>

      <!-- Student table toolbar -->
      <v-row class="mb-4" align="center">
        <v-col cols="12" sm="6" md="4">
          <v-text-field
            v-model="searchQuery"
            label="Buscar alumno"
            placeholder="Nombre, apellido o matrícula..."
            prepend-inner-icon="mdi-magnify"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            @update:model-value="debouncedSearch"
          />
        </v-col>
        <v-col cols="12" sm="3" md="2">
          <v-select
            v-model="filterStatus"
            label="Estado"
            :items="STUDENT_STATUS_OPTIONS"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            clearable
            hide-details
            @update:model-value="fetchStudents"
          />
        </v-col>
        <v-spacer />
        <v-col cols="auto" class="d-flex ga-2">
          <v-btn
            variant="outlined"
            color="success"
            prepend-icon="mdi-file-excel-outline"
            :loading="exportingExcel"
            :disabled="exportingExcel || exportingPDF"
            @click="handleExportExcel"
          >
            Excel
          </v-btn>
          <v-btn
            variant="outlined"
            color="error"
            prepend-icon="mdi-file-pdf-box"
            :loading="exportingPDF"
            :disabled="exportingPDF || exportingExcel"
            @click="handleExportPDF"
          >
            PDF
          </v-btn>
        </v-col>
      </v-row>

      <!-- Students table -->
      <v-card elevation="2" class="mb-4">
        <PaginatedTable
          :columns="STUDENT_COLUMNS"
          :data="students"
          :total-records="studentPagination.count"
          :total-pages="studentPagination.totalPages"
          :current-page-prop="studentPagination.currentPage"
          :page-size-prop="studentPagination.pageSize"
          :loading="tableLoading"
          @update:page="handleStudentPageChange"
          @update:page-size="handleStudentPageSizeChange"
        >
          <template #cell-matricula="{ value }">
            <span class="text-body-2">{{ value }}</span>
          </template>

          <template #cell-full_name="{ value }">
            <span class="text-body-2 font-weight-medium">{{ value }}</span>
          </template>

          <template #cell-status_label="{ row }">
            <v-chip :color="getStudentStatusColor(row.status)" size="small" variant="tonal">
              {{ row.status_label }}
            </v-chip>
          </template>

          <template #cell-score="{ value }">
            <span class="text-body-2">{{ value ?? '--' }}</span>
          </template>

          <template #cell-is_passed="{ value }">
            <span v-if="value === null" class="text-body-2 text-grey-darken-1">--</span>
            <v-chip v-else :color="value ? 'success' : 'error'" size="small" variant="tonal">
              {{ value ? 'Aprobado' : 'No aprobado' }}
            </v-chip>
          </template>

          <template #cell-attempt_date="{ value }">
            <span class="text-body-2">{{ value ? formatDateTime(value) : '--' }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="d-flex justify-center">
              <v-menu location="bottom end">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-dots-vertical"
                    size="small"
                    variant="text"
                    color="grey-darken-2"
                  />
                </template>

                <v-list density="compact" min-width="220">
                  <v-list-item
                    prepend-icon="mdi-pencil-box-outline"
                    title="Calificar manualmente"
                    :disabled="row.status !== 'completed'"
                    @click="goToManualGrade(row)"
                  />
                </v-list>
              </v-menu>
            </div>
          </template>
        </PaginatedTable>
      </v-card>

      <!-- Pagination controls -->
      <v-row v-if="!tableLoading && studentPagination.count > 0" class="align-center mt-2">
        <v-col cols="12" md="3">
          <v-select
            label="Registros por página"
            v-model="studentPagination.pageSize"
            :items="PAGE_SIZE_OPTIONS"
            variant="outlined"
            density="compact"
            hide-details
            @update:model-value="handleStudentPageSizeChange"
          />
        </v-col>

        <v-col cols="12" md="6" class="d-flex justify-center">
          <v-pagination
            v-model="studentPagination.currentPage"
            :length="studentPagination.totalPages"
            :total-visible="7"
            rounded="circle"
            density="comfortable"
            @update:model-value="handleStudentPageChange"
          />
        </v-col>

        <v-col cols="12" md="3" class="text-end">
          <p class="text-caption text-grey-darken-1">{{ studentPaginationInfo }}</p>
        </v-col>
      </v-row>
    </template>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import PaginatedTable from '@/components/PaginatedTable.vue';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { encodeId, decodeId } from '@/kernel/url-cipher';
import { formatDateTime } from '@/kernel/utils';
import { ExamController } from '../exam.controller';
import type { ExamGroupAssignment, GroupStats, GroupStudent } from '../../entities/assign-exam.dto';
import {
  STUDENT_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
  getStudentStatusColor,
  formatGroupLabel,
} from '../../entities/exam-constants';

interface StatsCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

interface ColumnDef {
  label: string;
  key: string;
  width: string;
  minWidth: string;
}

interface Pagination {
  count: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const route = useRoute();
const router = useRouter();
const controller = new ExamController();

const STUDENT_COLUMNS: ColumnDef[] = [
  { label: 'Matrícula', key: 'matricula', width: '140px', minWidth: '120px' },
  { label: 'Nombre completo', key: 'full_name', width: '200px', minWidth: '160px' },
  { label: 'Estado', key: 'status_label', width: '130px', minWidth: '110px' },
  { label: 'Calificación', key: 'score', width: '120px', minWidth: '100px' },
  { label: 'Aprobado', key: 'is_passed', width: '120px', minWidth: '100px' },
  { label: 'Fecha de intento', key: 'attempt_date', width: '160px', minWidth: '140px' },
  { label: 'Acciones', key: 'actions', width: '100px', minWidth: '80px' },
];

// ── Reactive state ──
const pageLoading = ref(true);
const tableLoading = ref(false);
const errorMsg = ref('');
const examId = ref(0);
const examDisplayName = ref('');
const groups = ref<ExamGroupAssignment[]>([]);
const activeGroupIndex = ref(0);
const stats = ref<GroupStats | null>(null);
const students = ref<GroupStudent[]>([]);
const searchQuery = ref('');
const filterStatus = ref<string | null>(null);
const studentPagination = ref<Pagination>({ count: 0, totalPages: 1, currentPage: 1, pageSize: 10 });
const snackbar = ref({ show: false, message: '', color: 'success' });
const exportingExcel = ref(false);
const exportingPDF = ref(false);

// ── Helpers ──
function buildExportFilename(ext: 'xlsx' | 'pdf'): string {
  const unsafe = /[/\\:*?"<>|]/g;
  const group = activeGroup.value;
  const groupLabel = group ? `${group.academic_level}${group.group_label}` : 'grupo';
  const examName = (examDisplayName.value || 'examen').replaceAll(unsafe, '').substring(0, 80).trim();
  return `${examName}-calificaciones-${groupLabel}.${ext}`;
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

// ── Computed ──
const breadcrumbItems = computed(() => [
  { title: 'Exámenes', disabled: false, href: '/exams' },
  { title: 'Calificaciones', disabled: true },
]);

const activeGroup = computed<ExamGroupAssignment | null>(
  () => groups.value[activeGroupIndex.value] ?? null,
);

const statsCards = computed<StatsCard[]>(() => {
  const s = stats.value;
  if (!s) return [];
  return [
    { label: 'Total alumnos', value: s.total_students, icon: 'mdi-account-group', color: 'primary' },
    { label: 'Promedio', value: s.average_score ?? '--', icon: 'mdi-chart-line', color: 'info' },
    { label: 'Más alta', value: s.highest_score ?? '--', icon: 'mdi-arrow-up-bold', color: 'success' },
    { label: 'Más baja', value: s.lowest_score ?? '--', icon: 'mdi-arrow-down-bold', color: 'error' },
    { label: 'Aprobación', value: s.approval_rate ? `${s.approval_rate}%` : '--', icon: 'mdi-percent', color: 'success' },
    { label: 'Pendientes', value: s.pending_count, icon: 'mdi-clock-outline', color: 'warning' },
    { label: 'En progreso', value: s.in_progress_count, icon: 'mdi-progress-clock', color: 'info' },
    { label: 'Completados', value: s.completed_count, icon: 'mdi-check-circle-outline', color: 'success' },
  ];
});

const studentPaginationInfo = computed(() => {
  const p = studentPagination.value;
  if (p.count === 0) return '0 registros';
  const start = (p.currentPage - 1) * p.pageSize + 1;
  const end = Math.min(p.currentPage * p.pageSize, p.count);
  return `Mostrando ${start}-${end} de ${p.count} registros`;
});

// ── Data fetching ──
async function loadExamInfo(): Promise<void> {
  try {
    const res = await controller.getExamById(examId.value);
    if (res.success && res.data) {
      examDisplayName.value = res.data.title || res.data.name || '';
    }
  } catch {
    examDisplayName.value = '';
  }
}

async function loadGroups(): Promise<void> {
  pageLoading.value = true;
  errorMsg.value = '';
  try {
    const res = await controller.getExamAssignments(examId.value);
    if (res.success && res.data) {
      groups.value = Array.isArray(res.data) ? res.data : [];
      if (groups.value.length > 0) {
        activeGroupIndex.value = 0;
        await loadGroupData();
      }
    } else {
      errorMsg.value = res.message || 'Error al cargar los grupos';
    }
  } catch {
    errorMsg.value = 'Error de conexión al cargar los grupos';
  } finally {
    pageLoading.value = false;
  }
}

async function loadGroupData(): Promise<void> {
  const group = activeGroup.value;
  if (!group) return;
  tableLoading.value = true;
  try {
    const [statsRes, studentsRes] = await Promise.all([
      controller.getGroupStats(examId.value, group.group_id),
      controller.getGroupStudents(examId.value, group.group_id, {
        page: studentPagination.value.currentPage,
        page_size: studentPagination.value.pageSize,
        search: searchQuery.value || undefined,
        status: filterStatus.value || undefined,
      }),
    ]);

    if (statsRes.success && statsRes.data) {
      stats.value = statsRes.data;
    }

    if (studentsRes.success && studentsRes.data) {
      students.value = studentsRes.data.results || [];
      const pg = studentsRes.data.pagination;
      studentPagination.value = {
        count: pg.count,
        totalPages: pg.total_pages,
        currentPage: pg.page,
        pageSize: pg.page_size,
      };
    } else {
      showSnackbar(studentsRes.message || 'Error al cargar alumnos', 'error');
    }
  } catch {
    showSnackbar('Error al cargar datos del grupo', 'error');
  } finally {
    tableLoading.value = false;
  }
}

async function fetchStudents(): Promise<void> {
  const group = activeGroup.value;
  if (!group) return;
  tableLoading.value = true;
  try {
    const res = await controller.getGroupStudents(examId.value, group.group_id, {
      page: studentPagination.value.currentPage,
      page_size: studentPagination.value.pageSize,
      search: searchQuery.value || undefined,
      status: filterStatus.value || undefined,
    });
    if (res.success && res.data) {
      students.value = res.data.results || [];
      studentPagination.value.count = res.data.pagination.count;
      studentPagination.value.totalPages = res.data.pagination.total_pages;
    } else {
      showSnackbar(res.message || 'Error al cargar alumnos', 'error');
    }
  } catch {
    showSnackbar('Error al cargar alumnos', 'error');
  } finally {
    tableLoading.value = false;
  }
}

// ── Event handlers ──
async function onGroupChange(): Promise<void> {
  searchQuery.value = '';
  filterStatus.value = null;
  studentPagination.value.currentPage = 1;
  await loadGroupData();
}

function handleStudentPageChange(page: number): void {
  studentPagination.value.currentPage = page;
  fetchStudents();
}

function handleStudentPageSizeChange(pageSize: number): void {
  studentPagination.value.pageSize = pageSize;
  studentPagination.value.currentPage = 1;
  fetchStudents();
}

function debouncedSearch(): void {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    studentPagination.value.currentPage = 1;
    fetchStudents();
  }, 500);
}

// ── Export helpers ──
function triggerBlobDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function handleExportExcel(): Promise<void> {
  const group = activeGroup.value;
  if (!group) return;
  exportingExcel.value = true;
  try {
    const blob = await controller.exportGradesExcel(examId.value, group.group_id);
    triggerBlobDownload(blob, buildExportFilename('xlsx'));
    showSnackbar('Archivo Excel descargado correctamente');
  } catch {
    showSnackbar('Error al descargar el archivo Excel', 'error');
  } finally {
    exportingExcel.value = false;
  }
}

async function handleExportPDF(): Promise<void> {
  const group = activeGroup.value;
  if (!group) return;
  exportingPDF.value = true;
  try {
    const blob = await controller.exportGradesPDF(examId.value, group.group_id);
    triggerBlobDownload(blob, buildExportFilename('pdf'));
    showSnackbar('Archivo PDF descargado correctamente');
  } catch {
    showSnackbar('Error al descargar el archivo PDF', 'error');
  } finally {
    exportingPDF.value = false;
  }
}

// ── Navigation ──
function goToManualGrade(student: GroupStudent): void {
  if (student.status !== 'completed') {
    showSnackbar('Solo se puede calificar manualmente cuando el examen está completado.', 'warning');
    return;
  }
  if (!student.assignment_id) {
    showSnackbar('No se encontró la asignación del alumno para calificar.', 'warning');
    return;
  }
  router.push({
    name: 'ManualGrade',
    params: {
      examId: encodeId(examId.value),
      assignmentId: encodeId(student.assignment_id),
    },
    query: {
      studentName: student.full_name,
      examName: examDisplayName.value || undefined,
    },
  });
}

// ── Snackbar ──
function showSnackbar(message: string, color = 'success'): void {
  snackbar.value = { show: true, message, color };
}

// ── Init ──
onMounted(async () => {
  const idParam = route.params.id;
  examId.value = decodeId(idParam as string);
  if (!examId.value || Number.isNaN(examId.value)) {
    errorMsg.value = 'ID de examen no válido';
    return;
  }
  await loadExamInfo();
  await loadGroups();
});
</script>

<style scoped>
.exam-grades-view {
  background: #f9fbff;
  min-height: 100vh;
}

.page-title {
  color: #1a1a1a;
  line-height: 1.2;
}

.page-subtitle {
  color: #555;
  line-height: 1.5;
}
</style>
