<template>
  <v-container fluid class="periods-page pa-8">
    <Loader :visible="loading" message="Cargando periodos..." />

    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title">Periodos académicos</h1>
        <p class="page-subtitle">Administra los periodos (cuatrimestres) y sus fechas de vigencia</p>
      </div>
      <v-btn color="success" size="default" rounded="lg" class="text-none" prepend-icon="mdi-plus" @click="openCreate">
        Registrar periodo
      </v-btn>
    </div>

    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6" md="3">
        <v-text-field
          v-model.number="filterYearProxy"
          label="Año"
          type="number"
          min="1900"
          max="2200"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          placeholder="Todos"
          @update:model-value="onFilterChange"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="filterStatusProxy"
          label="Estado"
          :items="filterStatusItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="onFilterChange"
        />
      </v-col>
    </v-row>

    <v-card elevation="2" class="mb-4">
      <PaginatedTable
        :columns="columns"
        :data="periods"
        :total-records="totalItems"
        :total-pages="totalPages"
        :current-page-prop="currentPage"
        :page-size-prop="pageSize"
        :loading="loading"
      >
        <template #cell-year="{ value }">
          <span class="text-body-2 font-weight-medium">{{ value }}</span>
        </template>

        <template #cell-period_name="{ value }">
          <span class="text-body-2">{{ value }}</span>
        </template>

        <template #cell-start_date="{ row }">
          <span class="text-body-2">{{ formatDate(row.start_date) }}</span>
        </template>

        <template #cell-end_date="{ row }">
          <span class="text-body-2">{{ formatDate(row.end_date) }}</span>
        </template>

        <template #cell-status="{ row }">
          <v-chip :color="row.status ? '#10b981' : '#f59e0b'" size="small" variant="flat" class="text-white">
            {{ row.status ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template #cell-actions="{ row }">
          <div class="d-flex justify-center">
            <v-menu>
              <template #activator="{ props: menuProps }">
                <v-btn v-bind="menuProps" icon="mdi-dots-vertical" size="small" variant="text" color="grey-darken-1" />
              </template>
              <v-list density="compact">
                <v-list-item @click="openEdit(row)">
                  <template #prepend>
                    <v-icon color="warning">mdi-pencil-outline</v-icon>
                  </template>
                  <v-list-item-title>Editar</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="row.status" @click="openDeactivateConfirm(row)">
                  <template #prepend>
                    <v-icon color="error">mdi-delete-outline</v-icon>
                  </template>
                  <v-list-item-title>Desactivar</v-list-item-title>
                </v-list-item>

                <v-list-item v-else @click="openActivateConfirm(row)">
                  <template #prepend>
                    <v-icon color="success">mdi-check-circle-outline</v-icon>
                  </template>
                  <v-list-item-title>Activar</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </PaginatedTable>
    </v-card>

    <v-row v-if="!loading && totalItems > 0" class="align-center mt-2">
      <v-col cols="12" md="3">
        <v-select
          v-model="pageSize"
          label="Registros por página"
          :items="pageSizeOptions"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="onPageSizeChange"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="totalPages"
          :total-visible="7"
          rounded="circle"
          density="comfortable"
          @update:model-value="loadPeriods"
        />
      </v-col>
      <v-col cols="12" md="3" class="text-end">
        <p class="text-caption text-grey-darken-1">{{ paginationInfo }}</p>
      </v-col>
    </v-row>

    <PeriodFormDialog
      v-model="formOpen"
      :mode="formMode"
      :period="selectedPeriod"
      :saving="saving"
      @save="onSaveForm"
    />

    <v-dialog v-model="confirmDeactivateOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Desactivar periodo</v-card-title>
        <v-card-text class="text-body-2">
          Se desactivará el periodo (no hay borrado físico en la API). Dejará de estar disponible para operaciones
          académicas. ¿Continuar?
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="confirmDeactivateOpen = false">Cancelar</v-btn>
          <v-btn color="error" variant="flat" :loading="statusLoading" @click="confirmDeactivate"> Desactivar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="confirmActivateOpen" max-width="420">
      <v-card rounded="lg">
        <v-card-title class="text-h6">Activar periodo</v-card-title>
        <v-card-text>¿Desea marcar este periodo como activo?</v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="confirmActivateOpen = false">Cancelar</v-btn>
          <v-btn color="success" variant="flat" :loading="statusLoading" @click="confirmActivate"> Activar </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3200" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import PaginatedTable from '@/components/PaginatedTable.vue';
import Loader from '@/components/Loader.vue';
import PeriodFormDialog from '../components/PeriodFormDialog.vue';
import { usePeriods } from '../../composables/usePeriods';
import { periodService } from '../../services/period.service';
import type { Period } from '../../entities/period';
import type { CreatePeriodDto } from '../../entities/create-period.dto';

const {
  periods,
  loading,
  filterYear,
  filterStatus,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
  paginationInfo,
  loadPeriods,
  resetPageAndLoad,
} = usePeriods();

const saving = ref(false);
const statusLoading = ref(false);

const formOpen = ref(false);
const formMode = ref<'create' | 'edit'>('create');
const selectedPeriod = ref<Period | null>(null);

const confirmDeactivateOpen = ref(false);
const confirmActivateOpen = ref(false);
const periodForStatus = ref<Period | null>(null);

const snackbar = ref({ show: false, message: '', color: 'success' });

const filterYearProxy = ref<number | null>(null);
const filterStatusProxy = ref<boolean | null>(null);

const filterStatusItems = [
  { label: 'Activos', value: true },
  { label: 'Inactivos', value: false },
];

const pageSizeOptions = [5, 10, 20, 50];

const columns = [
  { label: 'Año', key: 'year', width: '100px', minWidth: '80px' },
  { label: 'Periodo', key: 'period_name', width: '200px', minWidth: '160px' },
  { label: 'Inicio', key: 'start_date', width: '140px', minWidth: '120px' },
  { label: 'Fin', key: 'end_date', width: '140px', minWidth: '120px' },
  { label: 'Estado', key: 'status', width: '120px', minWidth: '100px' },
  { label: 'Acciones', key: 'actions', width: '100px', minWidth: '88px' },
];

const showToast = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, message, color };
};

const formatDate = (iso: string) => {
  if (!iso) return '—';
  try {
    const d = new Date(`${iso}T12:00:00`);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
};

const onFilterChange = async () => {
  filterYear.value = filterYearProxy.value ?? undefined;
  filterStatus.value = filterStatusProxy.value ?? undefined;
  const result = await resetPageAndLoad();
  if (result && 'ok' in result && !result.ok && result.message) {
    showToast(result.message, 'error');
  }
};

const onPageSizeChange = async () => {
  currentPage.value = 1;
  await loadPeriods();
};

const openCreate = () => {
  formMode.value = 'create';
  selectedPeriod.value = null;
  formOpen.value = true;
};

const openEdit = (row: Period) => {
  formMode.value = 'edit';
  selectedPeriod.value = { ...row };
  formOpen.value = true;
};

const onSaveForm = async (payload: CreatePeriodDto) => {
  saving.value = true;
  try {
    if (formMode.value === 'edit' && selectedPeriod.value) {
      const res = await periodService.updatePeriod(selectedPeriod.value.id_period, payload);
      saving.value = false;
      if (!res.success) {
        showToast(res.message || 'No se pudo actualizar el periodo.', 'error');
        return;
      }
      showToast(res.message || 'Periodo actualizado exitosamente.');
      formOpen.value = false;
      await loadPeriods();
      return;
    }

    const res = await periodService.createPeriod(payload);
    saving.value = false;
    if (!res.success) {
      showToast(res.message || 'No se pudo registrar el periodo.', 'error');
      return;
    }
    showToast(res.message || 'Periodo registrado exitosamente.');
    formOpen.value = false;
    currentPage.value = 1;
    await loadPeriods();
  } catch {
    saving.value = false;
    showToast('Error de red o del servidor.', 'error');
  }
};

const openDeactivateConfirm = (row: Period) => {
  periodForStatus.value = row;
  confirmDeactivateOpen.value = true;
};

const openActivateConfirm = (row: Period) => {
  periodForStatus.value = row;
  confirmActivateOpen.value = true;
};

const confirmDeactivate = async () => {
  if (!periodForStatus.value) return;
  statusLoading.value = true;
  try {
    const res = await periodService.setPeriodStatus(periodForStatus.value.id_period, false);
    statusLoading.value = false;
    confirmDeactivateOpen.value = false;
    if (!res.success) {
      showToast(res.message || 'No se pudo desactivar el periodo.', 'error');
      return;
    }
    showToast(res.message || 'Periodo desactivado.');
    periodForStatus.value = null;
    await loadPeriods();
  } catch {
    statusLoading.value = false;
    showToast('Error al desactivar el periodo.', 'error');
  }
};

const confirmActivate = async () => {
  if (!periodForStatus.value) return;
  statusLoading.value = true;
  try {
    const res = await periodService.setPeriodStatus(periodForStatus.value.id_period, true);
    statusLoading.value = false;
    confirmActivateOpen.value = false;
    if (!res.success) {
      showToast(res.message || 'No se pudo activar el periodo.', 'error');
      return;
    }
    showToast(res.message || 'Periodo activado.');
    periodForStatus.value = null;
    await loadPeriods();
  } catch {
    statusLoading.value = false;
    showToast('Error al activar el periodo.', 'error');
  }
};

onMounted(async () => {
  const result = await loadPeriods();
  if (result && 'ok' in result && !result.ok && result.message) {
    showToast(result.message, 'error');
  }
});
</script>

<style scoped>
.periods-page {
  background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
  min-height: 100vh;
}
.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #063244;
  letter-spacing: -0.02em;
}
.page-subtitle {
  color: rgba(0, 0, 0, 0.55);
  max-width: 560px;
}
</style>
