<template>
  <v-dialog v-model="dialogModel" max-width="640" persistent scrollable>
    <v-card>
      <v-card-title class="pa-5 pb-3 d-flex align-center">
        <v-icon start color="primary">mdi-account-edit</v-icon>
        Editar usuario
        <v-spacer />
        <v-btn icon="mdi-close" variant="text" size="small" @click="close" />
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-5">
        <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="payload.first_name"
                label="Nombre(s)"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="serverErrors.first_name"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="payload.last_name"
                label="Apellidos"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="serverErrors.last_name"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="payload.email"
                label="Correo electrónico"
                type="email"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.email]"
                :error-messages="serverErrors.email"
              />
            </v-col>
            <v-col v-if="payload.role !== 'admin'" cols="12" md="6">
              <v-text-field
                v-model="payload.matricula"
                label="Matrícula"
                variant="outlined"
                density="compact"
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
                density="compact"
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
                density="compact"
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
      <v-card-actions class="pa-5 pt-3">
        <v-spacer />
        <v-btn variant="text" @click="close">Cancelar</v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="submitting"
          :disabled="!valid"
          @click="submit"
        >
          <v-icon start>mdi-check</v-icon>
          Actualizar
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
        email: (v) => /.+@.+\..+/.test(v) || 'Correo inválido'
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
      
      if (this.user.role === 'student' && this.user.group) {
        this.payload.id_group = this.user.group.id_group
      } else {
        this.payload.id_group = null
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
