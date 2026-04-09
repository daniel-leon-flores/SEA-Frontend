<template>
  <v-container fluid class="pa-8">
    <Loader :visible="loading" message="Cargando exámenes..." />

    <!-- Header -->
    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title text-h4 font-weight-bold mb-2">Gestión de Exámenes</h1>
        <p class="page-subtitle text-body-1 text-grey-darken-1">Administra y supervisa los exámenes del sistema</p>
      </div>
      <v-tooltip text="Crear un nuevo examen" location="bottom">
        <template #activator="{ props }">
          <v-btn
            v-bind="props"
            color="success"
            size="large"
            rounded="lg"
            class="text-none"
            prepend-icon="mdi-plus"
            :disabled="loading"
            @click="openCreateDialog"
          >
            Registrar examen
          </v-btn>
        </template>
      </v-tooltip>
    </div>

    <!-- Tabs (only for ADMIN) -->
    <v-tabs v-if="isAdmin" v-model="activeTab" class="mb-4" @update:model-value="handleTabChange">
      <v-tab :value="0">Mis exámenes</v-tab>
      <v-tab :value="1">Todos los exámenes</v-tab>
    </v-tabs>

    <!-- Toolbar: filtros + búsqueda -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar examen"
          placeholder="Nombre del examen o materia..."
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
          v-model="filterDifficulty"
          label="Dificultad"
          :items="DIFFICULTY_OPTIONS"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="fetchExams"
        />
      </v-col>
      <v-col cols="12" sm="3" md="2">
        <v-select
          v-model="filterStatus"
          label="Estado"
          :items="STATUS_OPTIONS"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="fetchExams"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-card elevation="2" class="mb-4">
      <PaginatedTable
        :columns="currentColumns"
        :data="exams"
        :total-records="pagination.count"
        :total-pages="pagination.totalPages"
        :current-page-prop="pagination.currentPage"
        :page-size-prop="pagination.pageSize"
        :loading="false"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-name="{ row }">
          <div class="text-center">
            <div class="font-weight-medium text-body-2">{{ row.name }}</div>
          </div>
        </template>

        <template #cell-subject_name="{ value }">
          <span class="text-body-2">{{ value }}</span>
        </template>

        <template #cell-unit_name="{ row }">
          <span class="text-body-2">{{ row.unit_name || `Unidad ${row.unit_number}` }}</span>
        </template>

        <template #cell-difficulty_label="{ row }">
          <v-chip :color="getDifficultyColor(row.difficulty_level)" size="small" variant="tonal">
            {{ row.difficulty_label }}
          </v-chip>
        </template>

        <template #cell-secure_mode="{ row }">
          <v-chip :color="row.secure_mode ? '#10b981' : '#94a3b8'" size="small" class="status-chip">
            {{ row.secure_mode ? 'Activado' : 'Desactivado' }}
          </v-chip>
        </template>

        <template #cell-minimum_score="{ value }">
          <span class="text-body-2">{{ value }}</span>
        </template>

        <template #cell-teacher_name="{ value }">
          <span class="text-body-2">{{ value }}</span>
        </template>

        <template #cell-status="{ row }">
          <v-chip
            :color="row.status ? '#10b981' : '#f59e0b'"
            size="small"
            class="status-chip"
          >
            {{ row.status ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template #cell-actions="{ row }">
          <div class="d-flex justify-center">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  color="grey-darken-1"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="openEditDialog(row)">
                  <template #prepend>
                    <v-icon color="warning">mdi-pencil-outline</v-icon>
                  </template>
                  <v-list-item-title>Editar examen</v-list-item-title>
                </v-list-item>

                <v-list-item @click="openAssignDialog(row)">
                  <template #prepend>
                    <v-icon color="primary">mdi-account-group</v-icon>
                  </template>
                  <v-list-item-title>Asignar a grupos</v-list-item-title>
                </v-list-item>

                <v-list-item @click="toggleSecureMode(row)">
                  <template #prepend>
                    <v-icon :color="row.secure_mode ? 'grey' : 'info'">
                      {{ row.secure_mode ? 'mdi-lock-open-outline' : 'mdi-lock-outline' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ row.secure_mode ? 'Desactivar modo seguro' : 'Activar modo seguro' }}
                  </v-list-item-title>
                </v-list-item>

                <v-list-item @click="viewGrades(row)">
                  <template #prepend>
                    <v-icon color="primary">mdi-clipboard-text-outline</v-icon>
                  </template>
                  <v-list-item-title>Ver calificaciones</v-list-item-title>
                </v-list-item>

                <v-divider class="my-1" />

                <v-list-item @click="toggleStatus(row)">
                  <template #prepend>
                    <v-icon :color="row.status ? 'error' : 'success'">
                      {{ row.status ? 'mdi-close-circle-outline' : 'mdi-check-circle-outline' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ row.status ? 'Desactivar' : 'Activar' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </PaginatedTable>
    </v-card>

    <!-- Controles de paginación -->
    <v-row v-if="!tableLoading && pagination.count > 0" class="align-center mt-2">
      <v-col cols="12" md="3">
        <v-select
          label="Registros por página"
          v-model="pagination.pageSize"
          :items="PAGE_SIZE_OPTIONS"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="handlePageSizeChange"
        />
      </v-col>

      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-pagination
          v-model="pagination.currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          rounded="circle"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </v-col>

      <v-col cols="12" md="3" class="text-end">
        <p class="text-caption text-grey-darken-1">
          {{ paginationInfo }}
        </p>
      </v-col>
    </v-row>

    <!-- Dialogs -->
    <ExamFormDialog ref="examFormDialog" @saved="onExamSaved" @error="showSnackbar($event, 'error')" />
    <AssignGroupsDialog ref="assignGroupsDialog" @assigned="onGroupsAssigned" @error="showSnackbar($event, 'error')" />
    <ConfirmDialog ref="confirmDialog" />

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import PaginatedTable from '@/components/PaginatedTable.vue';
import Loader from '@/components/Loader.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import ExamFormDialog from './ExamFormDialog.vue';
import AssignGroupsDialog from './AssignGroupsDialog.vue';
import { ExamController } from '../exam.controller';
import type { Exam } from '../../entities/exam';
import {
  DIFFICULTY_OPTIONS,
  STATUS_OPTIONS,
  PAGE_SIZE_OPTIONS,
  getDifficultyColor,
} from '../../entities/exam-constants';

const controller = new ExamController();

const myExamsColumns = [
  { label: 'Nombre', key: 'name', width: '200px', minWidth: '160px' },
  { label: 'Materia', key: 'subject_name', width: '160px', minWidth: '130px' },
  { label: 'Unidad', key: 'unit_name', width: '140px', minWidth: '110px' },
  { label: 'Dificultad', key: 'difficulty_label', width: '130px', minWidth: '110px' },
  { label: 'Modo Seguro', key: 'secure_mode', width: '130px', minWidth: '110px' },
  { label: 'Cal. Mínima', key: 'minimum_score', width: '120px', minWidth: '100px' },
  { label: 'Estado', key: 'status', width: '110px', minWidth: '90px' },
  { label: 'Acciones', key: 'actions', width: '100px', minWidth: '80px' },
];

const allExamsColumns = [
  { label: 'Nombre', key: 'name', width: '180px', minWidth: '150px' },
  { label: 'Materia', key: 'subject_name', width: '150px', minWidth: '120px' },
  { label: 'Unidad', key: 'unit_name', width: '130px', minWidth: '100px' },
  { label: 'Dificultad', key: 'difficulty_label', width: '120px', minWidth: '100px' },
  { label: 'Docente', key: 'teacher_name', width: '160px', minWidth: '130px' },
  { label: 'Modo Seguro', key: 'secure_mode', width: '120px', minWidth: '100px' },
  { label: 'Cal. Mínima', key: 'minimum_score', width: '110px', minWidth: '90px' },
  { label: 'Estado', key: 'status', width: '100px', minWidth: '80px' },
  { label: 'Acciones', key: 'actions', width: '100px', minWidth: '80px' },
];

export default {
  name: 'ExamListView',
  components: {
    PaginatedTable,
    Loader,
    ConfirmDialog,
    ExamFormDialog,
    AssignGroupsDialog,
  },
  data() {
    return {
      loading: false,
      tableLoading: false,
      exams: [] as Exam[],
      activeTab: 0,
      searchQuery: '',
      filterDifficulty: null as string | null,
      filterStatus: null as string | null,
      pagination: {
        count: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
      DIFFICULTY_OPTIONS,
      STATUS_OPTIONS,
      PAGE_SIZE_OPTIONS,
      debounceTimer: null as ReturnType<typeof setTimeout> | null,
    };
  },
  computed: {
    isAdmin(): boolean {
      return localStorage.getItem('sea_selectedRole') === 'ADMIN';
    },
    currentColumns() {
      return this.isAdmin && this.activeTab === 1 ? allExamsColumns : myExamsColumns;
    },
    paginationInfo(): string {
      if (this.pagination.count === 0) return '0 registros';
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
      const end = Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.count);
      return `Mostrando ${start}-${end} de ${this.pagination.count} registros`;
    },
  },
  mounted() {
    this.loading = true;
    this.fetchExams();
  },
  methods: {
    getDifficultyColor,

    async fetchExams() {
      this.tableLoading = true;
      try {
        const params = {
          page: this.pagination.currentPage,
          page_size: this.pagination.pageSize,
          search: this.searchQuery || undefined,
          difficulty_level: this.filterDifficulty || undefined,
          status: this.filterStatus || undefined,
        };

        const useAllExams = this.isAdmin && this.activeTab === 1;
        const response = useAllExams
          ? await controller.getAllExams(params)
          : await controller.getMyExams(params);

        if (response.success && response.data) {
          this.exams = response.data.results || [];
          this.pagination.count = response.data.pagination.count;
          this.pagination.totalPages = response.data.pagination.total_pages;
          this.pagination.currentPage = response.data.pagination.page;
          this.pagination.pageSize = response.data.pagination.page_size;
        } else {
          this.showSnackbar(response.message || 'Error al cargar exámenes', 'error');
        }
      } catch {
        this.showSnackbar('Error al cargar exámenes', 'error');
      } finally {
        this.loading = false;
        this.tableLoading = false;
      }
    },

    handleTabChange() {
      this.pagination.currentPage = 1;
      this.searchQuery = '';
      this.filterDifficulty = null;
      this.filterStatus = null;
      this.fetchExams();
    },

    handlePageChange(page: number) {
      this.pagination.currentPage = page;
      this.fetchExams();
    },

    handlePageSizeChange(pageSize: number) {
      this.pagination.pageSize = pageSize;
      this.pagination.currentPage = 1;
      this.fetchExams();
    },

    debouncedSearch() {
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.pagination.currentPage = 1;
        this.fetchExams();
      }, 500);
    },

    showSnackbar(message: string, color = 'success') {
      this.snackbar = { show: true, message, color };
    },

    openCreateDialog() {
      (this.$refs.examFormDialog as InstanceType<typeof ExamFormDialog>).openCreate();
    },

    openEditDialog(exam: Exam) {
      (this.$refs.examFormDialog as InstanceType<typeof ExamFormDialog>).openEdit(exam.id_exam);
    },

    openAssignDialog(exam: Exam) {
      (this.$refs.assignGroupsDialog as InstanceType<typeof AssignGroupsDialog>).open(exam.id_exam);
    },

    onExamSaved() {
      this.showSnackbar('Examen guardado exitosamente.');
      this.loading = true;
      this.fetchExams();
    },

    onGroupsAssigned() {
      this.showSnackbar('Grupos asignados exitosamente.');
      this.loading = true;
      this.fetchExams();
    },

    async toggleStatus(exam: Exam) {
      const newStatus = !exam.status;
      const action = newStatus ? 'activar' : 'desactivar';
      const confirmed = await (this.$refs.confirmDialog as InstanceType<typeof ConfirmDialog>)
        .open(`¿Está seguro de ${action} el examen "${exam.name}" (${exam.difficulty_label})?`);
      if (!confirmed) return;

      this.loading = true;
      try {
        const response = await controller.updateExamStatus(exam.id_exam, newStatus);
        if (response.success) {
          this.showSnackbar(`Examen ${newStatus ? 'activado' : 'desactivado'} exitosamente.`);
          this.fetchExams();
        } else {
          this.showSnackbar(response.message || 'Error al cambiar el estado.', 'error');
        }
      } catch {
        this.showSnackbar('Error inesperado al cambiar el estado.', 'error');
      } finally {
        this.loading = false;
      }
    },

    async toggleSecureMode(exam: Exam) {
      const newMode = !exam.secure_mode;
      const action = newMode ? 'activar' : 'desactivar';
      const confirmed = await (this.$refs.confirmDialog as InstanceType<typeof ConfirmDialog>)
        .open(`¿Está seguro de ${action} el modo seguro del examen "${exam.name}" (${exam.difficulty_label})?`);
      if (!confirmed) return;

      this.loading = true;
      try {
        const response = await controller.updateExamSecureMode(exam.id_exam, newMode);
        if (response.success) {
          this.showSnackbar(`Modo seguro ${newMode ? 'activado' : 'desactivado'} exitosamente.`);
          this.fetchExams();
        } else {
          this.showSnackbar(response.message || 'Error al cambiar el modo seguro.', 'error');
        }
      } catch {
        this.showSnackbar('Error inesperado al cambiar el modo seguro.', 'error');
      } finally {
        this.loading = false;
      }
    },

    viewGrades(exam: Exam) {
      this.$router.push({ name: 'ExamGrades', params: { id: String(exam.id_exam) } });
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

.status-chip {
  font-weight: 600;
}
</style>
