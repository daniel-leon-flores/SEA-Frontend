<template>
  <v-container fluid class="students-page pa-8">
    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div class="d-flex align-start ga-4">
        <v-btn icon variant="text" class="mt-2" @click="goBackToGroups">
          <v-icon size="30">mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="page-title">Grupo {{ groupName }}</h1>
          <p class="page-subtitle">Administra los estudiantes del grupo</p>
        </div>
      </div>
      <v-btn color="success" size="default" rounded="lg" class="action-btn" prepend-icon="mdi-plus" @click="openAddStudentModal">
        Agregar alumno
      </v-btn>
    </div>

    <v-alert type="info" variant="tonal" rounded="lg">
      Alumnos
    </v-alert>

    <v-dialog v-model="showAddStudentModal" max-width="480" persistent>
      <v-card class="modal-card" rounded="xl" elevation="0">
        <div class="d-flex align-center justify-space-between mb-5">
          <div class="d-flex align-center ga-3">
            <div class="modal-icon">
              <v-icon color="#0f766e">mdi-account-plus-outline</v-icon>
            </div>
            <h2 class="modal-title">Agregar alumno</h2>
          </div>
          <v-btn icon variant="text" @click="closeAddStudentModal">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <v-row>
          <v-col cols="12" md="6">
            <label class="field-label">Nombre
            <v-text-field
              v-model="studentForm.firstName"
              hide-details
              variant="solo-filled"
              rounded="lg"
              density="comfortable"
              placeholder="Nombre"
            />
            </label>
          </v-col>

          <v-col cols="12" md="6">
            <label class="field-label">Apellidos
            <v-text-field
              v-model="studentForm.lastName"
              hide-details
              variant="solo-filled"
              rounded="lg"
              density="comfortable"
              placeholder="Apellidos"
            />
            </label>
          </v-col>

          <v-col cols="12">
            <label class="field-label">Fecha de nacimiento
            <v-text-field
              v-model="studentForm.birthDate"
              type="date"
              hide-details
              variant="solo-filled"
              rounded="lg"
              density="comfortable"
            />
            </label>
          </v-col>
        </v-row>

        <v-divider class="my-6" />

        <div class="d-flex justify-end ga-3">
          <v-btn variant="outlined" rounded="lg" @click="closeAddStudentModal">Cancelar</v-btn>
          <v-btn color="success" rounded="lg" @click="registerStudent">
            Guardar alumno
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="2600">
      {{ snackbar.message }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const generationId = Number(route.params.generationId);
const groupName = computed(() => (route.query.groupName as string) || 'Nombre del grupo');

const showAddStudentModal = ref(false);

const studentForm = ref({
  firstName: '',
  lastName: '',
  birthDate: '',
});

const snackbar = ref({
  show: false,
  color: 'success',
  message: '',
});

const showToast = (message: string, color: string = 'success') => {
  snackbar.value = { show: true, color, message };
};

const resetForm = () => {
  studentForm.value = {
    firstName: '',
    lastName: '',
    birthDate: '',
  };
};

const goBackToGroups = async () => {
  await router.push(`/generations/${generationId}/groups`);
};

const openAddStudentModal = () => {
  showAddStudentModal.value = true;
};

const closeAddStudentModal = () => {
  showAddStudentModal.value = false;
};

const registerStudent = () => {
  if (!studentForm.value.firstName || !studentForm.value.lastName || !studentForm.value.birthDate) {
    showToast('Completa nombre, apellidos y fecha de nacimiento.', 'error');
    return;
  }

  showToast('Alumno registrado localmente (sin backend por ahora).');
  closeAddStudentModal();
  resetForm();
};

onMounted(() => {
  const shouldOpen = String(route.query.openAdd || '0') === '1';
  if (shouldOpen) {
    openAddStudentModal();
  }
});
</script>

<style scoped>
.students-page {
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

@media (max-width: 960px) {
  .page-title {
    font-size: 32px;
  }

  .page-subtitle {
    font-size: 16px;
  }
}
</style>
