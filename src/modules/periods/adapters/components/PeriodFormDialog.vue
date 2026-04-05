<template>
  <v-dialog :model-value="modelValue" max-width="560" persistent scrollable @update:model-value="$emit('update:modelValue', $event)">
    <v-card rounded="xl" class="modal-card">
      <div class="d-flex align-start justify-space-between pa-5 pb-2">
        <div class="d-flex align-center ga-3">
          <div class="modal-icon-wrap">
            <v-icon color="#0f766e">mdi-calendar-clock</v-icon>
          </div>
          <h2 class="text-h6 font-weight-bold">{{ isEdit ? 'Editar periodo' : 'Registrar periodo' }}</h2>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <v-divider />

      <v-card-text class="pa-5">
        <v-form ref="formRef" v-model="formValid" @submit.prevent="submit">
          <v-row>
            <v-col cols="12" md="6">
              <label class="field-label">Año</label>
              <v-text-field
                v-model.number="form.year"
                type="number"
                min="1900"
                max="2200"
                hide-details="auto"
                variant="solo-filled"
                rounded="lg"
                density="comfortable"
                :rules="[rules.year]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Nombre del periodo</label>
              <v-select
                v-model="form.period_name"
                :items="periodNameItems"
                hide-details="auto"
                variant="solo-filled"
                rounded="lg"
                density="comfortable"
                :rules="[rules.requiredSelect]"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Fecha de inicio</label>
              <v-menu v-model="menuStart" :close-on-content-click="false" location="bottom">
                <template #activator="{ props: menuProps }">
                  <v-text-field
                    v-bind="menuProps"
                    :model-value="displayStartDate"
                    readonly
                    placeholder="Selecciona fecha"
                    prepend-inner-icon="mdi-calendar"
                    hide-details="auto"
                    variant="solo-filled"
                    rounded="lg"
                    density="comfortable"
                    :disabled="!canPickDates"
                    :rules="[rules.requiredStartDate, rules.startInAllowedMonth]"
                  />
                </template>
                <v-date-picker
                  v-if="canPickDates"
                  :model-value="form.start_date || undefined"
                  :min="startRange.min"
                  :max="startRange.max"
                  :header-color="seaSidebarBg"
                  color="secondary"
                  show-adjacent-months
                  @update:model-value="onPickStart"
                />
              </v-menu>
              <p v-if="canPickDates" class="hint-text mt-1">
                Solo días de <strong>{{ startMonthLabel }}</strong> ({{ form.year }})
              </p>
            </v-col>
            <v-col cols="12" md="6">
              <label class="field-label">Fecha de fin</label>
              <v-menu v-model="menuEnd" :close-on-content-click="false" location="bottom">
                <template #activator="{ props: menuProps }">
                  <v-text-field
                    v-bind="menuProps"
                    :model-value="displayEndDate"
                    readonly
                    placeholder="Selecciona fecha"
                    prepend-inner-icon="mdi-calendar"
                    hide-details="auto"
                    variant="solo-filled"
                    rounded="lg"
                    density="comfortable"
                    :disabled="!canPickDates"
                    :rules="[rules.requiredEndDate, rules.endInAllowedMonth, rules.endAfterStart]"
                  />
                </template>
                <v-date-picker
                  v-if="canPickDates"
                  :model-value="form.end_date || undefined"
                  :min="endRange.min"
                  :max="endRange.max"
                  :header-color="seaSidebarBg"
                  color="secondary"
                  show-adjacent-months
                  @update:model-value="onPickEnd"
                />
              </v-menu>
              <p v-if="canPickDates" class="hint-text mt-1">
                Solo días de <strong>{{ endMonthLabel }}</strong> ({{ form.year }})
              </p>
            </v-col>
            <v-col cols="12">
              <div class="status-box d-flex align-center justify-space-between">
                <div>
                  <p class="status-title mb-0">Periodo activo</p>
                  <p class="status-subtitle">Disponible para operaciones académicas</p>
                </div>
                <v-switch v-model="form.status" hide-details color="success" density="comfortable" />
              </div>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-5 justify-end ga-2">
        <v-btn variant="outlined" rounded="lg" class="text-none" :disabled="saving" @click="close">Cancelar</v-btn>
        <v-btn variant="text" color="success" rounded="lg" class="text-none font-weight-bold" :loading="saving" @click="submit">
          {{ isEdit ? 'Guardar cambios' : 'Registrar periodo' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { SEA_SIDEBAR_BG } from '@/plugins/vuetify';
import { PERIOD_NAME_OPTIONS, type Period, type PeriodName } from '../../entities/period';
import type { CreatePeriodDto } from '../../entities/create-period.dto';

const seaSidebarBg = SEA_SIDEBAR_BG;

const props = defineProps<{
  modelValue: boolean;
  saving: boolean;
  mode: 'create' | 'edit';
  period: Period | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [payload: CreatePeriodDto];
}>();

const formRef = ref<{ validate: () => Promise<{ valid: boolean }> } | null>(null);
const formValid = ref(false);

const defaultForm = (): CreatePeriodDto => ({
  year: new Date().getFullYear(),
  period_name: 'Enero-Abril',
  start_date: '',
  end_date: '',
  status: true,
});

const form = ref<CreatePeriodDto>(defaultForm());

const menuStart = ref(false);
const menuEnd = ref(false);

const isEdit = computed(() => props.mode === 'edit');

const periodNameItems = [...PERIOD_NAME_OPTIONS];

/** Mes de inicio / fin permitido por nombre de periodo (mes 1–12). */
const PERIOD_START_MONTH: Record<PeriodName, number> = {
  'Enero-Abril': 1,
  'Mayo-Agosto': 5,
  'Septiembre-Diciembre': 9,
};
const PERIOD_END_MONTH: Record<PeriodName, number> = {
  'Enero-Abril': 4,
  'Mayo-Agosto': 8,
  'Septiembre-Diciembre': 12,
};

const MONTH_LABEL_ES: Record<number, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre',
};

function getMonthRange(
  year: number,
  period: PeriodName,
  field: 'start' | 'end',
): { min: string; max: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const m = field === 'start' ? PERIOD_START_MONTH[period] : PERIOD_END_MONTH[period];
  const last = new Date(year, m, 0).getDate();
  return {
    min: `${year}-${pad(m)}-01`,
    max: `${year}-${pad(m)}-${pad(last)}`,
  };
}

const canPickDates = computed(() => {
  const y = form.value.year;
  return typeof y === 'number' && !Number.isNaN(y) && y >= 1900 && y <= 2200 && !!form.value.period_name;
});

const startRange = computed(() => {
  const y = form.value.year;
  if (typeof y !== 'number' || y < 1900 || y > 2200) {
    return { min: '2000-01-01', max: '2000-01-31' };
  }
  return getMonthRange(y, form.value.period_name, 'start');
});

const endRange = computed(() => {
  const y = form.value.year;
  if (typeof y !== 'number' || y < 1900 || y > 2200) {
    return { min: '2000-04-01', max: '2000-04-30' };
  }
  return getMonthRange(y, form.value.period_name, 'end');
});

const startMonthLabel = computed(() => MONTH_LABEL_ES[PERIOD_START_MONTH[form.value.period_name]] ?? '');
const endMonthLabel = computed(() => MONTH_LABEL_ES[PERIOD_END_MONTH[form.value.period_name]] ?? '');

function formatDisplayDate(iso: string): string {
  if (!iso) return '';
  const parts = iso.split('-').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 3 || parts.some(Number.isNaN)) return iso;
  const [y, m, d] = parts;
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

const displayStartDate = computed(() => formatDisplayDate(form.value.start_date));
const displayEndDate = computed(() => formatDisplayDate(form.value.end_date));

function toIsoDateString(v: unknown): string {
  if (v == null || v === '') return '';
  if (typeof v === 'string') {
    return v.length >= 10 ? v.slice(0, 10) : v;
  }
  if (v instanceof Date) {
    const y = v.getFullYear();
    const m = String(v.getMonth() + 1).padStart(2, '0');
    const d = String(v.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

function onPickStart(v: unknown) {
  form.value.start_date = toIsoDateString(v);
  menuStart.value = false;
}

function onPickEnd(v: unknown) {
  form.value.end_date = toIsoDateString(v);
  menuEnd.value = false;
}

const rules = {
  requiredSelect: (v: PeriodName | '') => !!v || 'Selecciona un periodo',
  year: (v: number | null) => {
    if (v === null || v === undefined || Number.isNaN(Number(v))) return 'Ingresa un año válido';
    if (v < 1900 || v > 2200) return 'El año debe estar entre 1900 y 2200';
    return true;
  },
  /** El valor del campo es texto formateado; la validación debe usar ISO en `form`. */
  requiredStartDate: () => !!form.value.start_date || 'Este campo es obligatorio',
  requiredEndDate: () => !!form.value.end_date || 'Este campo es obligatorio',
  startInAllowedMonth: () => {
    const iso = form.value.start_date;
    if (!iso || !canPickDates.value) return true;
    const r = startRange.value;
    return (iso >= r.min && iso <= r.max) || `El inicio debe ser un día de ${startMonthLabel.value}`;
  },
  endInAllowedMonth: () => {
    const iso = form.value.end_date;
    if (!iso || !canPickDates.value) return true;
    const r = endRange.value;
    return (iso >= r.min && iso <= r.max) || `El fin debe ser un día de ${endMonthLabel.value}`;
  },
  endAfterStart: () => {
    const end = form.value.end_date;
    const start = form.value.start_date;
    if (!end || !start) return true;
    if (end <= start) return 'La fecha de fin debe ser posterior a la de inicio';
    return true;
  },
};

watch(
  () => [form.value.year, form.value.period_name] as const,
  () => {
    if (!canPickDates.value) return;
    const sr = startRange.value;
    const er = endRange.value;
    if (form.value.start_date && (form.value.start_date < sr.min || form.value.start_date > sr.max)) {
      form.value.start_date = '';
    }
    if (form.value.end_date && (form.value.end_date < er.min || form.value.end_date > er.max)) {
      form.value.end_date = '';
    }
  },
);

const resetFromProps = () => {
  if (props.mode === 'edit' && props.period) {
    form.value = {
      year: props.period.year,
      period_name: props.period.period_name,
      start_date: props.period.start_date,
      end_date: props.period.end_date,
      status: props.period.status,
    };
  } else {
    form.value = defaultForm();
  }
};

watch(
  () => [props.modelValue, props.mode, props.period] as const,
  ([open]) => {
    if (open) {
      resetFromProps();
    }
  },
);

const close = () => {
  emit('update:modelValue', false);
};

const submit = async () => {
  if (!formRef.value) return;
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  if (form.value.start_date && form.value.end_date && form.value.end_date <= form.value.start_date) {
    return;
  }
  emit('save', { ...form.value });
};
</script>

<style scoped>
.modal-card {
  border: 1px solid rgba(15, 118, 110, 0.12);
}
.modal-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(15, 118, 110, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.65);
  margin-bottom: 6px;
}
.status-box {
  padding: 12px 16px;
  border-radius: 12px;
  background: rgba(15, 118, 110, 0.06);
}
.status-title {
  font-weight: 600;
  font-size: 0.95rem;
}
.status-subtitle {
  font-size: 0.8rem;
  color: rgba(0, 0, 0, 0.55);
  margin: 0;
}
.hint-text {
  font-size: 0.75rem;
  color: rgba(0, 0, 0, 0.55);
  line-height: 1.3;
}
</style>
