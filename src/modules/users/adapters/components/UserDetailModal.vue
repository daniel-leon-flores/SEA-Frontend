<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-information-outline</v-icon>
        Detalles del usuario
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4" v-if="user">
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
              <!-- Grupos donde imparte clases -->
              <v-col cols="12">
                <div class="mb-3">
                  <p class="text-caption text-grey-darken-1 mb-2">Grupos donde imparte clases</p>
                  <div v-if="user.teaching_groups && user.teaching_groups.length > 0" class="d-flex flex-wrap ga-2">
                    <v-chip
                      v-for="tg in user.teaching_groups"
                      :key="tg.id_group"
                      color="deep-purple"
                      variant="tonal"
                      size="small"
                    >
                      <v-icon start size="14">mdi-account-group</v-icon>
                      {{ tg.academic_level }}{{ tg.group_letter }} &mdash; Gen. {{ tg.generation_year }}
                    </v-chip>
                  </div>
                  <v-alert v-else type="info" variant="tonal" density="compact">
                    Este docente no tiene grupos asignados
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
                    {{ user.group.academic_level }}{{ user.group.group_letter }} &mdash; Gen. {{ user.group.generation_year }}
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
        <v-btn variant="text" color="grey" @click="close">
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
