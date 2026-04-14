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
              <template v-if="examStarted && !examSubmitted && currentQuestion">
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

                    <v-sheet
                      v-if="currentQuestion.image_url"
                      rounded="xl"
                      class="question-image-frame pa-2 mb-6 mx-auto"
                      border
                    >
                      <v-img
                        :src="currentQuestion.image_url"
                        alt="Imagen de la pregunta"
                        height="220"
                        class="question-image"
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
                    </template>
                  </div>
                </v-card>

                <div class="d-flex justify-space-between align-center mt-6 flex-wrap ga-3">
                  <div></div>

                  <div class="d-flex ga-3 flex-wrap">
                    <v-btn v-if="currentIndex < totalQuestions - 1" color="primary" variant="flat" append-icon="mdi-arrow-right" @click="nextQuestion">
                      Siguiente
                    </v-btn>
                    <v-btn
                      v-if="currentIndex === totalQuestions - 1"
                      color="success"
                      variant="flat"
                      prepend-icon="mdi-send"
                      :loading="isSubmittingExam"
                      :disabled="isSubmittingExam"
                      @click="submitExam"
                    >
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

    <!-- ── Pantalla de resultados ────────────────────────────────────────── -->
    <v-dialog v-model="examSubmitted" max-width="640" persistent scrollable>
      <v-card rounded="xl">
        <v-card-title class="text-h6 font-weight-bold pa-5 pb-3 d-flex align-center ga-3">
          <v-icon color="success">mdi-check-circle</v-icon>
          Examen enviado
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-5">
          <!-- Score principal -->
          <v-sheet
            v-if="submitResult?.score_summary"
            rounded="xl"
            class="result-score-banner d-flex align-center justify-space-between pa-4 mb-5 flex-wrap ga-3"
          >
            <div>
              <p class="text-body-2 text-medium-emphasis mb-1">Calificación final</p>
              <p class="text-h4 font-weight-bold mb-0">{{ finalScoreText ?? '--' }}</p>
            </div>
            <v-chip
              :color="submitResult.score_summary.is_passed ? 'success' : 'error'"
              variant="flat"
              size="large"
              class="font-weight-bold"
            >
              {{ submitResult.score_summary.is_passed ? 'Aprobado' : 'No aprobado' }}
            </v-chip>
          </v-sheet>

          <p v-else class="text-body-1 text-medium-emphasis mb-4">
            Tu examen fue enviado. Las preguntas abiertas están pendientes de calificación manual.
          </p>

          <!-- Desglose por pregunta -->
          <div v-if="submitResult?.graded_answers?.length" class="mb-2">
            <p class="text-subtitle-2 font-weight-bold mb-3">Resultado por pregunta</p>
            <v-list density="compact" class="pa-0">
              <v-list-item
                v-for="(item, idx) in submitResult.graded_answers"
                :key="item.question_id"
                class="result-row px-3 mb-2 rounded-lg"
                :class="resultRowClass(item)"
              >
                <template #prepend>
                  <span class="result-idx mr-3 font-weight-bold text-caption">{{ String(idx + 1).padStart(2, '0') }}</span>
                  <v-icon
                    v-if="item.graded && item.is_correct !== null"
                    :color="item.is_correct ? 'success' : 'error'"
                    size="20"
                  >
                    {{ item.is_correct ? 'mdi-check-circle' : 'mdi-close-circle' }}
                  </v-icon>
                  <v-icon v-else color="warning" size="20">mdi-clock-outline</v-icon>
                </template>

                <v-list-item-title class="text-body-2">
                  Pregunta #{{ item.question_id }}
                  <span v-if="!item.graded" class="text-caption text-medium-emphasis ml-2">(pendiente de calificación manual)</span>
                </v-list-item-title>

                <template #append>
                  <span class="text-body-2 font-weight-medium">
                    {{ item.score !== null && item.score !== undefined ? item.score : '--' }}
                  </span>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card-text>

        <v-divider />

        <v-card-actions class="justify-end pa-4">
          <v-btn color="primary" variant="flat" prepend-icon="mdi-arrow-left" @click="goBack">
            Volver a mis exámenes
          </v-btn>
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
import { decodeId } from '@/kernel/url-cipher';
import CodeMirrorEditor from '../components/CodeMirrorEditor.vue';
import { useSecureExam } from '../../composables/useSecureExam';
import { ExamController } from '@/modules/exams/adapters/exam.controller';
import { AnswersController } from '../answers.controller';
import type { MyAssignment } from '@/modules/exams/entities/my-assignment';
import type { ExamLinkedQuestion } from '@/modules/exams/entities/exam-linked-question';
import type { SubmitAnswerItemDto, SubmitExamAnswersResult } from '../../entities/exam-answer';

type StudentQuestionType = 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECTION' | 'OPEN' | 'CODE';
type StudentDifficulty = 'easy' | 'medium' | 'hard';
type StudentBloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

type StudentAnswer = {
  id_answer: number;
  answer_text: string;
  is_correct: boolean;
};

type StudentCodeQuestion = {
  language: string;
  starter_code: string;
  test_cases: Array<{
    input: string;
    expected: string;
  }>;
};

type StudentQuestion = {
  id_question: number;
  statement: string;
  image_url?: string | null;
  question_type: StudentQuestionType;
  difficulty: StudentDifficulty;
  bloom_level: StudentBloomLevel;
  points: number;
  answers?: StudentAnswer[];
  codeQuestion?: StudentCodeQuestion;
};

type StudentExamSession = {
  assignmentId: number;
  examName: string;
  examTitle: string;
  subjectName: string;
  unitLabel: string;
  groupLabel: string;
  durationMinutes: number;
  questions: StudentQuestion[];
};

const route = useRoute();
const router = useRouter();
const session = reactive<StudentExamSession>({
  assignmentId: 0,
  examName: 'Examen',
  examTitle: 'Examen',
  subjectName: 'Materia',
  unitLabel: 'Unidad',
  groupLabel: 'Grupo',
  durationMinutes: 60,
  questions: [],
});
const controller = new ExamController();
const answersController = new AnswersController();

const isSecureMode = ref(false);
const examStarted = ref(false);
const examSubmitted = ref(false);
const currentIndex = ref(0);
const loadingAssignment = ref(false);
const isSubmittingExam = ref(false);
const assignmentInfo = ref<MyAssignment | null>(null);
const submitResult = ref<SubmitExamAnswersResult | null>(null);

const responses = reactive<Record<number, string>>({});
const openResponses = reactive<Record<number, string>>({});
const codeResponses = reactive<Record<number, string>>({});
const multiResponses = reactive<Record<number, string[]>>({});

const snackbar = ref({ show: false, message: '', color: 'primary' as 'primary' | 'success' | 'warning' | 'error' });

const totalQuestions = computed(() => session.questions.length);
const currentQuestion = computed(() => session.questions[currentIndex.value] ?? null);
const currentQuestionNumber = computed(() => currentIndex.value + 1);
const finalScoreText = computed(() => {
  const score = submitResult.value?.score_summary?.score;
  if (score === null || score === undefined) {
    return null;
  }
  const numericScore = typeof score === 'number' ? score : Number(score);
  if (Number.isNaN(numericScore)) {
    return null;
  }
  return numericScore.toFixed(2);
});

function normalizeQuestionType(value: string): StudentQuestionType {
  const normalized = (value || '').toUpperCase();
  if (normalized === 'MULTIPLE_SELECTION') return 'MULTIPLE_SELECTION';
  if (normalized === 'OPEN') return 'OPEN';
  if (normalized === 'CODE') return 'CODE';
  return 'MULTIPLE_CHOICE';
}

function normalizeDifficulty(value: string): StudentDifficulty {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'easy') return 'easy';
  if (normalized === 'hard') return 'hard';
  return 'medium';
}

function normalizeBloomLevel(value: string): StudentBloomLevel {
  const normalized = (value || '').toLowerCase();
  if (normalized === 'remember') return 'remember';
  if (normalized === 'understand') return 'understand';
  if (normalized === 'apply') return 'apply';
  if (normalized === 'analyze') return 'analyze';
  if (normalized === 'evaluate') return 'evaluate';
  if (normalized === 'create') return 'create';
  return 'remember';
}

function normalizeCodeTestCases(raw: unknown): Array<{ input: string; expected: string }> {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (typeof item === 'string') {
        return { input: item, expected: '-' };
      }

      if (item && typeof item === 'object') {
        const maybeInput = (item as { input?: unknown }).input;
        const maybeExpected = (item as { expected?: unknown }).expected;

        return {
          input: typeof maybeInput === 'string' ? maybeInput : '-',
          expected: typeof maybeExpected === 'string' ? maybeExpected : '-',
        };
      }

      return { input: '-', expected: '-' };
    })
    .filter((testCase) => testCase.input !== '-' || testCase.expected !== '-');
}

function initializeResponseState() {
  session.questions.forEach((question) => {
    responses[question.id_question] = responses[question.id_question] ?? '';
    openResponses[question.id_question] = openResponses[question.id_question] ?? '';
    codeResponses[question.id_question] = codeResponses[question.id_question] ?? question.codeQuestion?.starter_code ?? '';
    multiResponses[question.id_question] = multiResponses[question.id_question] ?? [];
  });
}

function mapQuestion(linkedQuestion: ExamLinkedQuestion): StudentQuestion {
  const answers = (linkedQuestion.answers ?? []).map((answer, index) => ({
    id_answer: answer.id_answer ?? index + 1,
    answer_text: answer.answer_text,
    is_correct: false,
  }));

  const codeQuestion = linkedQuestion.code_question
    ? {
        language: linkedQuestion.code_question.language || 'python',
        starter_code: '',
        test_cases: normalizeCodeTestCases(linkedQuestion.code_question.test_cases),
      }
    : undefined;

  return {
    id_question: linkedQuestion.id_question,
    statement: linkedQuestion.text,
    image_url: linkedQuestion.image_url ?? null,
    question_type: normalizeQuestionType(linkedQuestion.question_type),
    difficulty: normalizeDifficulty(linkedQuestion.difficulty),
    bloom_level: normalizeBloomLevel(linkedQuestion.bloom_level),
    points: Number(linkedQuestion.points ?? 0),
    answers,
    codeQuestion,
  };
}

async function loadExamQuestions(examId: number) {
  try {
    const examQuestionsResponse = await controller.getExamQuestions(examId);

    if (!examQuestionsResponse.success || !examQuestionsResponse.data?.questions) {
      showSnackbar(examQuestionsResponse.message || 'No se pudieron obtener las preguntas del examen.', 'warning');
      session.questions = [];
      return;
    }

    const linkedQuestions = examQuestionsResponse.data.questions;
    if (linkedQuestions.length === 0) {
      session.questions = [];
      showSnackbar('Este examen no tiene preguntas asignadas.', 'warning');
      return;
    }

    const mappedQuestions = linkedQuestions.map((question) => mapQuestion(question));

    session.questions = mappedQuestions;
    currentIndex.value = 0;
    initializeResponseState();
  } catch {
    session.questions = [];
    showSnackbar('Error al cargar las preguntas del examen.', 'warning');
  }
}

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

async function submitExam(forceSubmit = false) {
  if (examSubmitted.value || isSubmittingExam.value) {
    return;
  }

  if (!session.assignmentId) {
    showSnackbar('No se encontro la asignacion del examen.', 'error');
    return;
  }

  const answersPayload = buildSubmitAnswersPayload();
  const unanswered = session.questions.filter((question) => !isAnswered(question.id_question));
  if (!forceSubmit && unanswered.length > 0) {
    showSnackbar('Debes responder todas las preguntas antes de enviar el examen.', 'warning');
    return;
  }

  if (answersPayload.length === 0) {
    showSnackbar('No hay respuestas para enviar.', 'warning');
    return;
  }

  isSubmittingExam.value = true;

  try {
    const response = await answersController.submitExamAnswers({
      exam_assignment_id: session.assignmentId,
      answers: answersPayload,
    });

    if (!response.success || !response.data) {
      showSnackbar(response.message || 'No se pudieron enviar las respuestas del examen.', 'error');
      return;
    }

    submitResult.value = response.data;

    await exitFullscreenIfNeeded();

    examSubmitted.value = true;
    examStarted.value = false;
    showSnackbar(response.message || 'Examen enviado correctamente.', 'success');
  } catch {
    showSnackbar('Error al enviar el examen. Intenta nuevamente.', 'error');
  } finally {
    isSubmittingExam.value = false;
  }
}

const {
  isDialogOpen: isSecureDialogOpen,
  isRequestingFullscreen,
  openSecureExamDialog,
  closeSecureExamDialog,
  enterFullscreen,
} = useSecureExam(isSecureMode, () => {
  void submitExam(true);
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

function buildSubmitAnswersPayload(): SubmitAnswerItemDto[] {
  return session.questions
    .map((question) => mapQuestionAnswer(question))
    .filter((answer): answer is SubmitAnswerItemDto => answer !== null);
}

function mapQuestionAnswer(question: StudentQuestion): SubmitAnswerItemDto | null {
  const questionId = question.id_question;

  if (question.question_type === 'MULTIPLE_CHOICE') {
    const selected = responses[questionId];
    if (!selected) {
      return null;
    }
    return {
      question_id: questionId,
      selected_answer: Number(selected),
    };
  }

  if (question.question_type === 'MULTIPLE_SELECTION') {
    const selectedValues = (multiResponses[questionId] ?? []).map(Number);
    if (selectedValues.length === 0) {
      return null;
    }
    return {
      question_id: questionId,
      selected_answers: selectedValues,
    };
  }

  if (question.question_type === 'OPEN') {
    const answerText = (openResponses[questionId] ?? '').trim();
    if (!answerText) {
      return null;
    }
    return {
      question_id: questionId,
      answer_text: answerText,
    };
  }

  const codeAnswer = (codeResponses[questionId] ?? '').trim();
  if (!codeAnswer) {
    return null;
  }
  return {
    question_id: questionId,
    code_answer: codeAnswer,
  };
}

function resultRowClass(item: { graded: boolean; is_correct: boolean | null }) {
  if (!item.graded) return 'result-row--pending';
  return item.is_correct ? 'result-row--correct' : 'result-row--wrong';
}

async function goBack() {
  await exitFullscreenIfNeeded();
  await router.push({ name: 'MyExams' });
}

function startExam() {
  if (loadingAssignment.value) {
    return;
  }

  if (totalQuestions.value === 0) {
    showSnackbar('No hay preguntas disponibles para este examen.', 'warning');
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
    const assignmentId = decodeId(route.params.assignmentId as string);
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

      await loadExamQuestions(found.exam_id);
    } else {
      showSnackbar('No se encontró la asignación del examen.', 'warning');
    }
  } catch {
    showSnackbar('Error al obtener la configuración del examen.', 'warning');
  } finally {
    loadingAssignment.value = false;
  }
}

function difficultyLabel(level: StudentQuestion['difficulty']) {
  const map = { easy: 'FÁCIL', medium: 'MEDIO', hard: 'DIFÍCIL' } as const;
  return map[level];
}

function difficultyColor(level: StudentQuestion['difficulty']) {
  const map = { easy: 'success', medium: 'warning', hard: 'error' } as const;
  return map[level];
}

function bloomLabel(level: StudentQuestion['bloom_level']) {
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

function bloomColor(level: StudentQuestion['bloom_level']) {
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
  background: #087868;
  color: white;
  font-weight: 800;
  font-size: 18px;
  flex: 0 0 auto;
}

.question-statement {
  color: #1e3a5f;
  line-height: 1.55;
}

.question-image-frame {
  border-color: rgba(20, 184, 166, 0.28) !important;
  background: linear-gradient(180deg, #f0fdfa 0%, #f8fafc 100%);
  max-width: 640px;
}

.question-image {
  border-radius: 14px;
  overflow: hidden;
  background: #ffffff;
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

/* ── Result screen ───────────────────────────── */
.result-score-banner {
  background: linear-gradient(135deg, #e6f9f5 0%, #f0fdf7 100%);
  border: 1px solid rgba(15, 118, 110, 0.18);
}

.result-row {
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: #fff;
  min-height: 44px;
}

.result-row--correct {
  border-color: rgba(22, 163, 74, 0.25);
  background: rgba(240, 253, 244, 0.6);
}

.result-row--wrong {
  border-color: rgba(220, 38, 38, 0.2);
  background: rgba(255, 241, 242, 0.5);
}

.result-row--pending {
  border-color: rgba(234, 179, 8, 0.25);
  background: rgba(255, 251, 235, 0.6);
}

.result-idx {
  min-width: 24px;
  color: #64748b;
}
</style>