<template>
  <v-dialog :model-value="modelValue" max-width="560" persistent scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center pa-5 pb-2">
        <v-icon :color="isEdit ? 'warning' : 'success'" class="mr-2">
          {{ isEdit ? 'mdi-pencil-outline' : 'mdi-book-plus-outline' }}
        </v-icon>
        <span class="text-h6">{{ isEdit ? 'Editar materia' : 'Registrar materia' }}</span>
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" :disabled="saving" @click="close" />
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-5">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
          <v-text-field
            v-model="form.name"
            label="Nombre de la materia"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.maxLen]"
            :disabled="saving"
            :error-messages="fieldErrors.name"
            @update:model-value="clearFieldError('name')"
          />

          <v-select
            v-model.number="form.level_number"
            label="Nivel académico"
            :items="levelItems"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required, rules.minLevel]"
            :disabled="saving"
            :error-messages="fieldErrors.level_number"
            @update:model-value="clearFieldError('level_number')"
          />

          <v-text-field
            v-if="!isEdit"
            v-model.number="form.number_of_units"
            label="Número de unidades (opcional)"
            type="number"
            min="0"
            max="50"
            hint="Si indicas un número, se crearán unidades numeradas automáticamente."
            persistent-hint
            variant="outlined"
            density="comfortable"
            :disabled="saving"
            :rules="[rules.nonNegativeUnits]"
            :error-messages="fieldErrors.number_of_units"
            @update:model-value="clearFieldError('number_of_units')"
          />

          <div class="d-flex align-center justify-space-between rounded-lg pa-3 mt-2" style="background: rgba(6, 50, 68, 0.06)">
            <div>
              <div class="text-body-2 font-weight-medium">Estado activo</div>
              <div class="text-caption text-medium-emphasis">La materia visible para exámenes y asignaciones</div>
            </div>
            <v-switch v-model="form.status" color="success" hide-details :disabled="saving" />
          </div>
        </v-form>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4 justify-end ga-2">
        <v-btn variant="text" rounded="lg" :disabled="saving" @click="close">Cancelar</v-btn>
        <v-btn color="success" rounded="lg" :loading="saving" @click="submit">
          {{ isEdit ? 'Guardar cambios' : 'Registrar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Subject } from '../../entities/subject';
import type { CreateSubjectDto } from '../../entities/create-subject.dto';
import type { UpdateSubjectDto } from '../../entities/update-subject.dto';
import { SubjectController } from '../subject.controller';

const props = defineProps<{
  modelValue: boolean;
  /** When set, dialog is in edit mode */
  subject: Subject | null;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'saved'): void;
}>();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const formValid = ref(false);
const saving = ref(false);
const fieldErrors = ref<Record<string, string[]>>({});

const isEdit = computed(() => !!props.subject);

const levelItems = Array.from({ length: 11 }, (_, i) => ({
  title: `Nivel ${i + 1}`,
  value: i + 1,
}));

const form = ref({
  name: '',
  level_number: 1 as number,
  number_of_units: 0 as number,
  status: true,
});

const rules = {
  required: (v: unknown) => (v !== undefined && v !== null && String(v).trim() !== '') || 'Campo requerido',
  maxLen: (v: string) => !v || v.length <= 150 || 'Máximo 150 caracteres',
  minLevel: (v: number) => (v >= 1) || 'El nivel debe ser al menos 1',
  nonNegativeUnits: (v: number) => v === undefined || v === null || (v >= 0 && v <= 50) || 'Entre 0 y 50',
};

function resetForm() {
  form.value = {
    name: '',
    level_number: 1,
    number_of_units: 0,
    status: true,
  };
  fieldErrors.value = {};
}

function applySubject(s: Subject | null) {
  if (!s) {
    resetForm();
    return;
  }
  form.value = {
    name: s.name,
    level_number: s.level_number,
    number_of_units: 0,
    status: s.status,
  };
  fieldErrors.value = {};
}

watch(
  () => [props.modelValue, props.subject] as const,
  ([open]) => {
    if (open) {
      applySubject(props.subject);
    } else {
      resetForm();
    }
  },
);

function close() {
  emit('update:modelValue', false);
}

function clearFieldError(key: string) {
  const next = { ...fieldErrors.value };
  delete next[key];
  fieldErrors.value = next;
}

function mapServerErrors(details: unknown): void {
  const out: Record<string, string[]> = {};
  if (details && typeof details === 'object') {
    for (const [k, v] of Object.entries(details as Record<string, unknown>)) {
      if (Array.isArray(v)) {
        out[k] = v.map(String);
      } else if (typeof v === 'string') {
        out[k] = [v];
      }
    }
  }
  fieldErrors.value = out;
}

async function submit() {
  const result = await formRef.value?.validate();
  if (!result?.valid) return;

  saving.value = true;
  fieldErrors.value = {};
  const controller = new SubjectController();

  try {
    if (isEdit.value && props.subject) {
      const dto: UpdateSubjectDto = {
        name: form.value.name.trim(),
        level_number: form.value.level_number,
        status: form.value.status,
      };
      const res = await controller.updateSubject(props.subject.id_subject, dto);
      if (res.success) {
        emit('saved');
        close();
      } else {
        const r = res as { errors?: unknown; error?: { details?: unknown } };
        mapServerErrors(r.errors ?? r.error?.details);
      }
    } else {
      const dto: CreateSubjectDto = {
        name: form.value.name.trim(),
        level_number: form.value.level_number,
        status: form.value.status,
      };
      const n = Number(form.value.number_of_units);
      if (!Number.isNaN(n) && n > 0) {
        dto.number_of_units = n;
      }
      const res = await controller.createSubject(dto);
      if (res.success) {
        emit('saved');
        close();
      } else {
        const r = res as { errors?: unknown; error?: { details?: unknown } };
        mapServerErrors(r.errors ?? r.error?.details);
      }
    }
  } finally {
    saving.value = false;
  }
}
</script>
