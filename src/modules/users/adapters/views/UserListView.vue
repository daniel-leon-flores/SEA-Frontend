<template>
  <v-container fluid class="pa-8">
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
        :loading="loading"
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      >
        <!-- Matrícula -->
        <template #cell-matricula="{ value }">
          <span class="text-body-2 font-weight-medium">{{ value }}</span>
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
            :color="row.status ? 'success' : 'error'"
            size="small"
            variant="flat"
          >
            <v-icon start size="14">
              {{ row.status ? 'mdi-check-circle' : 'mdi-close-circle' }}
            </v-icon>
            {{ row.status_display }}
          </v-chip>
        </template>

        <!-- Acciones -->
        <template #cell-actions="{ row }">
          <div class="d-flex gap-1 justify-center">
            <v-tooltip text="Ver detalles" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-eye-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openDetailModal(row)"
                />
              </template>
            </v-tooltip>
            
            <v-tooltip text="Editar usuario" location="top">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="warning"
                  @click="editUser(row)"
                />
              </template>
            </v-tooltip>
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

    <!-- Modal de detalle del usuario (simplificado) -->
    <v-dialog v-model="detailModal" max-width="500" persistent>
      <v-card rounded="lg" elevation="0">
        <v-card-title class="d-flex align-center justify-space-between pa-5 bg-primary">
          <div class="d-flex align-center ga-3">
            <v-icon color="white">mdi-information-outline</v-icon>
            <span class="text-h6 text-white">Detalles Adicionales</span>
          </div>
          <v-btn icon variant="text" @click="detailModal = false">
            <v-icon color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-5" v-if="selectedUser">
          <v-row>
            <!-- Solo mostrar grupo si NO es admin -->
            <template v-if="selectedUser.role !== 'admin'">
              <v-col cols="12" v-if="selectedUser.group">
                <div class="mb-3">
                  <p class="text-caption text-grey-darken-1 mb-2">Grupo asignado</p>
                  <v-chip color="info" variant="tonal" size="large">
                    <v-icon start>mdi-account-group</v-icon>
                    {{ selectedUser.group.group_letter }} - Nivel {{ selectedUser.group.academic_level }}
                  </v-chip>
                </div>
              </v-col>

              <v-col cols="12" v-else>
                <v-alert type="info" variant="tonal" density="compact">
                  Este usuario no tiene un grupo asignado
                </v-alert>
              </v-col>
            </template>

            <v-col cols="12" v-if="selectedUser.role !== 'admin'">
              <v-divider class="my-2" />
            </v-col>

            <v-col cols="12">
              <div>
                <p class="text-caption text-grey-darken-1 mb-2">Fecha de registro</p>
                <div class="d-flex align-center">
                  <v-icon class="mr-2" color="grey-darken-1">mdi-calendar</v-icon>
                  <span class="text-body-1">{{ formatDate(selectedUser.date_joined) }}</span>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn variant="text" color="primary" @click="detailModal = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Modal de registro de usuario -->
    <v-dialog v-model="dialog" max-width="640" persistent scrollable>
      <v-card>
        <v-card-title class="pa-5 pb-3 d-flex align-center">
          <v-icon start color="primary">mdi-account-plus</v-icon>
          Registrar nuevo usuario
          <v-spacer />
          <v-btn icon="mdi-close" variant="text" size="small" @click="closeDialog" />
        </v-card-title>
        <v-divider />

        <v-card-text class="pa-5">
          <v-form ref="formRef" v-model="valid" @submit.prevent="submit">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.first_name"
                  label="Nombre(s)"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.first_name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.last_name"
                  label="Apellidos"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.last_name"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.email"
                  label="Correo electrónico"
                  type="email"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required, rules.email]"
                  :error-messages="serverErrors.email"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="payload.matricula"
                  label="Matrícula"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.matricula"
                />
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="payload.role"
                  label="Rol"
                  :items="roleItems"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  @update:model-value="onRoleChange"
                />
              </v-col>

              <!-- Grupo — solo alumnos -->
              <v-col v-if="payload.role === 'student'" cols="12">
                <v-select
                  v-model="payload.id_group"
                  label="Grupo académico"
                  :items="groups"
                  item-title="label"
                  item-value="id_group"
                  variant="outlined"
                  density="compact"
                  :rules="[rules.required]"
                  :error-messages="serverErrors.id_group"
                  :loading="loadingGroups"
                  clearable
                />
              </v-col>

              <!-- Materias — solo docentes -->
              <v-col v-if="payload.role === 'teacher'" cols="12">
                <v-select
                  v-model="payload.subject_ids"
                  label="Materias asignadas"
                  :items="subjects"
                  item-title="name"
                  item-value="id_subject"
                  variant="outlined"
                  density="compact"
                  multiple
                  chips
                  clearable
                  :error-messages="serverErrors.subject_ids"
                  :loading="loadingSubjects"
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />
        <v-card-actions class="pa-5 pt-3">
          <v-spacer />
          <v-btn variant="text" @click="closeDialog">Cancelar</v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            :loading="submitting"
            :disabled="!valid"
            @click="submit"
          >
            <v-icon start>mdi-check</v-icon>
            Registrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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

export default {
  name: 'UserListView',
  components: {
    PaginatedTable,
    Loader
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
      // Modal de registro
      dialog: false,
      valid: false,
      submitting: false,
      loadingGroups: false,
      loadingSubjects: false,
      groups: [],
      subjects: [],
      payload: {
        first_name: '',
        last_name: '',
        email: '',
        matricula: '',
        role: 'student',
        id_group: null,
        subject_ids: []
      },
      serverErrors: {},
      roleItems: [
        { label: 'Alumno', value: 'student' },
        { label: 'Docente', value: 'teacher' },
        { label: 'Administrador', value: 'admin' }
      ],
      rules: {
        required: (v) => (v !== null && v !== undefined && v !== '') || 'Campo requerido',
        email: (v) => /.+@.+\..+/.test(v) || 'Correo inválido'
      },
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
        { label: 'Matrícula', key: 'matricula', width: '130px', minWidth: '120px' },
        { label: 'Nombre Completo', key: 'fullName', width: '250px', minWidth: '200px' },
        { label: 'Correo', key: 'email', width: '220px', minWidth: '180px' },
        { label: 'Rol', key: 'role', width: '140px', minWidth: '120px' },
        { label: 'Estado', key: 'status', width: '120px', minWidth: '100px' },
        { label: 'Acciones', key: 'actions', width: '120px', minWidth: '100px' }
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
    
    formatDate(dateString) {
      if (!dateString) return 'N/A'
      const date = new Date(dateString)
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    },
    
    showSnackbar(message, color = 'success') {
      this.snackbar.message = message
      this.snackbar.color = color
      this.snackbar.show = true
    },
    
    async openDialog() {
      // Cargar grupos y materias si no están cargados
      if (this.groups.length === 0) await this.loadGroups()
      if (this.subjects.length === 0) await this.loadSubjects()
      this.dialog = true
    },
    
    closeDialog() {
      this.dialog = false
      if (this.$refs.formRef) {
        this.$refs.formRef.reset()
      }
      this.serverErrors = {}
      Object.assign(this.payload, {
        first_name: '',
        last_name: '',
        email: '',
        matricula: '',
        role: 'student',
        id_group: null,
        subject_ids: []
      })
    },
    
    onRoleChange() {
      this.payload.id_group = null
      this.payload.subject_ids = []
    },
    
    async loadGroups() {
      this.loadingGroups = true
      try {
        const { default: AxiosClient } = await import('@/config/axios')
        const res = await AxiosClient.get('/api/academic/groups/?status=true&page_size=100')
        const results = res.data?.data?.results ?? res.data?.data ?? []
        this.groups = results.map((g) => ({
          id_group: g.id_group,
          label: `${g.academic_level}${g.group_letter} — Gen. ${g.generation_year}`
        }))
      } catch (error) {
        console.error('Error loading groups:', error)
      } finally {
        this.loadingGroups = false
      }
    },
    
    async loadSubjects() {
      this.loadingSubjects = true
      try {
        const { default: AxiosClient } = await import('@/config/axios')
        const res = await AxiosClient.get('/api/academic/subjects/?status=true&page_size=100')
        this.subjects = res.data?.data?.results ?? res.data?.data ?? []
      } catch (error) {
        console.error('Error loading subjects:', error)
      } finally {
        this.loadingSubjects = false
      }
    },
    
    async submit() {
      this.serverErrors = {}
      const { valid } = await this.$refs.formRef.validate()
      if (!valid) return

      this.submitting = true
      try {
        const { UserController } = await import('../user.controller')
        const controller = new UserController()
        const response = await controller.createUser({ ...this.payload })

        if (response.success) {
          this.showSnackbar('Usuario registrado exitosamente. Se envió el correo con las credenciales.', 'success')
          this.closeDialog()
          this.fetchUsers()
        } else {
          const errors = response?.errors ?? {}
          Object.entries(errors).forEach(([k, v]) => {
            this.serverErrors[k] = Array.isArray(v) ? v[0] : String(v)
          })
          this.showSnackbar(response.message || 'Error al registrar el usuario.', 'error')
        }
      } catch (error) {
        console.error('Error submitting user:', error)
        this.showSnackbar('Error inesperado. Intenta de nuevo.', 'error')
      } finally {
        this.submitting = false
      }
    },
    
    openDetailModal(user) {
      this.selectedUser = user
      this.detailModal = true
    },
    
    editUser(user) {
      this.showSnackbar('Funcionalidad de edición en desarrollo', 'info')
      console.log('Editar usuario:', user)
    },
    
    viewUserDetail(user) {
      this.$router.push({ name: 'UserDetail', params: { id: user.id_user } })
    }
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
</style>
