<template>
  <v-container class="text-center pa-10">
    <v-row justify="center">
      <v-col cols="12" md="6">
        <v-icon size="120" color="grey-lighten-1" class="mb-6">mdi-alert-circle-outline</v-icon>
        <h2 class="text-h4 mb-4">{{ title }}</h2>
        <p class="text-body-1 text-grey">{{ description }}</p>
        <v-btn
          v-if="showButton"
          color="primary"
          class="mt-4"
          @click="$emit('action')"
        >
          {{ buttonText }}
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  showButton?: boolean;
  buttonText?: string;
}>();

defineEmits(['action']);
</script>
