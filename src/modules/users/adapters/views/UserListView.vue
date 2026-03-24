<template>
  <v-container fluid class="pa-6">
    <Loader :visible="loading" message="Cargando usuarios..." />

    <HeaderSession title="Usuarios" />

    <!-- Header card -->
    <v-row>
      <v-col cols="12">
        <v-card color="#063244" class="pa-6 mb-4">
          <v-card-title class="text-white">
            <v-icon start>mdi-shield-account</v-icon>
            Gestión de Usuarios
          </v-card-title>
          <v-card-text style="color: #9fb5b8;">
            Administra los usuarios del sistema (estudiantes, profesores, administradores).
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Toolbar: filtros + botón -->
    <v-row class="mb-2" align="center">
      <v-col cols="12" sm="4" md="3">
        <v-select
          v-model="filterRole"
          label="Filtrar por rol"
          :items="filterRoleItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @update:model-value="fetchUsers"
        />
      </v-col>
      <v-col cols="12" sm="4" md="3">
        <v-select
          v-model="filterStatus"
          label="Estado"
          :items="filterStatusItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          @update:model-value="fetchUsers"
        />
      </v-col>
      <v-spacer />
      <v-col cols="12" sm="4" md="3" class="d-flex justify-end">
        <v-btn color="primary" prepend-icon="mdi-account-plus" @click="openDialog">
          Registrar usuario
        </v-btn>
      </v-col>
    </v-row>

    <!-- Tabla / Empty state -->
    <v-row v-if="!loading">
      <v-col cols="12">
        <EmptyState
          v-if="users.length === 0"
          title="Sin usuarios"
          description="No se encontraron usuarios con los filtros aplicados."
          :show-button="true"
          button-text="Registrar primer usuario"
          @action="openDialog"
        />

        <Table
          v-else
          :columns="columns"
          :data="tableRows"
          :total-records="users.length"
        >
          <!-- Nombre + matrícula -->
          <template #cell-fullName="{ row }">
            <div class="d-flex align-center gap-2">
              <v-avatar size="32" color="primary" class="mr-2 flex-shrink-0">
                <span class="text-caption text-white font-weight-bold">
                  {{ initials(row) }}
                </span>
              </v-avatar>
              <div class="text-left">
                <div class="font-weight-medium text-body-2">{{ row.fullName }}</div>
                <div class="text-caption text-grey">{{ row.matricula }}</div>
              </div>
            </div>
          </template>

          <!-- Email -->
          <template #cell-email="{ value }">
            <span class="text-body-2">{{ value }}</span>
          </template>

          <!-- Rol -->
          <template #cell-role="{ value }">
            <v-chip :color="roleColor(value)" size="small" variant="tonal">
              <v-icon start :icon="roleIcon(value)" size="14" />
              {{ roleLabel(value) }}
            </v-chip>
          </template>

          <!-- Estado -->
          <template #cell-isActive="{ value }">
            <v-chip :color="value ? 'success' : 'error'" size="small" variant="tonal">
              {{ value ? 'Activo' : 'Inactivo' }}
            </v-chip>
          </template>

          <!-- Fecha de registro -->
          <template #cell-dateJoined="{ value }">
            <span class="text-caption text-grey">{{ formatDate(value) }}</span>
          </template>

          <!-- Acciones -->
          <template #cell-actions>
            <TableButton
              icon="mdi-eye-outline"
              color="info"
              tooltip="Ver detalles"
              @click="() => {}"
            />
          </template>
        </Table>
      </v-col>
    </v-row>

    <!-- ── Modal de registro ───────────────────────────────────────────── -->
    <v-dialog v-model="dialog" max-width="640" persistent scrollable>
      <v-card>
        <!-- Título -->
        <v-card-title class="pa-5 pb-3 d-flex align-center">
          <v-icon start color="primary">mdi-account-plus</v-icon>
          Registrar nuevo usuario
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </v-card-title>
        <v-divider />

        <!-- Formulario -->
        <v-card-text class="pa-5">
          <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.first_name"
                  label="Nombre(s)"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.first_name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.last_name"
                  label="Apellidos"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.last_name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.email"
                  label="Correo electrónico"
                  type="email"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required, rules.email]"
                  :error-messages="serverErrors.email"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.matricula"
                  label="Matrícula"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.matricula"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="payload.role"
                  label="Rol"
                  :items="roleItems"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  @update:model-value="onRoleChange"
                />
              </v-col>
              <v-col cols="12" md="6" class="d-flex align-center">
                <v-switch
                  v-model="payload.status"
                  label="Usuario activo"
                  color="primary"
                  hide-details
                  inset
                />
              </v-col>

              <!-- Grupo — solo alumnos -->
              <v-col v-if="payload.role === 'student'" cols="12">
                <v-select
                  v-model="payload.id_group"
                  label="Grupo académico"
                  :items="groups"
                  item-title="label"
                  item-value="id_group"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.id_group"
                  :loading="loadingGroups"
                  clearable
                />
              </v-col>

              <!-- Materias — solo docentes -->
              <v-col v-if="payload.role === 'teacher'" cols="12">
                <v-select
                  v-model="payload.subject_ids"
                  label="Materias asignadas"
                  :items="subjects"
                  item-title="name"
                  item-value="id_subject"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  clearable
                  :error-messages="serverErrors.subject_ids"
                  :loading="loadingSubjects"
                />
              </v-col>
            </v-row>

            <!-- Hint de contraseña -->
            <v-alert
              v-if="payload.matricula && payload.role"
              type="info"
              variant="tonal"
              density="compact"
              class="mt-3"
              icon="mdi-key-outline"
            >
              Contraseña generada:
              <strong>{{ passwordPrefix }}{{ payload.matricula.slice(-3) }}***</strong>
              — se enviará al correo del usuario.
            </v-alert>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-5 pt-3">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="submitting"
            :disabled="!valid"
            @click="submit"
          >
            <v-icon start>mdi-check</v-icon>
            Registrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="4000"
      location="bottom right"
    >
      <v-icon start>
        {{ snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle' }}
      </v-icon>
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import HeaderSession from '@/components/HeaderSession.vue';
import Loader from '@/components/Loader.vue';
import Table from '@/components/Table.vue';
import TableButton from '@/components/TableButton.vue';
import EmptyState from '@/components/EmptyState.vue';
import { UserController } from '../user.controller';
import { CreateUserDto } from '../../entities/create-user.dto';
import { User } from '../../entities/user';
import AxiosClient from '@/config/axios';

const controller = new UserController();

// ── Estado general ─────────────────────────────────────────────────────────
const loading         = ref(false);
const submitting      = ref(false);
const dialog          = ref(false);
const valid           = ref(false);
const formRef         = ref<any>(null);
const loadingGroups   = ref(false);
const loadingSubjects = ref(false);

const users    = ref<User[]>([]);
const groups   = ref<{ id_group: number; label: string }[]>([]);
const subjects = ref<{ id_subject: number; name: string }[]>([]);

const filterRole   = ref<string | null>(null);
const filterStatus = ref<string | null>(null);

const snackbar = reactive({ show: false, message: '', color: 'success' as 'success' | 'error' });
const serverErrors = reactive<Record<string, string>>({});

const payload = reactive<CreateUserDto>({
  first_name:  '',
  last_name:   '',
  email:       '',
  matricula:   '',
  role:        'student',
  status:      true,
  id_group:    null,
  subject_ids: [],
});

// ── Columnas de la tabla ────────────────────────────────────────────────────
const columns = [
  { label: 'Usuario',    key: 'fullName',   minWidth: '200px' },
  { label: 'Correo',     key: 'email',      minWidth: '180px' },
  { label: 'Rol',        key: 'role',        width: '130px' },
  { label: 'Estado',     key: 'isActive',    width: '110px' },
  { label: 'Registrado', key: 'dateJoined',  width: '130px' },
  { label: 'Acciones',   key: 'actions',     width: '100px' },
];

const tableRows = computed(() =>
  users.value.map(u => ({
    fullName:   u.fullName || `${u.firstName} ${u.lastName}`,
    matricula:  u.matricula,
    email:      u.email,
    role:       u.role,
    isActive:   u.isActive,
    dateJoined: u.dateJoined,
    _user:      u,
  }))
);

// ── Items de select ─────────────────────────────────────────────────────────
const roleItems = [
  { label: 'Alumno',        value: 'student' },
  { label: 'Docente',       value: 'teacher' },
  { label: 'Administrador', value: 'admin'   },
];

const filterRoleItems   = roleItems;
const filterStatusItems = [
  { label: 'Activo',   value: 'true'  },
  { label: 'Inactivo', value: 'false' },
];

// ── Helpers de rol ──────────────────────────────────────────────────────────
const roleLabel = (r: string) =>
  ({ student: 'Alumno', teacher: 'Docente', admin: 'Admin' }[r] ?? r);
const roleColor = (r: string) =>
  ({ student: 'blue', teacher: 'teal', admin: 'deep-purple' }[r] ?? 'grey');
const roleIcon  = (r: string) =>
  ({ student: 'mdi-school', teacher: 'mdi-human-male-board', admin: 'mdi-shield-crown' }[r] ?? 'mdi-account');

const passwordPrefix = computed(() =>
  ({ student: 'ALU', teacher: 'PRO', admin: 'ADM' }[payload.role] ?? 'USR')
);

const initials = (row: any) => {
  const full: string = row.fullName ?? '';
  const parts = full.trim().split(' ');
  return parts.length >= 2
    ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    : full.slice(0, 2).toUpperCase();
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
};

// ── Validaciones ────────────────────────────────────────────────────────────
const rules = {
  required: (v: any) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
  email:    (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido',
};

// ── Carga de datos ──────────────────────────────────────────────────────────
const fetchUsers = async () => {
  loading.value = true;
  try {
    const response = await controller.getUsers(
      {},
      filterRole.value   ?? undefined,
      filterStatus.value ?? undefined,
    );
    if (response.success) {
      users.value = (response.data as any)?.results ?? (response.data as any) ?? [];
    }
  } finally {
    loading.value = false;
  }
};

const loadGroups = async () => {
  loadingGroups.value = true;
  try {
    const res = await AxiosClient.get('/api/academic/groups/?status=true&page_size=100');
    const results = res.data?.data?.results ?? res.data?.data ?? [];
    groups.value = results.map((g: any) => ({
      id_group: g.id_group,
      label: `${g.academic_level}${g.group_letter} — Gen. ${g.generation_year}`,
    }));
  } finally {
    loadingGroups.value = false;
  }
};

const loadSubjects = async () => {
  loadingSubjects.value = true;
  try {
    const res = await AxiosClient.get('/api/academic/subjects/?status=true&page_size=100');
    subjects.value = res.data?.data?.results ?? res.data?.data ?? [];
  } finally {
    loadingSubjects.value = false;
  }
};

// ── Dialog ──────────────────────────────────────────────────────────────────
const onRoleChange = () => {
  payload.id_group    = null;
  payload.subject_ids = [];
};

const openDialog = () => {
  if (groups.value.length === 0)   loadGroups();
  if (subjects.value.length === 0) loadSubjects();
  dialog.value = true;
};

const clearServerErrors = () =>
  Object.keys(serverErrors).forEach(k => delete (serverErrors as any)[k]);

const closeDialog = () => {
  dialog.value = false;
  formRef.value?.reset();
  clearServerErrors();
  Object.assign(payload, {
    first_name: '', last_name: '', email: '', matricula: '',
    role: 'student', status: true, id_group: null, subject_ids: [],
  });
};

const submit = async () => {
  clearServerErrors();
  const { valid: isValid } = await formRef.value.validate();
  if (!isValid) return;

  submitting.value = true;
  try {
    const response = await controller.createUser({ ...payload });

    if (response.success) {
      snackbar.message = 'Usuario registrado. Se envió el correo con las credenciales.';
      snackbar.color   = 'success';
      snackbar.show    = true;
      closeDialog();
      fetchUsers();
    } else {
      const errors = (response as any)?.errors ?? {};
      Object.entries(errors).forEach(([k, v]) => {
        (serverErrors as any)[k] = Array.isArray(v) ? v[0] : String(v);
      });
      snackbar.message = response.message || 'Error al registrar el usuario.';
      snackbar.color   = 'error';
      snackbar.show    = true;
    }
  } catch {
    snackbar.message = 'Error inesperado. Intenta de nuevo.';
    snackbar.color   = 'error';
    snackbar.show    = true;
  } finally {
    submitting.value = false;
  }
};

onMounted(fetchUsers);
</script>
