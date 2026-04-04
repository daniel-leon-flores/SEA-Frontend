<template>
  <v-dialog :model-value="dialog" max-width="900" @update:model-value="emit('update:dialog', $event)">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between py-4 px-5">
        <span class="text-h6 font-weight-bold">Detalle de movimiento</span>
        <v-btn icon="mdi-close" variant="text" @click="emit('update:dialog', false)" />
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <v-row class="mb-2">
          <v-col cols="12" md="4">
            <div class="detail-label">Tabla</div>
            <div class="detail-value">{{ auditLog?.table || '-' }}</div>
          </v-col>
          <v-col cols="12" md="4">
            <div class="detail-label">Operación</div>
            <v-chip :color="operationColor" size="small" variant="tonal">
              {{ auditLog?.operation || '-' }}
            </v-chip>
          </v-col>
          <v-col cols="12" md="4">
            <div class="detail-label">Fecha</div>
            <div class="detail-value">{{ formattedDate }}</div>
          </v-col>
        </v-row>

        <v-row class="mb-6">
          <v-col cols="12">
            <div class="detail-label">Usuario</div>
            <div class="detail-value">{{ auditLog?.user || 'Sin usuario' }}</div>
          </v-col>
        </v-row>

        <div class="text-subtitle-1 font-weight-bold mb-3">Historial de cambios</div>

        <v-alert
          v-if="isPasswordUpdateOnly"
          type="warning"
          variant="tonal"
          density="comfortable"
          text="Actualización de contraseña."
        />

        <v-alert
          v-else-if="changeRows.length === 0"
          type="info"
          variant="tonal"
          density="comfortable"
          text="No hay diferencias para mostrar en este registro."
        />

        <v-table v-else density="comfortable" class="detail-table" fixed-header>
          <thead>
            <tr>
              <th class="text-left">Campo</th>
              <th v-if="!isCreationOperation" class="text-left">Valor anterior</th>
              <th class="text-left">Valor nuevo</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in changeRows" :key="row.field">
              <td class="font-weight-medium">{{ row.field }}</td>
              <td v-if="!isCreationOperation">
                <pre class="value-preview old-value">{{ row.old }}</pre>
              </td>
              <td>
                <pre class="value-preview new-value">{{ row.new }}</pre>
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>

      <v-divider />

      <v-card-actions class="justify-end pa-4">
        <v-btn variant="outlined" color="primary" @click="emit('update:dialog', false)">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AuditLog } from '../../entities/audit-log';

const props = defineProps<{
  dialog: boolean;
  auditLog: AuditLog | null;
}>();

const emit = defineEmits<{
  (event: 'update:dialog', value: boolean): void;
}>();

type ChangeRow = {
  field: string;
  old: string;
  new: string;
};

const formattedDate = computed(() => {
  if (!props.auditLog?.changed_at) return '-';
  return new Date(props.auditLog.changed_at).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
});

const operationColor = computed(() => {
  const operation = props.auditLog?.operation;

  if (operation === 'Creación' || operation === 'INSERT') return 'success';
  if (operation === 'Actualización' || operation === 'UPDATE') return 'warning';
  if (operation === 'Eliminación' || operation === 'DELETE') return 'error';

  return 'primary';
});

const isCreationOperation = computed(() => {
  const operation = props.auditLog?.operation;
  return operation === 'Creación' || operation === 'INSERT';
});

const isUpdateOperation = computed(() => {
  const operation = props.auditLog?.operation;
  return operation === 'Actualización' || operation === 'UPDATE';
});

const rawRows = computed<ChangeRow[]>(() => {
  return (props.auditLog?.changes || []).map((change) => ({
    field: change.field,
    old: formatValue(change.old, change.field),
    new: formatValue(change.new, change.field),
  }));
});

const hasSensitiveChanges = computed(() => rawRows.value.some((row) => isSensitiveField(row.field)));

const isPasswordUpdateOnly = computed(() => {
  return isUpdateOperation.value && hasSensitiveChanges.value && changeRows.value.length === 0;
});

const changeRows = computed<ChangeRow[]>(() => {
  const rowsWithoutSensitive = rawRows.value.filter((row) => !isSensitiveField(row.field));

  // En creación de usuario, no mostrar nunca el campo de contraseña.
  if (isCreationOperation.value) {
    return rowsWithoutSensitive;
  }

  // En actualización de contraseña, ocultar detalle sensible y priorizar alerta.
  return rowsWithoutSensitive;
});

function isSensitiveField(fieldName?: string): boolean {
  const normalized = (fieldName || '').trim().toLowerCase();
  return normalized === 'password' || normalized === 'token' || normalized === 'secret_key';
}

function formatValue(value: unknown, fieldName?: string): string {
  if (value === null || value === undefined) {
    return '-';
  }

  if (isStatusField(fieldName)) {
    const statusText = formatStatusValue(value);
    if (statusText) {
      return statusText;
    }
  }

  if (typeof value === 'string') {
    return value.trim() ? value : '-';
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function isStatusField(fieldName?: string): boolean {
  const normalized = (fieldName || '').toLowerCase();
  return normalized === 'estado' || normalized === 'activo' || normalized === 'status' || normalized === 'is_active';
}

function formatStatusValue(value: unknown): string | null {
  if (typeof value === 'boolean') {
    return value ? 'Activo' : 'Inactivo';
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') {
      return 'Activo';
    }
    if (normalized === 'false' || normalized === '0') {
      return 'Inactivo';
    }
  }

  if (typeof value === 'number') {
    if (value === 1) return 'Activo';
    if (value === 0) return 'Inactivo';
  }

  return null;
}
</script>

<style scoped>
.detail-label {
  font-size: 0.78rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 0.95rem;
  color: #111827;
  word-break: break-word;
}

.detail-table {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.value-preview {
  white-space: pre-wrap;
  margin: 0;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.4;
  max-height: 180px;
  overflow: auto;
}

.old-value {
  background: #fff7ed;
  color: #9a3412;
}

.new-value {
  background: #ecfdf5;
  color: #065f46;
}
</style>
