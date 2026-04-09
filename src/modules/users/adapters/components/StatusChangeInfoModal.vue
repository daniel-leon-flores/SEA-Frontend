<template>
  <v-dialog v-model="dialogModel" max-width="450" persistent>
    <v-card rounded="lg">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary" size="22">
          {{ newStatus ? 'mdi-account-check' : 'mdi-account-cancel' }}
        </v-icon>
        {{ newStatus ? 'Activar usuario' : 'Desactivar usuario' }}
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-5">
        <p class="text-body-1 mb-4">
          ¿Estás seguro de que deseas
          <strong>{{ newStatus ? 'activar' : 'desactivar' }}</strong>
          al siguiente usuario?
        </p>

        <div v-if="user" class="pa-3 bg-grey-lighten-4 rounded mb-4">
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="grey-darken-1">mdi-account</v-icon>
            <span class="text-body-2 font-weight-medium">{{ user.full_name }}</span>
          </div>
          <div class="d-flex align-center mb-2">
            <v-icon size="18" class="mr-2" color="grey-darken-1">mdi-email</v-icon>
            <span class="text-body-2">{{ user.email }}</span>
          </div>
          <div v-if="user.matricula" class="d-flex align-center">
            <v-icon size="18" class="mr-2" color="grey-darken-1">mdi-badge-account</v-icon>
            <span class="text-body-2">{{ user.matricula }}</span>
          </div>
        </div>

        <v-alert
          :type="newStatus ? 'success' : 'info'"
          variant="tonal"
          density="compact"
          rounded="lg"
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
          <v-icon start>{{ newStatus ? 'mdi-account-check' : 'mdi-account-cancel' }}</v-icon>
          {{ newStatus ? 'Activar' : 'Desactivar' }}
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
