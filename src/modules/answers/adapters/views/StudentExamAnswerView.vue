<template>
  <v-container fluid class="exam-shell pa-6 pa-md-8">
    <v-row justify="center">
      <v-col cols="12" xl="11">
        <v-card class="exam-page" rounded="xl" elevation="10">
          <div class="exam-topbar px-4 px-md-6 py-4">
            <div class="d-flex align-center justify-space-between flex-wrap ga-3">
              <div class="d-flex align-center ga-3">
                <div>
                  <div class="text-subtitle-1 font-weight-bold">{{ session.examName }}</div>
                  <div class="text-caption text-medium-emphasis">{{ session.subjectName }}</div>
                </div>
              </div>

              <v-chip color="info" variant="tonal" class="font-weight-medium">
                Pregunta {{ currentQuestionNumber }} de {{ totalQuestions }}
              </v-chip>
            </div>

            <v-alert
              v-if="isSecureMode"
              class="mt-4"
              type="warning"
              variant="tonal"
              density="compact"
              rounded="lg"
            >
              Modo seguro activado. No salgas de pantalla completa.
            </v-alert>
          </div>

          <v-row no-gutters class="exam-body">
            <v-col v-if="examStarted && !examSubmitted" cols="12" md="4" lg="3" class="exam-sidebar pa-4 pa-md-6">
              <v-sheet rounded="xl" class="sidebar-card pa-4 h-100 sticky-sidebar" elevation="0">
                <div class="text-subtitle-1 font-weight-bold mb-3">Navegador de preguntas</div>

                <div class="sidebar-scroll pr-1">
                  <button
                    v-for="(question, index) in session.questions"
                    :key="question.id_question"
                    type="button"
                    class="question-row"
                    :class="{
                      'question-row--current': question.id_question === currentQuestion.id_question,
                      'question-row--answered': isAnswered(question.id_question),
                    }"
                    @click="selectQuestion(question.id_question)"
                  >
                    <span class="question-row__bar" :class="questionBarClass(question.id_question)" />

                    <span class="question-row__number">{{ String(index + 1).padStart(2, '0') }}</span>

                    <span class="question-row__label">Pregunta {{ String(index + 1).padStart(2, '0') }}</span>

                    <v-icon v-if="isAnswered(question.id_question)" size="18" color="success" class="question-row__icon">
                      mdi-check-circle
                    </v-icon>
                  </button>
                </div>
              </v-sheet>
            </v-col>

            <v-col cols="12" :md="examStarted && !examSubmitted ? 8 : 12" :lg="examStarted && !examSubmitted ? 9 : 12" class="exam-main pa-4 pa-md-6">
              <template v-if="examStarted && !examSubmitted">
                <v-card rounded="xl" class="question-card" elevation="2">
                  <div class="question-header pa-5 pa-md-6 d-flex justify-space-between align-start ga-4 flex-wrap">
                    <div class="d-flex align-start ga-4">
                      <div class="question-badge">{{ currentQuestion.id_question }}</div>
                      <div>
                        <div class="text-subtitle-1 font-weight-bold">Pregunta {{ currentQuestionNumber }} de {{ totalQuestions }}</div>
                      </div>
                    </div>

                    <div class="d-flex flex-wrap ga-2">
                      <v-chip :color="difficultyColor(currentQuestion.difficulty)" variant="tonal" size="small">
                        {{ difficultyLabel(currentQuestion.difficulty) }}
                      </v-chip>
                      <v-chip :color="bloomColor(currentQuestion.bloom_level)" variant="tonal" size="small">
                        {{ bloomLabel(currentQuestion.bloom_level) }}
                      </v-chip>
                    </div>
                  </div>

                  <v-divider />

                  <div class="pa-5 pa-md-6">
                    <p class="text-h6 question-statement mb-6">{{ currentQuestion.statement }}</p>

                    <template v-if="currentQuestion.question_type === 'MULTIPLE_CHOICE'">
                      <v-radio-group v-model="responses[currentQuestion.id_question]" color="primary" hide-details>
                        <v-radio
                          v-for="answer in currentQuestion.answers"
                          :key="answer.id_answer"
                          :label="answer.answer_text"
                          :value="String(answer.id_answer)"
                          class="answer-option"
                        />
                      </v-radio-group>
                    </template>

                    <template v-else-if="currentQuestion.question_type === 'MULTIPLE_SELECTION'">
                      <div class="text-body-2 text-medium-emphasis mb-4">Selecciona todas las opciones correctas.</div>
                      <v-checkbox
                        v-for="answer in currentQuestion.answers"
                        :key="answer.id_answer"
                        v-model="multiResponses[currentQuestion.id_question]"
                        :label="answer.answer_text"
                        :value="String(answer.id_answer)"
                        color="primary"
                        hide-details
                        class="answer-option answer-option--check"
                      />
                    </template>

                    <template v-else-if="currentQuestion.question_type === 'OPEN'">
                      <v-textarea
                        v-model="openResponses[currentQuestion.id_question]"
                        variant="outlined"
                        density="comfortable"
                        rows="10"
                        auto-grow
                        placeholder="Escribe tu respuesta aquí..."
                        hide-details
                      />
                      <div class="text-caption text-medium-emphasis mt-2">
                        {{ (openResponses[currentQuestion.id_question] || '').length }} caracteres
                      </div>
                    </template>

                    <template v-else>
                      <div class="d-flex align-center ga-2 mb-3">
                        <v-icon color="teal">mdi-language-python</v-icon>
                        <v-chip size="small" variant="tonal" color="blue-grey">python</v-chip>
                      </div>

                      <CodeMirrorEditor v-model="codeResponses[currentQuestion.id_question]" />

                      <v-expansion-panels class="mt-4" variant="accordion">
                        <v-expansion-panel>
                          <v-expansion-panel-title>Casos de prueba ({{ currentQuestion.codeQuestion?.test_cases.length ?? 0 }})</v-expansion-panel-title>
                          <v-expansion-panel-text>
                            <v-list density="compact">
                              <v-list-item
                                v-for="(testCase, index) in currentQuestion.codeQuestion?.test_cases ?? []"
                                :key="`${currentQuestion.id_question}-${index}`"
                                class="px-0"
                              >
                                <template #prepend>
                                  <v-icon color="success">mdi-check-circle-outline</v-icon>
                                </template>
                                <v-list-item-title class="text-body-2">{{ testCase.input }}</v-list-item-title>
                                <v-list-item-subtitle>Esperado: {{ testCase.expected }}</v-list-item-subtitle>
                              </v-list-item>
                            </v-list>
                          </v-expansion-panel-text>
                        </v-expansion-panel>
                      </v-expansion-panels>

                      <div class="d-flex justify-end mt-4">
                        <v-btn color="teal-darken-2" variant="flat" prepend-icon="mdi-play" @click="runCode">Ejecutar</v-btn>
                      </div>
                    </template>
                  </div>
                </v-card>

                <div class="d-flex justify-space-between align-center mt-6 flex-wrap ga-3">
                  <div></div>

                  <div class="d-flex ga-3 flex-wrap">
                    <v-btn v-if="currentIndex < totalQuestions - 1" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextQuestion">
                      Siguiente
                    </v-btn>
                    <v-btn v-if="currentIndex === totalQuestions - 1" color="success" variant="flat" prepend-icon="mdi-send" @click="submitExam">
                      Enviar examen
                    </v-btn>
                  </div>
                </div>
              </template>

              <template v-else>
                <v-card rounded="xl" class="start-card pa-6 pa-md-8" elevation="2">
                  <div class="d-flex flex-column ga-4">
                    <div>
                      <h2 class="text-h5 font-weight-bold mb-2">{{ session.examTitle }}</h2>
                      <p class="text-body-1 text-medium-emphasis mb-0">
                        {{ session.groupLabel }} · {{ session.unitLabel }}
                      </p>
                    </div>

                    <div class="text-body-1">
                      Revisa tus preguntas, responde con cuidado y usa el navegador lateral para saltar entre ellas.
                    </div>

                    <div class="d-flex flex-wrap ga-3">
                      <v-chip color="info" variant="tonal">{{ totalQuestions }} preguntas</v-chip>
                      <v-chip color="success" variant="tonal">Python</v-chip>
                      <v-chip v-if="isSecureMode" color="warning" variant="tonal">Pantalla completa</v-chip>
                    </div>

                    <div class="d-flex flex-wrap ga-3 mt-2">
                      <v-btn color="primary" size="large" prepend-icon="mdi-play" :loading="loadingAssignment" @click="startExam">
                        Iniciar examen
                      </v-btn>
                    </div>
                  </div>
                </v-card>
              </template>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>

    <v-dialog v-model="isSecureDialogOpen" max-width="520" persistent>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">Este examen requiere pantalla completa</v-card-title>
        <v-card-text class="text-body-1 text-medium-emphasis">
          Para iniciar la evaluación debes continuar en pantalla completa. Si sales de pantalla completa o cambias de pestaña, el examen se enviará automáticamente.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="cancelSecureStart">Cancelar</v-btn>
          <v-btn color="primary" variant="flat" :loading="isRequestingFullscreen" @click="confirmSecureStart">
            Continuar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="examSubmitted" max-width="480" persistent>
      <v-card rounded="xl" class="pa-2">
        <v-card-title class="text-h6 font-weight-bold">Examen enviado</v-card-title>
        <v-card-text class="text-body-1 text-medium-emphasis">
          Tu examen fue enviado correctamente.
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn color="primary" variant="flat" @click="goBack">Volver a mis exámenes</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000" location="bottom right">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue';
import { useSecureExam } from '../../composables/useSecureExam';
import { mockExamSession, type MockQuestion } from '../../entities/mock-exam';
import { ExamController } from '@/modules/exams/adapters/exam.controller';
import type { MyAssignment } from '@/modules/exams/entities/my-assignment';

const route = useRoute();
const router = useRouter();
const session = mockExamSession;
const controller = new ExamController();

const isSecureMode = ref(false);
const examStarted = ref(false);
const examSubmitted = ref(false);
const currentIndex = ref(0);
const loadingAssignment = ref(false);
const assignmentInfo = ref<MyAssignment | null>(null);

const responses = reactive<Record<number, string>>({});
const openResponses = reactive<Record<number, string>>({});
const codeResponses = reactive<Record<number, string>>({});
const multiResponses = reactive<Record<number, string[]>>({});

const snackbar = ref({ show: false, message: '', color: 'primary' as 'primary' | 'success' | 'warning' | 'error' });

const totalQuestions = computed(() => session.questions.length);
const currentQuestion = computed(() => session.questions[currentIndex.value]);
const currentQuestionNumber = computed(() => currentIndex.value + 1);

function showSnackbar(message: string, color: 'primary' | 'success' | 'warning' | 'error' = 'primary') {
  snackbar.value = { show: true, message, color };
}

async function exitFullscreenIfNeeded() {
  if (document.fullscreenElement && document.exitFullscreen) {
    try {
      await document.exitFullscreen();
    } catch {
      // Ignore fullscreen exit errors to avoid blocking exam flow.
    }
  }
}

async function submitExam() {
  if (examSubmitted.value) {
    return;
  }

  await exitFullscreenIfNeeded();

  examSubmitted.value = true;
  examStarted.value = false;
  showSnackbar('Examen enviado correctamente.', 'success');
}

const {
  isDialogOpen: isSecureDialogOpen,
  isRequestingFullscreen,
  openSecureExamDialog,
  closeSecureExamDialog,
  enterFullscreen,
} = useSecureExam(isSecureMode, () => {
  void submitExam();
});

function isAnswered(questionId: number) {
  const question = session.questions.find((item) => item.id_question === questionId);
  if (!question) {
    return false;
  }

  if (question.question_type === 'MULTIPLE_CHOICE') {
    return Boolean(responses[questionId]);
  }

  if (question.question_type === 'MULTIPLE_SELECTION') {
    return (multiResponses[questionId] ?? []).length > 0;
  }

  if (question.question_type === 'OPEN') {
    return Boolean((openResponses[questionId] ?? '').trim());
  }

  return Boolean((codeResponses[questionId] ?? '').trim());
}

function questionBarClass(questionId: number) {
  if (session.questions[currentIndex.value]?.id_question === questionId) {
    return 'question-row__bar--current';
  }

  return isAnswered(questionId) ? 'question-row__bar--answered' : 'question-row__bar--pending';
}

function selectQuestion(questionId: number) {
  const index = session.questions.findIndex((question) => question.id_question === questionId);
  if (index >= 0) {
    currentIndex.value = index;
  }
}

function nextQuestion() {
  if (currentIndex.value < totalQuestions.value - 1) {
    currentIndex.value += 1;
  }
}

function runCode() {
  showSnackbar('Ejecución simulada con CodeMirror y Python.', 'primary');
}

async function goBack() {
  await exitFullscreenIfNeeded();
  void router.push({ name: 'MyExams' });
}

function startExam() {
  if (loadingAssignment.value) {
    return;
  }

  if (!isSecureMode.value) {
    examStarted.value = true;
    return;
  }

  openSecureExamDialog();
}

async function confirmSecureStart() {
  const fullscreenGranted = await enterFullscreen();
  if (fullscreenGranted) {
    examStarted.value = true;
  } else {
    showSnackbar('No fue posible activar pantalla completa.', 'warning');
  }
}

function cancelSecureStart() {
  closeSecureExamDialog();
}

async function loadAssignmentConfig() {
  loadingAssignment.value = true;

  try {
    const assignmentId = Number(route.params.assignmentId);
    const response = await controller.getStudentAssignments({ include_completed: true });

    if (!response.success || !Array.isArray(response.data)) {
      showSnackbar(response.message || 'No se pudo obtener la asignación del examen.', 'warning');
      return;
    }

    const found = response.data.find((item) => item.id_assignment === assignmentId) ?? null;
    assignmentInfo.value = found;

    if (found) {
      isSecureMode.value = Boolean(found.secure_mode);
      session.assignmentId = found.id_assignment;
      session.examName = found.exam_name;
      session.examTitle = found.exam_title;
      session.subjectName = found.subject_name;
      session.unitLabel = `Unidad ${found.unit_number}`;
      session.groupLabel = found.group_label;
    }
  } catch {
    showSnackbar('Error al obtener la configuración del examen.', 'warning');
  } finally {
    loadingAssignment.value = false;
  }
}

function difficultyLabel(level: MockQuestion['difficulty']) {
  const map = { easy: 'FÁCIL', medium: 'MEDIO', hard: 'DIFÍCIL' } as const;
  return map[level];
}

function difficultyColor(level: MockQuestion['difficulty']) {
  const map = { easy: 'success', medium: 'warning', hard: 'error' } as const;
  return map[level];
}

function bloomLabel(level: MockQuestion['bloom_level']) {
  const map = {
    remember: 'RECORDAR',
    understand: 'COMPRENDER',
    apply: 'APLICAR',
    analyze: 'ANALIZAR',
    evaluate: 'EVALUAR',
    create: 'CREAR',
  } as const;
  return map[level];
}

function bloomColor(level: MockQuestion['bloom_level']) {
  const map = {
    remember: 'info',
    understand: 'indigo',
    apply: 'purple',
    analyze: 'teal',
    evaluate: 'amber',
    create: 'pink',
  } as const;
  return map[level];
}

onMounted(() => {
  session.questions.forEach((question) => {
    responses[question.id_question] = responses[question.id_question] ?? '';
    openResponses[question.id_question] = openResponses[question.id_question] ?? '';
    codeResponses[question.id_question] = codeResponses[question.id_question] ?? question.codeQuestion?.starter_code ?? '';
    multiResponses[question.id_question] = multiResponses[question.id_question] ?? [];
  });

  void loadAssignmentConfig();
});
</script>

<style scoped>
.exam-shell {
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.92), transparent 34%),
    linear-gradient(180deg, #dff7f8 0%, #e6fbff 50%, #ecfeff 100%);
}

.exam-page {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(8px);
}

.exam-topbar {
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.75);
}

.exam-body {
  min-height: calc(100vh - 160px);
}

.exam-sidebar {
  background: rgba(233, 249, 250, 0.8);
}

.sticky-sidebar {
  position: sticky;
  top: 24px;
  max-height: calc(100vh - 48px);
  overflow: hidden;
}

.sidebar-scroll {
  max-height: calc(100vh - 150px);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
}

.sidebar-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.question-row {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background: transparent;
  transition: background-color 200ms ease, transform 200ms ease;
  cursor: pointer;
  text-align: left;
  position: relative;
}

.question-row:hover {
  background: rgba(8, 30, 83, 0.05);
}

.question-row--current {
  background: rgba(8, 30, 83, 0.08);
}

.question-row__bar {
  width: 5px;
  height: 34px;
  border-radius: 999px;
  flex: 0 0 auto;
}

.question-row__bar--current {
  background: #081e53;
}

.question-row__bar--answered {
  background: #0d7d5f;
}

.question-row__bar--pending {
  background: #d1d5db;
}

.question-row__number {
  width: 34px;
  min-width: 34px;
  font-weight: 700;
  color: #1e3a5f;
}

.question-row__label {
  flex: 1;
  font-size: 0.95rem;
  color: #1e3a5f;
}

.question-row--current .question-row__label,
.question-row--current .question-row__number {
  font-weight: 800;
}

.question-row__icon {
  flex: 0 0 auto;
}

.question-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

.question-header {
  background: linear-gradient(180deg, rgba(243, 250, 255, 0.92), rgba(255, 255, 255, 0.88));
}

.question-badge {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #0f8b7b;
  color: white;
  font-weight: 800;
  font-size: 18px;
  flex: 0 0 auto;
}

.question-statement {
  color: #1e3a5f;
  line-height: 1.55;
}

.answer-option {
  padding: 14px 18px;
  border: 1px solid rgba(103, 132, 163, 0.22);
  border-radius: 18px;
  margin-bottom: 14px;
  background: white;
}

.answer-option--check {
  align-items: center;
}

.start-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
}

@media (max-width: 959px) {
  .exam-body {
    min-height: auto;
  }

  .sticky-sidebar,
  .sidebar-scroll {
    max-height: none;
  }
}
</style>