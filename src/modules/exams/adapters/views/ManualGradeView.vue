<template>
  <v-container fluid class="pa-8">
    <!-- Breadcrumbs -->
    <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
      <template #divider>
        <v-icon icon="mdi-chevron-right" />
      </template>
    </v-breadcrumbs>

    <div class="mb-6">
      <h1 class="text-h4 font-weight-bold mb-2">Calificación Manual</h1>
      <p class="text-body-1 text-grey-darken-1">
        Revisa y califica manualmente las respuestas del alumno.
      </p>
    </div>

    <v-alert type="info" variant="tonal">
      Esta vista estará disponible cuando el módulo de preguntas esté completamente implementado.
    </v-alert>

    <v-btn class="mt-4" variant="text" prepend-icon="mdi-arrow-left" @click="goBack">
      Volver a calificaciones
    </v-btn>
  </v-container>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const examId = computed(() => route.params.examId as string);

const breadcrumbItems = computed(() => [
  { title: 'Exámenes', disabled: false, href: '/exams' },
  { title: 'Calificaciones', disabled: false, href: `/exams/${examId.value}/grades` },
  { title: 'Calificación manual', disabled: true },
]);

function goBack() {
  router.push({ name: 'ExamGrades', params: { id: examId.value } });
}
</script>
