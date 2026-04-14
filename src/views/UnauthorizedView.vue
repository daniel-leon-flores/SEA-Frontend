<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" md="6" class="text-center">
        <v-icon size="120" color="error" class="mb-4">mdi-lock-alert</v-icon>
        <h1 class="text-h3 mb-4" style="color: white;">Acceso No Autorizado</h1>
        <p class="text-body-1 mb-6" style="color: #9fb5b8;">
          No tiene permisos para acceder a esta sección.
        </p>
        <v-btn color="primary" @click="goToLogin">
          <v-icon start>mdi-login</v-icon>
          Ir al Inicio de Sesión
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function goToLogin() {
  localStorage.removeItem('sea_token');
  localStorage.removeItem('sea_refresh');
  localStorage.removeItem('sea_selectedRole');
  router.push({ name: 'Login' });
}
</script>
