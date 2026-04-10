<template>
  <v-dialog v-model="dialogModel" max-width="500" persistent>
    <v-card rounded="lg" elevation="0">
      <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
        <div class="d-flex align-center ga-3">
          <v-icon color="white">mdi-information-outline</v-icon>
          <span class="text-h6 text-white">Detalles Adicionales</span>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-5" v-if="user">
        <v-row>
          <!-- Solo mostrar grupo si NO es admin -->
          <template v-if="user.role !== 'admin'">
            <!-- Para docentes: mostrar materias que imparte -->
            <template v-if="user.role === 'teacher'">
              <v-col cols="12">
                <div class="mb-3">
                  <p class="text-caption text-grey-darken-1 mb-2">Materias que imparte</p>
                  <div v-if="user.subjects && user.subjects.length > 0" class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="subject in user.subjects"
                      :key="subject.id_subject"
                      color="teal"
                      variant="tonal"
                      size="small"
                    >
                      <v-icon start size="14">mdi-book-open-variant</v-icon>
                      {{ subject.name }}
                    </v-chip>
                  </div>
                  <v-alert v-else type="info" variant="tonal" density="compact">
                    Este docente no tiene materias asignadas
                  </v-alert>
                </div>
              </v-col>
              <v-col cols="12">
                <v-divider class="my-2" />
              </v-col>
            </template>

            <!-- Para estudiantes: mostrar grupo asignado -->
            <template v-if="user.role === 'student'">
              <v-col cols="12" v-if="user.group">
                <div class="mb-3">
                  <p class="text-caption text-grey-darken-1 mb-2">Grupo asignado</p>
                  <v-chip color="info" variant="tonal" size="large">
                    <v-icon start>mdi-account-group</v-icon>
                    {{ user.group.group_letter }} - Nivel {{ user.group.academic_level }}
                  </v-chip>
                </div>
              </v-col>
              <v-col cols="12" v-else>
                <v-alert type="info" variant="tonal" density="compact">
                  Este usuario no tiene un grupo asignado
                </v-alert>
              </v-col>
              <v-col cols="12">
                <v-divider class="my-2" />
              </v-col>
            </template>
          </template>

          <v-col cols="12">
            <div>
              <p class="text-caption text-grey-darken-1 mb-2">Fecha de registro</p>
              <div class="d-flex align-center">
                <v-icon class="mr-2" color="grey-darken-1">mdi-calendar</v-icon>
                <span class="text-body-1">{{ formatDate(user.date_joined) }}</span>
              </div>
            </div>
          </v-col>
        </v-row>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="primary" @click="close">
          Cerrar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'UserDetailModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    user: {
      type: Object,
      default: null
    }
  },
  emits: ['update:dialog'],
  computed: {
    dialogModel: {
      get() {
        return this.dialog
      },
      set(value) {
        this.$emit('update:dialog', value)
      }
    }
  },
  methods: {
    close() {
      this.dialogModel = false
    },
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
  }
}
</script>

<style scoped>
/* Estilos opcionales si se necesitan */
</style>
