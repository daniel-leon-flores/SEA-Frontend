<template>
  <v-layout>
    <SideBar v-if="showSidebar" :role="userRole" />
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import SideBar from './SideBar.vue';

const userRole = computed(() => localStorage.getItem('sea_selectedRole') || '');

const showSidebar = computed(() => {
  const role = userRole.value;
  return role && ['STUDENT', 'TEACHER', 'ADMIN'].includes(role);
});
</script>

<style scoped>
.main-content {
  background-color: #FFFFFF;
  min-height: 100vh;
}
</style>
