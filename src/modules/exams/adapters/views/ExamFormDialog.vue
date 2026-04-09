<template>
  <v-dialog v-model="visible" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start :color="isEditing ? 'primary' : 'success'">
          {{ isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline' }}
        </v-icon>
        {{ isEditing ? 'Editar examen' : 'Registrar examen' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" @submit.prevent="handleSubmit">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.name"
                label="Nombre del examen"
                placeholder="Ej. Examen Parcial 1"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="submitting || loadingSubjects"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.id_subject"
                label="Materia"
                :items="subjectItems"
                item-title="name"
                item-value="id_subject"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="submitting || loadingSubjects"
                :loading="loadingSubjects"
                @update:model-value="onSubjectChange"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-select
                v-model="form.unit_number"
                label="Unidad"
                :items="unitItems"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :disabled="submitting || loadingSubjects || !form.id_subject"
                no-data-text="Seleccione una materia primero"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <p class="text-body-2 text-medium-emphasis mb-1">Dificultad</p>
              <v-radio-group
                v-model="form.difficulty_level"
                inline
                hide-details="auto"
                :rules="[rules.required]"
                :disabled="submitting || loadingSubjects"
              >
                <v-radio
                  v-for="opt in DIFFICULTY_OPTIONS"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </v-radio-group>
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="form.minimum_score"
                label="Calificación mínima"
                placeholder="Ej. 6.00"
                variant="outlined"
                density="comfortable"
                type="number"
                step="0.01"
                min="0"
                max="10"
                :rules="[rules.required, rules.scoreRange]"
                :disabled="submitting || loadingSubjects"
              />
            </v-col>

            <v-col cols="12" v-if="form.id_subject">
              <v-divider class="my-2" />
              <p class="text-subtitle-2 mb-2">Preguntas del examen</p>
              <p class="text-caption text-medium-emphasis mb-2">
                Solo se listan preguntas del banco de la misma materia. Todas formarán parte del examen; al asignar el examen, el
                alumno verá las preguntas en orden aleatorio (no depende de cómo aparezcan aquí).
              </p>
              <v-select
                v-model="addQuestionSelection"
                label="Añadir pregunta del banco"
                :items="availableQuestionItems"
                item-title="title"
                item-value="value"
                variant="outlined"
                density="comfortable"
                clearable
                hide-details
                no-data-text="No hay más preguntas disponibles para esta materia"
                :disabled="submitting || loadingSubjects || loadingQuestions"
                :loading="loadingQuestions"
                @update:model-value="onAddQuestion"
              />
              <v-list v-if="linkedQuestionIds.length" density="compact" class="border rounded mt-2">
                <v-list-item v-for="(qid, idx) in linkedQuestionIds" :key="`${qid}-${idx}`">
                  <v-list-item-title class="text-body-2 text-wrap">
                    {{ questionTitle(qid) }}
                  </v-list-item-title>
                  <template #append>
                    <v-btn icon size="x-small" variant="text" color="error" @click="removeQuestion(idx)">
                      <v-icon size="small">mdi-close</v-icon>
                    </v-btn>
                  </template>
                </v-list-item>
              </v-list>
              <p v-else class="text-caption text-medium-emphasis mt-1">
                Ninguna pregunta vinculada. Podrá activar el examen cuando asigne al menos una pregunta y grupos.
              </p>
            </v-col>

          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" :disabled="submitting || loadingSubjects" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          variant="elevated"
          :color="isEditing ? 'primary' : 'success'"
          :loading="submitting"
          :disabled="submitting || loadingSubjects"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Guardar cambios' : 'Registrar examen' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { ExamController } from '../exam.controller';
import { QuestionController } from '@/modules/questions/adapters/question.controller';
import type { Subject, SubjectUnit } from '../../entities/assign-exam.dto';
import type { Exam } from '../../entities/exam';
import { DIFFICULTY_OPTIONS, MAX_SCORE, MIN_SCORE } from '../../entities/exam-constants';

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'error', message: string): void;
}>();

const controller = new ExamController();
const questionController = new QuestionController();

const visible = ref(false);
const submitting = ref(false);
const loadingSubjects = ref(false);
const editingExamId = ref<number | null>(null);
const editingExamOriginal = ref<Exam | null>(null);
const subjectItems = ref<Subject[]>([]);
const formRef = ref<InstanceType<typeof import('vuetify/components').VForm> | null>(null);

const form = ref({
  name: '',
  id_subject: null as number | null,
  unit_number: null as number | null,
  difficulty_level: '' as string,
  secure_mode: true,
  minimum_score: '7.00',
});

/** IDs de preguntas incluidas en el examen (sin orden semántico para el alumno). */
const linkedQuestionIds = ref<number[]>([]);
const questionTitles = ref<Record<number, string>>({});
const loadingQuestions = ref(false);
const addQuestionSelection = ref<number | null>(null);

const isEditing = computed(() => editingExamId.value !== null);

const availableQuestionItems = computed(() => {
  const taken = new Set(linkedQuestionIds.value);
  return Object.entries(questionTitles.value)
    .filter(([id]) => !taken.has(Number(id)))
    .map(([value, title]) => ({ value: Number(value), title }));
});

const unitItems = computed(() => {
  if (!form.value.id_subject) return [];
  const subject = subjectItems.value.find(s => s.id_subject === form.value.id_subject);
  if (!subject?.units) return [];
  return subject.units.map((u: SubjectUnit) => ({
    label: u.unit_name || `Unidad ${u.unit_number}`,
    value: u.unit_number,
  }));
});

const rules = {
  required: (v: unknown) => {
    if (v === null || v === undefined || v === '') return 'Campo requerido';
    return true;
  },
  scoreRange: (v: string) => {
    const num = Number.parseFloat(v);
    if (Number.isNaN(num)) return 'Debe ser un número válido';
    if (num < MIN_SCORE || num > MAX_SCORE) return `Debe estar entre ${MIN_SCORE} y ${MAX_SCORE}`;
    return true;
  },
};

async function loadBankQuestions() {
  if (!form.value.id_subject) {
    questionTitles.value = {};
    return;
  }
  loadingQuestions.value = true;
  try {
    const res = await questionController.getQuestions({
      pagination: { page: 1, limit: 500 },
      subjectId: form.value.id_subject,
    });
    const map: Record<number, string> = {};
    if (res.success && res.data?.results) {
      for (const q of res.data.results) {
        const t = q.text || '';
        map[q.id] = t.length > 120 ? `${t.slice(0, 117)}…` : t;
      }
    }
    questionTitles.value = map;
  } finally {
    loadingQuestions.value = false;
  }
}

async function loadLinkedQuestions(examId: number) {
  loadingQuestions.value = true;
  try {
    const res = await controller.getExamQuestions(examId);
    if (res.success && res.data?.questions?.length) {
      const sorted = res.data.questions.slice().sort((a, b) => a.id_exam_question - b.id_exam_question);
      linkedQuestionIds.value = sorted.map((q) => q.id_question);
      const merged = { ...questionTitles.value };
      for (const q of sorted) {
        const t = q.text || '';
        merged[q.id_question] = t.length > 120 ? `${t.slice(0, 117)}…` : t;
      }
      questionTitles.value = merged;
    } else {
      linkedQuestionIds.value = [];
    }
  } finally {
    loadingQuestions.value = false;
  }
}

function questionTitle(id: number) {
  return questionTitles.value[id] ?? `Pregunta #${id}`;
}

function onAddQuestion(id: number | null) {
  if (id == null) return;
  if (!linkedQuestionIds.value.includes(id)) {
    linkedQuestionIds.value.push(id);
  }
  addQuestionSelection.value = null;
}

function removeQuestion(idx: number) {
  linkedQuestionIds.value.splice(idx, 1);
}

async function onSubjectChange() {
  form.value.unit_number = null;
  linkedQuestionIds.value = [];
  await loadBankQuestions();
}

async function loadSubjects() {
  loadingSubjects.value = true;
  try {
    const res = await controller.getMySubjects();
    if (res.success && res.data) {
      subjectItems.value = res.data.results ?? [];
    }
  } finally {
    loadingSubjects.value = false;
  }
}

function resetForm() {
  form.value = {
    name: '',
    id_subject: null,
    unit_number: null,
    difficulty_level: '',
    secure_mode: true,
    minimum_score: '7.00',
  };
  editingExamId.value = null;
  editingExamOriginal.value = null;
  linkedQuestionIds.value = [];
  questionTitles.value = {};
  addQuestionSelection.value = null;
}

async function openCreate() {
  resetForm();
  visible.value = true;
  await loadSubjects();
}

async function openEdit(examId: number) {
  resetForm();
  editingExamId.value = examId;
  visible.value = true;

  await loadSubjects();

  try {
    const res = await controller.getExamById(examId);
    if (res.success && res.data) {
      const exam = res.data;
      editingExamOriginal.value = exam;
      form.value = {
        name: exam.name,
        id_subject: exam.id_subject,
        unit_number: exam.unit_number,
        difficulty_level: exam.difficulty_level,
        secure_mode: exam.secure_mode,
        minimum_score: exam.minimum_score,
      };
      await loadBankQuestions();
      await loadLinkedQuestions(examId);
    } else {
      emit('error', res.message || 'Error al cargar el examen');
      close();
    }
  } catch {
    emit('error', 'Error de conexión al cargar el examen');
    close();
  }
}

function close() {
  visible.value = false;
  resetForm();
}

async function handleSubmit() {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  submitting.value = true;
  try {
    const payload = {
      name: form.value.name.trim(),
      id_subject: form.value.id_subject as number,
      unit_number: form.value.unit_number as number,
      difficulty_level: form.value.difficulty_level as 'easy' | 'medium' | 'hard',
      secure_mode: form.value.secure_mode,
      minimum_score: Number.parseFloat(form.value.minimum_score).toFixed(2),
    };

    const res = isEditing.value && editingExamId.value
      ? await controller.updateExam(editingExamId.value, {
          ...payload,
          status: editingExamOriginal.value?.status ?? false,
        })
      : await controller.createExam(payload);

    if (!res.success) {
      emit('error', res.message || 'Error al guardar el examen');
      return;
    }

    const examPk = isEditing.value && editingExamId.value
      ? editingExamId.value
      : res.data?.id_exam;

    if (examPk != null) {
      const qres = await controller.putExamQuestions(examPk, {
        question_ids: [...linkedQuestionIds.value],
      });
      if (!qres.success) {
        emit('error', qres.message || 'No se pudieron guardar las preguntas vinculadas al examen');
        return;
      }
    }

    emit('saved');
    close();
  } catch {
    emit('error', 'Error de conexión al guardar el examen');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>
