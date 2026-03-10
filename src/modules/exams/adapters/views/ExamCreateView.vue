<template>
  <v-container fluid class="pa-6">
    <HeaderSession title="Crear Examen" />
    <v-row>
      <v-col cols="12">
        <v-card color="#063244" class="pa-6">
          <v-card-title class="text-white">
            <v-icon start>mdi-file-document-edit</v-icon>
            Crear Examen
          </v-card-title>
          <v-card-text style="color: #9fb5b8;">
            Formulario para crear un nuevo examen autogestionado.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import HeaderSession from '@/components/HeaderSession.vue';
</script>
