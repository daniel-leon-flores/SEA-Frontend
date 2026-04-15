<template>
  <v-container fluid class="review-shell pa-6 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" lg="10" xl="9">
        <v-card rounded="xl" class="pa-4 pa-md-6" elevation="2">
          <div class="d-flex justify-space-between align-start flex-wrap ga-3 mb-6">
            <div>
              <h1 class="page-title text-h4 font-weight-bold mb-2">Mis respuestas</h1>
              <p class="page-subtitle text-body-1 text-grey-darken-1 mb-0">{{ examTitle }} · {{ answers.length }} preguntas</p>
            </div>
            <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="goBack">Volver</v-btn>
          </div>

          <Loader :visible="loading" message="Cargando respuestas..." />

          <v-alert v-if="errorMsg && !loading" type="error" variant="tonal" class="mb-4" rounded="lg">
            {{ errorMsg }}
          </v-alert>

          <EmptyState
            v-if="!loading && !errorMsg && answers.length === 0"
            title="Sin respuestas registradas"
            description="No encontramos respuestas para esta asignación."
          />

          <div v-if="!loading && answers.length > 0" class="d-flex flex-column ga-4">
            <v-card
              v-for="(item, index) in answers"
              :key="item.id_student_answer ?? `unanswered-${index}`"
              rounded="xl"
              variant="outlined"
              class="answer-card"
            >
              <div class="px-4 px-md-5 py-4">
                <div class="d-flex align-start justify-space-between ga-3 flex-wrap mb-3">
                  <div class="d-flex align-start ga-3">
                    <div class="q-index">{{ index + 1 }}</div>
                    <div>
                      <p class="text-subtitle-1 font-weight-bold mb-2">{{ item.question_statement }}</p>
                      <v-chip size="small" color="primary" variant="tonal">{{ questionTypeLabel(item.question_type) }}</v-chip>
                    </div>
                  </div>
                </div>

                <v-sheet
                  v-if="item.question_image_url"
                  class="question-image-frame pa-2 mb-4 mx-auto"
                  rounded="xl"
                  border
                >
                  <v-img
                    :src="item.question_image_url"
                    alt="Imagen de la pregunta"
                    class="question-image"
                    height="220"
                    contain
                  >
                    <template #error>
                      <v-sheet class="d-flex flex-column align-center justify-center text-medium-emphasis pa-6" color="grey-lighten-4">
                        <v-icon size="28" class="mb-2">mdi-image-off-outline</v-icon>
                        No se pudo cargar la imagen.
                      </v-sheet>
                    </template>
                  </v-img>
                </v-sheet>

                <p class="text-subtitle-2 font-weight-bold mb-2">Tu respuesta</p>

                <template v-if="item.question_type === 'MULTIPLE_CHOICE'">
                  <v-sheet class="answer-box pa-4" rounded="lg" border>
                    <p class="mb-0">{{ item.selected_answer_text || '(Sin respuesta)' }}</p>
                  </v-sheet>
                </template>

                <template v-else-if="item.question_type === 'MULTIPLE_SELECTION'">
                  <v-sheet class="answer-box pa-4" rounded="lg" border>
                    <template v-if="item.selected_answers_texts?.length">
                      <p v-for="(text, i) in item.selected_answers_texts" :key="i" class="mb-1">• {{ text }}</p>
                    </template>
                    <p v-else class="mb-0">(Sin respuesta)</p>
                  </v-sheet>
                </template>

                <template v-else-if="item.question_type === 'OPEN'">
                  <v-sheet class="answer-box pa-4" rounded="lg" border>
                    <p class="mb-0 answer-text-pre">{{ item.answer_text || '(Sin respuesta)' }}</p>
                  </v-sheet>
                </template>

                <template v-else>
                  <v-sheet class="answer-box pa-4" rounded="lg" border>
                    <pre class="code-answer mb-0">{{ item.code_answer || '(Sin respuesta)' }}</pre>
                  </v-sheet>
                </template>
              </div>
            </v-card>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { decodeId } from '@/kernel/url-cipher';
import Loader from '@/components/Loader.vue';
import EmptyState from '@/components/EmptyState.vue';
import { AnswersController } from '../answers.controller';
import type { StudentAnswerRecord } from '../../entities/exam-answer';

const route = useRoute();
const router = useRouter();
const controller = new AnswersController();

const loading = ref(false);
const errorMsg = ref('');
const examTitle = ref('Examen');
const answers = ref<StudentAnswerRecord[]>([]);

function questionTypeLabel(type: StudentAnswerRecord['question_type']) {
  const map: Record<StudentAnswerRecord['question_type'], string> = {
    MULTIPLE_CHOICE: 'Opción única',
    MULTIPLE_SELECTION: 'Selección múltiple',
    OPEN: 'Abierta',
    CODE: 'Código',
  };
  return map[type];
}

async function loadAnswers() {
  const assignmentId = decodeId(route.params.assignmentId as string);
  if (!assignmentId || Number.isNaN(assignmentId)) {
    errorMsg.value = 'ID de asignación inválido.';
    return;
  }

  loading.value = true;
  errorMsg.value = '';

  try {
    const response = await controller.getAssignmentAnswers(assignmentId);
    if (!response.success || !response.data) {
      errorMsg.value = response.message || 'No se pudieron obtener tus respuestas.';
      return;
    }

    examTitle.value = response.data.exam_title || response.data.exam_name || examTitle.value;
    answers.value = response.data.answers || [];
  } catch {
    errorMsg.value = 'Error de conexión al cargar tus respuestas.';
  } finally {
    loading.value = false;
  }
}

async function goBack() {
  await router.push({ name: 'MyExams' });
}

onMounted(() => {
  void loadAnswers();
});
</script>

<style scoped>
.review-shell {
  min-height: 100vh;
  background: #f8fafc;
}

.answer-card {
  border-color: rgba(148, 163, 184, 0.24) !important;
}

.q-index {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e5f3ef;
  color: #0f766e;
  font-weight: 700;
  flex: 0 0 auto;
}

.question-image-frame {
  border-color: rgba(15, 118, 110, 0.24) !important;
  background: linear-gradient(180deg, #effcf9 0%, #f8fafc 100%);
  max-width: 640px;
}

.question-image {
  border-radius: 12px;
  overflow: hidden;
  background: #ffffff;
}

.answer-box {
  border-color: #d7e7ea !important;
  background: #f8fcfd;
}

.answer-text-pre {
  white-space: pre-wrap;
  word-break: break-word;
}

.code-answer {
  white-space: pre-wrap;
  word-break: break-word;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 0.875rem;
  color: #0f172a;
}
</style>
