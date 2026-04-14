<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-pencil-outline</v-icon>
        Editar usuario
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="payload.first_name"
                label="Nombre(s)"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :error-messages="serverErrors.first_name"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="payload.last_name"
                label="Apellidos"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :error-messages="serverErrors.last_name"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="payload.email"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required, rules.email]"
                :error-messages="serverErrors.email"
              />
            </v-col>
            <v-col v-if="payload.role !== 'admin'" cols="12" sm="6">
              <v-text-field
                v-model="payload.matricula"
                label="Matrícula"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                :error-messages="serverErrors.matricula"
              />
            </v-col>
            <!-- Grupo — solo alumnos -->
            <v-col v-if="payload.role === 'student'" cols="12">
              <v-select
                v-model="payload.id_group"
                label="Grupo académico"
                :items="groups"
                item-title="label"
                item-value="id_group"
                variant="outlined"
                density="comfortable"
                :error-messages="serverErrors.id_group"
                :loading="loadingGroups"
                clearable
              />
            </v-col>

            <!-- Materias — solo docentes -->
            <v-col v-if="payload.role === 'teacher'" cols="12">
              <v-select
                v-model="payload.subject_ids"
                label="Materias asignadas"
                :items="subjects"
                item-title="name"
                item-value="id_subject"
                variant="outlined"
                density="comfortable"
                multiple
                chips
                clearable
                :error-messages="serverErrors.subject_ids"
                :loading="loadingSubjects"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="submitting"
          :disabled="!valid"
          @click="submit"
        >
          Guardar cambios
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'UpdateUserModal',
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
  emits: ['update:dialog', 'user-updated'],
  data() {
    return {
      valid: false,
      submitting: false,
      loadingGroups: false,
      loadingSubjects: false,
      pendingGroupId: null,
      groups: [],
      subjects: [],
      payload: {
        first_name: '',
        last_name: '',
        email: '',
        matricula: '',
        role: 'student',
        id_group: null,
        subject_ids: []
      },
      serverErrors: {},
      roleItems: [
        { label: 'Alumno', value: 'student' },
        { label: 'Docente', value: 'teacher' },
        { label: 'Administrador', value: 'admin' }
      ],
      rules: {
        required: (v) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        email: (v) => /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/.test(v) || 'Correo inválido'
      }
    }
  },
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
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.loadGroups()
        this.loadSubjects()
        this.loadUserData()
      }
    }
  },
  methods: {
    close() {
      this.dialogModel = false
      if (this.$refs.formRef) {
        this.$refs.formRef.reset()
      }
      this.serverErrors = {}
      this.pendingGroupId = null
      Object.assign(this.payload, {
        first_name: '',
        last_name: '',
        email: '',
        matricula: '',
        role: 'student',
        id_group: null,
        subject_ids: []
      })
    },
    
    loadUserData() {
      if (!this.user) return
      
      this.payload.first_name = this.user.first_name
      this.payload.last_name = this.user.last_name
      this.payload.email = this.user.email
      this.payload.matricula = this.user.matricula
      this.payload.role = this.user.role
      
      // Reset id_group to null while groups are loading to avoid showing raw ID
      this.payload.id_group = null
      if (this.user.role === 'student' && this.user.group) {
        this.pendingGroupId = this.user.group.id_group
      } else {
        this.pendingGroupId = null
      }
      
      if (this.user.role === 'teacher' && this.user.subjects && this.user.subjects.length > 0) {
        this.payload.subject_ids = this.user.subjects.map(s => s.id_subject)
      } else {
        this.payload.subject_ids = []
      }
    },
    
    async loadGroups() {
      this.loadingGroups = true
      try {
        const { default: AxiosClient } = await import('@/config/axios')
        const res = await AxiosClient.get('/api/academic/groups/?status=true&page_size=100')
        const results = res.data?.data?.results ?? res.data?.data ?? []
        this.groups = results.map((g) => ({
          id_group: g.id_group,
          label: `${g.academic_level}${g.group_letter} — Gen. ${g.generation_year}`
        }))
        // Apply pending group id now that options are loaded
        if (this.pendingGroupId !== null) {
          this.payload.id_group = this.pendingGroupId
          this.pendingGroupId = null
        }
      } catch (error) {
        console.error('Error loading groups:', error)
      } finally {
        this.loadingGroups = false
      }
    },
    
    async loadSubjects() {
      this.loadingSubjects = true
      try {
        const { default: AxiosClient } = await import('@/config/axios')
        const res = await AxiosClient.get('/api/academic/subjects/?status=true&page_size=100')
        this.subjects = res.data?.data?.results ?? res.data?.data ?? []
      } catch (error) {
        console.error('Error loading subjects:', error)
      } finally {
        this.loadingSubjects = false
      }
    },
    
    async submit() {
      this.serverErrors = {}
      const { valid } = await this.$refs.formRef.validate()
      if (!valid) return

      this.submitting = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        const response = await controller.updateUser(this.user.id_user, { ...this.payload })

        if (response.success) {
          this.$emit('user-updated', response.data)
          this.close()
        } else {
          const errors = response?.errors ?? {}
          Object.entries(errors).forEach(([k, v]) => {
            this.serverErrors[k] = Array.isArray(v) ? v[0] : String(v)
          })
        }
      } catch (error) {
        console.error('Error updating user:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
