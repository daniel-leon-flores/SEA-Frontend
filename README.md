# SEA - Sistema de Exámenes Autogestionados (Frontend)

Frontend del sistema SEA construido con **Vue 3 + Vite + TypeScript + Vuetify 3**, siguiendo Clean Architecture.

---

## Requisitos

- **Node.js** >= 18
- **npm** >= 9

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd SEA-Frontend

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Instalar dependencias
npm install

# 4. Iniciar servidor de desarrollo
npm run dev
```

---

## Scripts disponibles

| Comando           | Descripción                              |
|-------------------|------------------------------------------|
| `npm run dev`     | Servidor de desarrollo (Vite)            |
| `npm run build`   | Compilar para producción (vue-tsc + Vite)|
| `npm run preview` | Preview del build de producción          |

---

## Variables de entorno

Archivo `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_ENCRYPTION_KEY=<clave-de-cifrado-AES-256>
```

| Variable | Descripción |
|---|---|
| `VITE_API_BASE_URL` | URL base de la API del backend |
| `VITE_ENCRYPTION_KEY` | Clave AES-256 para cifrado de datos sensibles (cambio de contraseña). Debe coincidir con `ENCRYPTION_KEY` del backend |

---

## Credenciales de prueba

| Correo     | Contraseña   | Rol       |
|---------------|-------------|-----------|
| admin@legacydevs.com    | 1234  | admin   |
| profesor@legacydevs.com    | 1234  | teacher   |
| alumno@legacydevs.com    | 1234    | student     |

---

## Arquitectura

El proyecto sigue **Clean Architecture** con la siguiente estructura por módulo:

```
src/modules/{modulo}/
├── entities/              # Tipos y DTOs
├── use-cases/
│   ├── ports/             # Interfaces de repositorios
│   └── *.interactor.ts    # Casos de uso (UseCase<TInput, TOutput>)
└── adapters/
    ├── *.controller.ts      # Orquestador (instancia gateway + interactor)
    ├── *.storage.gateway.ts # Implementación HTTP (usa handleRequest)
    ├── views/               # Vistas Vue
    └── components/          # Componentes específicos del módulo
```

Algunos módulos incluyen adicionalmente:
- **`composables/`** — Composables de Vue (lógica reactiva reutilizable, e.g. `useSecureExam.ts`)
- **`utils/`** — Funciones utilitarias específicas del módulo

### Flujo de datos

```
Vista (Vue) → Controller → Interactor → Repository (Gateway) → API REST
```

1. La **Vista** invoca un método del **Controller**.
2. El **Controller** instancia un **Interactor** inyectándole el **Gateway** concreto.
3. El **Interactor** ejecuta la lógica y delega la llamada HTTP al **Gateway**.
4. El **Gateway** usa `handleRequest()` para comunicarse con la API.
5. La respuesta tipada `ApiResponse<T>` fluye de regreso hasta la vista.

---

## Módulos del sistema

| Módulo | Carpeta | Roles | Descripción |
|---|---|---|---|
| Autenticación | `src/modules/auth/` | Público | Login, recuperación de contraseña, logout |
| Respuestas | `src/modules/answers/` | Estudiante / Docente | Presentación de exámenes, revisión de respuestas, calificación manual |
| Exámenes | `src/modules/exams/` | Docente, Admin | Crear, editar, asignar y gestionar exámenes |
| Preguntas | `src/modules/questions/` | Docente, Admin | Banco de preguntas con carga individual y masiva (Excel) |
| Generaciones | `src/modules/generations/` | Admin | Gestión de cohortes/generaciones académicas |
| Grupos | `src/modules/groups/` | Admin | Grupos por generación, asignación de docentes |
| Materias | `src/modules/subjects/` | Docente, Admin | Catálogo de materias, grupos del docente, estudiantes |
| Usuarios | `src/modules/users/` | Admin | CRUD de usuarios (estudiantes, docentes, administradores) |
| Periodos | `src/modules/terms/` | Admin | Periodos académicos (Enero-Abril, Mayo-Agosto, Sep-Dic) |
| Reportes | `src/modules/reports/` | Docente, Admin | Dashboard de reportes con gráficas, exportación PDF/Excel |
| Auditoría | `src/modules/audit/` | Admin | Bitácora de cambios en la base de datos |

---

## Rutas principales

| Ruta | Nombre | Roles | Vista |
|---|---|---|---|
| `/login` | Login | Público | Inicio de sesión |
| `/password-recovery` | PasswordRecovery | Público | Recuperación de contraseña |
| `/unauthorized` | Unauthorized | Público | Acceso denegado |
| `/` | Reports | Docente, Admin | Dashboard de reportes (página principal) |
| `/my-exams` | MyExams | Estudiante | Exámenes asignados al estudiante |
| `/my-exams/:id/answer` | AnswerExam | Estudiante | Presentar examen (sidebar oculto) |
| `/my-exams/:id/review` | ReviewExam | Estudiante | Revisar respuestas post-examen |
| `/exams` | ManageExams | Docente, Admin | Gestión de exámenes |
| `/exams/:id/grades` | ExamGrades | Docente, Admin | Calificaciones por grupo |
| `/exams/.../grade` | ManualGrade | Docente, Admin | Calificación manual de respuestas |
| `/questions` | Questions | Docente, Admin | Banco de preguntas |
| `/generations` | Generations | Admin | Generaciones académicas |
| `/generations/:id/groups` | GenerationGroups | Admin | Grupos de una generación |
| `/subjects` | Subjects | Docente, Admin | Catálogo de materias |
| `/subjects/:id/groups` | TeacherSubjectGroups | Docente, Admin | Grupos por materia |
| `/subjects/.../students` | TeacherGroupStudents | Docente, Admin | Estudiantes de un grupo |
| `/users` | Users | Admin | Gestión de usuarios |
| `/users/:id` | UserDetail | Admin | Detalle de usuario |
| `/settings` | Settings | Admin | Bitácora de auditoría |

### Guard de navegación

- Rutas públicas: accesibles sin token. Si el usuario ya está autenticado e intenta ir a Login, se redirige según su rol.
- Rutas protegidas: requieren `sea_token` en `localStorage`. Si no existe, redirige a Login. Si el rol del usuario (`sea_selectedRole`) no coincide con `meta.roles`, redirige a Unauthorized.

---

## Estructura del proyecto

```
SEA-Frontend/
├── index.html                   # Punto de entrada HTML
├── package.json                 # Dependencias y scripts
├── tsconfig.json                # Configuración TypeScript (strict mode)
├── tsconfig.node.json           # Configuración TS para Vite
├── vite.config.ts               # Configuración de Vite + plugins
├── vercel.json                  # Configuración de despliegue en Vercel
├── sonar-project.properties     # Configuración de SonarQube
├── .env.example                 # Variables de entorno de ejemplo
├── public/                      # Archivos estáticos
└── src/
    ├── App.vue                  # Componente raíz (transiciones entre vistas)
    ├── main.ts                  # Bootstrap: Vue + Vuetify + Router
    ├── env.d.ts                 # Tipos para import.meta.env
    ├── vite-env.d.ts            # Tipos de Vite
    ├── components/              # Componentes compartidos
    │   ├── MainLayout.vue       # Layout con sidebar
    │   ├── SideBar.vue          # Navegación lateral por rol
    │   ├── PaginatedTable.vue   # Tabla paginada reutilizable
    │   ├── ConfirmDialog.vue    # Diálogo de confirmación genérico
    │   ├── ChangePasswordModal.vue
    │   ├── ConfirmPasswordChangeModal.vue
    │   ├── HeaderSession.vue    # Header con info del usuario
    │   ├── BackButton.vue       # Botón de retorno
    │   ├── BreadCrumb.vue       # Migas de pan
    │   ├── EmptyState.vue       # Estado vacío
    │   ├── Loader.vue           # Indicador de carga
    │   ├── Table.vue            # Tabla base
    │   └── TableButton.vue      # Botón de acciones en tablas
    ├── composables/             # Composables globales
    │   └── useVantaBirds.ts     # Fondo animado 3D del login
    ├── config/                  # Configuración HTTP
    │   ├── axios.ts             # Instancia de Axios (baseURL, timeout)
    │   └── http-client.gateway.ts  # Interceptores JWT + métodos HTTP
    ├── constants/
    │   └── menu-items.ts        # Items del sidebar por rol
    ├── kernel/                  # Tipos y utilidades transversales
    │   ├── types.ts             # ApiResponse, PaginatedData, UseCase, Entity
    │   ├── contract.ts          # Interfaz UseCase<TInput, TOutput>
    │   ├── validators.ts        # Reglas de validación Vuetify (required, email, noHtml, etc.)
    │   ├── utils.ts             # formatDate, isValidEmail, capitalize
    │   ├── api-error-message.ts # Extracción de errores DRF legibles
    │   ├── crypto.service.ts    # Cifrado AES-256-GCM (Web Crypto API)
    │   └── url-cipher.ts        # Ofuscación de IDs numéricos en URLs
    ├── services/
    │   └── auth.service.ts      # Cambio de contraseña cifrado
    ├── modules/                 # Módulos de negocio (Clean Architecture)
    │   ├── auth/                # Login, recuperación de contraseña
    │   ├── answers/             # Respuestas de exámenes
    │   ├── exams/               # Gestión de exámenes
    │   ├── questions/           # Banco de preguntas
    │   ├── generations/         # Generaciones académicas
    │   ├── groups/              # Grupos por generación
    │   ├── subjects/            # Materias y asignaciones
    │   ├── users/               # Gestión de usuarios
    │   ├── terms/               # Periodos académicos
    │   ├── reports/             # Reportes y estadísticas
    │   └── audit/               # Bitácora de auditoría
    ├── plugins/
    │   └── vuetify.ts           # Tema personalizado SEA + localización español
    ├── router/
    │   └── index.ts             # Rutas + guard de autenticación/roles
    ├── types/                   # Declaraciones TypeScript globales
    │   ├── vue.d.ts             # Tipos de componentes Vue
    │   ├── router.d.ts          # Extensión de RouteMeta
    │   └── vanta.d.ts           # Tipos para Vanta.js
    └── views/
        └── UnauthorizedView.vue # Página de acceso denegado
```

---

## Tecnologías

### Dependencias principales

| Librería | Versión | Propósito |
|---|---|---|
| **Vue 3** | 3.4.21 | Framework reactivo (Composition API + `<script setup>`) |
| **Vite** | 5.1.6 | Bundler con HMR instantáneo |
| **TypeScript** | 5.4.2 | Tipado estático (strict mode) |
| **Vuetify 3** | 3.5.7 | Componentes UI Material Design + MDI Icons |
| **Vue Router 4** | 4.3.0 | Enrutamiento SPA con guards por rol |
| **Axios** | 1.6.7 | Cliente HTTP con interceptores JWT |
| **Pinia** | 2.1.7 | Store de estado (disponible, no utilizado actualmente) |
| **Chart.js + vue-chartjs** | 4.5.1 / 5.3.3 | Gráficas para el módulo de reportes |
| **CodeMirror 6** | 6.0.2 | Editor de código para preguntas tipo CODE |
| **jsPDF + jspdf-autotable** | 4.2.1 / 5.0.7 | Exportación de reportes a PDF |
| **xlsx** | 0.18.5 | Exportación de reportes a Excel |
| **Three.js + Vanta** | 0.183.2 / 0.5.24 | Fondo animado 3D en la pantalla de login |
| **Sass** | 1.71.1 | Estilos personalizados |

---

## Comunicación con el backend

### Configuración HTTP

- **Base URL**: `VITE_API_BASE_URL` (default `http://localhost:8080`)
- **Timeout**: 60 segundos
- **Content-Type**: `application/json` (automático `multipart/form-data` para `FormData`)

### Interceptores

**Request**: Inyecta automáticamente `Authorization: Bearer <token>` y `X-Active-Role: <rol>` desde `localStorage`.

**Response**:
- **401**: Intenta refrescar el token con `POST /api/auth/refresh/`. Si falla, limpia sesión y redirige a `/login`. Excluye endpoints de autenticación del auto-refresh.
- **403**: Redirige a `/unauthorized`.
- Las peticiones pendientes durante un refresh se encolan y reintentan con el nuevo token.

### Autenticación

1. Login → Backend retorna `access`, `refresh` y datos del usuario.
2. Se almacenan en `localStorage`: `sea_token`, `sea_refresh`, `sea_selectedRole`, `sea_userName`.
3. Todas las peticiones incluyen el token en el header `Authorization`.
4. El refresh de tokens es transparente al usuario.

### Cifrado

El cambio de contraseña cifra los datos con **AES-256-GCM** (Web Crypto API nativa) antes de enviarlos al backend. La clave de cifrado se configura en `VITE_ENCRYPTION_KEY`.

---

## Convenciones de código

- **PascalCase** para componentes Vue y sus archivos
- **kebab-case** para archivos TypeScript (entities, DTOs, interactors, gateways)
- Todos los repositorios devuelven `Promise<ApiResponse<T>>`
- Todas las gateways usan `handleRequest()` de `src/config/http-client.gateway.ts`
- Los controllers instancian gateway + interactor en cada método
- Validaciones centralizadas en `kernel/validators.ts` (compatible con Vuetify `:rules`)
- Sanitización de inputs con `sanitizeText()` / `sanitizeName()` antes de enviar al backend
- Sin `console.log` en código de producción
