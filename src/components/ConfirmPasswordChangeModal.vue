<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-lock-check</v-icon>
        Confirmar cambio de contraseña
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-1 mb-2">
          ¿Estás seguro de que deseas cambiar tu contraseña?
        </p>
        <p class="text-body-2 text-grey-darken-1 mb-3">
          Esta acción cerrará tu sesión actual y deberás iniciar sesión nuevamente con tu nueva contraseña.
        </p>
        <v-alert type="warning" variant="tonal" density="compact">
          <strong>Importante:</strong> Asegúrate de recordar tu nueva contraseña.
        </v-alert>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="cancel" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn variant="elevated" color="primary" @click="confirm" :loading="loading">
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
