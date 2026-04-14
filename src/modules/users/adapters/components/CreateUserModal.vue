<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="success">mdi-account-plus</v-icon>
        Registrar nuevo usuario
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
            <v-col cols="12" sm="6">
              <v-select
                v-model="payload.role"
                label="Rol"
                :items="roleItems"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
                :rules="[rules.required]"
                @update:model-value="onRoleChange"
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
                :rules="[rules.required]"
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
          color="success"
          variant="elevated"
          :loading="submitting"
          :disabled="!valid"
          @click="submit"
        >
          Registrar usuario
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'CreateUserModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:dialog', 'user-created'],
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
      serverErrors: {} as Record<string, string | undefined>,
      roleItems: [
        { label: 'Alumno', value: 'student' },
        { label: 'Docente', value: 'teacher' },
        { label: 'Administrador', value: 'admin' }
      ],
      rules: {
        required: (v: string) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        email: (v: string) => /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/.test(v) || 'Correo inválido'
      }
    }
  },
  computed: {
    dialogModel: {
      get() {
        return this.dialog
      },
      set(value: boolean) {
        this.$emit('update:dialog', value)
      }
    }
  },
  watch: {
    dialog(newVal) {
      if (newVal) {
        this.loadGroups()
        this.loadSubjects()
      }
    },
    'payload.first_name'() {
      if ((this.serverErrors as Record<string, string | undefined>).first_name) {
        (this.serverErrors as Record<string, string | undefined>).first_name = undefined
        this.$nextTick(() => {
          (this.$refs.formRef as any).validate()
        })
      }
    },
    'payload.last_name'() {
      if ((this.serverErrors as Record<string, string | undefined>).last_name) {
        (this.serverErrors as Record<string, string | undefined>).last_name = undefined
        this.$nextTick(() => {
          (this.$refs.formRef as any).validate()
        })
      }
    },
    'payload.email'() {
      if ((this.serverErrors as Record<string, string | undefined>).email) {
        (this.serverErrors as Record<string, string | undefined>).email = undefined
        this.$nextTick(() => {
          (this.$refs.formRef as any).validate()
        })
      }
    },
    'payload.matricula'() {
      if ((this.serverErrors as Record<string, string | undefined>).matricula) {
        (this.serverErrors as Record<string, string | undefined>).matricula = undefined
        this.$nextTick(() => {
          (this.$refs.formRef as any).validate()
        })
      }
    },
    'payload.id_group'() {
      if ((this.serverErrors as Record<string, string | undefined>).id_group) {
        (this.serverErrors as Record<string, string | undefined>).id_group = undefined
        this.$nextTick(() => {
          (this.$refs.formRef as any).validate()
        })
      }
    },
    'payload.subject_ids'() {
      if ((this.serverErrors as Record<string, string | undefined>).subject_ids) {
        (this.serverErrors as Record<string, string | undefined>).subject_ids = undefined
        this.$nextTick(() => {
          (this.$refs.formRef as any).validate()
        })
      }
    }
  },
  methods: {
    close() {
      this.dialogModel = false
      if (this.$refs.formRef) {
        (this.$refs.formRef as any).reset()
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
    
    onRoleChange() {
      this.payload.id_group = null
      this.payload.subject_ids = []
    },
    
    async loadGroups() {
      this.loadingGroups = true
      try {
        const { default: AxiosClient } = await import('@/config/axios')
        const res = await AxiosClient.get('/api/academic/groups/?status=true&page_size=100')
        const results = res.data?.data?.results ?? res.data?.data ?? []
        this.groups = results.map((g: any) => ({
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
      const { valid } = await (this.$refs.formRef as any).validate()
      if (!valid) return

      this.submitting = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        const response = await controller.createUser({ ...this.payload } as any)

        if (response.success) {
          this.$emit('user-created', response.data)
          this.close()
        } else {
          const errors = response?.errors ?? {}
          Object.entries(errors).forEach(([k, v]) => {
            (this.serverErrors as Record<string, string | undefined>)[k] = Array.isArray(v) ? v[0] : String(v)
          })
        }
      } catch (error) {
        console.error('Error creating user:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>
