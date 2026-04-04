<template>
  <v-container fluid class="pa-8">
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
      <p class="page-subtitle text-body-1 text-grey-darken-1">Consulta las calificaciones y estadísticas por grupo</p>
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
      </v-row>

      <!-- Students table -->
      <v-card elevation="2" class="mb-4">
        <PaginatedTable
          :columns="studentColumns"
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
            <template v-if="value === null">
              <span class="text-body-2 text-grey">--</span>
            </template>
            <template v-else>
              <v-chip :color="value ? 'success' : 'error'" size="small" variant="tonal">
                {{ value ? 'Aprobado' : 'No aprobado' }}
              </v-chip>
            </template>
          </template>

          <template #cell-attempt_date="{ value }">
            <span class="text-body-2">{{ value ? formatDateTime(value) : '--' }}</span>
          </template>

          <template #cell-actions="{ row }">
            <div class="d-flex justify-center">
              <v-tooltip text="Calificar manualmente" location="top">
                <template #activator="{ props }">
                  <v-btn
                    v-bind="props"
                    icon="mdi-pencil-box-outline"
                    size="small"
                    variant="text"
                    color="warning"
                    :disabled="row.status === 'pending'"
                    @click="goToManualGrade(row)"
                  />
                </template>
              </v-tooltip>
            </div>
          </template>
        </PaginatedTable>
      </v-card>

      <!-- Controles de paginación -->
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

<script lang="ts">
import PaginatedTable from '@/components/PaginatedTable.vue';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { ExamController } from '../exam.controller';
import type { ExamGroupAssignment, GroupStats, GroupStudent } from '../../entities/assign-exam.dto';
import {
  STUDENT_STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
  getStudentStatusColor,
  formatGroupLabel,
} from '../../entities/exam-constants';
import { formatDateTime } from '@/kernel/utils';

const controller = new ExamController();

interface StatsCard {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}

export default {
  name: 'ExamGradesView',
  components: { PaginatedTable, Loader, EmptyState },
  data() {
    return {
      studentColumns: [
        { label: 'Matrícula', key: 'matricula', width: '140px', minWidth: '120px' },
        { label: 'Nombre completo', key: 'full_name', width: '200px', minWidth: '160px' },
        { label: 'Estado', key: 'status_label', width: '130px', minWidth: '110px' },
        { label: 'Calificación', key: 'score', width: '120px', minWidth: '100px' },
        { label: 'Aprobado', key: 'is_passed', width: '120px', minWidth: '100px' },
        { label: 'Fecha de intento', key: 'attempt_date', width: '160px', minWidth: '140px' },
        { label: 'Acciones', key: 'actions', width: '100px', minWidth: '80px' },
      ],
      pageLoading: false,
      tableLoading: false,
      errorMsg: '',
      examId: 0,
      groups: [] as ExamGroupAssignment[],
      activeGroupIndex: 0,
      stats: null as GroupStats | null,
      students: [] as GroupStudent[],
      searchQuery: '',
      filterStatus: null as string | null,
      studentPagination: {
        count: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      snackbar: { show: false, message: '', color: 'success' },
      STUDENT_STATUS_OPTIONS,
      PAGE_SIZE_OPTIONS,
      debounceTimer: null as ReturnType<typeof setTimeout> | null,
    };
  },
  computed: {
    breadcrumbItems() {
      return [
        { title: 'Exámenes', disabled: false, href: '/exams' },
        { title: 'Calificaciones', disabled: true },
      ];
    },
    activeGroup(): ExamGroupAssignment | null {
      return this.groups[this.activeGroupIndex] ?? null;
    },
    statsCards(): StatsCard[] {
      if (!this.stats) return [];
      return [
        { label: 'Total alumnos', value: this.stats.total_students, icon: 'mdi-account-group', color: 'primary' },
        { label: 'Promedio', value: this.stats.average_score ?? '--', icon: 'mdi-chart-line', color: 'info' },
        { label: 'Más alta', value: this.stats.highest_score ?? '--', icon: 'mdi-arrow-up-bold', color: 'success' },
        { label: 'Más baja', value: this.stats.lowest_score ?? '--', icon: 'mdi-arrow-down-bold', color: 'error' },
        { label: 'Aprobación', value: this.stats.approval_rate ? `${this.stats.approval_rate}%` : '--', icon: 'mdi-percent', color: 'success' },
        { label: 'Pendientes', value: this.stats.pending_count, icon: 'mdi-clock-outline', color: 'warning' },
        { label: 'En progreso', value: this.stats.in_progress_count, icon: 'mdi-progress-clock', color: 'info' },
        { label: 'Completados', value: this.stats.completed_count, icon: 'mdi-check-circle-outline', color: 'success' },
      ];
    },
    studentPaginationInfo(): string {
      if (this.studentPagination.count === 0) return '0 registros';
      const start = (this.studentPagination.currentPage - 1) * this.studentPagination.pageSize + 1;
      const end = Math.min(this.studentPagination.currentPage * this.studentPagination.pageSize, this.studentPagination.count);
      return `Mostrando ${start}-${end} de ${this.studentPagination.count} registros`;
    },
  },
  async mounted() {
    const idParam = this.$route.params.id;
    this.examId = Number(idParam);
    if (!this.examId || isNaN(this.examId)) {
      this.errorMsg = 'ID de examen no válido';
      return;
    }
    await this.loadGroups();
  },
  methods: {
    formatDateTime,
    getStudentStatusColor,
    formatGroupLabel,

    async loadGroups() {
      this.pageLoading = true;
      this.errorMsg = '';
      try {
        const res = await controller.getExamAssignments(this.examId);
        if (res.success && res.data) {
          this.groups = Array.isArray(res.data) ? res.data : [];
          if (this.groups.length > 0) {
            this.activeGroupIndex = 0;
            await this.loadGroupData();
          }
        } else {
          this.errorMsg = res.message || 'Error al cargar los grupos';
        }
      } catch {
        this.errorMsg = 'Error de conexión al cargar los grupos';
      } finally {
        this.pageLoading = false;
      }
    },

    async onGroupChange() {
      this.searchQuery = '';
      this.filterStatus = null;
      this.studentPagination.currentPage = 1;
      await this.loadGroupData();
    },

    async loadGroupData() {
      if (!this.activeGroup) return;
      const groupId = this.activeGroup.group_id;
      this.tableLoading = true;
      try {
        const [statsRes, studentsRes] = await Promise.all([
          controller.getGroupStats(this.examId, groupId),
          controller.getGroupStudents(this.examId, groupId, {
            page: this.studentPagination.currentPage,
            page_size: this.studentPagination.pageSize,
            search: this.searchQuery || undefined,
            status: this.filterStatus || undefined,
          }),
        ]);

        if (statsRes.success && statsRes.data) {
          this.stats = statsRes.data;
        }

        if (studentsRes.success && studentsRes.data) {
          this.students = studentsRes.data.results || [];
          this.studentPagination.count = studentsRes.data.pagination.count;
          this.studentPagination.totalPages = studentsRes.data.pagination.total_pages;
          this.studentPagination.currentPage = studentsRes.data.pagination.page;
          this.studentPagination.pageSize = studentsRes.data.pagination.page_size;
        } else {
          this.showSnackbar(studentsRes.message || 'Error al cargar alumnos', 'error');
        }
      } catch {
        this.showSnackbar('Error al cargar datos del grupo', 'error');
      } finally {
        this.tableLoading = false;
      }
    },

    async fetchStudents() {
      if (!this.activeGroup) return;
      this.tableLoading = true;
      try {
        const res = await controller.getGroupStudents(this.examId, this.activeGroup.group_id, {
          page: this.studentPagination.currentPage,
          page_size: this.studentPagination.pageSize,
          search: this.searchQuery || undefined,
          status: this.filterStatus || undefined,
        });
        if (res.success && res.data) {
          this.students = res.data.results || [];
          this.studentPagination.count = res.data.pagination.count;
          this.studentPagination.totalPages = res.data.pagination.total_pages;
        } else {
          this.showSnackbar(res.message || 'Error al cargar alumnos', 'error');
        }
      } catch {
        this.showSnackbar('Error al cargar alumnos', 'error');
      } finally {
        this.tableLoading = false;
      }
    },

    handleStudentPageChange(page: number) {
      this.studentPagination.currentPage = page;
      this.fetchStudents();
    },

    handleStudentPageSizeChange(pageSize: number) {
      this.studentPagination.pageSize = pageSize;
      this.studentPagination.currentPage = 1;
      this.fetchStudents();
    },

    debouncedSearch() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.studentPagination.currentPage = 1;
        this.fetchStudents();
      }, 500);
    },

    goToManualGrade(student: GroupStudent) {
      this.$router.push({
        name: 'ManualGrade',
        params: {
          examId: String(this.examId),
          assignmentId: String(student.assignment_id),
        },
      });
    },

    showSnackbar(message: string, color = 'success') {
      this.snackbar = { show: true, message, color };
    },
  },
};
</script>

<style scoped>
.page-title {
  color: #1a1a1a;
  line-height: 1.2;
}

.page-subtitle {
  color: #666;
  line-height: 1.5;
}
</style>
