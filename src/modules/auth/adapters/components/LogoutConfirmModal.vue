<template>
  <v-dialog v-model="dialogModel" max-width="450" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
        <div class="d-flex align-center ga-3">
          <v-icon color="white" size="28">mdi-logout-variant</v-icon>
          <span class="text-h6 text-white">Cerrar sesión</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon color="warning" size="64">
            mdi-alert-circle-outline
          </v-icon>
        </div>
        
        <p class="text-body-1 text-center mb-2">
          ¿Estás seguro de que deseas cerrar sesión?
        </p>
        
        <p class="text-body-2 text-center text-grey-darken-1">
          Tras esta acción deberás iniciar sesión nuevamente para acceder al sistema.
        </p>

        <v-alert type="info" variant="tonal" density="compact" class="mt-4">
          Asegúrate de guardar cualquier cambio antes de continuar.
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn 
          variant="text" 
          @click="cancel"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="confirm"
        >
          <v-icon start>mdi-logout</v-icon>
          Cerrar sesión
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'LogoutConfirmModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
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
