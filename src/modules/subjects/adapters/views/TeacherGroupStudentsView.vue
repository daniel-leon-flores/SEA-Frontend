<template>
  <v-container fluid class="pa-8" style="background: #f9fbff; min-height: 100vh;">
    <Loader :visible="loading" message="Cargando alumnos..." />

    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
      <template #divider>
        <v-icon icon="mdi-chevron-right" />
      </template>
    </v-breadcrumbs>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="page-title text-h4 font-weight-bold mb-1">Alumnos del grupo</h1>
      <p class="page-subtitle text-body-1 text-grey-darken-1">
        Grupo <strong>{{ groupLetter }}</strong> · {{ subjectName }}
      </p>
    </div>

    <v-alert v-if="!loading && students.length === 0" type="info" variant="tonal" class="mt-2" rounded="lg">
      No hay alumnos en este grupo.
    </v-alert>

    <v-card v-else elevation="2" class="mb-4">
      <PaginatedTable
        :columns="columns"
        :data="students"
        :total-records="pagination.count"
        :total-pages="pagination.total_pages"
        :current-page-prop="currentPage"
        :page-size-prop="pageSize"
        :loading="false"
      />
    </v-card>

    <v-row v-if="!loading && pagination.count > 0" class="align-center mt-2">
      <v-col cols="12" md="3">
        <v-select
          label="Registros por página"
          v-model="pageSize"
          :items="PAGE_SIZE_OPTIONS"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="handlePageSizeChange"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-pagination
          v-model="currentPage"
          :length="pagination.total_pages"
          :total-visible="7"
          rounded="circle"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </v-col>
      <v-col cols="12" md="3" class="text-end">
        <p class="text-caption text-grey-darken-1">{{ paginationInfo }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { encodeId, decodeId } from '@/kernel/url-cipher';
import Loader from '@/components/Loader.vue';
import PaginatedTable from '@/components/PaginatedTable.vue';
import { handleRequest } from '@/config/http-client.gateway';

type StudentRow = {
  id_user: number;
  first_name: string;
  last_name: string;
  matricula: string;
  email: string;
};

type PaginationMeta = {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
};

const route = useRoute();

const subjectId = decodeId(route.params.subjectId as string);
const groupId = decodeId(route.params.groupId as string);
const subjectName = ref((route.query.subjectName as string) ?? '');
const groupLetter = ref((route.query.groupLetter as string) ?? '');

const loading = ref(false);
const students = ref<StudentRow[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const pagination = ref<PaginationMeta>({ count: 0, page: 1, page_size: 10, total_pages: 1 });

const breadcrumbItems = computed(() => [
  { title: 'Materias', href: '/subjects', disabled: false },
  { title: subjectName.value || 'Materia', href: `/subjects/${encodeId(subjectId)}/groups`, disabled: false },
  { title: `Grupo ${groupLetter.value}`, disabled: true },
  { title: 'Alumnos', disabled: true },
]);

const PAGE_SIZE_OPTIONS = [5, 10, 15, 25];

const columns = [
  { label: 'Nombre completo', key: 'full_name', width: '200px', minWidth: '160px' },
  { label: 'Matrícula', key: 'matricula', width: '140px', minWidth: '120px' },
  { label: 'Correo', key: 'email', width: '220px', minWidth: '180px' },
];

const paginationInfo = computed(() => {
  if (pagination.value.count === 0) return '0 registros';
  const start = (currentPage.value - 1) * pageSize.value + 1;
  const end = Math.min(currentPage.value * pageSize.value, pagination.value.count);
  return `Mostrando ${start}-${end} de ${pagination.value.count} registros`;
});

const fetchStudents = async (page = 1) => {
  if (!groupId || !Number.isFinite(groupId)) return;
  loading.value = true;
  try {
    const res = await handleRequest<{ results: StudentRow[]; pagination: PaginationMeta }>(
      'get',
      `/api/academic/groups/${groupId}/students/?page=${page}&page_size=${pageSize.value}`
    );
    if (res.success && res.data) {
      const raw = res.data as unknown as { results: StudentRow[]; pagination: PaginationMeta };
      students.value = raw.results ?? [];
      if (raw.pagination) pagination.value = raw.pagination;
    }
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
  void fetchStudents(page);
};

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  currentPage.value = 1;
  void fetchStudents(1);
};

onMounted(() => {
  void fetchStudents(1);
});
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
