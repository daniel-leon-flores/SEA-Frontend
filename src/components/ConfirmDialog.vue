<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card style="position: relative;">
      <v-card-title class="text-h6 pa-4 d-flex align-center">
        <v-icon start color="primary">mdi-help-circle-outline</v-icon>
        Confirmar acción
      </v-card-title>
      <v-divider />
      <v-card-text class="pa-4">
        {{ message }}
      </v-card-text>
      <v-divider />
      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" color="grey" @click="cancel">
          Cancelar
        </v-btn>
        <v-btn variant="elevated" color="primary" @click="confirm">
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
