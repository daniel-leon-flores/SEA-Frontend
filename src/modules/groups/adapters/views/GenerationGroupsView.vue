<template>
  <v-container fluid class="groups-page pa-8">
    <Loader :visible="loading" message="Cargando grupos..." />

    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div class="d-flex align-start ga-4">
        <v-btn icon variant="text" class="mt-2" @click="goBack">
          <v-icon size="30">mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="page-title">Generación {{ generationYear || generationId }}</h1>
          <p class="page-subtitle">Administra los grupos de la generación seleccionada</p>
        </div>
      </div>
      <v-btn color="success" size="default" rounded="lg" class="action-btn" prepend-icon="mdi-plus" @click="openCreateGroupModal">
        Agregar grupo
      </v-btn>
    </div>

    <v-row class="mb-6" align="center">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar por letra de grupo"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          bg-color="white"
          @update:model-value="onSearchChange"
        />
      </v-col>
    </v-row>

    <v-row>
      <v-col
        v-for="group in groups"
        :key="group.id_group"
        cols="12"
        md="6"
        lg="4"
      >
        <GenerationGroupCard
          :group="group"
          :students-count="group.students_count ?? 0"
          @view-students="goToGroupStudentsView(group)"
          @view-details="openGroupDetailsDialog(group)"
          @edit="openEditGroupModal(group)"
          @toggle-status="toggleGroupStatus(group, $event)"
          @assign-teacher="openAssignTeacherDialog(group)"
        />
      </v-col>
    </v-row>

    <v-alert v-if="!loading && groups.length === 0" type="info" variant="tonal" class="mt-4" rounded="lg">
      Esta generación aún no tiene grupos registrados.
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
      Mostrando {{ groups.length }} de {{ totalItems }} grupos
    </p>

    <v-dialog v-model="showGroupModal" max-width="500" persistent>
      <v-card class="modal-card" rounded="xl" elevation="0">
        <div class="d-flex align-center justify-space-between mb-5">
          <div class="d-flex align-center ga-3">
            <div class="modal-icon">
              <v-icon color="#0f766e">mdi-account-group-outline</v-icon>
            </div>
            <h2 class="modal-title">{{ groupEditId ? 'Editar grupo' : 'Agregar grupo' }}</h2>
          </div>
          <v-btn icon variant="text" @click="closeGroupModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <span class="field-label">Nombre del grupo</span>
            <v-text-field
              v-model="groupForm.group_letter"
              aria-label="Nombre del grupo"
              hide-details
              variant="solo-filled"
              rounded="lg"
              density="comfortable"
              placeholder="A"
              @update:model-value="groupForm.group_letter = normalizeLetter(groupForm.group_letter)"
            />
          </v-col>

          <v-col cols="12" md="6">
            <span class="field-label">Nivel académico actual</span>
            <v-text-field
              :model-value="detectedAcademicLevel"
              aria-label="Nivel académico actual"
              hide-details
              variant="solo-filled"
              rounded="lg"
              density="comfortable"
              readonly
            />
          </v-col>

          <v-col cols="12">
            <div class="status-box d-flex align-center justify-space-between">
              <div>
                <p class="status-title">Estatus activo</p>
                <p class="status-subtitle">Controla la disponibilidad del grupo</p>
              </div>
              <v-switch v-model="groupForm.status" hide-details color="success" density="comfortable" />
            </div>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <div class="d-flex justify-end ga-3">
          <v-btn variant="outlined" rounded="lg" @click="closeGroupModal">Cancelar</v-btn>
          <v-btn color="success" rounded="lg" :loading="saving" @click="saveGroup">Guardar grupo</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Group details dialog (teachers per subject) -->
    <v-dialog v-model="showGroupDetailsDialog" max-width="480">
      <v-card rounded="xl" elevation="0" class="dialog-card">
        <div class="d-flex align-center justify-space-between mb-4">
          <div class="d-flex align-center ga-3">
            <div class="detail-icon">
              <v-icon color="#0f766e" size="22">mdi-account-group</v-icon>
            </div>
            <div>
              <h3 class="detail-title">Docentes asignados</h3>
              <p class="detail-subtitle">Grupo {{ detailGroup ? detailGroup.group_letter : '' }} &middot; Nivel {{ detailGroup ? detailGroup.academic_level : '' }}</p>
            </div>
          </div>
          <v-btn icon variant="text" @click="showGroupDetailsDialog = false"><v-icon>mdi-close</v-icon></v-btn>
        </div>
        <div v-if="detailGroup && detailGroup.assignments && detailGroup.assignments.length > 0" class="detail-list">
          <div v-for="a in detailGroup.assignments" :key="a.id_assignment" class="detail-row">
            <div class="d-flex align-center ga-3">
              <div class="teacher-icon-wrap">
                <v-icon size="16" color="#0f766e">mdi-account-tie</v-icon>
              </div>
              <div>
                <p class="detail-teacher">{{ a.teacher.full_name }}</p>
                <p class="detail-subject">{{ a.subject.name }}</p>
              </div>
            </div>
          </div>
        </div>
        <v-alert v-else type="info" variant="tonal" density="compact" rounded="lg">
          Este grupo no tiene docentes asignados.
        </v-alert>
        <div class="d-flex justify-end mt-4">
          <v-btn variant="outlined" rounded="lg" @click="showGroupDetailsDialog = false">Cerrar</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <AssignTeacherDialog
      v-model="showAssignTeacherDialog"
      :group-id="assignTeacherGroupId"
      :group-letter="assignTeacherGroupLetter"
      :academic-level="assignTeacherGroupLevel"
      :assignments="assignTeacherAssignments"
      @changed="handleTeacherAssigned"
    />

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2600">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import GenerationGroupCard from '../components/GenerationGroupCard.vue';
import AssignTeacherDialog from '../components/AssignTeacherDialog.vue';
import Loader from '@/components/Loader.vue';
import { GenerationController } from '@/modules/generations/adapters/generation.controller';
import { Generation } from '@/modules/generations/entities/generation';
import { getGenerationGroupsInteractor, createGenerationGroupInteractor, updateGenerationGroupInteractor, setGenerationGroupStatusInteractor } from '../generation-group.controller';
import { CreateGenerationGroupDto } from '../../entities/create-generation-group.dto';
import { UpdateGenerationGroupDto } from '../../entities/update-generation-group.dto';
import type { GenerationGroup, GroupTeacherAssignment } from '../../entities/generation-group';
import { calculateAcademicLevel } from '../../utils/academic-level';

const route = useRoute();
const router = useRouter();
const controller = new GenerationController();

const generationId = Number(route.params.id);
const generationYear = ref<number | null>(null);
const generationTotalLevels = ref<number>(11);

const loading = ref(true);
const saving = ref(false);
const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = ref(9);
const totalPages = ref(1);
const totalItems = ref(0);

const groups = ref<GenerationGroup[]>([]);

const showGroupModal = ref(false);
const groupEditId = ref<number | null>(null);

// ---- Assign teacher dialog state ----
const showAssignTeacherDialog = ref(false);
const assignTeacherGroupId = ref<number>(0);
const assignTeacherGroupLetter = ref<string>('');
const assignTeacherGroupLevel = ref<number>(1);
const assignTeacherAssignments = ref<GroupTeacherAssignment[]>([]);

const snackbar = ref({
  show: false,
  color: 'success',
  message: '',
});

const groupForm = ref({
  group_letter: '',
  academic_level: null as number | null,
  status: true,
});

const detectedAcademicLevel = computed(() =>
  calculateAcademicLevel(
    generationYear.value ?? new Date().getFullYear(),
    generationTotalLevels.value
  )
);

const showToast = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, color, message };
};

const normalizeLetter = (value: string): string => value.trim().toUpperCase();

const resetGroupForm = () => {
  groupForm.value = {
    group_letter: '',
    academic_level: detectedAcademicLevel.value,
    status: true,
  };
  groupEditId.value = null;
};

const loadGenerationInfo = async () => {
  const response = await controller.getGenerations(generationId, undefined, 1, 1);
  if (!response.success || !response.data) {
    return;
  }
  const generation = response.data.results?.[0] as Generation | undefined;
  generationYear.value = generation?.year ?? null;
  generationTotalLevels.value = generation?.total_levels ?? 11;
};

let searchTimer: ReturnType<typeof setTimeout> | null = null;
const onSearchChange = () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadGroups();
  }, 500);
};

const loadGroups = async () => {
  loading.value = true;
  try {
    const response = await getGenerationGroupsInteractor.execute({
      idGeneration: generationId,
      groupLetter: searchQuery.value || undefined,
      page: currentPage.value,
      pageSize: pageSize.value,
    });
    if (!response.success || !response.data) {
      showToast(response.message || 'No se pudieron cargar los grupos.', 'error');
      return;
    }
    groups.value = response.data.results ?? [];
    totalPages.value = response.data.pagination?.total_pages ?? 1;
    totalItems.value = response.data.pagination?.count ?? groups.value.length;
    if (groups.value.length > 0) {
      generationTotalLevels.value = groups.value[0].generation_total_levels;
    }
  } finally {
    loading.value = false;
  }
};

const goBack = () => {
  router.push('/generations');
};

const goToGroupStudentsView = (group: GenerationGroup, openAddModal: boolean = false) => {
  router.push({
    name: 'GroupStudents',
    params: {
      generationId,
      groupId: group.id_group,
    },
    query: {
      groupName: group.group_letter,
      openAdd: openAddModal ? '1' : '0',
    },
  });
};

const openCreateGroupModal = () => {
  resetGroupForm();
  showGroupModal.value = true;
};

// ---- Group details dialog state ----
const showGroupDetailsDialog = ref(false);
const detailGroup = ref<GenerationGroup | null>(null);

const openGroupDetailsDialog = (group: GenerationGroup) => {
  detailGroup.value = group;
  showGroupDetailsDialog.value = true;
};

const openAssignTeacherDialog = (group: GenerationGroup) => {
  assignTeacherGroupId.value = group.id_group;
  assignTeacherGroupLetter.value = group.group_letter;
  assignTeacherGroupLevel.value = group.academic_level;
  assignTeacherAssignments.value = group.assignments ?? [];
  showAssignTeacherDialog.value = true;
};

const openEditGroupModal = (group: GenerationGroup) => {
  groupEditId.value = group.id_group;
  groupForm.value = {
    group_letter: group.group_letter,
    academic_level: detectedAcademicLevel.value,
    status: group.status,
  };
  showGroupModal.value = true;
};

const closeGroupModal = () => {
  showGroupModal.value = false;
};

const saveGroup = async () => {
  if (!groupForm.value.group_letter || !groupForm.value.academic_level) {
    showToast('Debes completar la letra del grupo y el nivel académico.', 'error');
    return;
  }

  saving.value = true;

  if (groupEditId.value) {
    const resolvedAcademicLevel = detectedAcademicLevel.value;
    const payload: UpdateGenerationGroupDto = {
      group_letter: normalizeLetter(groupForm.value.group_letter),
      academic_level: resolvedAcademicLevel,
      status: groupForm.value.status,
    };
    const response = await updateGenerationGroupInteractor.execute({ id: groupEditId.value, payload });
    saving.value = false;
    if (!response.success) {
      showToast(response.message || 'No se pudo actualizar el grupo.', 'error');
      return;
    }
    showToast('Grupo actualizado correctamente.');
    showGroupModal.value = false;
    await loadGroups();
    return;
  }

  const resolvedAcademicLevel = detectedAcademicLevel.value;
  const payload: CreateGenerationGroupDto = {
    id_generation: generationId,
    group_letter: normalizeLetter(groupForm.value.group_letter),
    academic_level: resolvedAcademicLevel,
    status: groupForm.value.status,
  };
  const response = await createGenerationGroupInteractor.execute(payload);
  saving.value = false;
  if (!response.success) {
    showToast(response.message || 'No se pudo crear el grupo.', 'error');
    return;
  }
  showToast('Grupo creado correctamente.');
  showGroupModal.value = false;
  await loadGroups();
};

const toggleGroupStatus = async (group: GenerationGroup, value: boolean) => {
  const response = await setGenerationGroupStatusInteractor.execute({ id: group.id_group, status: value });
  if (!response.success) {
    showToast(response.message || 'No se pudo actualizar el estatus del grupo.', 'error');
    return;
  }
  showToast('Estatus del grupo actualizado.');
  await loadGroups();
};

const handleTeacherAssigned = async () => {
  showToast('Docente actualizado correctamente.');
  await loadGroups();
};

onMounted(async () => {
  resetGroupForm();
  await Promise.all([
    loadGenerationInfo(),
    loadGroups(),
  ]);
});

watch(currentPage, async () => {
  await loadGroups();
});

watch(detectedAcademicLevel, (level) => {
  if (!showGroupModal.value) {
    return;
  }
  groupForm.value.academic_level = level;
});
</script>

<style scoped>
.groups-page {
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

.modal-icon {
  width: 38px;
  height: 38px;
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
}

/* Group details dialog */
.dialog-card {
  padding: 24px;
  border: 1px solid #e2e8f0;
}

.detail-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #d1fae5;
}

.detail-title {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.detail-subtitle {
  font-size: 13px;
  color: #64748b;
  margin: 2px 0 0;
}

.detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-row {
  padding: 12px 14px;
  border: 1.5px solid #e2e8f0;
  border-radius: 12px;
  background: #fafcff;
}

.teacher-icon-wrap {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: #f0fdf4;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-teacher {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.detail-subject {
  margin: 2px 0 0;
  font-size: 12px;
  color: #0f766e;
  font-weight: 500;
}
</style>
