<template>
  <div class="recovery-container" :class="{ 'inverted': step === 2 }">
    <!-- Left side: White background with form (or Vanta in step 2) -->
    <div class="recovery-form-side">
      <v-container class="fill-height" fluid>
        <v-row align="center" justify="center">
          <v-col cols="12" sm="10" md="8" lg="8" xl="6">
            <div class="brand text-center mb-8">
              <v-avatar size="64" class="brand-avatar mb-3">
                <v-icon size="36">mdi-lock-reset</v-icon>
              </v-avatar>
              <h1 class="brand-title">Recuperar Contraseña</h1>
              <p class="brand-subtitle">Sistema de Exámenes Autogestionados</p>
            </div>

            <v-card class="pa-8 recovery-card" color="white" elevation="0" rounded="lg">
              <!-- Transición entre steps -->
              <transition :name="stepTransition" mode="out-in">
                <!-- Step 1: Solicitar código -->
                <div v-if="step === 1" key="step1">
                  <h2 class="text-center mb-1" style="color: #1a1a1a; font-weight: 700;">Recuperación de cuenta</h2>
                  <p class="text-center mb-6" style="color: #6b7280;">Ingresa tu correo electrónico para recibir un código de verificación</p>

                  <v-form ref="emailFormRef" @submit.prevent="requestCode">
                    <v-alert
                      v-if="errorMessage"
                      type="error"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                      :text="errorMessage"
                    />
                    
                    <v-alert
                      v-if="successMessage"
                      type="success"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                      :text="successMessage"
                    />

                    <div class="mb-1 font-weight-bold" style="color: #1a1a1a; font-size: 0.875rem;">Correo electrónico</div>
                    <v-text-field
                      v-model="email"
                      placeholder="correo@example.com"
                      variant="outlined"
                      density="comfortable"
                      maxlength="254"
                      :rules="[rules.required, rules.email]"
                    />

                    <v-btn
                      class="mt-4"
                      block
                      type="submit"
                      color="primary"
                      size="large"
                      rounded="lg"
                      :loading="loading"
                    >
                      <v-icon start>mdi-email-send</v-icon>
                      Enviar código
                    </v-btn>

                    <v-btn
                      class="mt-3"
                      block
                      variant="text"
                      @click="goToLogin"
                    >
                      <v-icon start>mdi-arrow-left</v-icon>
                      Volver al inicio de sesión
                    </v-btn>
                  </v-form>
                </div>

                <!-- Step 2: Verificar código -->
                <div v-else-if="step === 2" key="step2">
                  <h2 class="text-center mb-1" style="color: #1a1a1a; font-weight: 700;">Verificación</h2>
                  <p class="text-center mb-2" style="color: #6b7280;">Ingresa el código de 6 dígitos enviado a tu correo</p>
                  <p class="text-center mb-6" style="color: #9ca3af; font-size: 0.875rem;">{{ email }}</p>

                  <v-form ref="codeFormRef" @submit.prevent="verifyCode">
                    <v-alert
                      v-if="errorMessage"
                      type="error"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                      :text="errorMessage"
                    />

                    <div class="mb-3 text-center">
                      <v-otp-input
                        v-model="code"
                        :length="6"
                        type="text"
                        variant="outlined"
                        :loading="loading"
                      />
                    </div>

                    <v-btn
                      class="mt-4"
                      block
                      type="submit"
                      color="primary"
                      size="large"
                      rounded="lg"
                      :loading="loading"
                      :disabled="code.length !== 6"
                    >
                      <v-icon start>mdi-check-circle</v-icon>
                      Verificar código
                    </v-btn>

                    <v-btn
                      class="mt-3"
                      block
                      variant="text"
                      @click="backToStep1"
                    >
                      <v-icon start>mdi-arrow-left</v-icon>
                      Solicitar nuevo código
                    </v-btn>
                  </v-form>
                </div>

                <!-- Step 3: Nueva contraseña -->
                <div v-else-if="step === 3" key="step3">
                  <h2 class="text-center mb-1" style="color: #1a1a1a; font-weight: 700;">Nueva contraseña</h2>
                  <p class="text-center mb-6" style="color: #6b7280;">Establece una nueva contraseña segura</p>

                  <v-form ref="passwordFormRef" @submit.prevent="resetPassword">
                    <v-alert
                      v-if="errorMessage"
                      type="error"
                      variant="tonal"
                      density="compact"
                      class="mb-4"
                      :text="errorMessage"
                    />

                    <div class="mb-1 font-weight-bold" style="color: #1a1a1a; font-size: 0.875rem;">Nueva contraseña</div>
                    <v-text-field
                      v-model="newPassword"
                      :type="showPassword ? 'text' : 'password'"
                      placeholder="Mínimo 8 caracteres"
                      variant="outlined"
                      density="comfortable"
                      maxlength="128"
                      :rules="[rules.required, rules.minLength, rules.noSpaces]"
                    >
                      <template #append-inner>
                        <v-btn icon variant="text" size="small" @click="togglePassword">
                          <v-icon size="20">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>

                    <div class="mb-1 font-weight-bold" style="color: #1a1a1a; font-size: 0.875rem;">Confirmar contraseña</div>
                    <v-text-field
                      v-model="confirmPassword"
                      :type="showConfirmPassword ? 'text' : 'password'"
                      placeholder="Repite tu contraseña"
                      variant="outlined"
                      density="comfortable"
                      maxlength="128"
                      :rules="[rules.required, rules.passwordMatch]"
                    >
                      <template #append-inner>
                        <v-btn icon variant="text" size="small" @click="toggleConfirmPassword">
                          <v-icon size="20">{{ showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                        </v-btn>
                      </template>
                    </v-text-field>

                    <v-btn
                      class="mt-4"
                      block
                      type="submit"
                      color="primary"
                      size="large"
                      rounded="lg"
                      :loading="loading"
                    >
                      <v-icon start>mdi-lock-check</v-icon>
                      Cambiar contraseña
                    </v-btn>
                  </v-form>
                </div>
              </transition>
            </v-card>
      </v-col>
    </v-row>
  </v-container>
    </div>

    <!-- Right side: Vanta Birds background -->
    <div ref="vantaRef" class="recovery-vanta-side"></div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AxiosClient from '@/config/axios';
import { useVantaBirds } from '@/composables/useVantaBirds';

const router = useRouter();

const vantaRef = ref<HTMLElement | null>(null);

// Inicializar Vanta Birds
useVantaBirds(vantaRef, {
  backgroundColor: 0x465199,
  backgroundAlpha: 1,
  color1: 0x05323b,
  color2: 0x1cb07a,
  colorMode: 'varianceGradient',
  birdSize: 1,
  wingSpan: 30,
  speedLimit: 5,
  separation: 20,
  alignment: 20,
  cohesion: 20,
  quantity: 5,
});

// State
const step = ref(1);
const stepTransition = ref('step-slide-left');
const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

// Form refs
const emailFormRef = ref<any>(null);
const codeFormRef = ref<any>(null);
const passwordFormRef = ref<any>(null);

// Rules
const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  email: (v: string) => /^[^\s@]{1,64}@[^\s@]{1,253}\.[^\s@]{2,63}$/.test(v) || 'Correo electrónico inválido',
  minLength: (v: string) => v.length >= 8 || 'Mínimo 8 caracteres',
  passwordMatch: (v: string) => v === newPassword.value || 'Las contraseñas no coinciden',
  noSpaces: (v: string) => !v || !/\s/.test(v) || 'La contraseña no debe contener espacios',
};

// Methods
function togglePassword() {
  showPassword.value = !showPassword.value;
}

function toggleConfirmPassword() {
  showConfirmPassword.value = !showConfirmPassword.value;
}

function goToLogin() {
  router.push('/login');
}

function backToStep1() {
  stepTransition.value = 'step-slide-right';
  step.value = 1;
  code.value = '';
  errorMessage.value = '';
}

async function requestCode() {
  const { valid } = await emailFormRef.value.validate();
  if (!valid) return;

  errorMessage.value = '';
  successMessage.value = '';
  loading.value = true;

  try {
    const { data } = await AxiosClient.post('/api/users/password-recovery/request/', {
      email: email.value.trim(),
    });
    
    successMessage.value = data.message || 'Código enviado a tu correo electrónico';
    
    setTimeout(() => {
      stepTransition.value = 'step-slide-left';
      step.value = 2;
      successMessage.value = '';
    }, 2000);
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message;
    errorMessage.value = msg || 'Error al enviar el código. Verifica tu correo e inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}

async function verifyCode() {
  if (code.value.length !== 6) {
    errorMessage.value = 'Ingresa un código de 6 dígitos';
    return;
  }

  errorMessage.value = '';
  loading.value = true;

  try {
    await AxiosClient.post('/api/users/password-recovery/verify/', {
      email: email.value,
      code: code.value,
    });
    
    stepTransition.value = 'step-slide-left';
    step.value = 3;
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message;
    errorMessage.value = msg || 'Código inválido o expirado. Verifica e inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}

async function resetPassword() {
  const { valid } = await passwordFormRef.value.validate();
  if (!valid) return;

  errorMessage.value = '';
  loading.value = true;

  try {
    await AxiosClient.post('/api/users/password-recovery/reset/', {
      email: email.value,
      code: code.value,
      new_password: newPassword.value,
      confirm_password: confirmPassword.value,
    });
    
    // Redirigir automáticamente al login después de cambiar la contraseña
    router.push('/login');
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message;
    errorMessage.value = msg || 'Error al restablecer la contraseña. Inténtalo de nuevo.';
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.recovery-container {
  display: flex;
  height: 100vh;
  width: 100%;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Layout invertido en step 2 */
.recovery-container.inverted {
  flex-direction: row-reverse;
}

.recovery-form-side {
  flex: 1;
  background-color: #ffffff;
  overflow-y: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.recovery-vanta-side {
  flex: 1;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.recovery-card {
  background: #ffffff !important;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08) !important;
}

.brand-avatar {
  background-color: #081e53;
  color: white;
  box-shadow: 0 4px 12px rgba(8, 30, 83, 0.2);
}

.brand-title {
  margin: 0;
  font-weight: 700;
  color: #1a1a1a;
  font-size: 2rem;
}

.brand-subtitle {
  color: #6b7280;
  margin-top: 4px;
  font-size: 0.9rem;
}

/* ============================================
   ANIMACIONES ENTRE PASOS DEL WIZARD
   ============================================ */

/* Slide Left (avanzar steps) */
.step-slide-left-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-left-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-left-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.step-slide-left-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

/* Slide Right (retroceder steps) */
.step-slide-right-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-right-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.step-slide-right-enter-from {
  transform: translateX(-20px);
  opacity: 0;
}

.step-slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}

/* Responsive: en pantallas pequeñas, mostrar solo la parte blanca */
@media (max-width: 960px) {
  .recovery-vanta-side {
    display: none;
  }
  
  .recovery-form-side {
    flex: 1;
    width: 100%;
  }
  
  .recovery-container.inverted {
    flex-direction: row;
  }
}
</style>
