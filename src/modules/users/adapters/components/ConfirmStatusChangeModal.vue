<template>
  <v-dialog v-model="dialogModel" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start :color="newStatus ? 'success' : 'error'">
          {{ newStatus ? 'mdi-account-check' : 'mdi-account-cancel' }}
        </v-icon>
        {{ newStatus ? 'Activar usuario' : 'Desactivar usuario' }}
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        <p class="text-body-1 mb-2">
          ¿Estás seguro de que deseas
          <strong>{{ newStatus ? 'activar' : 'desactivar' }}</strong>
          al usuario?
        </p>

        <div v-if="user" class="mt-4 pa-3 bg-grey-lighten-4 rounded">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2">mdi-account</v-icon>
            <span class="text-body-2 font-weight-medium">{{ user.full_name }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="mr-2">mdi-email</v-icon>
            <span class="text-body-2">{{ user.email }}</span>
          </div>
        </div>

        <v-alert
          v-if="!newStatus"
          type="info"
          variant="tonal"
          density="compact"
          class="mt-4"
        >
          El usuario no podrá acceder al sistema mientras esté inactivo.
        </v-alert>
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="cancel" :disabled="loading">
          Cancelar
        </v-btn>
        <v-btn
          variant="elevated"
          :color="newStatus ? 'success' : 'error'"
          @click="confirm"
          :loading="loading"
        >
          {{ newStatus ? 'Activar' : 'Desactivar' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
export default {
  name: 'ConfirmStatusChangeModal',
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
    }
  },
  emits: ['update:dialog', 'confirm', 'cancel'],
  data() {
    return {
      loading: false
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
