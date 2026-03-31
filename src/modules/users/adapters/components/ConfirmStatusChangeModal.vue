<template>
  <v-dialog v-model="dialogModel" max-width="450" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
        <div class="d-flex align-center ga-3">
          <v-icon color="white" size="28">mdi-alert-circle-outline</v-icon>
          <span class="text-h6 text-white">Confirmar cambio de estado</span>
        </div>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon 
            :color="newStatus ? 'success' : 'error'" 
            size="64"
          >
            {{ newStatus ? 'mdi-account-check' : 'mdi-account-cancel' }}
          </v-icon>
        </div>
        
        <p class="text-body-1 text-center mb-2">
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
      set(value) {
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
