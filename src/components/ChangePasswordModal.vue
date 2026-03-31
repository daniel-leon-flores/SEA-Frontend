<template>
  <v-dialog v-model="dialogModel" max-width="500" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
        <div class="d-flex align-center ga-3">
          <v-icon color="white" size="28">mdi-lock-reset</v-icon>
          <span class="text-h6 text-white">Cambiar contraseña</span>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
          <v-row>
            <v-col cols="12">
              <v-text-field
                v-model="form.current_password"
                label="Contraseña actual"
                :type="showCurrentPassword ? 'text' : 'password'"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="compact"
                :rules="[rules.required]"
                :error-messages="serverErrors.current_password"
                @click:append-inner="showCurrentPassword = !showCurrentPassword"
                @input="clearServerError('current_password')"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.new_password"
                label="Nueva contraseña"
                :type="showNewPassword ? 'text' : 'password'"
                :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.minLength]"
                :error-messages="serverErrors.new_password"
                @click:append-inner="showNewPassword = !showNewPassword"
                @input="clearServerError('new_password')"
                hint="Mínimo 8 caracteres"
                persistent-hint
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="form.confirm_password"
                label="Confirmar nueva contraseña"
                :type="showConfirmPassword ? 'text' : 'password'"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="compact"
                :rules="[rules.required, rules.passwordMatch]"
                :error-messages="serverErrors.confirm_password"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                @input="clearServerError('confirm_password')"
              />
            </v-col>
          </v-row>
        </v-form>

        <v-alert type="info" variant="tonal" density="compact" class="mt-4">
          Asegúrate de recordar tu nueva contraseña. 
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" @click="close" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!valid"
          @click="submit"
        >
          <v-icon start>mdi-check</v-icon>
          Continuar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'ChangePasswordModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    }
  },
  emits: ['update:dialog', 'proceed'],
  data() {
    return {
      valid: false,
      loading: false,
      showCurrentPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      form: {
        current_password: '',
        new_password: '',
        confirm_password: ''
      },
      serverErrors: {},
      rules: {
        required: (v: string) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        minLength: (v: string) => (v && v.length >= 8) || 'Mínimo 8 caracteres',
        passwordMatch: (v: string) => v === this.form.new_password || 'Las contraseñas no coinciden'
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
  methods: {
    async submit() {
      this.serverErrors = {}
      const { valid } = await (this.$refs.formRef as any).validate()
      if (!valid) return

      this.$emit('proceed', { ...this.form })
    },
    close() {
      this.dialogModel = false
      this.resetForm()
    },
    resetForm() {
      if (this.$refs.formRef) {
        (this.$refs.formRef as any).reset()
      }
      this.serverErrors = {}
      Object.assign(this.form, {
        current_password: '',
        new_password: '',
        confirm_password: ''
      })
      this.showCurrentPassword = false
      this.showNewPassword = false
      this.showConfirmPassword = false
    },
    setServerErrors(errors: Record<string, string>) {
      this.serverErrors = errors
    },
    clearServerError(field: string) {
      if (this.serverErrors[field]) {
        delete this.serverErrors[field]
        // Forzar revalidación del formulario
        this.$nextTick(() => {
          if (this.$refs.formRef) {
            (this.$refs.formRef as any).validate()
          }
        })
      }
    }
  }
}
</script>
