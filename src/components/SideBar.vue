<template>
  <div>
    <!-- App bar for mobile -->
    <v-app-bar
      v-if="isMobile && !drawer"
      app
      color="#063244"
      flat
      class="d-flex d-md-none mobile-app-bar"
      style="box-shadow: none; border-bottom: 1px solid #1b324e"
    >
      <v-btn icon class="ml-2 mr-2" @click="drawer = true">
        <v-icon color="#069574">mdi-menu</v-icon>
      </v-btn>
      <v-icon color="#069574" size="32" class="ml-2">mdi-school</v-icon>
      <span class="ml-2 text-h6 font-weight-bold" style="color: #069574;">SEA</span>
    </v-app-bar>

    <!-- Navigation Drawer -->
    <v-navigation-drawer
      v-model="drawer"
      :rail="rail"
      :temporary="isMobile"
      :permanent="!isMobile"
      :width="rail ? 72 : 280"
      class="sea-sidebar"
      color="#05323b"
    >
      <!-- Header with logo -->
      <div class="pa-4 d-flex align-center justify-center" @click.stop="toggleRail()" style="cursor: pointer;">
        <div v-if="!rail" class="d-flex align-center">
          <v-avatar size="48" class="logo-avatar">
            <v-icon>mdi-school</v-icon>
          </v-avatar>
          <div class="ml-3">
            <div class="text-h6 font-weight-bold" style="color: white;">SEA</div>
            <div style="color: #9fb5b8; font-size: 0.85rem;">Exámenes Académicos</div>
          </div>
        </div>
        <v-avatar v-else size="40" class="logo-avatar" style="cursor:pointer;">
          <v-icon size="24">mdi-school</v-icon>
        </v-avatar>
      </div>

      <v-divider class="my-2" style="border-color: #1fb07a;" />

      <!-- RAIL MODE: centered icons -->
      <template v-if="rail">
        <div class="d-flex flex-column align-center pt-1">
          <v-tooltip
            v-for="item in navItems"
            :key="item.title"
            location="right"
            :text="item.title"
          >
            <template #activator="{ props: tip }">
              <div
                v-bind="tip"
                class="rail-btn mb-1"
                :class="{ 'rail-btn--active': isItemActive(item) }"
                @click="$router.push(item.to)"
              >
                <v-icon size="22" :color="isItemActive(item) ? 'white' : '#9fb5b8'">{{ item.icon }}</v-icon>
              </div>
            </template>
          </v-tooltip>

          <template v-if="quickActions.length">
            <div style="width: 100%; padding: 4px 0;">
              <v-divider style="border-color: #1fb07a;" />
            </div>
            <v-tooltip
              v-for="item in quickActions"
              :key="item.title"
              location="right"
              :text="item.title"
            >
              <template #activator="{ props: tip }">
                <div
                  v-bind="tip"
                  class="rail-btn mt-2 mb-1"
                  :class="{ 'rail-btn--active': isItemActive(item) }"
                  @click="$router.push(item.to)"
                >
                  <v-icon size="22" :color="isItemActive(item) ? 'white' : '#9fb5b8'">{{ item.icon }}</v-icon>
                </div>
              </template>
            </v-tooltip>
          </template>
        </div>
      </template>

      <!-- EXPANDED MODE: full list -->
      <template v-else>
        <div class="scrollable-menu">
          <v-list nav density="default" bg-color="transparent">
            <div class="section-label pl-4 mb-1">Navegación</div>
            <v-list-item
              v-for="item in navItems"
              :key="item.title"
              class="sidebar-item mx-2 mb-1"
              rounded="lg"
              :prepend-icon="item.icon"
              :title="item.title"
              :active="isItemActive(item)"
              active-color="white"
              @click="$router.push(item.to)"
            />

            <template v-if="quickActions.length">
              <v-divider class="mt-3 mb-2 mx-n2" style="border-color: #1fb07a;" />
              <div class="section-label pl-4 mt-4 mb-1">Acciones Rápidas</div>
              <v-list-item
                v-for="item in quickActions"
                :key="item.title"
                class="sidebar-item mx-2 mb-1"
                rounded="lg"
                :prepend-icon="item.icon"
                :title="item.title"
                :active="isItemActive(item)"
                active-color="white"
                @click="$router.push(item.to)"
              />
            </template>
          </v-list>
        </div>
      </template>

      <!-- Footer with user info and logout -->
      <template #append>
        <div v-if="!rail">
          <v-divider class="mb-2" style="border-color: #1fb07a;" />
          
          <!-- Cambiar contraseña -->
          <div class="pa-2 px-3">
            <v-btn
              block
              variant="tonal"
              color="#1fb07a"
              class="text-none"
              prepend-icon="mdi-lock-reset"
              @click="openChangePasswordDialog"
            >
              Cambiar contraseña
            </v-btn>
          </div>

          <div class="pa-4 d-flex align-center">
            <v-avatar size="40" class="profile-avatar">
              {{ userInitials }}
            </v-avatar>
            <div class="ml-3">
              <div style="color: white; font-weight: 600;">{{ userName }}</div>
              <div style="color: #9fb5b8; font-size: 0.8rem;">{{ roleLabel }}</div>
            </div>
            <v-btn icon class="ml-auto" variant="text" @click="logout">
              <v-icon color="#9fb5b8">mdi-logout</v-icon>
            </v-btn>
          </div>
        </div>
        <div v-else class="pb-3">
          <v-divider style="border-color: #1fb07a;" class="mb-3" />
          
          <!-- Cambiar contraseña en modo rail -->
          <div class="d-flex justify-center mb-3">
            <v-tooltip text="Cambiar contraseña" location="right">
              <template #activator="{ props: tip }">
                <v-btn
                  v-bind="tip"
                  icon="mdi-lock-reset"
                  variant="text"
                  color="#1fb07a"
                  size="small"
                  @click="openChangePasswordDialog"
                />
              </template>
            </v-tooltip>
          </div>

          <div class="d-flex justify-center">
          <v-btn
            icon="mdi-logout"
            variant="text"
            color="grey-darken-2"
            size="small"
            @click="logout"
          />
          </div>
        </div>
      </template>
    </v-navigation-drawer>

    <!-- Modales de cambio de contraseña -->
    <ChangePasswordModal
      :dialog="changePasswordDialog"
      @update:dialog="changePasswordDialog = $event"
      @proceed="handlePasswordFormSubmit"
      ref="changePasswordModalRef"
    />

    <ConfirmPasswordChangeModal
      :dialog="confirmChangeDialog"
      @update:dialog="confirmChangeDialog = $event"
      :loading="changingPassword"
      @confirm="handlePasswordChangeConfirm"
      @cancel="handlePasswordChangeCancel"
    />

    <!-- Snackbar para notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top right"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useDisplay } from 'vuetify';
import { roleMenus } from '@/constants/menu-items';
import type { MenuItem } from '@/constants/menu-items';
import ChangePasswordModal from './ChangePasswordModal.vue';
import ConfirmPasswordChangeModal from './ConfirmPasswordChangeModal.vue';
import { AuthService } from '@/services/auth.service';
import type { ChangePasswordDto } from '@/modules/auth/entities/change-password.dto';

export default defineComponent({
  name: 'SideBar',
  components: {
    ChangePasswordModal,
    ConfirmPasswordChangeModal
  },
  props: {
    role: {
      type: String,
      required: true
    }
  },
  setup() {
    const display = useDisplay();
    return { display };
  },
  data() {
    return {
      drawer: true,
      rail: false,
      changePasswordDialog: false,
      confirmChangeDialog: false,
      changingPassword: false,
      passwordData: null as ChangePasswordDto | null,
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      }
    }
  },
  computed: {
    isMobile(): boolean {
      return this.display.smAndDown.value;
    },
    navItems(): MenuItem[] {
      return (roleMenus as any)[this.role]?.navItems || [];
    },
    quickActions(): MenuItem[] {
      return (roleMenus as any)[this.role]?.quickActions || [];
    },
    userName(): string {
      return localStorage.getItem('sea_userName') || 'Usuario';
    },
    userInitials(): string {
      const name = this.userName;
      const parts = name.split(' ');
      return parts.map(p => p.charAt(0)).slice(0, 2).join('').toUpperCase();
    },
    roleLabel(): string {
      const roleLabels: Record<string, string> = {
        'STUDENT': 'Estudiante',
        'TEACHER': 'Profesor',
        'ADMIN': 'Administrador',
      };
      return roleLabels[this.role] || this.role;
    }
  },
  methods: {
    isItemActive(item: MenuItem): boolean {
      if (item.to === '/') return this.$route.path === '/';
      return this.$route.path.startsWith(item.to);
    },
    toggleRail() {
      if (!this.isMobile) {
        this.rail = !this.rail;
      }
    },
    openChangePasswordDialog() {
      this.changePasswordDialog = true;
    },
    handlePasswordFormSubmit(data: ChangePasswordDto) {
      this.passwordData = data;
      this.changePasswordDialog = false;
      this.confirmChangeDialog = true;
    },
    async handlePasswordChangeConfirm() {
      if (!this.passwordData) return;

      this.changingPassword = true;
      
      try {
        const response = await AuthService.changePassword(this.passwordData);
        
        if (response.success) {
          this.showSnackbar('Contraseña cambiada exitosamente. Serás redirigido al login.', 'success');
          this.confirmChangeDialog = false;
          this.passwordData = null;
          
          // Cerrar sesión después de 2 segundos
          setTimeout(() => {
            this.logout();
          }, 2000);
        } else {
          const errorMsg = response.message || 'Error al cambiar la contraseña.';
          this.showSnackbar(errorMsg, 'error');
          
          // Si hay errores de validación, volver al primer modal
          if (response.error) {
            this.confirmChangeDialog = false;
            this.changePasswordDialog = true;
            
            // Pasar errores al modal
            this.$nextTick(() => {
              if (this.$refs.changePasswordModalRef) {
                (this.$refs.changePasswordModalRef as any).setServerErrors(response.error);
              }
            });
          }
        }
      } catch (error) {
        console.error('Error changing password:', error);
        this.showSnackbar('Error inesperado al cambiar la contraseña.', 'error');
      } finally {
        this.changingPassword = false;
      }
    },
    handlePasswordChangeCancel() {
      this.confirmChangeDialog = false;
      this.passwordData = null;
    },
    showSnackbar(message: string, color: string = 'success') {
      this.snackbar.message = message;
      this.snackbar.color = color;
      this.snackbar.show = true;
    },
    logout() {
      localStorage.removeItem('sea_token');
      localStorage.removeItem('sea_selectedRole');
      localStorage.removeItem('sea_userName');
      this.$router.push({ name: 'Login' });
    }
  }
});
</script>

<style scoped>
.sea-sidebar {
  border-right: 1px solid #1b324e;
  height: 100vh !important;
  max-height: 100vh !important;
  overflow: hidden;
}

.logo-avatar {
  background-color: #1fb07a;
  color: white;
}

.profile-avatar {
  background-color: #1fb07a;
  color: white;
  font-weight: 700;
}

.scrollable-menu {
  overflow-y: auto;
  flex: 1;
  min-height: 0; /* required for flex children to shrink and allow scroll */
}

.section-label {
  color: #9fb5b8;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  font-weight: 600;
}

/* Expanded items */
.sidebar-item {
  color: #c8dde2 !important;
}

.sidebar-item :deep(.v-list-item-title) {
  font-weight: 700 !important;
  font-size: 0.875rem !important;
}

.sidebar-item :deep(.v-list-item__prepend .v-icon) {
  font-size: 20px !important;
}

.sidebar-item:hover {
  background-color: rgba(255,255,255,0.08) !important;
}

/* Rail mode icon buttons */
.rail-btn {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.15s;
}

.rail-btn:hover {
  background-color: rgba(255, 255, 255, 0.10);
}

.rail-btn--active {
  background-color: rgba(255, 255, 255, 0.18);
}
</style>
