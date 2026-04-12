<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="error">mdi-logout-variant</v-icon>
        Cerrar sesión
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-1 mb-2">
          ¿Estás seguro de que deseas cerrar sesión?
        </p>
        <p class="text-body-2 text-grey-darken-1">
          Tras esta acción deberás iniciar sesión nuevamente para acceder al sistema.
        </p>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="cancel">
          Cancelar
        </v-btn>
        <v-btn variant="elevated" color="error" @click="confirm">
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
