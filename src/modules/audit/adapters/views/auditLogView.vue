<template>
  <v-container fluid class="pa-8">
    <Loader :visible="loading" message="Cargando bitácora..." />

    <HeaderSession title="Bitácora" />

    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <p class="page-subtitle text-body-1 text-grey-darken-1">
          Consulta el historial de cambios registrados en el sistema.
        </p>
      </div>
    </div>

    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="4" md="3">
        <v-select
          v-model="operationFilter"
          label="Operación"
          :items="operationFilterItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="fetchAuditLogs"
        />
      </v-col>
    </v-row>

    <v-card elevation="2" class="mb-4">
      <PaginatedTable
        :columns="columns"
        :data="auditLogs"
        :total-records="pagination.count"
        :total-pages="pagination.totalPages"
        :current-page-prop="pagination.currentPage"
        :page-size-prop="pagination.pageSize"
        :loading="loading"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <template #cell-changed_at="{ value }">
          <span class="text-body-2">{{ formatDate(value) }}</span>
        </template>

        <template #cell-table="{ value }">
          <span class="text-body-2 font-weight-medium">{{ value }}</span>
        </template>

        <template #cell-operation="{ value }">
          <v-chip :color="getOperationColor(value)" size="small" variant="tonal">
            {{ value }}
          </v-chip>
        </template>

        <template #cell-user="{ row }">
          <span class="text-body-2">
            {{ row.user || 'Sin usuario' }}
          </span>
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
                <v-list-item @click="openDetails(row)">
                  <template #prepend>
                    <v-icon color="primary">mdi-eye-outline</v-icon>
                  </template>
                  <v-list-item-title>Ver detalles</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </PaginatedTable>
    </v-card>

    <v-row v-if="!loading && pagination.count > 0" class="align-center mt-2">
      <v-col cols="12" md="3">
        <v-select
          label="Registros por página"
          v-model="pagination.pageSize"
          :items="pageSizesOptions"
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

    <AuditLogDetailModal
      :dialog="detailDialog"
      :audit-log="selectedAuditLog"
      @update:dialog="detailDialog = $event"
    />

    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import HeaderSession from '@/components/HeaderSession.vue';
import Loader from '@/components/Loader.vue';
import PaginatedTable from '@/components/PaginatedTable.vue';
import AuditLogDetailModal from '@/modules/audit/adapters/components/AuditLogDetailModal.vue';
import { AuditLog } from '@/modules/audit/entities/audit-log';
import { AuditLogController } from '@/modules/audit/adapters/audit-log.controller';

type OperationFilter = 'Creación' | 'Actualización' | 'Eliminación' | null;

export default defineComponent({
  name: 'auditLogView',
  components: {
    HeaderSession,
    Loader,
    PaginatedTable,
    AuditLogDetailModal,
  },
  data() {
    return {
      loading: false,
      auditLogs: [] as AuditLog[],
      operationFilter: null as OperationFilter,
      detailDialog: false,
      selectedAuditLog: null as AuditLog | null,
      pagination: {
        count: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      columns: [
        { label: 'Fecha', key: 'changed_at', width: '180px', minWidth: '160px' },
        { label: 'Tabla', key: 'table', width: '180px', minWidth: '150px' },
        { label: 'Operación', key: 'operation', width: '140px', minWidth: '130px' },
        { label: 'Usuario', key: 'user', width: '220px', minWidth: '180px' },
        { label: 'Acciones', key: 'actions', width: '90px', minWidth: '80px' },
      ],
      operationFilterItems: [
        { label: 'Creación', value: 'Creación' },
        { label: 'Actualización', value: 'Actualización' },
        { label: 'Eliminación', value: 'Eliminación' },
      ],
      pageSizesOptions: [
        { title: '5', value: 5 },
        { title: '10', value: 10 },
        { title: '20', value: 20 },
        { title: '50', value: 50 },
        { title: '100', value: 100 },
      ],
      snackbar: {
        show: false,
        message: '',
        color: 'success',
      },
    };
  },
  computed: {
    paginationInfo(): string {
      if (this.pagination.count === 0) return '0 registros';

      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
      const end = Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.count);

      return `Mostrando ${start}-${end} de ${this.pagination.count} registros`;
    },
  },
  mounted() {
    this.fetchAuditLogs();
  },
  methods: {
    async fetchAuditLogs() {
      this.loading = true;

      try {
        const controller = new AuditLogController();
        const response = await controller.getAuditLogs(
          {
            page: this.pagination.currentPage,
            limit: this.pagination.pageSize,
          },
          this.operationFilter || undefined,
        );

        this.auditLogs = response.results || [];
        this.pagination.count = response.count || 0;
        this.pagination.totalPages = response.total_pages || 1;
        this.pagination.currentPage = response.current_page || 1;
        this.pagination.pageSize = response.page_size || 10;
      } catch (error) {
        console.error('Error fetching audit logs:', error);
        this.showSnackbar('Error al cargar la bitácora.', 'error');
      } finally {
        this.loading = false;
      }
    },

    handlePageChange(page: number) {
      this.pagination.currentPage = page;
      this.fetchAuditLogs();
    },

    handlePageSizeChange(pageSize: number) {
      this.pagination.pageSize = pageSize;
      this.pagination.currentPage = 1;
      this.fetchAuditLogs();
    },

    openDetails(auditLog: AuditLog) {
      this.selectedAuditLog = auditLog;
      this.detailDialog = true;
    },

    getOperationColor(operation: string): string {
      if (operation === 'Creación' || operation === 'INSERT') return 'success';
      if (operation === 'Actualización' || operation === 'UPDATE') return 'warning';
      if (operation === 'Eliminación' || operation === 'DELETE') return 'error';
      return 'primary';
    },

    formatDate(dateValue: string): string {
      if (!dateValue) return '-';

      return new Date(dateValue).toLocaleString('es-MX', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },

    showSnackbar(message: string, color = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
  },
});
</script>
