<template>
  <v-container fluid class="pa-8" style="background: #f9fbff; min-height: 100vh;">
    <!-- Header -->
    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title text-h4 font-weight-bold mb-2">Mis Exámenes</h1>
        <p class="page-subtitle text-body-1 text-grey-darken-1">
          Consulta y realiza los exámenes asignados a tu grupo
        </p>
      </div>
    </div>

    <!-- Filter tabs -->
    <v-tabs v-model="activeTab" color="primary" class="mb-6" @update:model-value="onTabChange">
      <v-tab value="all">Todos</v-tab>
      <v-tab value="pending">Pendientes</v-tab>
      <v-tab value="completed">Completados</v-tab>
    </v-tabs>

    <!-- Loader -->
    <Loader :visible="loading" />

    <!-- Error -->
    <v-alert v-if="errorMsg && !loading" type="error" variant="tonal" class="mb-4">
      {{ errorMsg }}
    </v-alert>

    <!-- Empty state -->
    <EmptyState
      v-if="!loading && !errorMsg && assignments.length === 0"
      icon="mdi-clipboard-text-off"
      title="Sin exámenes"
      description="No tienes exámenes asignados en este momento."
    />

    <!-- Cards grid -->
    <v-row v-if="!loading && assignments.length > 0">
      <v-col
        v-for="item in assignments"
        :key="item.id_assignment"
        cols="12"
        sm="6"
        lg="4"
      >
        <v-card rounded="lg" elevation="2" height="100%" class="d-flex flex-column">
          <!-- Card header band -->
          <v-card-item :class="statusBandClass(item.status)">
            <template #prepend>
              <v-icon>mdi-clipboard-text</v-icon>
            </template>
            <v-card-title class="text-body-1 font-weight-bold text-truncate">
              {{ item.exam_name }}
            </v-card-title>
            <v-card-subtitle class="text-truncate">
              {{ item.exam_title }}
            </v-card-subtitle>
            <template #append>
              <v-chip :color="statusColor(item.status)" size="small" label variant="flat">
                {{ statusLabel(item.status) }}
              </v-chip>
            </template>
          </v-card-item>

          <v-divider />

          <v-card-text class="flex-grow-1">
            <v-list density="compact" class="pa-0">
              <v-list-item prepend-icon="mdi-book-open-variant" class="px-0">
                <span class="text-body-2">{{ item.subject_name }}</span>
                <template #append>
                  <span class="text-caption text-medium-emphasis">Unidad {{ item.unit_number }}</span>
                </template>
              </v-list-item>

              <v-list-item prepend-icon="mdi-account-group" class="px-0">
                <span class="text-body-2">{{ item.group_label }}</span>
              </v-list-item>

              <v-list-item prepend-icon="mdi-calendar-range" class="px-0">
                <span class="text-body-2">
                  {{ formatDate(item.available_from) }} — {{ formatDate(item.available_to) }}
                </span>
              </v-list-item>

              <v-list-item v-if="item.score !== null" prepend-icon="mdi-star-circle" class="px-0">
                <span class="text-body-2">
                  Calificación: <strong>{{ item.score }}</strong>
                  <v-icon
                    :color="item.is_passed ? 'success' : 'error'"
                    size="16"
                    class="ml-1"
                  >
                    {{ item.is_passed ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                </span>
              </v-list-item>
            </v-list>

            <!-- Difficulty & secure mode chips -->
            <div class="mt-3 d-flex flex-wrap gap-1">
              <v-chip :color="difficultyColor(item.difficulty_level)" size="small" variant="tonal">
                <v-icon start size="14">mdi-speedometer</v-icon>
                {{ item.difficulty_label }}
              </v-chip>
              <v-chip v-if="item.secure_mode" color="warning" size="small" variant="tonal">
                <v-icon start size="14">mdi-lock</v-icon>
                Modo seguro
              </v-chip>
              <v-chip v-if="item.is_expired && item.status === 'pending'" color="error" size="small" variant="tonal">
                <v-icon start size="14">mdi-clock-alert</v-icon>
                Expirado
              </v-chip>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-spacer />
            <template v-if="item.status === 'completed'">
              <v-btn
                color="teal-darken-2"
                variant="flat"
                prepend-icon="mdi-eye"
                :disabled="!item.can_review"
                @click="viewAnswers(item)"
              >
                Ver respuestas
              </v-btn>
            </template>
            <template v-else>
              <v-btn
                color="primary"
                variant="flat"
                :disabled="!item.can_start"
                prepend-icon="mdi-play-circle"
                @click="startExam(item)"
              >
                {{ item.status === 'in_progress' ? 'Continuar examen' : 'Empezar examen' }}
              </v-btn>
            </template>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom right">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { ExamController } from '../exam.controller';
import type { MyAssignment } from '../../entities/my-assignment';
import { formatDate } from '@/kernel/utils';

const controller = new ExamController();
const router = useRouter();

const loading = ref(false);
const errorMsg = ref('');
const assignments = ref<MyAssignment[]>([]);
const activeTab = ref<'all' | 'pending' | 'completed'>('all');

const snackbar = ref({ show: false, message: '', color: 'error' });

function showSnackbar(message: string, color = 'error') {
  snackbar.value = { show: true, message, color };
}

async function loadAssignments() {
  loading.value = true;
  errorMsg.value = '';
  try {
    const params = activeTab.value === 'all'
      ? { include_completed: true }
      : { status: activeTab.value as 'pending' | 'completed', include_completed: true };

    const res = await controller.getStudentAssignments(params);
    if (res.success) {
      assignments.value = Array.isArray(res.data) ? res.data : [];
    } else {
      errorMsg.value = res.message || 'Error al cargar los exámenes';
    }
  } catch {
    errorMsg.value = 'Error de conexión al cargar los exámenes';
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  loadAssignments();
}

async function startExam(item: MyAssignment) {
  if (!item.can_start) {
    showSnackbar('Este examen no se puede iniciar en este momento.', 'warning');
    return;
  }

  await router.push({
    name: 'AnswerExam',
    params: { assignmentId: String(item.id_assignment) },
  });
}

async function viewAnswers(item: MyAssignment) {
  if (!item.can_review) {
    showSnackbar('Podrás ver tus respuestas cuando termine el periodo del examen.', 'warning');
    return;
  }

  await router.push({
    name: 'ReviewExam',
    params: { assignmentId: String(item.id_assignment) },
  });
}

// Helpers
function statusColor(status: string) {
  const map: Record<string, string> = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  };
  return map[status] ?? 'default';
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: 'Pendiente',
    in_progress: 'En progreso',
    completed: 'Completado',
  };
  return map[status] ?? status;
}

function statusBandClass(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-warning-lighten-5',
    in_progress: 'bg-info-lighten-5',
    completed: 'bg-success-lighten-5',
  };
  return map[status] ?? '';
}

function difficultyColor(level: string) {
  const map: Record<string, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error',
  };
  return map[level] ?? 'default';
}

onMounted(loadAssignments);
</script>
