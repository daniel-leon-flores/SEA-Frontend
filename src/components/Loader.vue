<template>
  <v-overlay :model-value="true" class="align-center justify-center" persistent>
    <v-progress-circular
      color="primary"
      indeterminate
      size="64"
    ></v-progress-circular>
    <div class="text-h6 mt-4 text-white">Cargando...</div>
  </v-overlay>
</template>

<script setup lang="ts">
// Global loader component
</script>

<style scoped>
.text-white {
  color: white;
}
</style>
