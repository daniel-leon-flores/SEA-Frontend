<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon start color="warning">mdi-alert</v-icon>
        Confirmar Acción
      </v-card-title>
      <v-card-text class="pa-4">
        {{ message }}
      </v-card-text>
      <v-card-actions class="pa-4">
        <v-spacer></v-spacer>
        <v-btn
          color="grey"
          variant="text"
          @click="cancel"
        >
          Cancelar
        </v-btn>
        <v-btn
          color="error"
          variant="elevated"
          @click="confirm"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const dialog = ref(false);
const message = ref('¿Está seguro de realizar esta acción?');
let resolvePromise: ((value: boolean) => void) | null = null;

const open = (customMessage?: string): Promise<boolean> => {
  if (customMessage) {
    message.value = customMessage;
  }
  dialog.value = true;

  return new Promise((resolve) => {
    resolvePromise = resolve;
  });
};

const confirm = () => {
  dialog.value = false;
  if (resolvePromise) {
    resolvePromise(true);
    resolvePromise = null;
  }
};

const cancel = () => {
  dialog.value = false;
  if (resolvePromise) {
    resolvePromise(false);
    resolvePromise = null;
  }
};

defineExpose({
  open
});
</script>
