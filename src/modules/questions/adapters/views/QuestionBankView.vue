<template>
  <v-container fluid class="pa-8">
    <Loader :visible="loading" message="Cargando preguntas..." />

    <div class="d-flex align-start justify-space-between mb-6 flex-wrap ga-4">
      <div>
        <h1 class="page-title text-h4 font-weight-bold mb-2">Banco de Preguntas</h1>
        <p class="page-subtitle text-body-1 text-grey-darken-1">
          Administra el banco de preguntas para los exámenes
        </p>
      </div>
      <div class="d-flex flex-wrap ga-2">
        <v-btn color="success" rounded="lg" class="text-none" prepend-icon="mdi-plus" @click="openCreate">
          Nueva pregunta
        </v-btn>
        <v-btn color="primary" variant="tonal" rounded="lg" class="text-none" prepend-icon="mdi-upload" @click="uploadDialog = true">
          Cargar Excel
        </v-btn>
        <v-btn color="secondary" variant="tonal" rounded="lg" class="text-none" prepend-icon="mdi-download" :loading="downloadingTemplate" @click="downloadTemplate">
          Descargar plantilla
        </v-btn>
      </div>
    </div>

    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="filterSubject"
          label="Materia"
          :items="subjectItems"
          item-title="title"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="resetPageAndFetch"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="filterType"
          label="Tipo"
          :items="typeFilterItems"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="resetPageAndFetch"
        />
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-select
          v-model="filterDifficulty"
          label="Dificultad"
          :items="DIFFICULTY_OPTIONS"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="resetPageAndFetch"
        />
      </v-col>
    </v-row>

    <v-card elevation="2" class="mb-4">
      <PaginatedTable
        :columns="columns"
        :data="questions"
        :total-records="pagination.count"
        :total-pages="pagination.totalPages"
        :current-page-prop="pagination.currentPage"
        :page-size-prop="pagination.pageSize"
        :loading="tableLoading"
      >
        <template #cell-text="{ row }">
          <span class="text-body-2 text-left d-inline-block text-truncate" style="max-width: 320px">{{ row.text }}</span>
        </template>
        <template #cell-question_type="{ row }">
          {{ labelQuestionType(row.question_type) }}
        </template>
        <template #cell-difficulty="{ row }">
          <v-chip size="small" :color="difficultyColor(row.difficulty)" variant="tonal">
            {{ labelDifficulty(row.difficulty) }}
          </v-chip>
        </template>
        <template #cell-bloom_level="{ row }">
          {{ labelBloom(row.bloom_level) }}
        </template>
        <template #cell-actions="{ row }">
          <v-btn icon size="small" variant="text" @click="openEdit(row)"><v-icon>mdi-pencil</v-icon></v-btn>
          <v-btn icon size="small" variant="text" color="error" @click="confirmDelete(row)"><v-icon>mdi-delete</v-icon></v-btn>
        </template>
      </PaginatedTable>
    </v-card>

    <v-row v-if="!tableLoading && pagination.count > 0" class="align-center mt-2">
      <v-col cols="12" md="3">
        <v-select
          label="Registros por página"
          v-model="pagination.pageSize"
          :items="PAGE_SIZE_OPTIONS"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="handlePageSizeChange"
        />
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-pagination
          v-model="pagination.currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          rounded="circle"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </v-col>
      <v-col cols="12" md="3" class="text-end">
        <p class="text-caption text-grey-darken-1">{{ paginationInfo }}</p>
      </v-col>
    </v-row>

    <!-- Form dialog -->
    <v-dialog v-model="formDialog" max-width="720" scrollable persistent>
      <v-card>
        <v-card-title>{{ editingId ? 'Editar pregunta' : 'Nueva pregunta' }}</v-card-title>
        <v-card-text>
          <v-alert
            v-if="formErrors.non_field.length"
            type="error"
            variant="tonal"
            density="compact"
            class="mb-3"
            rounded="lg"
          >
            <ul class="pl-4 mb-0">
              <li v-for="(msg, i) in formErrors.non_field" :key="i">{{ msg }}</li>
            </ul>
          </v-alert>

          <v-select
            v-model="form.id_subject"
            label="Materia *"
            :items="subjectItems"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            :error-messages="formErrors.id_subject"
            @update:model-value="clearFieldError('id_subject')"
          />
          <v-select
            v-model="form.question_type"
            label="Tipo *"
            :items="QUESTION_TYPE_OPTIONS"
            item-title="label"
            item-value="value"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            :error-messages="formErrors.question_type"
            @update:model-value="onTypeChange"
          />
          <v-textarea
            v-model="form.text"
            label="Enunciado *"
            variant="outlined"
            rows="3"
            class="mb-1"
            :error-messages="formErrors.text"
            @update:model-value="clearFieldError('text')"
          />
          <v-row>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.difficulty"
                label="Dificultad *"
                :items="DIFFICULTY_OPTIONS"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.difficulty"
                @update:model-value="clearFieldError('difficulty')"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-select
                v-model="form.bloom_level"
                label="Bloom *"
                :items="BLOOM_OPTIONS"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.bloom_level"
                @update:model-value="clearFieldError('bloom_level')"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="form.points"
                label="Puntos"
                type="number"
                min="1"
                variant="outlined"
                density="comfortable"
                :error-messages="formErrors.points"
                @update:model-value="clearFieldError('points')"
              />
            </v-col>
          </v-row>
          <v-text-field
            v-model="form.image_url"
            label="URL de imagen (opcional)"
            variant="outlined"
            density="comfortable"
            class="mb-1"
            :error-messages="formErrors.image_url"
            @update:model-value="clearFieldError('image_url')"
          />

          <template v-if="form.question_type === 'MULTIPLE_CHOICE'">
            <p class="text-subtitle-2 mb-1">Opciones (máx. 4)</p>
            <p class="text-caption text-medium-emphasis mb-2">Seleccione una sola respuesta correcta.</p>
            <v-alert
              v-if="formErrors.answer_options.length"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-2"
              rounded="lg"
            >
              <ul class="pl-4 mb-0">
                <li v-for="(msg, i) in formErrors.answer_options" :key="i">{{ msg }}</li>
              </ul>
            </v-alert>
            <v-radio-group
              :model-value="singleCorrectIndex"
              density="compact"
              hide-details="auto"
              class="mb-2"
              @update:model-value="setSingleCorrectAnswer"
            >
              <div
                v-for="(opt, idx) in form.answer_options"
                :key="`mc-${idx}`"
                class="d-flex align-center ga-2 mb-2 flex-wrap"
              >
                <v-text-field
                  v-model="opt.text"
                  :label="`Opción ${idx + 1}`"
                  variant="outlined"
                  density="compact"
                  class="flex-grow-1"
                  style="min-width: 200px"
                  :error-messages="formErrors.optionRows[idx]"
                  @update:model-value="clearOptionRowError(idx)"
                />
                <v-radio :value="idx" label="Correcta" hide-details density="compact" />
              </div>
            </v-radio-group>
          </template>

          <template v-else-if="form.question_type === 'MULTIPLE_SELECTION'">
            <p class="text-subtitle-2 mb-1">Opciones (máx. 4)</p>
            <p class="text-caption text-medium-emphasis mb-2">Marque todas las respuestas correctas.</p>
            <v-alert
              v-if="formErrors.answer_options.length"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-2"
              rounded="lg"
            >
              <ul class="pl-4 mb-0">
                <li v-for="(msg, i) in formErrors.answer_options" :key="i">{{ msg }}</li>
              </ul>
            </v-alert>
            <div v-for="(opt, idx) in form.answer_options" :key="`ms-${idx}`" class="d-flex align-center ga-2 mb-2">
              <v-text-field
                v-model="opt.text"
                :label="`Opción ${idx + 1}`"
                variant="outlined"
                density="compact"
                :error-messages="formErrors.optionRows[idx]"
                @update:model-value="clearOptionRowError(idx)"
              />
              <v-checkbox v-model="opt.is_correct" label="Correcta" hide-details density="compact" />
            </div>
          </template>

          <template v-if="form.question_type === 'CODE'">
            <v-text-field
              v-model="codeLanguage"
              label="Lenguaje"
              variant="outlined"
              density="comfortable"
              class="mb-1"
              :error-messages="formErrors.code_question"
              @update:model-value="clearFieldError('code_question')"
            />
            <v-textarea
              v-model="codeTestsRaw"
              label="Casos de prueba (una línea por aserción o bloque)"
              variant="outlined"
              rows="6"
              hint="Se envían como lista de cadenas (test_cases)"
              :error-messages="formErrors.code_tests"
              @update:model-value="clearFieldError('code_tests')"
            />
          </template>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="formDialog = false">Cancelar</v-btn>
          <v-btn color="primary" :loading="saving" @click="saveQuestion">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Upload -->
    <v-dialog v-model="uploadDialog" max-width="520">
      <v-card>
        <v-card-title>Cargar Excel</v-card-title>
        <v-card-text>
          <v-file-input v-model="uploadFile" label="Archivo .xlsx" accept=".xlsx" variant="outlined" prepend-icon="mdi-file-excel" />
          <p class="text-body-2 text-medium-emphasis mt-2 mb-0">
            Use la hoja <strong>Plantilla</strong> para las filas de preguntas. La plantilla incluye <strong>Materias</strong> y listas
            para tipo, dificultad y taxonomía de Bloom. Incluye cuatro filas de ejemplo (un tipo cada una); bórrelas o edítelas antes de subir si no desea importarlas.
          </p>
          <v-alert v-if="uploadReport" type="info" variant="tonal" class="mt-3">
            <div>Filas: {{ uploadReport.total_rows }} · Creadas: {{ uploadReport.created }}</div>
            <div v-if="uploadReport.errors?.length" class="mt-2 text-error">
              Errores:
              <ul class="pl-4">
                <li v-for="(e, i) in uploadReport.errors" :key="i">Fila {{ e.row }}: {{ e.error }}</li>
              </ul>
            </div>
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="uploadDialog = false">Cerrar</v-btn>
          <v-btn color="primary" :loading="uploading" :disabled="!uploadFile" @click="runUpload">Subir</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialog" />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script lang="ts">
import PaginatedTable from '@/components/PaginatedTable.vue';
import Loader from '@/components/Loader.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import { QuestionController } from '../question.controller';
import { subjectService } from '@/modules/subjects/adapters/subject.service';
import type { ApiResponse } from '@/kernel/types';
import type { QuestionBank } from '../../entities/question-bank';
import type { CreateQuestionDto } from '../../entities/create-question.dto';
import {
  QUESTION_TYPE_OPTIONS,
  DIFFICULTY_OPTIONS,
  BLOOM_OPTIONS,
  PAGE_SIZE_OPTIONS,
  labelQuestionType,
  labelDifficulty,
  labelBloom,
} from '../../entities/question-constants';

const controller = new QuestionController();

type Opt = { text: string; is_correct: boolean };

function emptyOptions(): Opt[] {
  return [
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
    { text: '', is_correct: false },
  ];
}

type FormErrorsState = {
  id_subject: string[];
  question_type: string[];
  text: string[];
  difficulty: string[];
  bloom_level: string[];
  points: string[];
  image_url: string[];
  answer_options: string[];
  optionRows: string[][];
  code_question: string[];
  code_tests: string[];
  non_field: string[];
};

function emptyFormErrors(): FormErrorsState {
  return {
    id_subject: [],
    question_type: [],
    text: [],
    difficulty: [],
    bloom_level: [],
    points: [],
    image_url: [],
    answer_options: [],
    optionRows: [[], [], [], []],
    code_question: [],
    code_tests: [],
    non_field: [],
  };
}

/** Claves meta del envelope; el resto puede ser error DRF por campo en el cuerpo plano. */
const API_ENVELOPE_KEYS = new Set([
  'success',
  'message',
  'code',
  'timestamp',
  'error',
  'data',
  'errors',
]);

/**
 * Obtiene el dict de errores por campo: `res.errors`, `error.details`, o claves de primer nivel
 * (p. ej. `{ image_url: ["..."] }` cuando DRF no envía la clave `errors`).
 */
function extractFieldErrorsFromApiResponse(res: ApiResponse): Record<string, unknown> | undefined {
  if (res.errors && typeof res.errors === 'object' && !Array.isArray(res.errors)) {
    return res.errors as Record<string, unknown>;
  }
  const details = res.error?.details;
  if (details && typeof details === 'object' && !Array.isArray(details)) {
    return details as Record<string, unknown>;
  }
  const r = res as unknown as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(r)) {
    if (API_ENVELOPE_KEYS.has(key)) continue;
    const v = r[key];
    if (v === undefined || v === null) continue;
    out[key] = v;
  }
  return Object.keys(out).length ? out : undefined;
}

export default {
  name: 'QuestionBankView',
  components: { PaginatedTable, Loader, ConfirmDialog },
  data() {
    return {
      loading: false,
      tableLoading: false,
      downloadingTemplate: false,
      saving: false,
      uploading: false,
      questions: [] as QuestionBank[],
      subjectItems: [] as { title: string; value: number }[],
      filterSubject: null as number | null,
      filterType: null as string | null,
      filterDifficulty: null as string | null,
      pagination: {
        count: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10,
      },
      columns: [
        { label: 'Texto', key: 'text', minWidth: '280px' },
        { label: 'Tipo', key: 'question_type', minWidth: '160px' },
        { label: 'Dificultad', key: 'difficulty', minWidth: '120px' },
        { label: 'Bloom', key: 'bloom_level', minWidth: '120px' },
        { label: 'Acciones', key: 'actions', minWidth: '100px' },
      ],
      formDialog: false,
      editingId: null as number | null,
      form: {
        id_subject: null as number | null,
        question_type: 'MULTIPLE_CHOICE',
        text: '',
        difficulty: 'medium',
        bloom_level: 'remember',
        points: 1,
        image_url: '',
        answer_options: emptyOptions(),
      } as {
        id_subject: number | null;
        question_type: string;
        text: string;
        difficulty: string;
        bloom_level: string;
        points: number;
        image_url: string;
        answer_options: Opt[];
      },
      codeLanguage: 'python',
      codeTestsRaw: '',
      uploadDialog: false,
      uploadFile: null as File[] | File | null,
      uploadReport: null as { total_rows: number; created: number; errors: { row: number; error: string }[] } | null,
      snackbar: { show: false, message: '', color: 'success' },
      formErrors: emptyFormErrors(),
      QUESTION_TYPE_OPTIONS,
      DIFFICULTY_OPTIONS,
      BLOOM_OPTIONS,
      PAGE_SIZE_OPTIONS,
    };
  },
  computed: {
    /** Índice de la opción marcada como correcta (solo MULTIPLE_CHOICE). */
    singleCorrectIndex(): number | null {
      const idx = this.form.answer_options.findIndex((o) => o.is_correct);
      return idx >= 0 ? idx : null;
    },
    typeFilterItems(): { title: string; value: string }[] {
      return QUESTION_TYPE_OPTIONS.map((o) => ({ title: o.label, value: o.value }));
    },
    paginationInfo(): string {
      if (this.pagination.count === 0) return '0 registros';
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1;
      const end = Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.count);
      return `Mostrando ${start}-${end} de ${this.pagination.count} registros`;
    },
  },
  watch: {
    formDialog(val: boolean) {
      if (!val) {
        this.clearFormErrors();
      }
    },
  },
  mounted() {
    this.loading = true;
    this.loadSubjects();
    this.fetchQuestions();
  },
  methods: {
    labelQuestionType,
    labelDifficulty,
    labelBloom,
    difficultyColor(d: string): string {
      if (d === 'easy') return 'success';
      if (d === 'hard') return 'error';
      return 'warning';
    },
    showSnackbar(message: string, color = 'success') {
      this.snackbar = { show: true, message, color };
    },

    clearFormErrors() {
      this.formErrors = emptyFormErrors();
    },

    clearFieldError(key: keyof FormErrorsState) {
      const scalar: (keyof FormErrorsState)[] = [
        'id_subject',
        'question_type',
        'text',
        'difficulty',
        'bloom_level',
        'points',
        'image_url',
        'answer_options',
        'code_question',
        'code_tests',
      ];
      if (scalar.includes(key)) {
        (this.formErrors as Record<string, string[]>)[key as string] = [];
      }
    },

    clearOptionRowError(idx: number) {
      if (idx >= 0 && idx < 4) {
        this.formErrors.optionRows[idx] = [];
      }
    },

    normalizeMessages(val: unknown): string[] {
      if (val == null || val === '') return [];
      if (typeof val === 'string') return [val];
      if (Array.isArray(val)) {
        return val.flatMap((x) => this.normalizeMessages(x));
      }
      if (typeof val === 'object') {
        return Object.values(val as Record<string, unknown>).flatMap((x) => this.normalizeMessages(x));
      }
      return [];
    },

    /** Mapea errores DRF (por campo) a nuestro estado de formulario. */
    applyServerErrors(raw: unknown) {
      this.clearFormErrors();
      if (!raw || typeof raw !== 'object') return;
      const e = raw as Record<string, unknown>;
      const set = (key: keyof FormErrorsState, val: unknown) => {
        const msgs = this.normalizeMessages(val);
        if (msgs.length) (this.formErrors[key] as string[]) = msgs;
      };

      set('id_subject', e.id_subject);
      set('text', e.text ?? e.statement);
      set('question_type', e.question_type);
      set('difficulty', e.difficulty);
      set('bloom_level', e.bloom_level);
      set('points', e.points);
      set('image_url', e.image_url);

      set('non_field', e.non_field_errors ?? e.detail);

      const aq = e.answer_options;
      if (Array.isArray(aq)) {
        aq.forEach((row, idx) => {
          if (idx >= 4) return;
          if (row && typeof row === 'object') {
            const rowObj = row as Record<string, unknown>;
            const merged = [
              ...this.normalizeMessages(rowObj.text),
              ...this.normalizeMessages(rowObj.non_field_errors),
            ];
            if (merged.length) this.formErrors.optionRows[idx] = merged;
          } else if (row != null) {
            const msgs = this.normalizeMessages(row);
            if (msgs.length) this.formErrors.optionRows[idx] = msgs;
          }
        });
      } else if (aq != null) {
        set('answer_options', aq);
      }

      const cq = e.code_question;
      if (cq && typeof cq === 'object') {
        const c = cq as Record<string, unknown>;
        set('code_tests', c.test_cases);
        set('code_question', c.language ?? c.non_field_errors);
      } else if (cq != null) {
        set('code_question', cq);
      }
    },

    hasFormErrors(): boolean {
      const fe = this.formErrors;
      if (fe.non_field.length) return true;
      const scalarKeys: (keyof FormErrorsState)[] = [
        'id_subject',
        'question_type',
        'text',
        'difficulty',
        'bloom_level',
        'points',
        'image_url',
        'answer_options',
        'code_question',
        'code_tests',
      ];
      for (const k of scalarKeys) {
        if ((fe[k] as string[]).length) return true;
      }
      return fe.optionRows.some((r) => r.length > 0);
    },

    /** Validación en cliente antes de enviar al API. */
    clientValidate(): boolean {
      this.clearFormErrors();
      let ok = true;
      const fail = (key: keyof FormErrorsState, msg: string) => {
        if (key === 'optionRows') return;
        (this.formErrors[key] as string[]).push(msg);
        ok = false;
      };

      if (!this.form.id_subject) {
        fail('id_subject', 'Seleccione una materia.');
      }
      if (!this.form.question_type) {
        fail('question_type', 'Seleccione un tipo de pregunta.');
      }
      const t = this.form.text?.trim() ?? '';
      if (!t) {
        fail('text', 'El enunciado es obligatorio.');
      }
      if (!this.form.difficulty) {
        fail('difficulty', 'Seleccione la dificultad.');
      }
      if (!this.form.bloom_level) {
        fail('bloom_level', 'Seleccione el nivel Bloom.');
      }
      const pts = this.form.points;
      if (pts == null || Number.isNaN(Number(pts)) || Number(pts) < 1) {
        fail('points', 'Los puntos deben ser un número mayor o igual a 1.');
      }

      this.validateAnswerOptions(fail);
      this.validateCodeTests(fail);

      return ok;
    },
    validateAnswerOptions(fail: (key: keyof FormErrorsState, msg: string) => void) {
      const qtype = this.form.question_type;
      if (qtype !== 'MULTIPLE_CHOICE' && qtype !== 'MULTIPLE_SELECTION') return;

      const filled = this.form.answer_options.filter((o) => o.text.trim());
      if (filled.length < 2) {
        fail('answer_options', 'Ingrese al menos 2 opciones con texto.');
      }
      if (filled.length > 4) {
        fail('answer_options', 'Como máximo puede haber 4 opciones.');
      }
      if (qtype === 'MULTIPLE_SELECTION' && filled.length >= 2 && !filled.some((o) => o.is_correct)) {
        fail('answer_options', 'Marque al menos una respuesta correcta.');
      }
    },
    validateCodeTests(fail: (key: keyof FormErrorsState, msg: string) => void) {
      if (this.form.question_type !== 'CODE') return;

      const lines = this.codeTestsRaw
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);
      if (!lines.length) {
        fail('code_tests', 'Indique al menos un caso de prueba (test_cases).');
      }
    },
    async loadSubjects() {
      const res = await subjectService.list({ page: 1, page_size: 200, status: true });
      if (res.success && res.data?.results) {
        this.subjectItems = res.data.results.map((s) => ({
          title: s.name,
          value: s.id_subject,
        }));
      }
    },
    async fetchQuestions() {
      this.tableLoading = true;
      try {
        const res = await controller.getQuestions({
          pagination: {
            page: this.pagination.currentPage,
            limit: this.pagination.pageSize,
          },
          subjectId: this.filterSubject ?? undefined,
          difficulty: this.filterDifficulty ?? undefined,
          type: this.filterType ?? undefined,
        });
        if (res.success && res.data) {
          this.questions = res.data.results || [];
          this.pagination.count = res.data.pagination.count;
          this.pagination.totalPages = res.data.pagination.total_pages;
          this.pagination.currentPage = res.data.pagination.page;
          this.pagination.pageSize = res.data.pagination.page_size;
        } else {
          this.showSnackbar(res.message || 'Error al cargar preguntas', 'error');
        }
      } catch {
        this.showSnackbar('Error al cargar preguntas', 'error');
      } finally {
        this.loading = false;
        this.tableLoading = false;
      }
    },
    resetPageAndFetch() {
      this.pagination.currentPage = 1;
      this.fetchQuestions();
    },
    handlePageChange(page: number) {
      this.pagination.currentPage = page;
      this.fetchQuestions();
    },
    handlePageSizeChange(size: number) {
      this.pagination.pageSize = size;
      this.pagination.currentPage = 1;
      this.fetchQuestions();
    },
    openCreate() {
      this.clearFormErrors();
      this.editingId = null;
      this.form = {
        id_subject: this.filterSubject,
        question_type: 'MULTIPLE_CHOICE',
        text: '',
        difficulty: 'medium',
        bloom_level: 'remember',
        points: 1,
        image_url: '',
        answer_options: emptyOptions(),
      };
      this.normalizeSingleCorrectChoice();
      this.codeLanguage = 'python';
      this.codeTestsRaw = '';
      this.formDialog = true;
    },
    async openEdit(row: QuestionBank) {
      this.clearFormErrors();
      const res = await controller.getQuestionById(row.id);
      if (!res.success || !res.data) {
        this.showSnackbar(res.message || 'No se pudo cargar la pregunta', 'error');
        return;
      }
      const q = res.data;
      this.editingId = q.id;
      this.form.id_subject = q.id_subject;
      this.form.question_type = q.question_type;
      this.form.text = q.text;
      this.form.difficulty = q.difficulty;
      this.form.bloom_level = q.bloom_level;
      this.form.points = q.points ?? 1;
      this.form.image_url = q.image_url || '';
      if (q.question_type === 'MULTIPLE_CHOICE' || q.question_type === 'MULTIPLE_SELECTION') {
        const base = emptyOptions();
        (q.answer_options || []).slice(0, 4).forEach((o, i) => {
          base[i] = { text: o.text, is_correct: o.is_correct };
        });
        this.form.answer_options = base;
        if (q.question_type === 'MULTIPLE_CHOICE') {
          this.normalizeSingleCorrectChoice();
        }
      } else {
        this.form.answer_options = emptyOptions();
      }
      if (q.question_type === 'CODE' && q.code_question) {
        this.codeLanguage = q.code_question.language || 'python';
        this.codeTestsRaw = (q.code_question.test_cases || []).join('\n');
      } else {
        this.codeLanguage = 'python';
        this.codeTestsRaw = '';
      }
      this.formDialog = true;
    },
    /**
     * Para opción múltiple (una sola): deja exactamente una opción con is_correct.
     */
    normalizeSingleCorrectChoice() {
      const opts = this.form.answer_options;
      const firstIdx = opts.findIndex((o) => o.is_correct);
      opts.forEach((o, i) => {
        o.is_correct = firstIdx >= 0 ? i === firstIdx : i === 0;
      });
    },

    setSingleCorrectAnswer(idx: number | string | null) {
      if (idx === null || idx === undefined) return;
      const n = typeof idx === 'string' ? Number.parseInt(idx, 10) : idx;
      if (Number.isNaN(n)) return;
      this.form.answer_options.forEach((o, i) => {
        o.is_correct = i === n;
      });
    },

    onTypeChange() {
      this.clearFieldError('question_type');
      this.formErrors.answer_options = [];
      this.formErrors.optionRows = [[], [], [], []];
      const t = this.form.question_type;
      this.codeTestsRaw = '';
      if (t === 'OPEN' || t === 'CODE') {
        this.form.answer_options = emptyOptions();
      } else if (t === 'MULTIPLE_CHOICE') {
        this.normalizeSingleCorrectChoice();
      }
      // MULTIPLE_SELECTION: conserva opciones y marcas actuales
    },
    buildPayload(): CreateQuestionDto {
      const base: CreateQuestionDto = {
        text: this.form.text.trim(),
        question_type: this.form.question_type,
        difficulty: this.form.difficulty,
        bloom_level: this.form.bloom_level,
        id_subject: this.form.id_subject,
        points: this.form.points || 1,
        image_url: this.form.image_url?.trim() || null,
        status: true,
      };
      if (this.form.question_type === 'MULTIPLE_CHOICE' || this.form.question_type === 'MULTIPLE_SELECTION') {
        const opts = this.form.answer_options
          .filter((o) => o.text.trim())
          .map((o) => ({ text: o.text.trim(), is_correct: o.is_correct }));
        base.answer_options = opts;
      } else if (this.form.question_type === 'CODE') {
        const lines = this.codeTestsRaw
          .split('\n')
          .map((l) => l.trim())
          .filter(Boolean);
        base.code_question = {
          language: this.codeLanguage || 'python',
          test_cases: lines,
        };
      }
      return base;
    },
    async saveQuestion() {
      if (!this.clientValidate()) {
        this.showSnackbar('Revise los campos marcados en rojo.', 'warning');
        return;
      }
      const payload = this.buildPayload();
      this.saving = true;
      try {
        const res = this.editingId
          ? await controller.updateQuestion(this.editingId, payload)
          : await controller.createQuestion(payload);
        if (res.success) {
          this.clearFormErrors();
          this.showSnackbar(this.editingId ? 'Pregunta actualizada' : 'Pregunta creada');
          this.formDialog = false;
          await this.fetchQuestions();
        } else {
          const rawErr = extractFieldErrorsFromApiResponse(res);
          this.applyServerErrors(rawErr);
          if (this.hasFormErrors()) {
            this.showSnackbar('Revise los errores indicados en el formulario.', 'warning');
          } else {
            this.showSnackbar(res.message || 'Error al guardar', 'error');
          }
        }
      } finally {
        this.saving = false;
      }
    },
    confirmDelete(row: QuestionBank) {
      const dlg = this.$refs.confirmDialog as { open: (msg?: string) => Promise<boolean> };
      dlg
        .open('¿Confirma eliminar esta pregunta? No podrá eliminarse si está en un examen.')
        .then(async (ok) => {
          if (!ok) return;
          const res = await controller.deleteQuestion(row.id);
          if (res.success) {
            this.showSnackbar('Pregunta eliminada');
            this.fetchQuestions();
          } else {
            this.showSnackbar(res.message || 'No se pudo eliminar', 'error');
          }
        });
    },
    async downloadTemplate() {
      this.downloadingTemplate = true;
      try {
        const blob = await controller.downloadTemplateBlob();
        const url = globalThis.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'plantilla_preguntas.xlsx';
        a.click();
        globalThis.URL.revokeObjectURL(url);
        this.showSnackbar('Plantilla descargada');
      } catch {
        this.showSnackbar('Error al descargar plantilla', 'error');
      } finally {
        this.downloadingTemplate = false;
      }
    },
    async runUpload() {
      const f = Array.isArray(this.uploadFile) ? this.uploadFile[0] : this.uploadFile;
      if (!f) return;
      this.uploading = true;
      this.uploadReport = null;
      try {
        const res = await controller.uploadExcel(f);
        if (res.success && res.data) {
          this.uploadReport = res.data;
          this.showSnackbar(`Carga finalizada: ${res.data.created} creadas`);
          await this.fetchQuestions();
        } else {
          this.showSnackbar(res.message || 'Error en la carga', 'error');
        }
      } finally {
        this.uploading = false;
      }
    },
  },
};
</script>
