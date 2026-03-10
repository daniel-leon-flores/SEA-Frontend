<template>
  <v-container fluid class="pa-6">
    <HeaderSession title="Materias" />
    <v-row>
      <v-col cols="12">
        <v-card color="#063244" class="pa-6">
          <v-card-title class="text-white">
            <v-icon start>mdi-book-open-variant</v-icon>
            Gestión de Materias
          </v-card-title>
          <v-card-text style="color: #9fb5b8;">
            Administra las materias y su asignación a profesores.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import HeaderSession from '@/components/HeaderSession.vue';
</script>
