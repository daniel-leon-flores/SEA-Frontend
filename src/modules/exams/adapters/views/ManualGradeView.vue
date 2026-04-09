<template>
  <v-container fluid class="grading-shell pa-6 pa-md-8">
    <v-row justify="center">
      <v-col cols="12">
        <v-breadcrumbs :items="breadcrumbItems" class="pa-0 mb-4">
          <template #divider>
            <v-icon icon="mdi-chevron-right" />
          </template>
        </v-breadcrumbs>

        <div class="mb-6">
          <h1 class="page-title text-h4 font-weight-bold mb-2">Calificar examen de {{ mockStudent.fullName }}</h1>
          <p class="page-subtitle text-body-1 text-medium-emphasis mb-0">{{ examTitle }}</p>
        </div>

        <div class="question-stack">
          <v-card
            v-for="(item, index) in gradedQuestions"
            :key="item.idQuestion"
            rounded="xl"
            class="question-card mx-auto mb-5"
            elevation="1"
          >
            <div class="question-head px-4 px-md-5 py-4 d-flex justify-space-between align-start ga-3 flex-wrap">
              <div class="d-flex align-start ga-3 flex-grow-1">
                <div class="q-index">{{ index + 1 }}</div>
                <div class="min-w-0">
                  <h2 class="text-subtitle-1 text-md-h6 font-weight-bold mb-2 question-title">{{ item.statement }}</h2>
                  <div class="d-flex flex-wrap ga-2">
                    <v-chip size="small" variant="tonal" color="primary">{{ questionTypeLabel(item.type) }}</v-chip>
                    <v-chip :color="difficultyColor(item.difficulty)" size="small" variant="tonal">
                      {{ difficultyLabel(item.difficulty) }}
                    </v-chip>
                    <v-chip :color="bloomColor(item.bloomLevel)" size="small" variant="tonal">
                      {{ bloomLabel(item.bloomLevel) }}
                    </v-chip>
                    <v-chip v-if="item.type === 'CODE'" size="small" variant="flat" color="teal-darken-4">
                      <v-icon start size="14">mdi-code-tags</v-icon>
                      python
                    </v-chip>
                  </div>
                </div>
              </div>

            </div>

            <v-divider />

            <div class="px-4 px-md-5 py-5">
              <div class="text-subtitle-2 font-weight-bold mb-3">Respuesta del alumno</div>

              <template v-if="item.type === 'MULTIPLE_SELECTION' || item.type === 'MULTIPLE_CHOICE'">
                <v-sheet class="answer-box pa-4" rounded="lg" border>
                  <p class="mb-0 text-body-1">{{ item.studentAnswerText }}</p>
                  <div class="mt-3 d-flex align-center ga-2" :class="item.isAutoCorrect ? 'text-success' : 'text-error'">
                    <v-icon size="18">{{ item.isAutoCorrect ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                    <span class="font-weight-medium">{{ item.isAutoCorrect ? 'Correcta' : 'Incorrecta' }}</span>
                  </div>
                </v-sheet>

                <template v-if="!item.isAutoCorrect">
                  <div class="text-subtitle-2 font-weight-bold mt-5 mb-3">Respuesta correcta</div>
                  <v-sheet class="answer-box pa-4" rounded="lg" border>
                    <p class="mb-0 text-body-1">{{ item.correctAnswerText }}</p>
                  </v-sheet>
                </template>
              </template>

              <template v-else-if="item.type === 'OPEN'">
                <v-sheet class="answer-box pa-4" rounded="lg" border>
                  <p class="mb-0 text-body-1">{{ item.studentAnswerText }}</p>
                </v-sheet>
              </template>

              <template v-else-if="item.type === 'CODE'">
                <CodeMirrorEditor v-model="item.studentCode" />

                <div class="d-flex justify-end mt-4">
                  <v-btn color="teal-darken-2" prepend-icon="mdi-play" @click="runTeacherCode(item.idQuestion)">
                    Ejecutar código
                  </v-btn>
                </div>

                <v-card v-if="item.execution" class="mt-4 execution-card" rounded="lg" elevation="0" variant="tonal">
                  <v-card-text>
                    <div class="text-subtitle-2 font-weight-bold mb-3">Resultado de ejecución</div>
                    <v-list density="compact" class="pa-0">
                      <v-list-item
                        v-for="(test, tIndex) in item.execution.tests"
                        :key="`${item.idQuestion}-${tIndex}`"
                        class="px-0"
                      >
                        <template #prepend>
                          <v-icon :color="test.passed ? 'success' : 'error'" size="18">
                            {{ test.passed ? 'mdi-check-circle' : 'mdi-close-circle' }}
                          </v-icon>
                        </template>
                        <v-list-item-title class="text-body-2">{{ test.input }}</v-list-item-title>
                        <v-list-item-subtitle>
                          Esperado: {{ test.expected }} | Obtenido: {{ test.actual }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>
              </template>

              <v-divider class="my-5" />

              <div class="d-flex align-center ga-3 flex-wrap">
                <span class="text-h6 font-weight-bold">Puntaje</span>
                <v-text-field
                  v-model.number="item.teacherScore"
                  type="number"
                  density="comfortable"
                  variant="outlined"
                  hide-details
                  class="score-input"
                  :min="0"
                  :max="item.maxPoints"
                  @update:model-value="normalizeScore(item)"
                />
                <span class="text-h6">/ {{ item.maxPoints }}</span>

              </div>
            </div>
          </v-card>
        </div>

        <v-card rounded="xl" class="final-card mx-auto pa-5 pa-md-6 mt-2" elevation="1">
          <div class="d-flex justify-space-between align-center flex-wrap ga-4">
            <div>
              <p class="text-h5 font-weight-bold mb-2">Calificación final</p>
              <p class="text-h3 font-weight-black mb-1">{{ totalScore }}/{{ maxScore }}</p>
              <p class="text-body-1 text-medium-emphasis mb-0">{{ finalPercentage }}%</p>
            </div>

            <v-btn color="teal-darken-2" size="x-large" prepend-icon="mdi-send" @click="saveGrade">
              Enviar calificación
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2500" location="bottom right">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import CodeMirrorEditor from '@/modules/answers/adapters/components/CodeMirrorEditor.vue';

type QuestionType = 'MULTIPLE_SELECTION' | 'OPEN' | 'CODE' | 'MULTIPLE_CHOICE';
type DifficultyLevel = 'easy' | 'medium' | 'hard';
type BloomLevel = 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';

type ExecutionTest = {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
};

type GradeQuestion = {
  idQuestion: number;
  type: QuestionType;
  statement: string;
  difficulty: DifficultyLevel;
  bloomLevel: BloomLevel;
  maxPoints: number;
  teacherScore: number;
  isAutoCorrect: boolean;
  studentAnswerText?: string;
  correctAnswerText?: string;
  studentCode: string;
  execution?: {
    tests: ExecutionTest[];
  };
};

const route = useRoute();
const examId = computed(() => String(route.params.examId || '1'));

const mockStudent = {
  fullName: 'Alice Johnson',
  examName: 'JavaScript Fundamentals',
};

const examTitle = computed(() => mockStudent.examName);

const breadcrumbItems = computed(() => [
  { title: 'Exámenes', disabled: false, href: '/exams' },
  { title: 'Calificaciones', disabled: false, href: `/exams/${examId.value}/grades` },
  { title: 'Calificar examen', disabled: true },
]);

const gradedQuestions = reactive<GradeQuestion[]>([
  {
    idQuestion: 14,
    type: 'MULTIPLE_SELECTION',
    statement: '¿Cuáles son formas válidas de declarar una variable en JavaScript? (Selecciona todas las correctas)',
    difficulty: 'easy',
    bloomLevel: 'understand',
    maxPoints: 15,
    teacherScore: 15,
    isAutoCorrect: true,
    studentAnswerText: 'var myVar = 5;, let myVar = 5;, const myVar = 5;',
    correctAnswerText: 'var myVar = 5;, let myVar = 5;, const myVar = 5;',
    studentCode: '',
  },
  {
    idQuestion: 28,
    type: 'OPEN',
    statement: 'Explica la diferencia entre los operadores == y === en JavaScript. Incluye un ejemplo.',
    difficulty: 'medium',
    bloomLevel: 'analyze',
    maxPoints: 20,
    teacherScore: 0,
    isAutoCorrect: false,
    studentAnswerText:
      "El operador == convierte tipos antes de comparar, mientras que === compara valor y tipo. Ejemplo: 5 == '5' es true y 5 === '5' es false.",
    studentCode: '',
  },
  {
    idQuestion: 40,
    type: 'CODE',
    statement: 'Escribe una función llamada reverse_string que reciba una cadena y retorne la cadena invertida.',
    difficulty: 'medium',
    bloomLevel: 'apply',
    maxPoints: 25,
    teacherScore: 0,
    isAutoCorrect: false,
    studentCode: 'def reverse_string(texto):\n    return texto[::-1]',
  },
  {
    idQuestion: 2,
    type: 'MULTIPLE_CHOICE',
    statement: '¿Qué devuelve typeof null en JavaScript?',
    difficulty: 'easy',
    bloomLevel: 'remember',
    maxPoints: 10,
    teacherScore: 10,
    isAutoCorrect: true,
    studentAnswerText: '"object"',
    correctAnswerText: '"object"',
    studentCode: '',
  },
  {
    idQuestion: 3,
    type: 'MULTIPLE_CHOICE',
    statement: '¿Cuál NO es un tipo primitivo en JavaScript?',
    difficulty: 'easy',
    bloomLevel: 'remember',
    maxPoints: 10,
    teacherScore: 0,
    isAutoCorrect: false,
    studentAnswerText: 'String',
    correctAnswerText: 'Object',
    studentCode: '',
  },
]);

const snackbar = ref({ show: false, message: '', color: 'success' as 'success' | 'warning' | 'error' });

const maxScore = computed(() => gradedQuestions.reduce((sum, q) => sum + q.maxPoints, 0));
const totalScore = computed(() => gradedQuestions.reduce((sum, q) => sum + (Number(q.teacherScore) || 0), 0));
const finalPercentage = computed(() => {
  if (!maxScore.value) return 0;
  return Math.round((totalScore.value / maxScore.value) * 100);
});

function questionTypeLabel(type: QuestionType) {
  const map: Record<QuestionType, string> = {
    MULTIPLE_SELECTION: 'Selección múltiple',
    OPEN: 'Abierta',
    CODE: 'Código',
    MULTIPLE_CHOICE: 'Opción única',
  };
  return map[type];
}

function difficultyLabel(level: DifficultyLevel) {
  const map: Record<DifficultyLevel, string> = {
    easy: 'FÁCIL',
    medium: 'MEDIO',
    hard: 'DIFÍCIL',
  };
  return map[level];
}

function difficultyColor(level: DifficultyLevel) {
  const map: Record<DifficultyLevel, string> = {
    easy: 'success',
    medium: 'warning',
    hard: 'error',
  };
  return map[level];
}

function bloomLabel(level: BloomLevel) {
  const map: Record<BloomLevel, string> = {
    remember: 'RECORDAR',
    understand: 'COMPRENDER',
    apply: 'APLICAR',
    analyze: 'ANALIZAR',
    evaluate: 'EVALUAR',
    create: 'CREAR',
  };
  return map[level];
}

function bloomColor(level: BloomLevel) {
  const map: Record<BloomLevel, string> = {
    remember: 'info',
    understand: 'indigo',
    apply: 'purple',
    analyze: 'teal',
    evaluate: 'amber',
    create: 'pink',
  };
  return map[level];
}

function normalizeScore(item: GradeQuestion) {
  const score = Number(item.teacherScore);
  if (Number.isNaN(score)) {
    item.teacherScore = 0;
    return;
  }
  if (score < 0) {
    item.teacherScore = 0;
    return;
  }
  if (score > item.maxPoints) {
    item.teacherScore = item.maxPoints;
  }
}

function runTeacherCode(questionId: number) {
  const target = gradedQuestions.find((q) => q.idQuestion === questionId && q.type === 'CODE');
  if (!target) {
    return;
  }

  const normalized = target.studentCode.toLowerCase();
  const looksValid = normalized.includes('def reverse_string') && (normalized.includes('[::-1]') || normalized.includes('reversed('));

  const tests: ExecutionTest[] = [
    { input: 'reverse_string("hola")', expected: 'aloh', actual: looksValid ? 'aloh' : 'hola', passed: looksValid },
    { input: 'reverse_string("Python")', expected: 'nohtyP', actual: looksValid ? 'nohtyP' : 'Python', passed: looksValid },
    { input: 'reverse_string("")', expected: '', actual: '', passed: true },
  ];

  target.execution = { tests };
  target.isAutoCorrect = tests.every((t) => t.passed);
  target.teacherScore = target.isAutoCorrect ? target.maxPoints : Math.round(target.maxPoints * 0.4);

  snackbar.value = {
    show: true,
    message: target.isAutoCorrect ? 'Ejecución completada: todos los casos pasaron.' : 'Ejecución completada: hay casos fallidos.',
    color: target.isAutoCorrect ? 'success' : 'warning',
  };
}

function saveGrade() {
  snackbar.value = { show: true, message: 'Calificación guardada (mock).', color: 'success' };
}
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
  max-width: 980px;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: #fff;
}

.question-head {
  background: #ffffff;
}

.q-index {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: #e5f3ef;
  color: #0f766e;
  font-weight: 800;
  font-size: 1.15rem;
  flex: 0 0 auto;
}

.question-title {
  line-height: 1.35;
}

.answer-box {
  border-color: #d7e7ea !important;
  background: #f8fcfd;
}

.execution-card {
  background: #f8fcfd;
  border: 1px solid #d7e7ea;
}

.score-input {
  max-width: 100px;
}

.final-card {
  width: 100%;
  max-width: 980px;
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
