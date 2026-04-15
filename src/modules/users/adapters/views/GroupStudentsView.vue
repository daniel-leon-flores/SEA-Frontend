<template>
  <v-container fluid class="students-page pa-8">
    <Loader :visible="loading" message="Cargando estudiantes..." />
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
      <template #divider>
        <v-icon icon="mdi-chevron-right" />
      </template>
    </v-breadcrumbs>
    <!-- Header -->
    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div class="d-flex align-start ga-4">
        <div>
          <h1 class="page-title">Grupo {{ groupName }}</h1>
          <p class="page-subtitle">Administra los estudiantes del grupo</p>
        </div>
      </div>
      <v-btn color="success" size="large" rounded="lg" class="text-none" prepend-icon="mdi-plus" @click="openAddStudentModal">
        Registrar alumno
      </v-btn>
    </div>

    <!-- Toolbar: filtros + búsqueda -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar estudiante"
          placeholder="Nombre, matrícula, email..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="debouncedSearch"
        />
      </v-col>
      <v-col cols="12" sm="6" md="2">
        <v-select
          v-model="filterStatus"
          label="Estado"
          :items="filterStatusItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="loadStudents"
        />
      </v-col>
    </v-row>

    <!-- Tabla -->
    <v-card elevation="2" class="mb-4">
      <PaginatedTable
        :columns="columns"
        :data="students"
        :total-records="pagination.count"
        :total-pages="pagination.totalPages"
        :current-page-prop="pagination.currentPage"
        :page-size-prop="pagination.pageSize"
        :loading="loading"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <!-- Matrícula -->
        <template #cell-matricula="{ row }">
          <span class="text-body-2">{{ row.matricula || '-' }}</span>
        </template>

        <!-- Nombre completo -->
        <template #cell-fullName="{ row }">
          <div class="text-center">
            <div class="font-weight-medium text-body-2">{{ row.full_name }}</div>
          </div>
        </template>

        <!-- Email -->
        <template #cell-email="{ value }">
          <span class="text-body-2">{{ value }}</span>
        </template>

        <!-- Estado -->
        <template #cell-status="{ row }">
          <v-chip
            :color="row.status ? '#10b981' : '#f59e0b'"
            size="small"
            class="status-chip"
          >
            {{ row.status ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Acciones -->
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
                <v-list-item @click="editStudent(row)">
                  <template #prepend>
                    <v-icon color="warning">mdi-pencil-outline</v-icon>
                  </template>
                  <v-list-item-title>Editar estudiante</v-list-item-title>
                </v-list-item>

                <v-list-item @click="toggleStudentStatus(row)">
                  <template #prepend>
                    <v-icon :color="row.status ? 'error' : 'success'">
                      {{ row.status ? 'mdi-account-cancel' : 'mdi-account-check' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ row.status ? 'Desactivar' : 'Activar' }}
                  </v-list-item-title>
                </v-list-item>

                <v-divider class="my-1" />

                <v-list-item @click="removeStudent(row)">
                  <template #prepend>
                    <v-icon color="error">mdi-trash-outline</v-icon>
                  </template>
                  <v-list-item-title>Remover del grupo</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </PaginatedTable>
    </v-card>

    <!-- Modal: Agregar estudiante -->
    <CreateStudentModal
      v-model:dialog="showAddStudentModal"
      :group-id="groupId"
      @student-created="onStudentCreated"
    />

    <!-- Modal: Editar estudiante -->
    <UpdateUserModal
      v-model:dialog="updateDialog"
      :user="selectedStudent || undefined"
      @user-updated="onStudentUpdated"
    />

    <ConfirmDialog ref="confirmDialog" />

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2600">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { encodeId, decodeId } from '@/kernel/url-cipher';
import Loader from '@/components/Loader.vue';
import PaginatedTable from '@/components/PaginatedTable.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import CreateStudentModal from '../components/CreateStudentModal.vue';
import UpdateUserModal from '../components/UpdateUserModal.vue';
import { UserController } from '../user.controller';
import type { User } from '../../entities/user';

const route = useRoute();

const generationId = decodeId(route.params.generationId as string);
const groupId = decodeId(route.params.groupId as string);
const groupName = computed(() => (route.query.groupName as string) || 'Nombre del grupo');

// Estado
const loading = ref(false);
const students = ref<User[]>([]);
const showAddStudentModal = ref(false);
const updateDialog = ref(false);
const selectedStudent = ref<User | null>(null);
const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const searchQuery = ref('');
const filterStatus = ref<string | null>(null);

const snackbar = ref({
  show: false,
  color: 'success',
  message: '',
});

const pagination = ref({
  count: 0,
  totalPages: 1,
  currentPage: 1,
  pageSize: 10,
});

const columns = [
  { label: 'Matrícula', key: 'matricula', width: '150px', minWidth: '120px' },
  { label: 'Nombre Completo', key: 'fullName', width: '250px', minWidth: '200px' },
  { label: 'Correo', key: 'email', width: '250px', minWidth: '200px' },
  { label: 'Estado', key: 'status', width: '120px', minWidth: '100px' },
  { label: 'Acciones', key: 'actions', width: '100px', minWidth: '80px' }
];

const filterStatusItems = [
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' }
];

const breadcrumbItems = computed(() => [
  { title: 'Generaciones', disabled: false, href: '/generations' },
  { title: 'Grupos', disabled: false, href: `/generations/${encodeId(generationId)}/groups` },
  { title: groupName.value ? `Grupo ${groupName.value}` : 'Grupo', disabled: true },
]);

// Debounce para búsqueda
let debounceTimer: ReturnType<typeof setTimeout> | null = null;
const debouncedSearch = () => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    pagination.value.currentPage = 1;
    loadStudents();
  }, 500);
};

// Utilidades
const showToast = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, color, message };
};

// Carga de datos
const loadStudents = async () => {
  loading.value = true;
  try {
    const userController = new UserController();
    const response: any = await userController.getUsers({
      pagination: {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        filter: searchQuery.value || undefined,
      },
      role: 'student',
      group: groupId,
      status: filterStatus.value || undefined,
    });

    // Manejar dos posibles estructuras de respuesta
    if (response.results) {
      // Respuesta directa del paginador
      students.value = response.results;
      pagination.value.count = response.count || 0;
      pagination.value.totalPages = response.total_pages || 1;
      pagination.value.currentPage = response.current_page || 1;
      pagination.value.pageSize = response.page_size || 10;
    } else if (response.success && response.data && response.data.results) {
      // Respuesta envuelta en ApiResponse
      students.value = response.data.results;
      pagination.value.count = response.data.count || 0;
      pagination.value.totalPages = response.data.total_pages || 1;
      pagination.value.currentPage = response.data.current_page || 1;
      pagination.value.pageSize = response.data.page_size || 10;
    } else {
      console.error('Unexpected response format:', response);
      showToast(response.message || 'Error al cargar los estudiantes.', 'error');
    }
  } catch (error) {
    console.error('Error loading students:', error);
    showToast('Error al cargar los estudiantes.', 'error');
  } finally {
    loading.value = false;
  }
};

// Modal
const openAddStudentModal = () => {
  showAddStudentModal.value = true;
};

const onStudentCreated = async (_student: User) => {
  showToast('Alumno registrado correctamente.', 'success');
  await loadStudents();
};

// Acciones de tabla
const editStudent = (row: User) => {
  selectedStudent.value = row;
  updateDialog.value = true;
};

const toggleStudentStatus = async (row: User) => {
  if (!confirmDialog.value) return;

  const action = row.status ? 'desactivar' : 'activar';
  const confirmed = await confirmDialog.value.open(`¿Deseas ${action} al alumno ${row.full_name}?`);
  if (!confirmed) return;

  loading.value = true;
  try {
    const userController = new UserController();
    const response = await userController.updateUserStatus(row.id_user, !row.status);

    if (response.success) {
      const message = row.status ? 'Alumno desactivado.' : 'Alumno activado.';
      showToast(message, 'success');
      await loadStudents();
    } else {
      showToast(response.message || 'Error al cambiar el estado del alumno.', 'error');
    }
  } catch (error) {
    console.error('Error changing student status:', error);
    showToast('Error al cambiar el estado del alumno.', 'error');
  } finally {
    loading.value = false;
  }
};

const onStudentUpdated = async (_student: User) => {
  selectedStudent.value = null;
  showToast('Alumno actualizado correctamente.', 'success');
  await loadStudents();
};

const removeStudent = async (row: User) => {
  if (!confirmDialog.value) return;

  const confirmed = await confirmDialog.value.open(`¿Remover a ${row.full_name} del grupo?`);
  if (!confirmed) return;

  loading.value = true;
  try {
    const userController = new UserController();
    const response = await userController.updateUser(row.id_user, { id_group: null });

    if (response.success) {
      showToast('Alumno removido del grupo.', 'success');
      await loadStudents();
    } else {
      showToast(response.message || 'Error al remover al estudiante.', 'error');
    }
  } catch (error) {
    console.error('Error removing student:', error);
    showToast('Error al remover al estudiante.', 'error');
  } finally {
    loading.value = false;
  }
};

// Paginación
const handlePageChange = (page: number) => {
  pagination.value.currentPage = page;
  loadStudents();
};

const handlePageSizeChange = (size: number) => {
  pagination.value.pageSize = size;
  pagination.value.currentPage = 1;
  loadStudents();
};

onMounted(async () => {
  await loadStudents();
  const shouldOpen = String(route.query.openAdd || '0') === '1';
  if (shouldOpen) {
    openAddStudentModal();
  }
});
</script>

<style scoped>
.students-page {
  background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
  min-height: 100vh;
}

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

@media (max-width: 960px) {
  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 16px;
  }
}
</style>