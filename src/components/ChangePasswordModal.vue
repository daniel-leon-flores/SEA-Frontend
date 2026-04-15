<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-lock-reset</v-icon>
        Cambiar contraseña
      </v-card-title>
      <v-divider />

      <v-card-text class="pa-4">
        <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
          <v-row dense>
            <v-col cols="12">
              <v-text-field
                v-model="form.current_password"
                label="Contraseña actual"
                :type="showCurrentPassword ? 'text' : 'password'"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
                variant="outlined"
                density="comfortable"
                maxlength="128"
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
                density="comfortable"
                maxlength="128"
                :rules="[rules.required, rules.minLength, rules.noSpaces]"
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
                density="comfortable"
                maxlength="128"
                :rules="[rules.required, rules.passwordMatch]"
                :error-messages="serverErrors.confirm_password"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
                @input="clearServerError('confirm_password')"
              />
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="close" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          :loading="loading"
          :disabled="!valid"
          @click="submit"
        >
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
      serverErrors: {} as Record<string, string | undefined>,
      rules: {
        required: (v: string) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        minLength: (v: string) => (v && v.length >= 8) || 'Mínimo 8 caracteres',
        passwordMatch: (v: string) => v === (this as any).form.new_password || 'Las contraseñas no coinciden',
        noSpaces: (v: string) => !v || !/\s/.test(v) || 'La contraseña no debe contener espacios'
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
    setServerErrors(errors: Record<string, string | undefined>) {
      this.serverErrors = errors
    },
    clearServerError(field: string) {
      if ((this.serverErrors as Record<string, string | undefined>)[field]) {
        delete (this.serverErrors as Record<string, string | undefined>)[field]
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
