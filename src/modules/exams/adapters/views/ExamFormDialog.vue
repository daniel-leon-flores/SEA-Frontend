<template>
  <v-dialog v-model="visible" max-width="600" persistent>
    <v-card style="position: relative;">
      <Loader :visible="loadingSubjects" :fullscreen="false" message="Cargando datos..." />
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start :color="isEditing ? 'warning' : 'success'">
          {{ isEditing ? 'mdi-pencil-outline' : 'mdi-plus-circle-outline' }}
        </v-icon>
        {{ isEditing ? 'Editar examen' : 'Crear examen' }}
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
          :color="isEditing ? 'warning' : 'success'"
          :loading="submitting"
          :disabled="submitting || loadingSubjects"
          @click="handleSubmit"
        >
          {{ isEditing ? 'Guardar cambios' : 'Crear examen' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Loader from '@/components/Loader.vue';
import { ExamController } from '../exam.controller';
import type { Subject, SubjectUnit } from '../../entities/assign-exam.dto';
import type { Exam } from '../../entities/exam';
import { DIFFICULTY_OPTIONS, MAX_SCORE, MIN_SCORE } from '../../entities/exam-constants';

const emit = defineEmits<{
  (e: 'saved'): void;
  (e: 'error', message: string): void;
}>();

const controller = new ExamController();

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

const isEditing = computed(() => editingExamId.value !== null);

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
    const num = parseFloat(v);
    if (isNaN(num)) return 'Debe ser un número válido';
    if (num < MIN_SCORE || num > MAX_SCORE) return `Debe estar entre ${MIN_SCORE} y ${MAX_SCORE}`;
    return true;
  },
};

function onSubjectChange() {
  form.value.unit_number = null;
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
      minimum_score: parseFloat(form.value.minimum_score).toFixed(2),
    };

    const res = isEditing.value && editingExamId.value
      ? await controller.updateExam(editingExamId.value, {
          ...payload,
          status: editingExamOriginal.value?.status ?? false,
        })
      : await controller.createExam(payload);

    if (res.success) {
      emit('saved');
      close();
    } else {
      emit('error', res.message || 'Error al guardar el examen');
    }
  } catch {
    emit('error', 'Error de conexión al guardar el examen');
  } finally {
    submitting.value = false;
  }
}

defineExpose({ openCreate, openEdit });
</script>
