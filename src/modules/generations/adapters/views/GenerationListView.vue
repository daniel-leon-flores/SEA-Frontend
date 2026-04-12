<template>
  <v-container fluid class="generations-page pa-8">
      <Loader :visible="loading" message="Cargando generaciones..." />

    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title">Generaciones</h1>
        <p class="page-subtitle">Gestiona las generaciones académicas y sus grupos</p>
      </div>
      <v-btn color="success" size="large" rounded="lg" class="text-none" prepend-icon="mdi-plus" @click="openCreateModal">
        Registrar generación
      </v-btn>
    </div>

    <v-row class="mb-6" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar por año"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="onSearchChange"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="generation in generations"
        :key="generation.id_generation"
        cols="12"
        md="6"
        lg="4"
      >
        <GenerationCard
          :generation="generation"
          subtitle="Generación académica"
          :groups-count="groupsCount[generation.id_generation] ?? 0"
          @view="goToGroups(generation.id_generation)"
          @edit="openEditModal(generation)"
          @toggle-status="toggleGenerationStatus(generation, $event)"
        />
      </v-col>
    </v-row>

    <v-alert v-if="!loading && generations.length === 0" type="info" variant="tonal" class="mt-4" rounded="lg">
      No hay generaciones registradas.
    </v-alert>

    <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
      <v-pagination
        v-model="currentPage"
        :length="totalPages"
        rounded="circle"
        density="comfortable"
      />
    </div>

    <p v-if="totalItems > 0" class="pagination-caption text-center mt-2">
      Mostrando {{ generations.length }} de {{ totalItems }} generaciones
    </p>

    <v-dialog v-model="showModal" max-width="600" persistent>
      <v-card style="position: relative;">
        <v-card-title class="text-h6 pa-4 d-flex align-center">
          <v-icon start :color="isEditMode ? 'primary' : 'success'">
            {{ isEditMode ? 'mdi-pencil-outline' : 'mdi-calendar-plus' }}
          </v-icon>
          {{ isEditMode ? 'Editar generación' : 'Registrar generación' }}
        </v-card-title>

        <v-divider />

        <v-card-text class="pa-4">
          <v-tabs v-if="!isEditMode" v-model="activeTab" color="primary" class="mb-4" grow>
          <v-tab value="info" prepend-icon="mdi-calendar-blank-outline">Información</v-tab>
          <v-tab value="groups" prepend-icon="mdi-account-group-outline" :disabled="isEditMode">Grupos</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="info">
            <v-row dense>
              <v-col cols="12">
                <v-text-field
                  v-model.number="form.year"
                  label="Año de generación"
                  type="number"
                  :max="currentYear"
                  :error="!!yearError"
                  :error-messages="yearError"
                  hide-details="auto"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field
                  v-model.number="form.total_levels"
                  label="Cantidad de cuatrimestres"
                  type="number"
                  min="1"
                  max="20"
                  hide-details
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>

              <v-col cols="12">
                <div class="status-box d-flex align-center justify-space-between">
                  <div>
                    <p class="status-title">Estatus activo</p>
                    <p class="status-subtitle">Habilita para que la generación esté disponible</p>
                  </div>
                  <v-switch v-model="form.status" hide-details color="success" density="comfortable" />
                </div>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="groups">
            <v-card
              v-for="(group, index) in form.groups"
              :key="group.uid"
              class="group-form-card mb-4"
              rounded="xl"
              elevation="0"
            >
              <div class="d-flex align-center justify-space-between mb-4">
                <h3 class="text-h6">Grupo {{ index + 1 }}</h3>
                <v-btn
                  v-if="form.groups.length > 1"
                  icon
                  variant="text"
                  color="error"
                  @click="removeGroup(index)"
                >
                  <v-icon>mdi-trash-can-outline</v-icon>
                </v-btn>
              </div>

              <v-row>
                <v-col cols="12" sm="5">
                  <v-text-field
                    v-model="group.group_letter"
                    label="Nombre del grupo"
                    hide-details
                    variant="outlined"
                    density="comfortable"
                    placeholder="A"
                    @update:model-value="group.group_letter = normalizeLetter(group.group_letter)"
                  />
                </v-col>

                <v-col cols="12" sm="5">
                  <v-text-field
                    :model-value="detectedAcademicLevel"
                    label="Nivel académico actual"
                    hide-details
                    variant="outlined"
                    density="comfortable"
                    readonly
                  />
                </v-col>

                <v-col cols="12" md="2" class="d-flex align-center">
                  <v-switch v-model="group.status" color="success" hide-details />
                </v-col>
              </v-row>
            </v-card>

            <v-btn block variant="outlined" rounded="lg" class="add-group-btn" prepend-icon="mdi-plus" @click="addGroup">
              Agregar otro grupo
            </v-btn>
          </v-window-item>
        </v-window>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" color="grey" @click="closeModal">Cancelar</v-btn>
          <v-btn
            v-if="activeTab === 'info' && !isEditMode"
            color="primary"
            variant="elevated"
            @click="activeTab = 'groups'"
          >
            Continuar
          </v-btn>
          <v-btn
            variant="elevated"
            :color="isEditMode ? 'primary' : 'success'"
            :loading="saving"
            @click="saveGeneration"
          >
            {{ isEditMode ? 'Guardar cambios' : 'Guardar generación' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <ConfirmDialog ref="confirmDialog" />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2600" location="top right">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { encodeId } from '@/kernel/url-cipher';
import GenerationCard from '../components/GenerationCard.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';
import Loader from '@/components/Loader.vue';
import { GenerationController } from '../generation.controller';
import { getGenerationGroupsInteractor, createGenerationGroupInteractor } from '@/modules/groups/adapters/generation-group.controller';
import { Generation } from '../../entities/generation';
import { CreateGenerationDto } from '../../entities/create-generation.dto';
import { CreateGenerationGroupDto } from '@/modules/groups/entities/create-generation-group.dto';
import { calculateAcademicLevel } from '@/modules/groups/utils/academic-level';

type FormGroup = {
  uid: number;
  group_letter: string;
  academic_level: number | null;
  status: boolean;
};

const router = useRouter();
const controller = new GenerationController();
const currentYear = new Date().getFullYear();

const loading = ref(false);
const saving = ref(false);
const generations = ref<Generation[]>([]);
const groupsCount = ref<Record<number, number>>({});
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(9);
const totalPages = ref(1);
const totalItems = ref(0);

const showModal = ref(false);
const isEditMode = ref(false);
const editGenerationId = ref<number | null>(null);
const activeTab = ref<'info' | 'groups'>('info');

const confirmDialog = ref<InstanceType<typeof ConfirmDialog> | null>(null);
const snackbar = ref({
  show: false,
  color: 'success',
  message: '',
});

const form = ref({
  year: new Date().getFullYear(),
  status: true,
  total_levels: 11,
  groups: [] as FormGroup[],
});
const yearError = ref('');

const detectedAcademicLevel = computed(() =>
  calculateAcademicLevel(form.value.year, form.value.total_levels)
);

const showToast = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, color, message };
};

const normalizeLetter = (value: string): string => value.trim().toUpperCase();

// Contador seguro para generar UIDs únicos
let uidCounter = 0;
const nextUid = (): number => {
  uidCounter += 1;
  return Date.now() + uidCounter;
};

const getYearValidationMessage = (year: number): string => {
  if (!year || year < 1900) {
    return 'Debes ingresar un año de generación válido.';
  }

  if (year > currentYear) {
    return 'No puedes registrar generaciones mayores al año actual.';
  }

  return '';
};

const resetForm = () => {
  const baseYear = new Date().getFullYear();
  const baseTotalLevels = 11;
  const baseAcademicLevel = calculateAcademicLevel(baseYear, baseTotalLevels);
  yearError.value = '';
  form.value = {
    year: baseYear,
    status: true,
    total_levels: baseTotalLevels,
    groups: [{ uid: nextUid(), group_letter: 'A', academic_level: baseAcademicLevel, status: true }],
  };
  activeTab.value = 'info';
  isEditMode.value = false;
  editGenerationId.value = null;
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const onSearchChange = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadGenerations();
  }, 500);
};

const loadGenerations = async () => {
  loading.value = true;
  const yearFilter = searchQuery.value ? Number(searchQuery.value) : undefined;
  const response = await controller.getGenerations(undefined, yearFilter, undefined, currentPage.value, pageSize.value);
  if (!response.success || !response.data) {
    showToast(response.message || 'No se pudieron cargar las generaciones.', 'error');
    loading.value = false;
    return;
  }

  generations.value = response.data.results ?? [];
  totalPages.value = response.data.pagination?.total_pages ?? 1;
  totalItems.value = response.data.pagination?.count ?? generations.value.length;

  const countEntries = await Promise.all(
    generations.value.map(async (item) => {
      const groupsResponse = await getGenerationGroupsInteractor.execute({
        idGeneration: item.id_generation,
        page: 1,
        pageSize: 1,
      });
      return [item.id_generation, groupsResponse.data?.pagination?.count ?? 0] as const;
    })
  );

  groupsCount.value = Object.fromEntries(countEntries);
  loading.value = false;
};



const openCreateModal = () => {
  resetForm();
  showModal.value = true;
};

const openEditModal = (generation: Generation) => {
  resetForm();
  isEditMode.value = true;
  editGenerationId.value = generation.id_generation;
  form.value.year = generation.year;
  form.value.status = generation.status;
  form.value.total_levels = generation.total_levels || 11;
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const addGroup = () => {
  const groups = form.value.groups;
  let nextLetter = '';
  if (groups.length > 0) {
    const lastLetter = groups[groups.length - 1].group_letter;
    if (/^[A-Z]$/.test(lastLetter) && lastLetter.codePointAt(0)! < 90) {
      nextLetter = String.fromCodePoint(lastLetter.codePointAt(0)! + 1);
    }
  }
  form.value.groups.push({
    uid: nextUid(),
    group_letter: nextLetter,
    academic_level: detectedAcademicLevel.value,
    status: true,
  });
};

const removeGroup = (index: number) => {
  form.value.groups.splice(index, 1);
};

const validateForm = (): boolean => {
  yearError.value = getYearValidationMessage(form.value.year);
  if (yearError.value) {
    return false;
  }

  if (!isEditMode.value) {
    const invalid = form.value.groups.some((group) => !group.group_letter || !group.academic_level);
    if (invalid) {
      showToast('Completa la letra y nivel académico de todos los grupos.', 'error');
      return false;
    }
  }

  return true;
};

const saveGeneration = async () => {
  if (!validateForm()) {
    return;
  }

  const resolvedAcademicLevel = detectedAcademicLevel.value;
  form.value.groups = form.value.groups.map((item) => ({ ...item, academic_level: resolvedAcademicLevel }));

  saving.value = true;
  const generationPayload: CreateGenerationDto = {
    year: form.value.year,
    total_levels: form.value.total_levels,
    status: form.value.status,
  };

  if (isEditMode.value && editGenerationId.value) {
    const response = await controller.updateGeneration(editGenerationId.value, generationPayload);
    saving.value = false;
    if (!response.success) {
      showToast(response.message || 'No se pudo actualizar la generación.', 'error');
      return;
    }
    showToast('Generación actualizada correctamente.');
    showModal.value = false;
    await loadGenerations();
    return;
  }

  const generationResponse = await controller.createGeneration(generationPayload);
  if (!generationResponse.success || !generationResponse.data) {
    saving.value = false;
    showToast(generationResponse.message || 'No se pudo registrar la generación.', 'error');
    return;
  }

  const generationId = generationResponse.data.id_generation;

  for (const item of form.value.groups) {
    const groupPayload: CreateGenerationGroupDto = {
      id_generation: generationId,
      group_letter: normalizeLetter(item.group_letter),
      academic_level: Number(item.academic_level),
      status: item.status,
    };
    const groupResponse = await createGenerationGroupInteractor.execute(groupPayload);
    if (!groupResponse.success) {
      saving.value = false;
      showToast(groupResponse.message || 'La generación se creó, pero falló el registro de grupos.', 'warning');
      showModal.value = false;
      await loadGenerations();
      await router.push(`/generations/${encodeId(generationId)}/groups`);
      return;
    }
  }

  saving.value = false;
  showToast('Generación y grupos registrados correctamente.');
  showModal.value = false;
  await loadGenerations();
  await router.push(`/generations/${encodeId(generationId)}/groups`);
};

const goToGroups = async (idGeneration: number) => {
  await router.push(`/generations/${encodeId(idGeneration)}/groups`);
};

const toggleGenerationStatus = async (generation: Generation, value: boolean) => {
  const action = value ? 'activar' : 'desactivar';
  const confirmed = await confirmDialog.value?.open(`¿Está seguro de ${action} la generación ${generation.year}?`);
  if (!confirmed) return;

  const response = await controller.setGenerationStatus(generation.id_generation, value);
  if (!response.success) {
    showToast(response.message || 'No se pudo actualizar el estatus.', 'error');
    return;
  }
  showToast('Estatus de generación actualizado.');
  await loadGenerations();
};

onMounted(async () => {
  resetForm();
  await loadGenerations();
});

watch(currentPage, async () => {
  await loadGenerations();
});

watch(
  () => form.value.year,
  (year) => {
    yearError.value = getYearValidationMessage(year);
  },
  { immediate: true }
);

watch(
  () => [form.value.year, form.value.total_levels],
  () => {
    const resolvedAcademicLevel = detectedAcademicLevel.value;
    form.value.groups = form.value.groups.map((group) => ({
      ...group,
      academic_level: resolvedAcademicLevel,
    }));
  }
);
</script>

<style scoped>
.generations-page {
  background: linear-gradient(180deg, #f8fbff 0%, #f4f7fb 100%);
  min-height: 100vh;
}

.page-title {
  font-size: 40px;
  line-height: 1;
  margin: 0;
  color: #0f172a;
  font-weight: 750;
}

.page-subtitle {
  margin: 8px 0 0;
  color: #64748b;
  font-size: 18px;
}

.modal-card {
  padding: 24px 24px 20px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  box-shadow: 0 8px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06) !important;
}

.modal-scroll-area {
  max-height: 55vh;
  overflow-y: auto;
  padding-right: 4px;
}

.modal-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: #ecfeff;
  display: grid;
  place-items: center;
}

.modal-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
}

.action-btn {
  font-size: 14px;
  min-height: 38px;
  padding-inline: 14px;
}

.step-tabs {
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  overflow: hidden;
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #1e293b;
}

.status-box {
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px;
  background: #fafcff;
}

.status-title {
  margin: 0;
  font-weight: 700;
  font-size: 16px;
}

.status-subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 14px;
}

.group-form-card {
  border: 1px solid #e2e8f0;
  background: #fcfdff;
  padding: 14px;
}

.add-group-btn {
  border-style: dashed;
  font-size: 14px;
  min-height: 38px;
}

.pagination-caption {
  color: #64748b;
  font-size: 13px;
}

@media (max-width: 960px) {
  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 16px;
  }

  .modal-title {
    font-size: 24px;
  }
}
</style>
