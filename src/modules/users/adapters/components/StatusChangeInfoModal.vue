<template>
  <v-dialog v-model="dialogModel" max-width="400" persistent>
    <v-card rounded="lg">
      <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
        <div class="d-flex align-center ga-3">
          <v-icon color="white" size="28">
            {{ newStatus ? 'mdi-account-check' : 'mdi-account-cancel' }}
          </v-icon>
          <span class="text-h6 text-white">Cambio de estado</span>
        </div>
        <v-btn icon variant="text" @click="close">
          <v-icon color="white">mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-center mb-4">
          <v-icon 
            :color="newStatus ? 'success' : 'error'" 
            size="64"
          >
            {{ newStatus ? 'mdi-account-arrow-up' : 'mdi-account-arrow-down' }}
          </v-icon>
        </div>
        
        <p class="text-body-1 text-center mb-2">
          Estás a punto de 
          <strong>{{ newStatus ? 'activar' : 'desactivar' }}</strong> 
          al siguiente usuario:
        </p>
        
        <div v-if="user" class="mt-4 pa-4 bg-grey-lighten-4 rounded">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2">mdi-account</v-icon>
            <span class="text-body-2 font-weight-medium">{{ user.full_name }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2">mdi-email</v-icon>
            <span class="text-body-2">{{ user.email }}</span>
          </div>
          <div class="d-flex align-center">
            <v-icon size="18" class="mr-2">mdi-badge-account</v-icon>
            <span class="text-body-2">{{ user.matricula }}</span>
          </div>
        </div>

        <v-alert 
          :type="newStatus ? 'success' : 'info'" 
          variant="tonal" 
          density="compact" 
          class="mt-4"
        >
          {{ newStatus 
            ? 'El usuario podrá acceder nuevamente al sistema.' 
            : 'El usuario no podrá acceder al sistema mientras esté inactivo.'
          }}
        </v-alert>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn 
          variant="text" 
          @click="close"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="primary"
          variant="elevated"
          @click="proceed"
        >
          <v-icon start>mdi-arrow-right</v-icon>
          Continuar
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
    }
  },
  emits: ['update:dialog', 'proceed', 'cancel'],
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
    proceed() {
      this.$emit('proceed')
    },
    close() {
      this.$emit('cancel')
      this.dialogModel = false
    }
  }
}
</script>
