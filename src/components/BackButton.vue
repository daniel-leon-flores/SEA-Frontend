<template>
  <v-btn
    color="grey"
    variant="text"
    prepend-icon="mdi-arrow-left"
    @click="goBack"
  >
    Volver
  </v-btn>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const goBack = () => {
  router.back();
};
</script>
