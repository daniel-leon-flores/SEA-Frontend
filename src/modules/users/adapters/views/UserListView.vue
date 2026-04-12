<template>
  <v-container fluid class="pa-8" style="background: #f9fbff; min-height: 100vh;">
    <Loader :visible="loading" message="Cargando usuarios..." />

    <!-- Header mejorado al estilo de generaciones -->
    <div class="d-flex align-start justify-space-between mb-8 flex-wrap ga-4">
      <div>
        <h1 class="page-title text-h4 font-weight-bold mb-2">Gestión de Usuarios</h1>
        <p class="page-subtitle text-body-1 text-grey-darken-1">Administra los usuarios del sistema (estudiantes, profesores, administradores)</p>
      </div>
      <v-btn 
        color="success" 
        size="large" 
        rounded="lg" 
        class="text-none" 
        prepend-icon="mdi-account-plus" 
        @click="openDialog"
      >
        Registrar usuario
      </v-btn>
    </div>

    <!-- Toolbar: filtros + búsqueda -->
    <v-row class="mb-4" align="center">
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="searchQuery"
          label="Buscar usuario"
          placeholder="Nombre, matrícula, email..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="debouncedSearch"
        />
      </v-col>
      <v-col cols="12" sm="3" md="2">
        <v-select
          v-model="filterRole"
          label="Filtrar por rol"
          :items="filterRoleItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="fetchUsers"
        />
      </v-col>
      <v-col cols="12" sm="3" md="2">
        <v-select
          v-model="filterStatus"
          label="Estado"
          :items="filterStatusItems"
          item-title="label"
          item-value="value"
          variant="outlined"
          density="comfortable"
          clearable
          hide-details
          @update:model-value="fetchUsers"
        />
      </v-col>
    </v-row>

    <!-- Tabla mejorada -->
    <v-card elevation="2" class="mb-4">
      <PaginatedTable
        :columns="columns"
        :data="users"
        :total-records="pagination.count"
        :total-pages="pagination.totalPages"
        :current-page-prop="pagination.currentPage"
        :page-size-prop="pagination.pageSize"
        :loading="false"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <!-- Matrícula -->
        <template #cell-matricula="{ row }">
          <span v-if="row.role === 'admin'" class="text-body-2 font-italic text-grey-darken-1">
            No aplica
          </span>
          <span v-else class="text-body-2">
            {{ row.matricula || '-' }}
          </span>
        </template>
      
        <!-- Nombre completo -->
        <template #cell-fullName="{ row }">
          <div class="text-center">
            <div class="font-weight-medium text-body-2">{{ row.full_name }}</div>
          </div>
        </template>

        <!-- Email -->
        <template #cell-email="{ value }">
          <span class="text-body-2">{{ value }}</span>
        </template>

        <!-- Rol -->
        <template #cell-role="{ value }">
          <v-chip :color="getRoleColor(value)" size="small" variant="tonal">
            <v-icon start size="14">{{ getRoleIcon(value) }}</v-icon>
            {{ getRoleLabel(value) }}
          </v-chip>
        </template>

        <!-- Estado -->
        <template #cell-status="{ row }">
          <v-chip
            :color="row.status ? '#10b981' : '#f59e0b'"
            size="small"
            class="status-chip"
          >
            {{ row.status ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template #cell-actions="{ row }">
          <div class="d-flex justify-center">
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  color="grey-darken-1"
                />
              </template>
              <v-list density="compact">
                <v-list-item @click="openDetailModal(row)">
                  <template #prepend>
                    <v-icon color="primary">mdi-eye-outline</v-icon>
                  </template>
                  <v-list-item-title>Ver detalles</v-list-item-title>
                </v-list-item>
                
                <v-list-item @click="editUser(row)">
                  <template #prepend>
                    <v-icon color="warning">mdi-pencil-outline</v-icon>
                  </template>
                  <v-list-item-title>Editar usuario</v-list-item-title>
                </v-list-item>

                <v-list-item v-if="row.role === 'teacher'" @click="openAssignGroupsDialog(row)">
                  <template #prepend>
                    <v-icon color="primary">mdi-account-group-outline</v-icon>
                  </template>
                  <v-list-item-title>Asignar a grupo</v-list-item-title>
                </v-list-item>

                <v-divider class="my-1" />

                <v-list-item @click="openStatusInfoModal(row)">
                  <template #prepend>
                    <v-icon :color="row.status ? 'error' : 'success'">
                      {{ row.status ? 'mdi-account-cancel' : 'mdi-account-check' }}
                    </v-icon>
                  </template>
                  <v-list-item-title>
                    {{ row.status ? 'Desactivar' : 'Activar' }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </PaginatedTable>
    </v-card>

    <!-- Controles de paginación fuera de la tabla -->
    <v-row v-if="!loading && pagination.count > 0" class="align-center mt-2">
      <v-col cols="12" md="3">
        <v-select
          label="Registros por página"
          v-model="pagination.pageSize"
          :items="pageSizesOptions"
          variant="outlined"
          density="compact"
          hide-details
          @update:model-value="handlePageSizeChange"
        />
      </v-col>

      <v-col cols="12" md="6" class="d-flex justify-center">
        <v-pagination
          v-model="pagination.currentPage"
          :length="pagination.totalPages"
          :total-visible="7"
          rounded="circle"
          density="comfortable"
          @update:model-value="handlePageChange"
        />
      </v-col>

      <v-col cols="12" md="3" class="text-end">
        <p class="text-caption text-grey-darken-1">
          {{ paginationInfo }}
        </p>
      </v-col>
    </v-row>

    <!-- Modal de detalle del usuario -->
    <UserDetailModal
      :dialog="detailModal"
      @update:dialog="detailModal = $event"
      :user="selectedUser"
    />

    <!-- Modales de creación y edición -->
    <CreateUserModal 
      :dialog="createDialog" 
      @update:dialog="createDialog = $event"
      @user-created="handleUserCreated"
    />
    
    <UpdateUserModal 
      :dialog="updateDialog"
      @update:dialog="updateDialog = $event"
      :user="selectedUserForEdit"
      @user-updated="handleUserUpdated"
    />

    <!-- Modal de confirmación de cambio de estado -->
    <StatusChangeInfoModal
      :dialog="statusInfoDialog"
      @update:dialog="statusInfoDialog = $event"
      :user="userForStatusChange"
      :new-status="newStatusValue"
      :loading="statusLoading"
      @confirm="handleStatusChangeConfirm"
      @cancel="handleStatusChangeCancel"
    />

    <!-- Dialog asignar docente a grupo -->
    <AssignTeacherGroupsDialog
      :model-value="assignGroupsDialog"
      :teacher="selectedTeacherForGroups"
      @update:model-value="assignGroupsDialog = $event"
      @assigned="handleTeacherGroupsAssigned"
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
  </v-container>
</template>

<script lang="ts">
import PaginatedTable from '@/components/PaginatedTable.vue'
import Loader from '@/components/Loader.vue'
import CreateUserModal from '../components/CreateUserModal.vue'
import UpdateUserModal from '../components/UpdateUserModal.vue'
import UserDetailModal from '../components/UserDetailModal.vue'
import StatusChangeInfoModal from '../components/StatusChangeInfoModal.vue'
import ConfirmStatusChangeModal from '../components/ConfirmStatusChangeModal.vue'
import AssignTeacherGroupsDialog from '../components/AssignTeacherGroupsDialog.vue'

export default {
  name: 'UserListView',
  components: {
    PaginatedTable,
    Loader,
    CreateUserModal,
    UpdateUserModal,
    UserDetailModal,
    StatusChangeInfoModal,
    ConfirmStatusChangeModal,
    AssignTeacherGroupsDialog,
  },
  data() {
    return {
      loading: false,
      users: [],
      searchQuery: '',
      filterRole: null,
      filterStatus: null,
      detailModal: false,
      selectedUser: null,
      // Modales separados
      createDialog: false,
      updateDialog: false,
      selectedUserForEdit: null,
      // Modales de cambio de estado (confirmación única)
      statusInfoDialog: false,
      statusLoading: false,
      userForStatusChange: null,
      newStatusValue: false,
      // Dialog asignar docente a grupo
      assignGroupsDialog: false,
      selectedTeacherForGroups: null,
      pagination: {
        count: 0,
        totalPages: 1,
        currentPage: 1,
        pageSize: 10
      },
      snackbar: {
        show: false,
        message: '',
        color: 'success'
      },
      columns: [
        { label: 'Matrícula', key: 'matricula', width: '150px', minWidth: '120px' },
        { label: 'Nombre Completo', key: 'fullName', width: '250px', minWidth: '200px' },
        { label: 'Correo', key: 'email', width: '250px', minWidth: '200px' },
        { label: 'Rol', key: 'role', width: '140px', minWidth: '120px' },
        { label: 'Estado', key: 'status', width: '120px', minWidth: '100px' },
        { label: 'Acciones', key: 'actions', width: '100px', minWidth: '80px' }
      ],
      filterRoleItems: [
        { label: 'Estudiantes', value: 'student' },
        { label: 'Docentes', value: 'teacher' },
        { label: 'Administradores', value: 'admin' }
      ],
      filterStatusItems: [
        { label: 'Activos', value: 'true' },
        { label: 'Inactivos', value: 'false' }
      ],
      pageSizesOptions: [
        { title: '5', value: 5 },
        { title: '10', value: 10 },
        { title: '20', value: 20 },
        { title: '50', value: 50 },
        { title: '100', value: 100 }
      ],
      debounceTimer: null
    }
  },
  computed: {
    paginationInfo() {
      if (this.pagination.count === 0) return '0 registros'
      const start = (this.pagination.currentPage - 1) * this.pagination.pageSize + 1
      const end = Math.min(this.pagination.currentPage * this.pagination.pageSize, this.pagination.count)
      return `Mostrando ${start}-${end} de ${this.pagination.count} registros`
    }
  },
  mounted() {
    this.fetchUsers()
  },
  methods: {
    async fetchUsers() {
      this.loading = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        
        const response = await controller.getUsers({
          pagination: {
            page: this.pagination.currentPage,
            limit: this.pagination.pageSize,
            filter: this.searchQuery || undefined
          },
          role: this.filterRole || undefined,
          status: this.filterStatus || undefined
        })
        
        console.log('Response from backend:', response)
        
        // El backend devuelve la respuesta directamente sin envolver en ApiResponse.data
        // Verificar si response tiene la estructura de paginación directamente
        if (response.results) {
          // Respuesta directa del paginador
          this.users = response.results || []
          this.pagination.count = response.count || 0
          this.pagination.totalPages = response.total_pages || 1
          this.pagination.currentPage = response.current_page || 1
          this.pagination.pageSize = response.page_size || 10
        } else if (response.success && response.data) {
          // Respuesta envuelta en ApiResponse
          this.users = response.data.results || []
          this.pagination.count = response.data.count || 0
          this.pagination.totalPages = response.data.total_pages || 1
          this.pagination.currentPage = response.data.current_page || 1
          this.pagination.pageSize = response.data.page_size || 10
        } else {
          console.error('Unexpected response format:', response)
          this.showSnackbar('Error al cargar usuarios', 'error')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        this.showSnackbar('Error al cargar usuarios', 'error')
      } finally {
        this.loading = false
      }
    },
    
    handlePageChange(page) {
      this.pagination.currentPage = page
      this.fetchUsers()
    },
    
    handlePageSizeChange(pageSize) {
      this.pagination.pageSize = pageSize
      this.pagination.currentPage = 1
      this.fetchUsers()
    },
    
    debouncedSearch() {
      clearTimeout(this.debounceTimer)
      this.debounceTimer = setTimeout(() => {
        this.pagination.currentPage = 1
        this.fetchUsers()
      }, 500)
    },
    
    getInitials(user) {
      const first = user.first_name?.[0] || ''
      const last = user.last_name?.[0] || ''
      return (first + last).toUpperCase()
    },
    
    getRoleLabel(role) {
      const labels = {
        student: 'Estudiante',
        teacher: 'Docente',
        admin: 'Administrador'
      }
      return labels[role] || role
    },
    
    getRoleColor(role) {
      const colors = {
        student: 'primary',
        teacher: 'success',
        admin: 'error'
      }
      return colors[role] || 'grey'
    },
    
    getRoleIcon(role) {
      const icons = {
        student: 'mdi-school',
        teacher: 'mdi-account-tie',
        admin: 'mdi-shield-crown'
      }
      return icons[role] || 'mdi-account'
    },
    
    showSnackbar(message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    },
    
    openDialog() {
      this.createDialog = true
    },
    
    handleUserCreated(user) {
      this.showSnackbar('Usuario registrado exitosamente. Se envió el correo con las credenciales.', 'success')
      this.fetchUsers()
    },
    
    handleUserUpdated(user) {
      this.showSnackbar('Usuario actualizado exitosamente.', 'success')
      this.fetchUsers()
    },
    
    openDetailModal(user) {
      this.selectedUser = user
      this.detailModal = true
    },
    
    editUser(user) {
      this.selectedUserForEdit = user
      this.updateDialog = true
    },
    
    openStatusInfoModal(user) {
      this.userForStatusChange = user
      this.newStatusValue = !user.status
      this.statusInfoDialog = true
    },
    
    async handleStatusChangeConfirm() {
      if (!this.userForStatusChange) return
      
      const userId = this.userForStatusChange.id_user
      const newStatus = this.newStatusValue
      
      this.statusLoading = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        const response = await controller.updateUserStatus(userId, newStatus)
        
        if (response.success) {
          const message = newStatus 
            ? 'Usuario activado exitosamente.'
            : 'Usuario desactivado exitosamente.'
          this.showSnackbar(message, 'success')
          this.statusInfoDialog = false
          this.userForStatusChange = null
          this.fetchUsers()
        } else {
          this.showSnackbar(response.message || 'Error al cambiar el estado del usuario.', 'error')
        }
      } catch (error) {
        console.error('Error changing user status:', error)
        this.showSnackbar('Error inesperado al cambiar el estado.', 'error')
      } finally {
        this.statusLoading = false
      }
    },
    
    handleStatusChangeCancel() {
      // Cerrar el modal y limpiar
      this.statusInfoDialog = false
      this.userForStatusChange = null
    },
    
    viewUserDetail(user) {
      this.$router.push({ name: 'UserDetail', params: { id: user.id_user } })
    },

    openAssignGroupsDialog(user) {
      this.selectedTeacherForGroups = user
      this.assignGroupsDialog = true
    },

    handleTeacherGroupsAssigned() {
      this.showSnackbar('Asignación de grupos actualizada exitosamente.', 'success')
    },
  }
}
</script>

<style scoped>
.page-title {
  color: #1a1a1a;
  line-height: 1.2;
}

.page-subtitle {
  color: #666;
  line-height: 1.5;
}

.gap-2 {
  gap: 8px;
}

.status-chip {
  font-weight: 600;
}
</style>
