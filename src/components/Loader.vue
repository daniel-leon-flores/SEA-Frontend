<template>
  <Transition name="loader-fade">
    <div v-if="visible" class="loader-overlay" :class="{ 'loader-overlay--absolute': !fullscreen }">
      <output class="loader-content" aria-live="polite">

        <svg class="wave-loader" viewBox="0 0 120 30">
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#063244"/>
              <stop offset="40%" stop-color="#0f766e"/>
              <stop offset="70%" stop-color="#1fb07a"/>
              <stop offset="100%" stop-color="#f1f5a9"/>
            </linearGradient>
          </defs>

          <path
            d="M0 15 Q10 5 20 15 T40 15 T60 15 T80 15 T100 15 T120 15"
            fill="none"
            stroke="url(#waveGradient)"
            stroke-width="4"
            stroke-linecap="round"
            class="wave-path"
          />
        </svg>

        <p class="loader-message">{{ message }}</p>

      </output>
    </div>
  </Transition>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    visible: boolean;
    message?: string;
    fullscreen?: boolean;
  }>(),
  {
    message: 'Cargando...',
    fullscreen: true,
  }
);
</script>

<style scoped>
.loader-overlay {
  position: fixed;
  inset: 0;
  z-index: 2400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(6px);
}

.loader-overlay--absolute {
  position: absolute;
}

.loader-content {
  text-align: center;
}

.wave-loader {
  width: 120px;
  height: 30px;
  margin-bottom: 10px;
}

.wave-path {
  stroke-dasharray: 120;
  stroke-dashoffset: 120;
  animation: wave-move 1.6s linear infinite;
}

.loader-message {
  margin: 0;
  color: white;
  font-size: 14px;
  font-weight: 500;
}

.loader-fade-enter-active,
.loader-fade-leave-active {
  transition: opacity 0.2s ease;
}

.loader-fade-enter-from,
.loader-fade-leave-to {
  opacity: 0;
}

@keyframes wave-move {
  to {
    stroke-dashoffset: -120;
  }
}
</style>