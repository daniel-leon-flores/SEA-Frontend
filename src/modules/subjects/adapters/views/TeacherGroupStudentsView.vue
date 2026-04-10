<template>
  <v-container fluid class="pa-8">
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

    <v-card v-else elevation="0" rounded="xl" class="students-table-card">
      <v-data-table
        :headers="headers"
        :items="students"
        :loading="loading"
        item-value="id_user"
        hide-default-footer
        class="students-table"
      />
    </v-card>

    <div v-if="!loading && pagination.total_pages > 1" class="d-flex justify-center mt-4">
      <v-pagination
        v-model="currentPage"
        :length="pagination.total_pages"
        rounded="circle"
        density="comfortable"
        @update:model-value="handlePageChange"
      />
    </div>

    <p v-if="!loading && pagination.count > 0" class="pagination-caption text-center mt-2">
      Mostrando {{ students.length }} de {{ pagination.count }} alumno{{ pagination.count !== 1 ? 's' : '' }}
    </p>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Loader from '@/components/Loader.vue';
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

const subjectId = Number(route.params.subjectId);
const groupId = Number(route.params.groupId);
const subjectName = ref((route.query.subjectName as string) ?? '');
const groupLetter = ref((route.query.groupLetter as string) ?? '');

const loading = ref(false);
const students = ref<StudentRow[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const pagination = ref<PaginationMeta>({ count: 0, page: 1, page_size: 10, total_pages: 1 });

const breadcrumbItems = computed(() => [
  { title: 'Materias', href: '/subjects', disabled: false },
  { title: subjectName.value || 'Materia', href: `/subjects/${subjectId}/groups`, disabled: false },
  { title: `Grupo ${groupLetter.value}`, disabled: true },
  { title: 'Alumnos', disabled: true },
]);

const headers = [
  { title: 'Nombre completo', key: 'full_name' },
  { title: 'Matrícula', key: 'matricula' },
  { title: 'Correo', key: 'email' },
];

const fetchStudents = async (page = 1) => {
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

onMounted(() => {
  void fetchStudents(1);
});
</script>

<style scoped>
.students-table-card {
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.students-table {
  background: #ffffff;
}

.page-title {
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
}

.pagination-caption {
  font-size: 13px;
  color: #64748b;
}
</style>
