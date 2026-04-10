<template>
  <v-container fluid class="pa-8">
    <Loader :visible="loading" message="Cargando grupos..." />

    <!-- Breadcrumb -->
    <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
      <template #divider>
        <v-icon icon="mdi-chevron-right" />
      </template>
    </v-breadcrumbs>

    <!-- Header -->
    <div class="mb-6">
      <h1 class="page-title text-h4 font-weight-bold mb-1">Mis grupos</h1>
      <p class="page-subtitle text-body-1 text-grey-darken-1">
        Grupos donde impartes <strong>{{ subjectName }}</strong>
      </p>
    </div>

    <v-alert v-if="!loading && groups.length === 0" type="info" variant="tonal" class="mt-2" rounded="lg">
      No tienes grupos asignados para esta materia.
    </v-alert>

    <v-row>
      <v-col v-for="g in groups" :key="g.id_group" cols="12" sm="6" md="4">
        <v-card class="group-card" rounded="xl" elevation="0">
          <div class="d-flex align-center ga-3 mb-4">
            <div class="icon-wrap">
              <span class="group-letter">{{ g.group_letter }}</span>
            </div>
            <div>
              <h3 class="card-title">Grupo {{ g.group_letter }}</h3>
              <p class="card-subtitle">Nivel {{ g.academic_level }} · Gen. {{ g.generation_year }}</p>
            </div>
          </div>

          <div class="d-flex align-center ga-2 mb-4 text-medium-emphasis">
            <v-icon size="18" color="#64748b">mdi-account-group</v-icon>
            <span>{{ g.students_count }} alumnos</span>
          </div>

          <v-btn
            color="primary"
            variant="tonal"
            block
            rounded="lg"
            @click="goToStudents(g)"
          >
            <v-icon start size="18">mdi-account-multiple-outline</v-icon>
            Ver alumnos
          </v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Loader from '@/components/Loader.vue';
import { handleRequest } from '@/config/http-client.gateway';

type TeacherGroup = {
  id_group: number;
  group_letter: string;
  academic_level: number;
  generation_year: number;
  id_generation: number;
  students_count: number;
  status: boolean;
};

type SubjectInfo = { id_subject: number; name: string };

const route = useRoute();
const router = useRouter();

const subjectId = Number(route.params.subjectId);

const loading = ref(false);
const groups = ref<TeacherGroup[]>([]);
const subjectName = ref('');

const breadcrumbItems = computed(() => [
  { title: 'Materias', href: '/subjects', disabled: false },
  { title: subjectName.value || 'Materia', disabled: true },
  { title: 'Mis grupos', disabled: true },
]);

const fetchSubjectName = async () => {
  try {
    const res = await handleRequest<SubjectInfo>('get', `/api/academic/subjects/${subjectId}/`);
    if (res.success && res.data) {
      subjectName.value = (res.data as unknown as SubjectInfo).name ?? '';
    }
  } catch {
    // ignore
  }
};

const fetchGroups = async () => {
  loading.value = true;
  try {
    const res = await handleRequest<{ results: TeacherGroup[] }>(
      'get',
      `/api/academic/groups/my-groups/?subject_id=${subjectId}`
    );
    if (res.success && res.data) {
      groups.value = (res.data as unknown as { results: TeacherGroup[] }).results ?? [];
    }
  } finally {
    loading.value = false;
  }
};

const goToStudents = (g: TeacherGroup) => {
  router.push({
    name: 'TeacherGroupStudents',
    params: { subjectId, groupId: g.id_group },
    query: { subjectName: subjectName.value, groupLetter: g.group_letter },
  });
};

onMounted(() => {
  fetchSubjectName();
  fetchGroups();
});
</script>

<style scoped>
.group-card {
  border: 1px solid #e2e8f0;
  background: #ffffff;
  padding: 18px;
}

.icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: #ecfeff;
  display: grid;
  place-items: center;
  flex-shrink: 0;
}

.group-letter {
  font-size: 22px;
  font-weight: 800;
  color: #0f766e;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0;
  color: #0f172a;
}

.card-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: #64748b;
}

.page-title {
  color: #0f172a;
}

.page-subtitle {
  color: #64748b;
}
</style>
