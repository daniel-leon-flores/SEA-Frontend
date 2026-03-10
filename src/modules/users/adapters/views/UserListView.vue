<template>
  <v-container fluid class="pa-6">
    <HeaderSession title="Usuarios" />
    <v-row>
      <v-col cols="12">
        <v-card color="#063244" class="pa-6">
          <v-card-title class="text-white">
            <v-icon start>mdi-shield-account</v-icon>
            Gestión de Usuarios
          </v-card-title>
          <v-card-text style="color: #9fb5b8;">
            Administra los usuarios del sistema (estudiantes, profesores, administradores).
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import HeaderSession from '@/components/HeaderSession.vue';
</script>
