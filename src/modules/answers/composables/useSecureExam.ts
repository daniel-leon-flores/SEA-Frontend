import { computed, onBeforeUnmount, onMounted, ref, unref, watch, type Ref } from 'vue';

type SecureModeSource = boolean | Ref<boolean>;

export function useSecureExam(isSecureMode: SecureModeSource, onAutoSubmit: () => void) {
  const isDialogOpen = ref(false);
  const isFullscreen = ref(false);
  const isMonitoring = ref(false);
  const isRequestingFullscreen = ref(false);

  const secureEnabled = computed(() => Boolean(unref(isSecureMode)));

  async function enterFullscreen() {
    if (!secureEnabled.value || !document.documentElement.requestFullscreen) {
      isDialogOpen.value = false;
      return false;
    }

    isRequestingFullscreen.value = true;

    try {
      await document.documentElement.requestFullscreen();
      isFullscreen.value = true;
      isMonitoring.value = true;
      isDialogOpen.value = false;
      return true;
    } catch {
      return false;
    } finally {
      isRequestingFullscreen.value = false;
    }
  }

  function openSecureExamDialog() {
    if (!secureEnabled.value) {
      isMonitoring.value = true;
      return;
    }

    isDialogOpen.value = true;
  }

  function closeSecureExamDialog() {
    isDialogOpen.value = false;
  }

  function triggerAutoSubmit() {
    if (!secureEnabled.value || !isMonitoring.value) {
      return;
    }

    isMonitoring.value = false;
    onAutoSubmit();
  }

  function handleFullscreenChange() {
    isFullscreen.value = Boolean(document.fullscreenElement);

    if (secureEnabled.value && isMonitoring.value && !document.fullscreenElement) {
      triggerAutoSubmit();
    }
  }

  function handleVisibilityChange() {
    if (secureEnabled.value && isMonitoring.value && document.visibilityState === 'hidden') {
      triggerAutoSubmit();
    }
  }

  onMounted(() => {
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  });

  watch(
    secureEnabled,
    (enabled) => {
      if (!enabled) {
        isDialogOpen.value = false;
        isMonitoring.value = false;
      }
    },
    { immediate: true },
  );

  return {
    isDialogOpen,
    isFullscreen,
    isMonitoring,
    isRequestingFullscreen,
    openSecureExamDialog,
    closeSecureExamDialog,
    enterFullscreen,
  };
}
