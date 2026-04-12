<template>
  <v-container fluid class="grading-shell pa-6 pa-md-8">

    <!-- Loading full-page -->
    <Loader :visible="pageLoading" message="Cargando calificaciones..." />

    <!-- Error state -->
    <v-alert v-if="!pageLoading && pageError" type="error" variant="tonal" class="mb-4" rounded="lg">
      {{ pageError }}
    </v-alert>

    <template v-if="!pageLoading && !pageError">
      <v-row justify="center">
        <v-col cols="12">
          <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
            <template #divider>
              <v-icon icon="mdi-chevron-right" />
            </template>
          </v-breadcrumbs>

          <div class="mb-6">
            <h1 class="page-title text-h4 font-weight-bold mb-2">Calificar examen</h1>
            <p class="page-subtitle text-body-1 text-medium-emphasis mb-0">
              {{ examName }} · {{ studentName }} · {{ gradedQuestions.length }} preguntas
            </p>
          </div>

          <div v-if="gradedQuestions.length === 0" class="text-center text-medium-emphasis py-10">
            No hay respuestas registradas para esta asignación.
          </div>

          <div v-else class="question-stack">
            <v-card
              v-for="(item, index) in gradedQuestions"
              :key="item.id_student_answer"
              rounded="xl"
              class="question-card mx-auto mb-5"
              elevation="1"
            >
              <!-- ── Encabezado de la pregunta ── -->
              <div class="question-head px-3 px-md-4 py-3 d-flex justify-space-between align-start ga-3 flex-wrap">
                <div class="d-flex align-start ga-3 flex-grow-1">
                  <div class="q-index">{{ index + 1 }}</div>
                  <div class="min-w-0">
                    <h2 class="text-subtitle-1 text-md-h6 font-weight-bold mb-2 question-title">
                      {{ item.question_statement }}
                    </h2>
                    <div class="d-flex flex-wrap ga-2">
                      <v-chip size="small" variant="tonal" color="primary">
                        {{ questionTypeLabel(item.question_type) }}
                      </v-chip>
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="difficultyColor(item.question_difficulty)"
                      >
                        {{ difficultyLabel(item.question_difficulty) }}
                      </v-chip>
                      <v-chip
                        size="small"
                        variant="tonal"
                        :color="bloomColor(item.question_bloom_level)"
                      >
                        {{ bloomLabel(item.question_bloom_level) }}
                      </v-chip>
                      <v-chip v-if="item.question_type === 'CODE'" size="small" variant="flat" color="teal-darken-4">
                        <v-icon start size="14">mdi-code-tags</v-icon>
                        python
                      </v-chip>
                    </div>
                  </div>
                </div>

                <!-- Badge Correcta / Incorrecta / Pendiente -->
                <div v-if="item.is_correct !== null" class="d-flex align-center ga-1 flex-shrink-0">
                  <v-icon :color="item.is_correct ? 'success' : 'error'" size="20">
                    {{ item.is_correct ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <span
                    class="text-body-2 font-weight-medium"
                    :class="item.is_correct ? 'text-success' : 'text-error'"
                  >
                    {{ item.is_correct ? 'Correcta' : 'Incorrecta' }}
                  </span>
                </div>
                <v-chip v-else color="warning" size="small" variant="tonal">Pendiente</v-chip>
              </div>

              <v-divider />

              <div class="px-3 px-md-4 py-4">
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

                <!-- ── Respuesta del alumno ── -->
                <div class="text-subtitle-2 font-weight-bold mb-3">Respuesta del alumno</div>

                <!-- MULTIPLE_CHOICE / MULTIPLE_SELECTION -->
                <template v-if="item.question_type === 'MULTIPLE_CHOICE' || item.question_type === 'MULTIPLE_SELECTION'">
                  <v-sheet
                    class="answer-box pa-4 mb-3"
                    rounded="lg"
                    border
                    :class="item.is_correct === true ? 'answer-box--correct' : item.is_correct === false ? 'answer-box--wrong' : ''"
                  >
                    <!-- Texto(s) de la opción seleccionada -->
                    <template v-if="item.question_type === 'MULTIPLE_CHOICE'">
                      <p class="mb-2 text-body-1">
                        {{ item.selected_answer_text ?? '(Sin respuesta)' }}
                      </p>
                    </template>
                    <template v-else>
                      <p
                        v-for="(text, ti) in item.selected_answers_texts"
                        :key="ti"
                        class="mb-1 text-body-1"
                      >
                        • {{ text }}
                      </p>
                      <p v-if="!item.selected_answers_texts.length" class="mb-0 text-body-1 text-medium-emphasis">
                        (Sin respuesta)
                      </p>
                    </template>

                    <!-- Etiqueta correcta/incorrecta dentro del box -->
                    <div v-if="item.is_correct !== null" class="d-flex align-center ga-1 mt-2">
                      <v-icon :color="item.is_correct ? 'success' : 'error'" size="16">
                        {{ item.is_correct ? 'mdi-check-circle' : 'mdi-close-circle' }}
                      </v-icon>
                      <span
                        class="text-caption font-weight-bold"
                        :class="item.is_correct ? 'text-success' : 'text-error'"
                      >
                        {{ item.is_correct ? 'Respuesta correcta' : 'Respuesta incorrecta' }}
                      </span>
                    </div>
                  </v-sheet>

                  <!-- Respuesta correcta (solo cuando el alumno se equivocó) -->
                  <template v-if="item.is_correct === false">
                    <div class="text-subtitle-2 font-weight-bold mb-2 text-success">
                      <v-icon size="16" color="success" class="me-1">mdi-check-circle</v-icon>
                      Respuesta correcta
                    </div>
                    <v-sheet class="answer-box answer-box--correct pa-4" rounded="lg" border>
                      <template v-if="item.question_type === 'MULTIPLE_CHOICE'">
                        <p class="mb-0 text-body-1">{{ item.correct_answer_text ?? '—' }}</p>
                      </template>
                      <template v-else>
                        <p
                          v-for="(text, ci) in item.correct_answers_texts"
                          :key="ci"
                          class="mb-1 text-body-1"
                        >
                          • {{ text }}
                        </p>
                      </template>
                    </v-sheet>
                  </template>
                </template>

                <!-- OPEN -->
                <template v-else-if="item.question_type === 'OPEN'">
                  <v-sheet class="answer-box pa-4" rounded="lg" border>
                    <p class="mb-0 text-body-1 answer-text-pre">
                      {{ item.answer_text ?? '(Sin respuesta)' }}
                    </p>
                  </v-sheet>
                </template>

                <!-- CODE -->
                <template v-else-if="item.question_type === 'CODE'">
                  <CodeMirrorEditor :model-value="item.code_answer ?? ''" :readonly="true" />
                </template>

                <v-divider class="my-5" />

                <!-- ── Puntaje ── -->
                <div class="d-flex align-center ga-3 flex-wrap">
                  <span class="text-subtitle-1 font-weight-bold">Puntaje</span>
                  <v-text-field
                    v-model.number="item.teacherScore"
                    type="number"
                    density="comfortable"
                    variant="outlined"
                    hide-details
                    class="score-input"
                    :min="0"
                    :max="item.question_points"
                    :disabled="isSaving"
                    @update:model-value="normalizeScore(item)"
                  />
                  <span class="text-subtitle-1">/ {{ item.question_points }}</span>

                  <v-spacer />

                  <v-switch
                    v-model="item.teacherIsCorrect"
                    :label="item.teacherIsCorrect ? 'Correcta' : 'Incorrecta'"
                    color="success"
                    hide-details
                    density="comfortable"
                    :disabled="isSaving"
                  />
                </div>
              </div>
            </v-card>

            <!-- ── Panel final con botón único ── -->
            <v-card
              rounded="xl"
              class="final-card mx-auto pa-4 pa-md-5"
              elevation="1"
            >
              <div class="d-flex justify-space-between align-center flex-wrap ga-4">
                <div>
                  <p class="text-subtitle-1 font-weight-bold mb-1">Calificación acumulada</p>
                  <p class="text-h5 font-weight-bold mb-1">{{ totalScore }} / {{ maxScore }}</p>
                  <p class="text-body-2 text-medium-emphasis mb-0">{{ finalPercentage }}%</p>
                </div>

                <div class="d-flex flex-column align-end ga-2">
                  <v-chip
                    v-if="assignmentFinalScore !== null"
                    :color="assignmentIsPassed ? 'success' : 'error'"
                    variant="flat"
                    size="large"
                    class="font-weight-bold"
                  >
                    Guardado: {{ assignmentFinalScore }} · {{ assignmentIsPassed ? 'Aprobado' : 'No aprobado' }}
                  </v-chip>

                  <v-btn
                    color="teal-darken-2"
                    size="large"
                    :loading="isSaving"
                    @click="saveAllGrades"
                  >
                    Guardar calificaciones
                  </v-btn>
                </div>
              </div>
            </v-card>
          </div>
        </v-col>
      </v-row>
    </template>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom right">
      {{ snackbar.message }}
      <template #actions>
        <v-btn v-if="canReturnToGrades" variant="text" color="white" @click="goToGrades">Ir a calificaciones</v-btn>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CodeMirrorEditor from '@/modules/answers/adapters/components/CodeMirrorEditor.vue';
import Loader from '@/components/Loader.vue';
import { AnswersController } from '@/modules/answers/adapters/answers.controller';
import { ExamController } from '../exam.controller';
import type { StudentAnswerRecord } from '@/modules/answers/entities/exam-answer';

type QuestionType = 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECTION' | 'OPEN' | 'CODE';
type Difficulty = 'easy' | 'medium' | 'hard';
type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

type GradeRow = StudentAnswerRecord & {
  teacherScore: number;
  teacherIsCorrect: boolean;
};

const route = useRoute();
const router = useRouter();
const assignmentId = computed(() => Number(route.params.assignmentId));
const examId = computed(() => Number(route.params.examId));

const answersController = new AnswersController();
const examController = new ExamController();

const pageLoading = ref(false);
const pageError = ref('');
const isSaving = ref(false);

const snackbar = ref({ show: false, message: '', color: 'success' as 'success' | 'warning' | 'error' });
const gradedQuestions = reactive<GradeRow[]>([]);

const assignmentFinalScore = ref<string | number | null>(null);
const assignmentIsPassed = ref<boolean | null>(null);
const canReturnToGrades = ref(false);
const examName = ref('Examen');
const studentName = ref('Alumno');

const breadcrumbItems = computed(() => [
  { title: 'Exámenes', disabled: false, href: '/exams' },
  { title: 'Calificaciones', disabled: false, href: `/exams/${examId.value}/grades` },
  { title: 'Calificar examen', disabled: true },
]);

const maxScore = computed(() => gradedQuestions.reduce((s, q) => s + q.question_points, 0));
const totalScore = computed(() =>
  gradedQuestions.reduce((s, q) => s + (Number(q.teacherScore) || 0), 0),
);
const finalPercentage = computed(() => {
  if (!maxScore.value) return 0;
  return Math.round((totalScore.value / maxScore.value) * 100);
});

const gradesRoute = computed(() => ({
  name: 'ExamGrades',
  params: { id: String(examId.value) },
}));

function questionTypeLabel(type: QuestionType): string {
  const map: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'Opción única',
    MULTIPLE_SELECTION: 'Selección múltiple',
    OPEN: 'Abierta',
    CODE: 'Código',
  };
  return map[type];
}

function difficultyLabel(level: Difficulty): string {
  const map: Record<Difficulty, string> = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
  return map[level] ?? level;
}

function difficultyColor(level: Difficulty): string {
  const map: Record<Difficulty, string> = { easy: 'success', medium: 'warning', hard: 'error' };
  return map[level] ?? 'grey';
}

function bloomLabel(level: BloomLevel): string {
  const map: Record<BloomLevel, string> = {
    remember: 'Recordar',
    understand: 'Comprender',
    apply: 'Aplicar',
    analyze: 'Analizar',
    evaluate: 'Evaluar',
    create: 'Crear',
  };
  return map[level] ?? level;
}

function bloomColor(level: BloomLevel): string {
  const map: Record<BloomLevel, string> = {
    remember: 'blue-grey',
    understand: 'indigo',
    apply: 'purple',
    analyze: 'teal',
    evaluate: 'amber-darken-2',
    create: 'pink',
  };
  return map[level] ?? 'grey';
}

function normalizeScore(item: GradeRow) {
  const score = Number(item.teacherScore);
  if (Number.isNaN(score)) { item.teacherScore = 0; return; }
  if (score < 0) { item.teacherScore = 0; return; }
  if (score > item.question_points) item.teacherScore = item.question_points;
}

function mapToGradeRow(record: StudentAnswerRecord): GradeRow {
  return {
    ...record,
    teacherScore: record.score === null ? 0 : Number(record.score),
    teacherIsCorrect: record.is_correct ?? false,
  };
}

async function saveAllGrades() {
  isSaving.value = true;
  canReturnToGrades.value = false;
  let lastSummary: { score: string | number; is_passed: boolean } | null = null;
  let errorsCount = 0;

  for (const item of gradedQuestions) {
    try {
      const response = await answersController.manualGradeAnswer({
        student_answer_id: item.id_student_answer,
        score: item.teacherScore,
        is_correct: item.teacherIsCorrect,
      });

      if (!response.success || !response.data) {
        errorsCount++;
        continue;
      }

      const updated = response.data.student_answer;
      item.is_correct = updated.is_correct;
      item.score = updated.score;
      item.teacherScore = updated.score === null ? item.teacherScore : Number(updated.score);
      item.teacherIsCorrect = updated.is_correct ?? item.teacherIsCorrect;
      lastSummary = response.data.assignment_summary;
    } catch {
      errorsCount++;
    }
  }

  if (lastSummary) {
    assignmentFinalScore.value = lastSummary.score;
    assignmentIsPassed.value = lastSummary.is_passed;
    canReturnToGrades.value = true;
  }

  if (errorsCount === 0) {
    showSnackbar('Todas las calificaciones guardadas correctamente.', 'success');
  } else if (errorsCount < gradedQuestions.length) {
    showSnackbar(`${errorsCount} calificación(es) no se pudieron guardar.`, 'warning');
  } else {
    showSnackbar('No se pudieron guardar las calificaciones.', 'error');
  }

  isSaving.value = false;
}

function showSnackbar(message: string, color: 'success' | 'warning' | 'error' = 'success') {
  snackbar.value = { show: true, message, color };
}

async function goToGrades() {
  snackbar.value.show = false;
  await router.push(gradesRoute.value);
}

async function loadAnswers() {
  if (!assignmentId.value || Number.isNaN(assignmentId.value)) {
    pageError.value = 'ID de asignación inválido.';
    return;
  }

  pageLoading.value = true;
  pageError.value = '';

  try {
    const response = await answersController.getAssignmentAnswers(assignmentId.value);

    if (!response.success || !response.data) {
      pageError.value = response.message || 'No se pudieron obtener las respuestas.';
      return;
    }

    examName.value =
      response.data.exam_title ||
      response.data.exam_name ||
      String(route.query.examName || '').trim() ||
      examName.value;
    studentName.value =
      response.data.student_name ||
      String(route.query.studentName || '').trim() ||
      studentName.value;

    gradedQuestions.splice(0, gradedQuestions.length, ...response.data.answers.map(mapToGradeRow));
  } catch {
    pageError.value = 'Error de conexión al cargar las respuestas.';
  } finally {
    pageLoading.value = false;
  }
}

async function loadExamMeta() {
  if (!examId.value || Number.isNaN(examId.value)) return;

  try {
    const response = await examController.getExamById(examId.value);
    if (response.success && response.data) {
      const fallback = response.data.title || response.data.name;
      if (fallback) {
        examName.value = fallback;
      }
    }
  } catch {
    // Ignore and keep available fallbacks.
  }
}

onMounted(() => {
  void loadExamMeta();
  void loadAnswers();
});
</script>

<style scoped>
.grading-shell {
  min-height: 100vh;
  background: #f8fafc;
}

.question-stack {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.question-card {
  width: 100%;
  max-width: 760px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #fff;
}

.question-head {
  background: #ffffff;
}

.q-index {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e5f3ef;
  color: #0f766e;
  font-weight: 800;
  font-size: 1rem;
  flex: 0 0 auto;
}

.question-title {
  line-height: 1.35;
}

.answer-box {
  border-color: #d7e7ea !important;
  background: #f8fcfd;
}

.question-image-frame {
  border-color: rgba(15, 118, 110, 0.24) !important;
  background: linear-gradient(180deg, #effcf9 0%, #f8fafc 100%);
  max-width: 640px;
}

.question-image {
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
}

.answer-box--correct {
  border-color: #86efac !important;
  background: #f0fdf4 !important;
}

.answer-box--wrong {
  border-color: #fca5a5 !important;
  background: #fff5f5 !important;
}

.answer-text-pre {
  white-space: pre-wrap;
  word-break: break-word;
}

.score-input {
  max-width: 100px;
}

.final-card {
  width: 100%;
  max-width: 760px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #ffffff;
}

.page-title {
  color: #0f172a;
  line-height: 1.2;
}

.page-subtitle {
  color: #64748b;
  line-height: 1.5;
}

.min-w-0 {
  min-width: 0;
}
</style>
