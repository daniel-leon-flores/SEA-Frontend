<template>
  <v-app>
    <router-view />
  </v-app>
</template>

<script setup lang="ts">
// Main app - router handles all navigation
</script>

<style>
/* Global blurred backdrop for all Vuetify dialogs */
.v-overlay__scrim {
  backdrop-filter: blur(8px) !important;
  background-color: rgba(15, 23, 42, 0.55) !important;
}
</style>
