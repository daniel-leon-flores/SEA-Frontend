<template>
  <v-layout class="app-layout">
    <SideBar v-if="showSidebar" :role="userRole" />
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import SideBar from './SideBar.vue';

const route = useRoute();
const userRole = computed(() => localStorage.getItem('sea_selectedRole') || '');

const showSidebar = computed(() => {
  const role = userRole.value;
  return Boolean(role && ['STUDENT', 'TEACHER', 'ADMIN'].includes(role) && !route.meta.hideSidebar);
});
</script>

<style scoped>
/* Constrain entire layout to the viewport — prevents sidebar from stretching */
.app-layout {
  height: 100vh;
  overflow: hidden;
}

/* Main area scrolls independently; sidebar stays fixed */
.main-content {
  background-color: #FFFFFF;
  height: 100vh;
  overflow-y: auto;
}
</style>
