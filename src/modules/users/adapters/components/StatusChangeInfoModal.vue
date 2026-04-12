<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-help-circle-outline</v-icon>
        Confirmar acción
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-4">
        ¿Está seguro de {{ newStatus ? 'activar' : 'desactivar' }} al usuario
        <strong>{{ user ? user.full_name : '' }}</strong>?
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" :disabled="loading" @click="close">
          Cancelar
        </v-btn>
        <v-btn
          variant="elevated"
          color="primary"
          :loading="loading"
          :disabled="loading"
          @click="confirm"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'StatusChangeInfoModal',
  props: {
    dialog: {
      type: Boolean,
      required: true
    },
    user: {
      type: Object,
      default: null
    },
    newStatus: {
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
    close() {
      this.$emit('cancel')
      this.dialogModel = false
    }
  }
}
</script>
