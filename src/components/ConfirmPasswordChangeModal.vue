<template>
  <v-dialog v-model="dialogModel" max-width="450" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
        <div class="d-flex align-center ga-3">
          <v-icon color="white" size="28">mdi-shield-alert-outline</v-icon>
          <span class="text-h6 text-white">Confirmar cambio</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon color="warning" size="64">
            mdi-lock-alert
          </v-icon>
        </div>
        
        <p class="text-body-1 text-center mb-2">
          ¿Estás seguro de que deseas cambiar tu contraseña?
        </p>
        
        <p class="text-body-2 text-center text-grey-darken-1">
          Esta acción cerrará tu sesión actual y deberás iniciar sesión nuevamente con tu nueva contraseña.
        </p>

        <v-alert type="warning" variant="tonal" density="compact" class="mt-4">
          <strong>Importante:</strong> Asegúrate de recordar tu nueva contraseña.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn 
          variant="text" 
          @click="cancel"
          :disabled="loading"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="confirm"
          :loading="loading"
        >
          <v-icon start>mdi-check-circle</v-icon>
          Confirmar cambio
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'ConfirmPasswordChangeModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:dialog', 'confirm', 'cancel'],
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
    confirm() {
      this.$emit('confirm')
    },
    cancel() {
      this.$emit('cancel')
      this.dialogModel = false
    }
  }
}
</script>
