<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="success">mdi-account-plus</v-icon>
        Registrar nuevo alumno
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
                maxlength="100"
                counter
                validate-on="input lazy"
                :rules="[rules.required, rules.nameChars, rules.noHtml, rules.maxLen100]"
                :error-messages="serverErrors.first_name"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="payload.last_name"
                label="Apellidos"
                variant="outlined"
                density="comfortable"
                maxlength="100"
                counter
                validate-on="input lazy"
                :rules="[rules.required, rules.nameChars, rules.noHtml, rules.maxLen100]"
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
                maxlength="254"
                :rules="[rules.required, rules.email, rules.maxLen254]"
                :error-messages="serverErrors.email"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="payload.matricula"
                label="Matrícula"
                variant="outlined"
                density="comfortable"
                maxlength="30"
                validate-on="input lazy"
                :rules="[rules.required, rules.alphanumeric, rules.maxLen30]"
                :error-messages="serverErrors.matricula"
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
      serverErrors: {} as Record<string, string | undefined>,
      rules: {
        required: (v: string) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        email: (v: string) => /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/.test(v) || 'Correo inválido',
        nameChars: (v: string) => !v || /^[a-zA-ZÀ-ÿ\s'-]+$/.test(v) || 'Solo letras, espacios, acentos y guiones',
        noHtml: (v: string) => !v || !/<[^<>]*>/.test(v) || 'No se permiten etiquetas HTML',
        alphanumeric: (v: string) => !v || /^[a-zA-Z0-9-]+$/.test(v) || 'Solo letras, números y guiones',
        maxLen100: (v: string) => !v || v.length <= 100 || 'Máximo 100 caracteres',
        maxLen254: (v: string) => !v || v.length <= 254 || 'Máximo 254 caracteres',
        maxLen30: (v: string) => !v || v.length <= 30 || 'Máximo 30 caracteres'
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
        status: true,
        id_group: this.groupId
      })
    },

    async submit() {
      this.serverErrors = {}
      const { valid } = await (this.$refs.formRef as any).validate()
      if (!valid) return

      this.submitting = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        const sanitized = {
          ...this.payload,
          first_name: this.payload.first_name.trim().replaceAll(/<[^<>]*>/g, ''),
          last_name: this.payload.last_name.trim().replaceAll(/<[^<>]*>/g, ''),
          email: this.payload.email.trim(),
          matricula: this.payload.matricula.trim().replaceAll(/<[^<>]*>/g, ''),
        }
        const response = await controller.createUser(sanitized as any)

        if (response.success) {
          this.$emit('student-created', response.data)
          this.close()
        } else {
          const errors = response?.errors ?? {}
          Object.entries(errors).forEach(([k, v]) => {
            (this.serverErrors as Record<string, string | undefined>)[k] = Array.isArray(v) ? v[0] : String(v)
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