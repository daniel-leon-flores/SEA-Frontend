<template>
  <v-app>
    <router-view v-slot="{ Component, route }">
      <transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </transition>
    </router-view>
  </v-app>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// Detectar dirección de navegación para animaciones
watch(
  () => router.currentRoute.value,
  (to, from) => {
    // Login -> Recovery: slide-left
    if (from?.name === 'Login' && to?.name === 'PasswordRecovery') {
      to.meta.transition = 'slide-left';
    }
    // Recovery -> Login: slide-right
    else if (from?.name === 'PasswordRecovery' && to?.name === 'Login') {
      to.meta.transition = 'slide-right';
    }
    // Default: fade
    else {
      to.meta.transition = 'fade';
    }
  }
);
</script>

<style>
/* Global blurred backdrop for all Vuetify dialogs */
.v-overlay__scrim {
  backdrop-filter: blur(8px) !important;
  background-color: rgba(15, 23, 42, 0.55) !important;
}

/* ============================================
   TRANSITION ANIMATIONS
   ============================================ */

/* Fade transition (default) */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Slide Left (Login -> Recovery) */
.slide-left-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-left-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.slide-left-leave-to {
  transform: translateX(-50%);
  opacity: 0;
}

/* Slide Right (Recovery -> Login) */
.slide-right-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-right-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.slide-right-leave-to {
  transform: translateX(50%);
  opacity: 0;
}
</style>
