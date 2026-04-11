<template>
  <v-dialog v-model="dialogModel" max-width="640" persistent scrollable>
    <v-card>
      <v-card-title class="pa-5 pb-3 d-flex align-center">
        <v-icon start color="primary">mdi-account-plus</v-icon>
        Registrar nuevo alumno
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
            <v-col cols="12" md="6">
              <v-text-field
                v-model="payload.matricula"
                label="Matrícula"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="serverErrors.matricula"
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
          Registrar alumno
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'CreateStudentModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    groupId: {
      type: Number,
      default: null
    }
  },
  emits: ['update:dialog', 'student-created'],
  data() {
    return {
      valid: false,
      submitting: false,
      payload: {
        first_name: '',
        last_name: '',
        email: '',
        matricula: '',
        role: 'student',
        status: true,
        id_group: this.groupId
      },
      serverErrors: {},
      rules: {
        required: (v) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'Correo inválido'
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
        // Si se pasa groupId como prop, lo asignamos
        if (this.groupId) {
          this.payload.id_group = this.groupId
        }
      }
    },
    groupId(newVal) {
      this.payload.id_group = newVal
    },
    'payload.first_name'() {
      if (this.serverErrors.first_name) {
        this.serverErrors.first_name = undefined
        this.$nextTick(() => {
          this.$refs.formRef.validate()
        })
      }
    },
    'payload.last_name'() {
      if (this.serverErrors.last_name) {
        this.serverErrors.last_name = undefined
        this.$nextTick(() => {
          this.$refs.formRef.validate()
        })
      }
    },
    'payload.email'() {
      if (this.serverErrors.email) {
        this.serverErrors.email = undefined
        this.$nextTick(() => {
          this.$refs.formRef.validate()
        })
      }
    },
    'payload.matricula'() {
      if (this.serverErrors.matricula) {
        this.serverErrors.matricula = undefined
        this.$nextTick(() => {
          this.$refs.formRef.validate()
        })
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
        status: true,
        id_group: this.groupId
      })
    },

    async submit() {
      this.serverErrors = {}
      const { valid } = await this.$refs.formRef.validate()
      if (!valid) return

      this.submitting = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        const response = await controller.createUser({ ...this.payload })

        if (response.success) {
          this.$emit('student-created', response.data)
          this.close()
        } else {
          const errors = response?.errors ?? {}
          Object.entries(errors).forEach(([k, v]) => {
            this.serverErrors[k] = Array.isArray(v) ? v[0] : String(v)
          })
        }
      } catch (error) {
        console.error('Error creating student:', error)
      } finally {
        this.submitting = false
      }
    }
  }
}
</script>