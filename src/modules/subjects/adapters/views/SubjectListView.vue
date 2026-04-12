<template>
  <v-container fluid class="subjects-page pa-8">
    <Loader :visible="loading" message="Cargando materias..." />

    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title">Materias</h1>
        <p class="page-subtitle">
          {{ isTeacher ? 'Materias que impartes' : 'Gestiona el catálogo de materias por nivel y unidades' }}
        </p>
      </div>
      <v-btn
        v-if="!isTeacher"
        color="success"
        size="large"
        rounded="lg"
        class="text-none"
        prepend-icon="mdi-plus"
        @click="openCreate"
      >
        Registrar materia
      </v-btn>
    </div>

    <v-row v-if="!isTeacher" class="mb-6" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar por nombre"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="onFiltersChanged"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-select
          v-model="filterLevel"
          label="Nivel académico"
          :items="levelFilterItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="onFiltersChanged"
        />
      </v-col>
      <v-col cols="12" sm="6" md="4">
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
          @update:model-value="onFiltersChanged"
        />
      </v-col>
    </v-row>

    <v-row v-if="isTeacher" class="mb-6" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="teacherSearchQuery"
          label="Buscar por nombre"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="onTeacherSearchChange"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col v-for="s in subjects" :key="s.id_subject" cols="12" md="6" lg="4">
        <SubjectCard
          :subject="s"
          subtitle="Materia académica"
          :status-loading="statusTogglingId === s.id_subject"
          :show-groups-btn="isTeacher"
          :has-groups="isTeacher ? subjectIdsWithGroups.has(s.id_subject) : undefined"
          @view="openDetail(s)"
          @edit="openEdit(s)"
          @toggle-status="onToggleStatus(s, $event)"
          @view-groups="goToTeacherGroups(s)"
        />
      </v-col>
    </v-row>

    <v-alert v-if="!loading && subjects.length === 0" type="info" variant="tonal" class="mt-2" rounded="lg">
      No hay materias registradas con los filtros seleccionados.
    </v-alert>

    <div v-if="!loading && paginationData.totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination
        v-model="paginationData.currentPage"
        :length="paginationData.totalPages"
        rounded="circle"
        density="comfortable"
        @update:model-value="handlePageChange"
      />
    </div>

    <p v-if="!loading && paginationData.count > 0" class="pagination-caption text-center mt-2">
      Mostrando {{ subjects.length }} de {{ paginationData.count }} materias
    </p>

    <template v-if="!isTeacher">
      <SubjectFormDialog v-model="formDialog" :subject="subjectToEdit" @saved="onFormSaved" />
      <SubjectDetailDialog v-model="detailDialog" :subject="detailSubject" />
    </template>

    <ConfirmDialog ref="confirmDialog" />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3200" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { encodeId } from '@/kernel/url-cipher';
import Loader from '@/components/Loader.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import SubjectFormDialog from '../components/SubjectFormDialog.vue';
import SubjectCard from '../components/SubjectCard.vue';
import SubjectDetailDialog from '../components/SubjectDetailDialog.vue';
import { useSubjects } from '../../composables/useSubjects';
import { useTeacherSubjects } from '../../composables/useTeacherSubjects';
import type { Subject } from '../../entities/subject';

const router = useRouter();

const role = localStorage.getItem('sea_selectedRole') ?? '';
const isTeacher = computed(() => role === 'TEACHER');

// Use different data source depending on role
const adminComposable = useSubjects();
const teacherComposable = useTeacherSubjects();

const loading = computed(() => isTeacher.value ? teacherComposable.loading.value : adminComposable.loading.value);
const subjects = computed(() => isTeacher.value ? teacherComposable.subjects.value : adminComposable.subjects.value);
const paginationData = computed(() => isTeacher.value ? teacherComposable.pagination.value : adminComposable.pagination.value);
const subjectIdsWithGroups = computed(() => teacherComposable.subjectIdsWithGroups.value);

const {
  filterLevel,
  filterStatus,
  searchQuery,
  fetchSubjects,
  handlePageChange: pageChange,
  setSubjectStatus,
} = adminComposable;

const {
  searchQuery: teacherSearchQuery,
  fetchSubjects: teacherFetchSubjects,
  handlePageChange: teacherPageChange,
} = teacherComposable;

const levelFilterItems = [
  { label: 'Todos los niveles', value: null },
  ...Array.from({ length: 11 }, (_, i) => ({
    label: `Nivel ${i + 1}`,
    value: i + 1,
  })),
];

const filterStatusItems = [
  { label: 'Activas', value: 'true' },
  { label: 'Inactivas', value: 'false' },
];

const formDialog = ref(false);
const subjectToEdit = ref<Subject | null>(null);

const detailDialog = ref(false);
const detailSubject = ref<Subject | null>(null);

const statusTogglingId = ref<number | null>(null);
const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);

const snackbar = ref({ show: false, message: '', color: 'success' });

function showSnackbar(message: string, color: string = 'success') {
  snackbar.value = { show: true, message, color };
}

function openCreate() {
  subjectToEdit.value = null;
  formDialog.value = true;
}

function openEdit(s: Subject) {
  subjectToEdit.value = s;
  formDialog.value = true;
}

function openDetail(s: Subject) {
  detailSubject.value = s;
  detailDialog.value = true;
}

function goToTeacherGroups(s: Subject) {
  router.push({ name: 'TeacherSubjectGroups', params: { subjectId: encodeId(s.id_subject) } });
}

function onFormSaved() {
  showSnackbar(subjectToEdit.value ? 'Materia actualizada correctamente.' : 'Materia registrada correctamente.');
  fetchSubjects();
}

async function onToggleStatus(subject: Subject, value: boolean) {
  const action = value ? 'activar' : 'desactivar';
  const confirmed = await confirmDialog.value?.open(`¿Está seguro de ${action} la materia "${subject.name}"?`);
  if (!confirmed) return;

  statusTogglingId.value = subject.id_subject;
  try {
    const res = await setSubjectStatus(subject.id_subject, value);
    if (res.success) {
      showSnackbar(res.message || 'Estatus de materia actualizado.');
    } else {
      showSnackbar(res.message || 'No se pudo actualizar el estatus.', 'error');
      await fetchSubjects();
    }
  } finally {
    statusTogglingId.value = null;
  }
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;

async function onFiltersChanged() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    adminComposable.pagination.value.currentPage = 1;
    await fetchSubjects();
  }, 500);
}

async function onTeacherSearchChange() {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(async () => {
    teacherComposable.pagination.value.currentPage = 1;
    await teacherFetchSubjects();
  }, 500);
}

function handlePageChange(p: number) {
  if (isTeacher.value) {
    teacherPageChange(p);
  } else {
    pageChange(p);
  }
}

onMounted(async () => {
  if (isTeacher.value) {
    await teacherFetchSubjects();
  } else {
    await fetchSubjects();
  }
});
</script>

<style scoped>
.subjects-page {
  background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
  min-height: 100vh;
}

.page-title {
  font-size: 40px;
  line-height: 1;
  margin: 0;
  color: #0f172a;
  font-weight: 750;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 18px;
}

.action-btn {
  font-size: 14px;
  min-height: 38px;
  padding-inline: 14px;
}

.register-btn {
  letter-spacing: 0.04em;
  font-weight: 700;
}

.pagination-caption {
  color: #64748b;
  font-size: 13px;
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
