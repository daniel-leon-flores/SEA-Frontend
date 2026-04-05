<template>
  <div ref="vantaRef" class="vanta-container">
    <v-container class="fill-height login-overlay" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="5" lg="4">
          <div class="brand text-center mb-8">
            <v-avatar size="64" class="brand-avatar mb-3">
              <v-icon size="36">mdi-school</v-icon>
            </v-avatar>
            <h1 class="brand-title text-white">SEA</h1>
            <p class="brand-subtitle text-white">Sistema de Exámenes Autogestionados</p>
          </div>

          <v-card class="pa-8 login-card" color="white" elevation="8" rounded="lg">
          <h2 class="text-center mb-1" style="color: #1a1a1a; font-weight: 700;">Bienvenido</h2>
          <p class="text-center mb-6" style="color: #6b7280;">Inicia sesión con tus credenciales universitarias</p>

          <v-form ref="formRef" @submit.prevent="login">
            <v-alert
              v-if="loginError"
              type="error"
              variant="tonal"
              density="compact"
              class="mb-4"
              :text="loginError"
            />
            <div class="mb-1 font-weight-bold" style="color: #1a1a1a; font-size: 0.875rem;">Correo electrónico</div>
            <v-text-field
              v-model="email"
              placeholder="correo@example.com"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.email]"
            />

            <div class="mb-1 font-weight-bold" style="color: #1a1a1a; font-size: 0.875rem;">Contraseña</div>
            <v-text-field
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Ingresa tu contraseña"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required]"
            >
              <template #append-inner>
                <v-btn icon variant="text" size="small" @click="togglePassword">
                  <v-icon size="20">{{ showPassword ? 'mdi-eye-off' : 'mdi-eye' }}</v-icon>
                </v-btn>
              </template>
            </v-text-field>

            <div class="text-right mb-2">
              <v-btn
                variant="text"
                size="small"
                color="primary"
                @click="goToPasswordRecovery"
              >
                ¿Olvidaste tu contraseña?
              </v-btn>
            </div>

            <v-btn
              class="mt-4"
              block
              type="submit"
              color="primary"
              size="large"
              rounded="lg"
              :loading="loading"
            >
              <v-icon start>mdi-login</v-icon>
              Iniciar sesión
            </v-btn>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AxiosClient from '@/config/axios';
import { useVantaBirds } from '@/composables/useVantaBirds';

const vantaRef = ref<HTMLElement | null>(null);
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const loading = ref(false);
const loginError = ref('');
const formRef = ref<any>(null);
const router = useRouter();

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

const rules = {
  required: (v: string) => !!v || 'Campo requerido',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Correo electrónico inválido',
};

function togglePassword() {
  showPassword.value = !showPassword.value;
}

function goToPasswordRecovery() {
  router.push('/password-recovery');
}

async function login() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  loginError.value = '';
  loading.value = true;
  try {
    const { data } = await AxiosClient.post('/api/auth/login/', {
      email: email.value,
      password: password.value,
    });
    localStorage.setItem('sea_token', data.access);
    localStorage.setItem('sea_refresh', data.refresh);
    localStorage.setItem('sea_selectedRole', data.user.role.toUpperCase());
    localStorage.setItem('sea_userName', data.user.full_name);
    
    // Redirigir según el rol del usuario
    const userRole = data.user.role.toUpperCase();
    if (userRole === 'STUDENT') {
      router.push('/my-exams');
    } else {
      router.push('/');
    }
  } catch (err: any) {
    // Extraer mensaje de error del backend
    const msg = err?.response?.data?.error || 
                err?.response?.data?.detail || 
                err?.response?.data?.message;
    
    // Mostrar el mensaje del backend o uno genérico
    if (msg && msg.toLowerCase().includes('inactivo')) {
      loginError.value = 'Tu cuenta está inactiva. Contacta al administrador para más información.';
    } else {
      loginError.value = msg || 'Credenciales inválidas. Verifica tu correo y contraseña.';
    }
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.vanta-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-overlay {
  position: relative;
  z-index: 1;
}

.login-card {
  background: rgba(255, 255, 255, 0.98) !important;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15) !important;
}

.brand-avatar {
  background-color: #081e53;
  color: white;
  box-shadow: 0 4px 12px rgba(8, 30, 83, 0.3);
}

.brand-title {
  margin: 0;
  font-weight: 700;
  font-size: 2.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.brand-subtitle {
  margin-top: 4px;
  font-size: 0.95rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}
</style>
