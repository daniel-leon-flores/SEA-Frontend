<template>
  <v-dialog :model-value="modelValue" max-width="600" persistent @update:model-value="$emit('update:modelValue', $event)">
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start :color="isEdit ? 'primary' : 'success'">
          {{ isEdit ? 'mdi-pencil-outline' : 'mdi-book-plus-outline' }}
        </v-icon>
        {{ isEdit ? 'Editar materia' : 'Registrar materia' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
          <v-text-field
            v-model="form.name"
            label="Nombre de la materia"
            variant="outlined"
            density="comfortable"
            maxlength="150"
            counter
            :rules="[rules.required, rules.maxLen, rules.noHtml]"
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

          <div class="rounded-lg pa-3 mt-2" style="background: rgba(6, 50, 68, 0.06)">
            <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-2">
              <div>
                <div class="text-body-2 font-weight-medium">Unidades</div>
                <div class="text-caption text-medium-emphasis">
                  {{ unitsSectionSubtitle }}
                </div>
              </div>
              <v-btn
                color="primary"
                variant="tonal"
                size="small"
                class="text-none"
                prepend-icon="mdi-plus"
                :disabled="saving || unitsDraft.length >= 9"
                @click="addUnitRow"
              >
                Agregar unidad
              </v-btn>
            </div>

            <p v-if="unitsDraft.length === 0" class="text-body-2 text-medium-emphasis mb-0">
              No hay unidades. Usa «Agregar unidad» para registrar cada una con nombre y número, o guarda sin unidades
              si aún no aplica.
            </p>

            <div v-for="row in unitsDraft" :key="row.clientId" class="d-flex flex-wrap align-start ga-2 mb-2">
              <v-text-field
                v-model="row.unit_name"
                label="Nombre de la unidad"
                variant="outlined"
                density="comfortable"
                maxlength="150"
                hide-details="auto"
                class="flex-grow-1"
                style="min-width: 180px"
                :disabled="saving"
                :rules="[rules.required, rules.maxLen, rules.noHtml]"
                @update:model-value="clearFieldError('units')"
              />
              <v-text-field
                :model-value="row.unit_number"
                label="Número"
                type="number"
                min="1"
                max="9"
                step="1"
                variant="outlined"
                density="comfortable"
                maxlength="1"
                hide-details="auto"
                style="max-width: 110px"
                :disabled="saving"
                @keydown="preventInvalidNumberChars($event)"
                @update:model-value="(v: unknown) => onUnitNumberInput(row.clientId, v)"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                :disabled="saving"
                :aria-label="'Eliminar unidad'"
                @click="removeUnitRow(row.clientId)"
              />
            </div>
            <p v-if="fieldErrors.units?.length" class="text-caption text-error mt-1">
              {{ fieldErrors.units[0] }}
            </p>
          </div>

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
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" :disabled="saving" @click="close">Cancelar</v-btn>
        <v-btn
          variant="elevated"
          :color="isEdit ? 'primary' : 'success'"
          :loading="saving"
          :disabled="!formValid || saving"
          @click="submit"
        >
          {{ isEdit ? 'Guardar cambios' : 'Registrar materia' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { Subject } from '../../entities/subject';
import type { CreateSubjectDto, CreateSubjectUnitDto } from '../../entities/create-subject.dto';
import type { UpdateSubjectDto, UpdateSubjectUnitDto } from '../../entities/update-subject.dto';
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

const unitsSectionSubtitle = computed(() =>
  isEdit.value
    ? 'Máximo 9. Los números deben ser únicos (1–9). Si hay exámenes asociados a un número, no podrás eliminarlo ni cambiar ese número.'
    : 'Máximo 9. Los números deben ser únicos (1–9). Agrega cada unidad con nombre y número.',
);

const levelItems = Array.from({ length: 11 }, (_, i) => ({
  title: `Nivel ${i + 1}`,
  value: i + 1,
}));

type UnitDraftRow = {
  clientId: string;
  id_unit?: number;
  unit_name: string;
  unit_number: number;
};

const unitsDraft = ref<UnitDraftRow[]>([]);

const form = ref({
  name: '',
  level_number: 1 as number,
  status: true,
});

const rules = {
  required: (v: unknown) => (v !== undefined && v !== null && String(v).trim() !== '') || 'Campo requerido',
  maxLen: (v: string) => !v || v.length <= 150 || 'Máximo 150 caracteres',
  minLevel: (v: number) => (v >= 1) || 'El nivel debe ser al menos 1',
  noHtml: (v: string) => !v || !/<[^<>]*>/.test(v) || 'No se permiten etiquetas HTML',
};

function randomClientId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `u-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function resetForm() {
  form.value = {
    name: '',
    level_number: 1,
    status: true,
  };
  unitsDraft.value = [];
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
    status: s.status,
  };
  unitsDraft.value = [...(s.units ?? [])]
    .sort((a, b) => a.unit_number - b.unit_number)
    .map((u) => ({
      clientId: `existing-${u.id_unit}`,
      id_unit: u.id_unit,
      unit_name: u.unit_name,
      unit_number: u.unit_number,
    }));
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

function preventInvalidNumberChars(event: KeyboardEvent) {
  if (['e', 'E', '+', '-', '.', ','].includes(event.key)) {
    event.preventDefault();
  }
}

function nextAvailableUnitNumber(): number | null {
  const used = new Set(unitsDraft.value.map((u) => u.unit_number));
  for (let i = 1; i <= 9; i += 1) {
    if (!used.has(i)) return i;
  }
  return null;
}

function addUnitRow() {
  if (unitsDraft.value.length >= 9) return;
  const n = nextAvailableUnitNumber();
  if (n === null) return;
  unitsDraft.value.push({
    clientId: randomClientId(),
    unit_name: `Unidad ${n}`,
    unit_number: n,
  });
}

function removeUnitRow(clientId: string) {
  unitsDraft.value = unitsDraft.value.filter((r) => r.clientId !== clientId);
  clearFieldError('units');
}

function onUnitNumberInput(clientId: string, raw: unknown) {
  const row = unitsDraft.value.find((r) => r.clientId === clientId);
  if (!row) return;
  const cleaned = String(raw ?? '').replaceAll(/\D/g, '');
  const parsed = cleaned ? Number.parseInt(cleaned, 10) : Number.NaN;
  const clamped = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 1), 9) : row.unit_number;
  row.unit_number = clamped;
  clearFieldError('units');
}

function validateUnitsDraft(): string | null {
  if (unitsDraft.value.length > 9) return 'No puede haber más de 9 unidades.';
  const names = unitsDraft.value.map((u) => u.unit_name.trim());
  if (names.some((n) => !n)) return 'Cada unidad debe tener nombre.';
  const nums = unitsDraft.value.map((u) => u.unit_number);
  if (nums.some((n) => !Number.isInteger(n) || n < 1 || n > 9)) {
    return 'Cada número de unidad debe ser un entero entre 1 y 9.';
  }
  if (new Set(nums).size !== nums.length) return 'Los números de unidad deben ser únicos.';
  return null;
}

function buildUpdateUnitsPayload(): UpdateSubjectUnitDto[] {
  return unitsDraft.value.map((r) => {
    const item: UpdateSubjectUnitDto = {
      unit_name: r.unit_name.trim(),
      unit_number: r.unit_number,
    };
    if (r.id_unit != null) item.id_unit = r.id_unit;
    return item;
  });
}

function buildCreateUnitsPayload(): CreateSubjectUnitDto[] {
  return unitsDraft.value.map((r) => ({
    unit_name: r.unit_name.trim(),
    unit_number: r.unit_number,
  }));
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

  const unitsError = validateUnitsDraft();
  if (unitsError) {
    fieldErrors.value = { units: [unitsError] };
    return;
  }

  saving.value = true;
  fieldErrors.value = {};
  const controller = new SubjectController();

  try {
    if (isEdit.value && props.subject) {
      const dto: UpdateSubjectDto = {
        name: form.value.name.trim(),
        level_number: form.value.level_number,
        status: form.value.status,
        units: buildUpdateUnitsPayload(),
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
        units: buildCreateUnitsPayload(),
      };
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
