# SEA-front — Guía Técnica de Arquitectura

## Sistema de Exámenes Autogestionados — Frontend

**Versión:** 1.0.0  
**Stack:** Vue 3 · Vuetify 3 · Vite · TypeScript · Axios  
**Arquitectura:** Clean Architecture Modular  
**Última actualización:** Marzo 2026

---

## Tabla de Contenidos

1. [Introducción al Proyecto](#1-introducción-al-proyecto)
2. [Stack Tecnológico](#2-stack-tecnológico)
3. [Arquitectura del Frontend](#3-arquitectura-del-frontend)
4. [Estructura Completa del Proyecto](#4-estructura-completa-del-proyecto)
5. [Carpeta components/](#5-carpeta-components)
6. [Carpeta config/](#6-carpeta-config)
7. [Carpeta kernel/](#7-carpeta-kernel)
8. [Carpeta modules/](#8-carpeta-modules)
9. [Carpeta adapters/](#9-carpeta-adapters)
10. [Carpeta entities/](#10-carpeta-entities)
11. [Carpeta use-cases/](#11-carpeta-use-cases)
12. [Controllers](#12-controllers)
13. [Storage Gateways](#13-storage-gateways)
14. [Flujo Completo de una Petición](#14-flujo-completo-de-una-petición)
15. [Sistema de Diseño](#15-sistema-de-diseño)
16. [Sistema de Autenticación](#16-sistema-de-autenticación)
17. [Reglas de Desarrollo para el Equipo](#17-reglas-de-desarrollo-para-el-equipo)
18. [Cómo Desarrollar una Nueva Funcionalidad](#18-cómo-desarrollar-una-nueva-funcionalidad)
19. [Cómo Usar Copilot Correctamente](#19-cómo-usar-copilot-correctamente)
20. [Buenas Prácticas](#20-buenas-prácticas)
21. [Conclusión](#21-conclusión)

---

## 1. Introducción al Proyecto

### ¿Qué es SEA?

**SEA (Sistema de Exámenes Autogestionados)** es una plataforma web diseñada para la gestión integral de exámenes en instituciones educativas. El sistema permite a profesores crear, administrar y evaluar exámenes de forma digital, mientras que los estudiantes pueden consultarlos y responderlos de manera autónoma.

### ¿Qué problemas resuelve?

| Problema | Solución SEA |
|----------|-------------|
| Creación manual de exámenes | Formularios digitales con banco de preguntas reutilizable |
| Gestión dispersa de grupos y materias | Módulos centralizados de administración académica |
| Falta de reportes de desempeño | Generación automática de reportes por examen, grupo y estudiante |
| Control de acceso desorganizado | Sistema de roles (Estudiante, Profesor, Administrador) |
| Evaluación lenta y propensa a errores | Calificación automatizada |

### ¿Qué rol tiene el frontend?

El frontend de SEA es la interfaz de usuario que se comunica con el backend (API REST basada en Django). Su responsabilidad es:

- **Presentar** la información de forma clara y organizada al usuario.
- **Capturar** las interacciones del usuario (formularios, clicks, navegación).
- **Delegar** toda la lógica de negocio a capas intermedias (Controllers, UseCases).
- **Comunicarse** con el backend exclusivamente a través de gateways tipados.

El frontend **nunca** contiene lógica de negocio directamente en las vistas. Toda operación pasa por un flujo arquitectónico estricto que se detalla en esta guía.

---

## 2. Stack Tecnológico

### Vue 3

**¿Por qué Vue 3?**

Vue 3 es el framework principal para la construcción de la interfaz de usuario. Se eligió por:

- **Composition API:** Permite organizar la lógica de forma más clara y reutilizable mediante `<script setup>` y funciones `ref`, `computed`, `watch`.
- **Reactividad granular:** El sistema de reactividad de Vue 3 es más eficiente que Vue 2, actualizando solo los nodos del DOM que realmente cambian.
- **TypeScript nativo:** Vue 3 fue diseñado desde cero con soporte completo para TypeScript.
- **Ecosistema maduro:** Vue Router, Pinia, Vuetify y herramientas como Volar funcionan de forma integrada.

```typescript
// Ejemplo de componente con Composition API
<script setup lang="ts">
import { ref, computed } from 'vue';

const count = ref(0);
const doubled = computed(() => count.value * 2);
</script>
```

### Vuetify 3

**¿Por qué Vuetify?**

Vuetify es la librería de componentes UI basada en Material Design. Se eligió por:

- **Componentes pre-construidos:** Tablas, formularios, diálogos, barras laterales, botones — todos listos para usar.
- **Sistema de grid responsivo:** Basado en un grid de 12 columnas con breakpoints (`xs`, `sm`, `md`, `lg`, `xl`).
- **Tematización:** Permite definir colores personalizados del sistema a nivel global.
- **Iconos Material Design:** Incluye más de 7,000 iconos MDI integrados.
- **Consistencia visual:** Todos los componentes siguen las mismas guías de diseño sin esfuerzo adicional.

### Vite

**¿Por qué Vite?**

Vite es el bundler y servidor de desarrollo. Se eligió por:

- **Hot Module Replacement (HMR):** Los cambios en el código se reflejan instantáneamente en el navegador sin recargar la página.
- **Build rápido:** Utiliza Rollup internamente para producción, generando bundles optimizados.
- **Soporte nativo para TypeScript:** No requiere configuración adicional.
- **Variables de entorno:** Soporta archivos `.env` con prefijo `VITE_` para configuración segura.

```
# .env
VITE_API_BASE_URL=http://localhost:8000
```

### TypeScript

**¿Por qué TypeScript?**

TypeScript es obligatorio en este proyecto. Se eligió por:

- **Tipado estático:** Previene errores de tipo en tiempo de compilación, no en producción.
- **Autocompletado inteligente:** El IDE conoce exactamente qué propiedades tiene cada objeto.
- **Documentación implícita:** Los tipos actúan como documentación viva del código.
- **Refactorización segura:** Renombrar una propiedad actualiza todas las referencias automáticamente.

```typescript
// Sin TypeScript — error silencioso en producción
const user = getUser();
console.log(user.nombre); // undefined — ¿era "name"?

// Con TypeScript — error detectado al compilar
const user: User = getUser();
console.log(user.nombre); // ❌ Error: 'nombre' does not exist on type 'User'
```

### Axios

**¿Por qué Axios?**

Axios es el cliente HTTP. Se eligió por:

- **Interceptores:** Permiten agregar el token JWT a cada petición automáticamente.
- **Manejo de errores centralizado:** Los errores HTTP se capturan y procesan en un solo lugar.
- **Timeout configurable:** Evita peticiones colgadas con un timeout global.
- **Transformación de datos:** Convierte automáticamente JSON a objetos JavaScript.

---

## 3. Arquitectura del Frontend

### Clean Architecture Aplicada al Frontend

Este proyecto implementa **Clean Architecture** adaptada al contexto de una aplicación frontend. La arquitectura fue inspirada en el proyecto **MediTriage-frontend** y establece una separación estricta de responsabilidades entre capas.

### Principios Fundamentales

#### 1. Separación de Capas

Cada capa tiene una responsabilidad única y no puede saltarse niveles:

```
┌─────────────────────────────────────────────┐
│                   VISTA                      │
│         (Vue Components / Pages)             │
│    Solo presentación e interacción UI        │
├─────────────────────────────────────────────┤
│                CONTROLLER                    │
│         (Orchestration Layer)                │
│    Instancia repositorios y use cases        │
├─────────────────────────────────────────────┤
│                USE CASE                      │
│           (Interactors)                      │
│    Contiene la lógica de negocio             │
├─────────────────────────────────────────────┤
│              REPOSITORY                      │
│         (Port / Interface)                   │
│    Contrato abstracto de datos               │
├─────────────────────────────────────────────┤
│            STORAGE GATEWAY                   │
│      (Implementación concreta)               │
│    Conexión real con el backend              │
├─────────────────────────────────────────────┤
│              HTTP CLIENT                     │
│         (Axios + Interceptors)               │
│    Capa de transporte HTTP                   │
├─────────────────────────────────────────────┤
│                  API                         │
│          (Backend Django)                    │
└─────────────────────────────────────────────┘
```

#### 2. Independencia de Frameworks

Las entidades y los use cases **no dependen** de Vue, Vuetify ni de Axios. Son TypeScript puro. Esto significa que si en el futuro se cambia Vue por React o Axios por Fetch, las capas internas no se modifican.

#### 3. Dependencia hacia adentro

Las capas externas (vistas) pueden conocer a las capas internas (use cases), pero **nunca** al revés. Un use case jamás importa un componente de Vue.

### Conceptos Clave

| Concepto | Descripción | Ubicación en el proyecto |
|----------|-------------|--------------------------|
| **Entity** | Objeto de dominio que representa un concepto del negocio (Exam, User, Subject) | `modules/[modulo]/entities/` |
| **DTO** | Data Transfer Object — estructura de datos para enviar/recibir información | `modules/[modulo]/entities/` |
| **Use Case (Interactor)** | Clase que ejecuta una operación de negocio específica | `modules/[modulo]/use-cases/` |
| **Repository (Port)** | Interfaz (contrato) que define qué operaciones de datos existen | `modules/[modulo]/use-cases/ports/` |
| **Gateway** | Implementación concreta del repositorio que se conecta al backend | `modules/[modulo]/adapters/` |
| **Controller** | Orquestador que conecta la vista con los use cases | `modules/[modulo]/adapters/` |
| **View** | Componente Vue que muestra la UI y captura interacciones | `modules/[modulo]/adapters/views/` |

### Flujo de Información

```
Vista ──▶ Controller ──▶ UseCase ──▶ Repository (Port) ──▶ Gateway ──▶ API
  ◀──────── ◀────────── ◀─────────── ◀──────────────────── ◀──────── ◀───
                         ApiResponse<T>
```

La información **siempre** fluye de la misma manera:

1. La **Vista** captura la acción del usuario y llama al **Controller**.
2. El **Controller** instancia el **Repository** y el **UseCase**.
3. El **UseCase** ejecuta la lógica de negocio usando el **Repository**.
4. El **Gateway** (implementación del Repository) llama al backend usando `handleRequest`.
5. El backend responde con `ApiResponse<T>`.
6. La respuesta sube de vuelta hasta la vista.

---

## 4. Estructura Completa del Proyecto

```
SEA-frontend/
├── index.html                    # Entry point HTML
├── package.json                  # Dependencias y scripts
├── vite.config.ts                # Configuración de Vite
├── tsconfig.json                 # Configuración de TypeScript
├── tsconfig.node.json            # TypeScript para archivos Node
├── .env                          # Variables de entorno
├── .env.example                  # Ejemplo de variables de entorno
│
└── src/
    ├── App.vue                   # Componente raíz de la aplicación
    ├── main.ts                   # Punto de entrada — monta Vue + plugins
    ├── env.d.ts                  # Tipos para variables de entorno
    ├── vite-env.d.ts             # Tipos de Vite
    │
    ├── components/               # Componentes reutilizables globales
    │   ├── MainLayout.vue        # Layout principal con Sidebar
    │   ├── SideBar.vue           # Barra lateral de navegación
    │   ├── HeaderSession.vue     # Encabezado de página con nombre de usuario
    │   ├── Table.vue             # Tabla genérica con paginación
    │   ├── TableButton.vue       # Botón de acción para tablas
    │   ├── BackButton.vue        # Botón "Volver"
    │   ├── BreadCrumb.vue        # Migas de pan (breadcrumbs)
    │   ├── ConfirmDialog.vue     # Diálogo de confirmación reutilizable
    │   ├── EmptyState.vue        # Estado vacío (sin datos)
    │   └── Loader.vue            # Indicador de carga global
    │
    ├── config/                   # Configuración de comunicación HTTP
    │   ├── axios.ts              # Instancia de Axios configurada
    │   ├── http-client.gateway.ts# Interceptores + handleRequest
    │   └── mock-auth.ts          # Autenticación mock (desarrollo)
    │
    ├── constants/                # Constantes globales
    │   └── menu-items.ts         # Menús por rol (STUDENT, TEACHER, ADMIN)
    │
    ├── kernel/                   # Núcleo compartido — contratos y tipos
    │   ├── contract.ts           # Interfaz UseCase<TInput, TOutput>
    │   ├── types.ts              # Entity, ApiResponse, PaginationDto
    │   └── utils.ts              # Utilidades (formatDate, isValidEmail)
    │
    ├── modules/                  # Módulos de funcionalidad (Clean Architecture)
    │   ├── auth/                 # Autenticación
    │   ├── dashboard/            # Panel principal
    │   ├── exams/                # Gestión de exámenes
    │   ├── questions/            # Banco de preguntas
    │   ├── groups/               # Gestión de grupos
    │   ├── subjects/             # Gestión de materias
    │   ├── users/                # Gestión de usuarios
    │   ├── terms/                # Gestión de cuatrimestres
    │   └── reports/              # Reportes
    │
    ├── plugins/                  # Plugins de Vue
    │   └── vuetify.ts            # Configuración de Vuetify + tema
    │
    ├── router/                   # Enrutamiento
    │   └── index.ts              # Rutas + guards de autenticación
    │
    ├── types/                    # Declaraciones de tipos globales
    │   ├── vue.d.ts              # Declaración de módulos .vue
    │   └── router.d.ts           # Extensión de RouteMeta
    │
    └── views/                    # Vistas que no pertenecen a un módulo
        ├── SettingsView.vue      # Vista de ajustes
        └── UnauthorizedView.vue  # Vista de acceso no autorizado
```

### Propósito de cada carpeta

| Carpeta | Propósito |
|---------|-----------|
| `components/` | Componentes UI reutilizables, sin lógica de negocio |
| `config/` | Configuración del cliente HTTP (Axios, interceptores, handleRequest) |
| `constants/` | Valores constantes compartidos (menús, roles, configuraciones) |
| `kernel/` | Contratos, tipos e interfaces compartidas por todos los módulos |
| `modules/` | Funcionalidades del sistema organizadas como módulos independientes |
| `plugins/` | Configuración de plugins de Vue (Vuetify) |
| `router/` | Definición de rutas y guards de navegación |
| `types/` | Declaraciones de tipos globales de TypeScript |
| `views/` | Vistas genéricas que no pertenecen a ningún módulo específico |

---

## 5. Carpeta `components/`

La carpeta `components/` contiene **componentes reutilizables globales**. Estos componentes:

- ✅ Son **reutilizables** en cualquier módulo o vista.
- ✅ Son **desacoplados** — no conocen la lógica de negocio.
- ✅ Son **presentacionales** — solo reciben datos vía `props` y emiten eventos.
- ❌ **No** llaman a controllers ni gateways.
- ❌ **No** contienen lógica de negocio.
- ❌ **No** hacen peticiones HTTP directamente.

### Catálogo de Componentes

#### `MainLayout.vue`

**Responsabilidad:** Layout principal que envuelve todas las vistas autenticadas.

```vue
<template>
  <v-layout>
    <SideBar v-if="showSidebar" :role="userRole" />
    <v-main class="main-content">
      <router-view />
    </v-main>
  </v-layout>
</template>
```

- Renderiza el `SideBar` condicionalmente según el rol del usuario.
- Usa `<router-view />` para renderizar la vista activa.
- Lee el rol del `localStorage` (`sea_selectedRole`).

#### `SideBar.vue`

**Responsabilidad:** Barra de navegación lateral con dos modos.

- **Modo expandido (280px):** Muestra íconos + títulos + sección de navegación y acciones rápidas.
- **Modo rail (72px):** Muestra solo íconos con tooltips.
- **Modo móvil:** Se convierte en un drawer temporal.
- Recibe el `role` como prop y carga los menús correspondientes desde `menu-items.ts`.
- Muestra el nombre del usuario, sus iniciales y su rol en el footer.
- Incluye botón de logout.

#### `HeaderSession.vue`

**Responsabilidad:** Encabezado de cada página que muestra el título de la sección y el nombre del usuario.

```vue
<HeaderSession title="Mis Exámenes" />
```

#### `Table.vue`

**Responsabilidad:** Tabla genérica reutilizable con paginación integrada.

- Recibe `columns` (definición de columnas) y `data` (filas) como props.
- Paginación local configurable (5, 10, 20, 50 o todos los registros).
- Usa slots con nombre para personalizar el contenido de celdas: `cell-{key}`.

```vue
<Table :columns="columns" :data="users">
  <template #cell-actions="{ row }">
    <TableButton icon="mdi-pencil" tooltip="Editar" @click="edit(row)" />
  </template>
</Table>
```

#### `TableButton.vue`

**Responsabilidad:** Botón de acción pequeño para usar dentro de tablas, con tooltip.

#### `BackButton.vue`

**Responsabilidad:** Botón "Volver" que navega a la página anterior.

#### `BreadCrumb.vue`

**Responsabilidad:** Migas de pan generadas automáticamente a partir de la ruta actual.

#### `ConfirmDialog.vue`

**Responsabilidad:** Diálogo de confirmación reutilizable basado en promesas.

```typescript
// Uso desde cualquier vista
const dialogRef = ref();
const confirmed = await dialogRef.value.open('¿Desea eliminar este examen?');
if (confirmed) {
  // Proceder con la eliminación
}
```

#### `EmptyState.vue`

**Responsabilidad:** Componente que muestra un estado vacío cuando no hay datos, con ícono, título, descripción y botón de acción opcional.

#### `Loader.vue`

**Responsabilidad:** Overlay de carga global con spinner animado.

---

## 6. Carpeta `config/`

La carpeta `config/` contiene toda la configuración de comunicación HTTP con el backend.

### `axios.ts` — Instancia de Axios

Este archivo crea y exporta la instancia de Axios configurada:

```typescript
import axios, { AxiosInstance } from "axios";

const API: string = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

const instance: AxiosInstance = axios.create({
  baseURL: API,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
});

export default instance;
```

**Puntos clave:**

- La URL base se lee de la variable de entorno `VITE_API_BASE_URL`.
- Si no existe, usa `http://localhost:8000` como fallback.
- El timeout es de **10 segundos**.
- Los headers por defecto son JSON.

### `http-client.gateway.ts` — Interceptores + handleRequest

Este es el archivo más importante de la capa de comunicación. Tiene tres responsabilidades:

#### 1. Request Interceptor

Antes de cada petición HTTP, automáticamente:

- Agrega el header `Authorization: Bearer <token>` con el JWT almacenado en `localStorage`.
- Agrega el header `X-Active-Role` con el rol activo del usuario.
- Detecta si el payload es `FormData` y ajusta el `Content-Type`.

```typescript
AxiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('sea_token');
  const activeRole = localStorage.getItem('sea_selectedRole');

  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (activeRole) config.headers['X-Active-Role'] = activeRole;
  // ...
});
```

#### 2. Response Interceptor — Token Refresh

Cuando el backend responde con **401 (Unauthorized)**:

1. Intenta refrescar el token usando el `refresh` token almacenado.
2. Si el refresh tiene éxito, reemplaza el token y **reintenta la petición original automáticamente**.
3. Si el refresh falla, limpia todo el `localStorage` y redirige al login.

Cuando responde con **403 (Forbidden):**

- Redirige a la vista de acceso no autorizado.

#### 3. Función `handleRequest<T, P>`

Esta es la **función central** que todos los Storage Gateways usan para comunicarse con el backend:

```typescript
export async function handleRequest<T, P = undefined>(
  method: "post" | "put" | "get" | "delete" | "patch",
  url: string,
  payload?: P,
  config?: AxiosRequestConfig
): Promise<ApiResponse<T>>
```

**¿Qué hace?**

- Ejecuta la petición HTTP con el método, URL y payload indicados.
- **Siempre** retorna un objeto `ApiResponse<T>` tipado, tanto en éxito como en error.
- Captura errores de red y los transforma en un `ApiResponse` con `success: false`.

**¿Por qué es importante?**

Garantiza que **todas** las peticiones del sistema pasen por el mismo canal y retornen el mismo formato de respuesta. Ningún gateway necesita manejar errores HTTP por su cuenta.

### `mock-auth.ts` — Autenticación mock

Archivo con credenciales hardcodeadas para desarrollo. **No se usa en producción.** Actualmente el login usa la API real.

---

## 7. Carpeta `kernel/`

La carpeta `kernel/` contiene los **elementos fundacionales** que son compartidos por todos los módulos del sistema. Nada dentro de `kernel/` debe depender de un módulo específico.

### `contract.ts` — Interfaz UseCase

Define el contrato base que todos los interactors deben implementar:

```typescript
export interface UseCase<TInput, TOutput> {
  execute(payload?: TInput): Promise<TOutput>;
}
```

- `TInput`: Tipo de datos que recibe el caso de uso (DTO, id, etc.).
- `TOutput`: Tipo de datos que retorna (generalmente `ApiResponse<T>`).
- Todos los interactors del proyecto **deben** implementar esta interfaz.

### `types.ts` — Tipos globales

#### `Entity<T>`

Tipo base para todas las entidades del dominio:

```typescript
export type Entity<Tidentifier extends number | string> = {
  id?: Tidentifier;
};
```

Todas las entidades del sistema extienden este tipo:

```typescript
export type Exam = Entity<number> & {
  id: number;
  title: string;
  // ...
};
```

#### `ApiResponse<T>`

**Este es el tipo más importante del sistema.** Toda comunicación con el backend retorna este formato:

```typescript
export interface ApiResponse<T = any> {
  success: boolean;      // ¿La operación fue exitosa?
  code: number;          // Código HTTP (200, 400, 500, etc.)
  message: string;       // Mensaje descriptivo
  timestamp: string;     // Fecha/hora de la respuesta
  data?: T;              // Datos tipados (solo en éxito)
  error?: {              // Detalles del error (solo en fallo)
    message: string;
    details?: any;
  };
}
```

**Uso en la vista:**

```typescript
const response = await controller.getExams(pagination);
if (response.success) {
  exams.value = response.data!;
} else {
  showError(response.message);
}
```

#### `PaginationDto`

Estructura estándar para peticiones paginadas:

```typescript
export type PaginationDto = {
  filter?: string;        // Texto de búsqueda
  sortBy?: string;        // Campo de ordenamiento
  order?: 'ASC' | 'DESC'; // Dirección de ordenamiento
  page?: number;          // Número de página
  limit?: number;         // Registros por página
};
```

#### `TypesResponse`

Enum para categorizar respuestas:

```typescript
export enum TypesResponse {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
}
```

### `utils.ts` — Utilidades compartidas

Funciones auxiliares reutilizables:

| Función | Descripción | Ejemplo |
|---------|-------------|---------|
| `formatDate(date)` | Formatea fecha a `DD/MM/YYYY` | `formatDate('2026-03-09')` → `09/03/2026` |
| `formatDateTime(date)` | Formatea fecha+hora a `DD/MM/YYYY HH:MM` | `formatDateTime(new Date())` → `09/03/2026 14:30` |
| `isValidEmail(email)` | Valida formato de email | `isValidEmail('user@test.com')` → `true` |
| `capitalize(text)` | Primera letra mayúscula | `capitalize('hello')` → `Hello` |

---

## 8. Carpeta `modules/`

La carpeta `modules/` es el **corazón** del proyecto. Cada módulo representa una funcionalidad completa del sistema, completamente autocontenida e independiente de los demás módulos.

### Módulos actuales

| Módulo | Descripción | Roles que acceden |
|--------|-------------|-------------------|
| `auth` | Autenticación y login | Todos |
| `dashboard` | Panel principal / inicio | Todos |
| `exams` | Creación, listado y asignación de exámenes | STUDENT, TEACHER, ADMIN |
| `questions` | Banco de preguntas reutilizables | TEACHER, ADMIN |
| `groups` | Gestión de grupos académicos | TEACHER, ADMIN |
| `subjects` | Gestión de materias/asignaturas | TEACHER, ADMIN |
| `users` | Gestión de usuarios del sistema | ADMIN |
| `terms` | Gestión de cuatrimestres/periodos | ADMIN |
| `reports` | Generación y visualización de reportes | TEACHER, ADMIN |

### Estructura interna de cada módulo

**Todos** los módulos siguen la misma estructura. Sin excepción:

```
modules/
└── [nombre-del-modulo]/
    ├── adapters/                          # Capa de adaptadores
    │   ├── [modulo].controller.ts         # Orquestador
    │   ├── [modulo].storage.gateway.ts    # Comunicación con API
    │   └── views/                         # Vistas Vue
    │       └── [Modulo]View.vue
    │
    ├── entities/                          # Capa de dominio
    │   ├── [modulo].ts                    # Entidad principal
    │   ├── create-[modulo].dto.ts         # DTO de creación
    │   └── get-[modulos].dto.ts           # DTO de consulta
    │
    └── use-cases/                         # Capa de casos de uso
        ├── create-[modulo].interactor.ts  # Caso de uso: crear
        ├── get-[modulos].interactor.ts    # Caso de uso: listar
        └── ports/                         # Contratos
            └── [modulo].repository.ts     # Interfaz del repositorio
```

### Ejemplo concreto: Módulo `exams`

```
modules/exams/
├── adapters/
│   ├── exam.controller.ts
│   ├── exam.storage.gateway.ts
│   └── views/
│       ├── ExamListView.vue
│       └── ExamCreateView.vue
│
├── entities/
│   ├── exam.ts
│   ├── question.ts
│   ├── create-exam.dto.ts
│   ├── get-exams.dto.ts
│   └── assign-exam.dto.ts
│
└── use-cases/
    ├── create-exam.interactor.ts
    ├── get-exams.interactor.ts
    ├── assign-exam.interactor.ts
    └── ports/
        └── exam.repository.ts
```

### Regla de independencia modular

Los módulos **no deben importar** directamente desde otros módulos. Si dos módulos necesitan compartir un tipo, ese tipo debe vivir en `kernel/types.ts`.

```typescript
// ✅ CORRECTO — importar desde kernel
import { ApiResponse } from '@/kernel/types';

// ❌ INCORRECTO — importar desde otro módulo
import { User } from '@/modules/users/entities/user';
```

---

## 9. Carpeta `adapters/`

Dentro de cada módulo, la carpeta `adapters/` contiene los componentes que conectan el dominio con el mundo exterior (UI y API).

### Estructura

```
adapters/
├── [modulo].controller.ts        # Orquestador
├── [modulo].storage.gateway.ts   # Conexión con API
└── views/                        # Componentes Vue
    └── [Modulo]View.vue
```

### `views/` — Vistas Vue

Las vistas son componentes Vue que:

- ✅ Presentan la interfaz de usuario.
- ✅ Capturan interacciones del usuario (clicks, formularios).
- ✅ Llaman al **Controller** para ejecutar operaciones.
- ✅ Muestran los resultados de las operaciones.
- ❌ **No** contienen lógica de negocio.
- ❌ **No** llaman a gateways ni hacen peticiones HTTP directamente.
- ❌ **No** instancian repositorios ni interactors.

```typescript
// ✅ CORRECTO — la vista usa el Controller
const controller = new ExamController();
const response = await controller.getExams(pagination);

// ❌ INCORRECTO — la vista llama al gateway directamente
const response = await examGateway.getExams(pagination);

// ❌ INCORRECTO — la vista hace una petición HTTP
const response = await axios.get('/api/exams');
```

### `[modulo].controller.ts` — Controller

El Controller es el **orquestador** que conecta la vista con los casos de uso. Su responsabilidad es:

1. Instanciar el repositorio correcto (Storage Gateway).
2. Instanciar el interactor (UseCase) con ese repositorio.
3. Ejecutar el interactor y retornar el resultado.

### `[modulo].storage.gateway.ts` — Storage Gateway

El Storage Gateway es la **implementación concreta** del repositorio. Se encarga de hacer las peticiones HTTP reales al backend usando `handleRequest`.

---

## 10. Carpeta `entities/`

Dentro de cada módulo, la carpeta `entities/` contiene las **definiciones del dominio**: las entidades y los DTOs (Data Transfer Objects).

### Entidades

Una entidad representa un **concepto del negocio** con todos sus atributos. Siempre extiende `Entity<T>` del kernel:

```typescript
import { Entity } from "@/kernel/types";

export type Exam = Entity<number> & {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  groupId: number;
  createdBy: number;
  duration: number;
  totalQuestions: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};
```

**Reglas para entidades:**

- ✅ Siempre extienden `Entity<number>` (o `Entity<string>` si el ID es un UUID).
- ✅ Representan la estructura **completa** del objeto tal como viene del backend.
- ✅ Son tipos puros de TypeScript — no tienen métodos ni lógica.
- ❌ No importan nada de Vue, Vuetify ni Axios.

### DTOs (Data Transfer Objects)

Los DTOs definen la **forma de los datos** que se envían o reciben en operaciones específicas.

#### DTO de creación (`create-[modulo].dto.ts`)

Define los campos necesarios para **crear** un nuevo registro:

```typescript
export type CreateExamDto = {
  title: string;
  description: string;
  subjectId: number;
  groupId: number;
  duration: number;
  questionIds: number[];
  startDate: string;
  endDate: string;
};
```

Nota: No incluye `id`, `createdAt`, `updatedAt` — esos los genera el backend.

#### DTO de consulta (`get-[modulos].dto.ts`)

Define los parámetros de búsqueda y filtrado:

```typescript
import { PaginationDto } from "@/kernel/types";

export interface GetExamsDto {
  pagination: PaginationDto;
  status?: string;
}
```

### ¿Cuándo usar `Entity<T>` vs un tipo plano?

| Escenario | Usar |
|-----------|------|
| Representar un objeto que viene del backend con ID | `Entity<number> & { ... }` |
| Datos para enviar al backend (creación) | Tipo plano (`type CreateXDto = { ... }`) |
| Parámetros de búsqueda/filtrado | `interface GetXDto { ... }` |

---

## 11. Carpeta `use-cases/`

La carpeta `use-cases/` contiene la **lógica de negocio** del módulo. Está compuesta por interactors y ports.

### Interactors

Un interactor es una clase que implementa la interfaz `UseCase<TInput, TOutput>` y ejecuta **una sola operación de negocio**.

```typescript
import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "./ports/exam.repository";
import { CreateExamDto } from "../entities/create-exam.dto";

export class CreateExamInteractor implements UseCase<CreateExamDto, ApiResponse<Exam>> {
  constructor(private readonly examRepository: ExamRepository) {}

  async execute(payload?: CreateExamDto): Promise<ApiResponse<Exam>> {
    if (!payload) {
      throw new Error("Missing payload for CreateExamInteractor");
    }
    return this.examRepository.createExam(payload);
  }
}
```

**Reglas para interactors:**

- ✅ Implementan `UseCase<TInput, TOutput>` del kernel.
- ✅ Reciben un **Repository** por constructor (inyección de dependencias).
- ✅ Validan que el payload no sea nulo antes de procesar.
- ✅ Delegan la obtención de datos al repositorio.
- ✅ Pueden contener lógica de negocio adicional (validaciones, transformaciones).
- ❌ No conocen Axios, Vue ni ningún framework.
- ❌ No instancian gateways directamente — reciben el repositorio como abstracción.

### Ports (Repositorios — Interfaz)

La subcarpeta `ports/` contiene las **interfaces** (contratos) que definen qué operaciones de datos existen para el módulo:

```typescript
import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Exam } from "../../entities/exam";
import { CreateExamDto } from "../../entities/create-exam.dto";
import { AssignExamDto } from "../../entities/assign-exam.dto";

export interface ExamRepository {
  getExams(pagination: PaginationDto, status?: string): Promise<ApiResponse<Exam[]>>;
  getExamById(id: number): Promise<ApiResponse<Exam>>;
  createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>>;
  assignExam(data: AssignExamDto): Promise<ApiResponse<Exam>>;
  deleteExam(id: number): Promise<ApiResponse<boolean>>;
}
```

**¿Por qué usar interfaces?**

- **Desacoplamiento:** El interactor trabaja con la interfaz, no con la implementación concreta. Si se cambia el backend (o se usan datos mock), solo se cambia el gateway.
- **Testabilidad:** En pruebas, se puede inyectar un mock del repositorio.
- **Contratos claros:** La interfaz documenta exactamente qué operaciones existen.

---

## 12. Controllers

### Patrón Controller

El Controller es la **pieza de unión** entre la vista y la lógica de negocio. Su patrón es siempre el mismo:

```typescript
import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Exam } from '../entities/exam';
import { ExamRepository } from '../use-cases/ports/exam.repository';
import { ExamStorageGateway } from './exam.storage.gateway';
import { GetExamsInteractor } from '../use-cases/get-exams.interactor';
import { CreateExamDto } from '../entities/create-exam.dto';
import { CreateExamInteractor } from '../use-cases/create-exam.interactor';

export class ExamController {
  getExams(pagination: PaginationDto, status?: string): Promise<ApiResponse<Exam[]>> {
    // 1. Instanciar el repositorio (implementación concreta)
    const repository: ExamRepository = new ExamStorageGateway();

    // 2. Instanciar el interactor con el repositorio
    const interactor = new GetExamsInteractor(repository);

    // 3. Ejecutar y retornar
    return interactor.execute({ pagination, status });
  }

  createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>> {
    const repository: ExamRepository = new ExamStorageGateway();
    const interactor = new CreateExamInteractor(repository);
    return interactor.execute(exam);
  }
}
```

### Regla de cada método del Controller

Cada método del Controller **siempre** sigue estos 3 pasos:

```
1. const repository: [Interface] = new [Gateway]();
2. const interactor = new [Interactor](repository);
3. return interactor.execute(payload);
```

**Nunca** se debe:

- ❌ Llamar al gateway directamente sin pasar por un interactor.
- ❌ Hacer peticiones HTTP dentro del controller.
- ❌ Poner lógica de UI en el controller.

### Cómo se usa el Controller desde la Vista

```typescript
// En el <script setup> de la vista
import { ExamController } from '../exam.controller';

const controller = new ExamController();

async function loadExams() {
  loading.value = true;
  const response = await controller.getExams({ page: 1, limit: 10 });
  if (response.success) {
    exams.value = response.data!;
  } else {
    errorMsg.value = response.message;
  }
  loading.value = false;
}
```

---

## 13. Storage Gateways

### ¿Qué es un Storage Gateway?

El Storage Gateway es la **implementación concreta** de un repositorio. Es la clase que realmente se conecta con el backend usando `handleRequest`.

### Patrón

```typescript
import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Exam } from "../entities/exam";
import { ExamRepository } from "../use-cases/ports/exam.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateExamDto } from "../entities/create-exam.dto";

export class ExamStorageGateway implements ExamRepository {

  async getExams(pagination: PaginationDto, status?: string): Promise<ApiResponse<Exam[]>> {
    return handleRequest<Exam[], PaginationDto>(
      'post',
      `/api/exams/paged?status=${status || ''}`,
      pagination
    );
  }

  async getExamById(id: number): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam>('get', `/api/exams/${id}`);
  }

  async createExam(exam: CreateExamDto): Promise<ApiResponse<Exam>> {
    return handleRequest<Exam, CreateExamDto>('post', '/api/exams/save', exam);
  }

  async deleteExam(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/exams/${id}`);
  }
}
```

### Reglas de los Storage Gateways

- ✅ **Siempre** implementan la interfaz del repositorio (`implements ExamRepository`).
- ✅ **Siempre** usan `handleRequest` para las peticiones HTTP.
- ✅ **Siempre** retornan `Promise<ApiResponse<T>>`.
- ✅ Los tipos genéricos `<T, P>` en `handleRequest` deben coincidir con la entidad y el DTO.
- ❌ **Nunca** usan `axios` directamente ni `fetch`.
- ❌ **Nunca** manejan errores internamente — `handleRequest` ya lo hace.

### Convenciones de URLs de API

| Operación | Método HTTP | Patrón de URL |
|-----------|-------------|---------------|
| Listar con paginación | `POST` | `/api/[modulo]/paged` |
| Obtener por ID | `GET` | `/api/[modulo]/{id}` |
| Crear | `POST` | `/api/[modulo]/save` |
| Actualizar | `PUT` | `/api/[modulo]/{id}` |
| Eliminar | `DELETE` | `/api/[modulo]/{id}` |

---

## 14. Flujo Completo de una Petición

A continuación se muestra el flujo completo cuando un usuario quiere **ver la lista de exámenes**:

```
┌──────────────────┐
│   ExamListView   │  1. El usuario entra a /my-exams
│   (Vista Vue)    │
└────────┬─────────┘
         │
         │  2. La vista llama: controller.getExams(pagination)
         ▼
┌──────────────────┐
│  ExamController  │  3. Instancia ExamStorageGateway
│  (Adapter)       │  4. Instancia GetExamsInteractor(repository)
│                  │  5. Llama: interactor.execute({ pagination })
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ GetExamsInteractor│  6. Valida que el payload no sea nulo
│  (Use Case)      │  7. Llama: repository.getExams(pagination, status)
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ExamStorageGateway│  8. Llama: handleRequest<Exam[]>('post', '/api/exams/paged', pagination)
│  (Gateway)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   handleRequest  │  9. Axios ejecuta POST /api/exams/paged
│ (http-client.ts) │  10. El interceptor agrega Bearer token
│                  │  11. Retorna ApiResponse<Exam[]>
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│   Backend API    │  12. Django procesa la petición
│  (Django REST)   │  13. Retorna JSON con success, data, message
└──────────────────┘
```

**Respuesta de vuelta:**

```
Backend ──▶ handleRequest ──▶ Gateway ──▶ Interactor ──▶ Controller ──▶ Vista
                                                                           │
                                                                           ▼
                                                             if (response.success) {
                                                               exams.value = response.data!;
                                                             }
```

---

## 15. Sistema de Diseño

### Vuetify + Material Design

El proyecto usa Vuetify 3 con un tema personalizado definido en `src/plugins/vuetify.ts`.

### Paleta de Colores del Sistema

| Color | Hex | Uso |
|-------|-----|-----|
| **Primary** | `#081e53` | Botones principales, acentos, encabezados |
| **Secondary** | `#069574` | Botones secundarios, enlaces, íconos activos |
| **Sidebar Background** | `#05323b` | Fondo del sidebar |
| **Sidebar Brand** | `#063244` | Cards de módulos |
| **Sidebar Accent** | `#1fb07a` | Divisores, logo avatar, avatar de perfil |
| **Sidebar Text** | `#9fb5b8` | Texto secundario del sidebar |
| **Sidebar Active** | `rgba(255,255,255,0.18)` | Fondo del item activo en rail mode |
| **Error** | `#FF5252` | Errores y alertas |
| **Success** | `#4CAF50` | Confirmaciones |
| **Warning** | `#FFC107` | Advertencias |
| **Background** | `#FFFFFF` | Fondo principal |

### Iconos

Se usa **Material Design Icons (MDI)** con el prefijo `mdi-`. Catálogo completo: [materialdesignicons.com](https://materialdesignicons.com)

```vue
<v-icon>mdi-account</v-icon>
<v-icon>mdi-clipboard-text</v-icon>
<v-icon>mdi-chart-bar</v-icon>
```

### Layout del Sistema

```
┌─────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────────┐ │
│ │          │ │  HeaderSession                         │ │
│ │          │ ├────────────────────────────────────────┤ │
│ │ Sidebar  │ │                                        │ │
│ │          │ │  Contenido de la vista                  │ │
│ │          │ │  (router-view)                          │ │
│ │          │ │                                        │ │
│ │          │ │                                        │ │
│ └──────────┘ └────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Responsividad

- **Desktop (md+):** Sidebar permanente con opción rail/expanded.
- **Móvil (sm-):** Sidebar temporal (drawer) con app bar superior.

---

## 16. Sistema de Autenticación

### Flujo de Autenticación Actual

El sistema usa **JWT (JSON Web Tokens)** con la API de Django:

```
┌─────────────┐     POST /api/auth/login/      ┌──────────┐
│  LoginView  │ ───────────────────────────────▶│  Backend │
│             │   { email, password }           │          │
│             │ ◀───────────────────────────────│          │
│             │   { access, refresh, user }     │          │
└─────────────┘                                 └──────────┘
```

### Tokens almacenados en localStorage

| Clave | Contenido |
|-------|-----------|
| `sea_token` | JWT de acceso (access token) |
| `sea_refresh` | JWT de refresco (refresh token) |
| `sea_selectedRole` | Rol del usuario (`STUDENT`, `TEACHER`, `ADMIN`) |
| `sea_userName` | Nombre completo del usuario |

### Roles del sistema

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| `STUDENT` | Estudiante | Dashboard, Mis Exámenes |
| `TEACHER` | Profesor | Dashboard, Crear Examen, Reportes, Banco de Preguntas |
| `ADMIN` | Administrador | Acceso completo a todas las funcionalidades |

### Guards de Navegación

El router implementa guards que:

1. Verifican que el usuario tenga un token válido.
2. Verifican que el rol del usuario esté en la lista de roles permitidos de la ruta.
3. Redirigen a `/login` si no hay token.
4. Redirigen a `/unauthorized` si el rol no tiene permisos.

```typescript
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('sea_token');
  const role = localStorage.getItem('sea_selectedRole');

  if (to.meta.requiresAuth === false) return next();
  if (!token) return next({ name: 'Login' });

  const allowedRoles = to.meta.roles as string[] | undefined;
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return next({ name: 'Unauthorized' });
  }
  next();
});
```

### Token Refresh Automático

Cuando un token expira (el backend responde 401):

1. El interceptor de Axios detecta el error 401.
2. Envía automáticamente `POST /api/auth/refresh/` con el refresh token.
3. Si tiene éxito, actualiza el `sea_token` y reintenta la petición original.
4. Si falla, limpia todo y redirige al login.

---

## 17. Reglas de Desarrollo para el Equipo

### Reglas OBLIGATORIAS

Estas reglas **no son opcionales**. Todo el equipo debe seguirlas.

---

#### REGLA 1: NO llamar APIs directamente desde las vistas

```typescript
// ❌ PROHIBIDO — Nunca hagas peticiones HTTP desde un componente Vue
const { data } = await axios.get('/api/exams');

// ❌ PROHIBIDO — Nunca uses handleRequest desde la vista
const response = await handleRequest('get', '/api/exams');

// ✅ CORRECTO — Siempre usa el Controller
const controller = new ExamController();
const response = await controller.getExams(pagination);
```

---

#### REGLA 2: NO poner lógica de negocio en componentes

```typescript
// ❌ PROHIBIDO — Lógica de negocio en la vista
async function deleteExam(id: number) {
  const hasStudents = await checkStudents(id);
  if (hasStudents) {
    throw new Error("Cannot delete exam with students");
  }
  await axios.delete(`/api/exams/${id}`);
}

// ✅ CORRECTO — La lógica vive en el Interactor
// La vista solo llama al controller
const response = await controller.deleteExam(id);
```

---

#### REGLA 3: SIEMPRE usar el patrón complete Controller → Interactor → Gateway

Toda operación de datos **debe** pasar por las 3 capas. No se puede saltar ninguna.

---

#### REGLA 4: SIEMPRE usar `ApiResponse<T>` como tipo de retorno

Todas las funciones que comuniquen con el backend **deben** retornar `ApiResponse<T>`.

---

#### REGLA 5: SIEMPRE usar `handleRequest` en los Gateways

Nunca usar `axios.get()` ni `AxiosClient.post()` directamente en un gateway.

```typescript
// ❌ PROHIBIDO
async getExams() {
  const { data } = await AxiosClient.get('/api/exams');
  return data;
}

// ✅ CORRECTO
async getExams(pagination: PaginationDto): Promise<ApiResponse<Exam[]>> {
  return handleRequest<Exam[], PaginationDto>('post', '/api/exams/paged', pagination);
}
```

---

#### REGLA 6: SIEMPRE tipar con TypeScript

```typescript
// ❌ PROHIBIDO — Sin tipado
const exams = ref([]);
const response = await controller.getExams(data);

// ✅ CORRECTO — Con tipado explícito
const exams = ref<Exam[]>([]);
const response: ApiResponse<Exam[]> = await controller.getExams(pagination);
```

---

#### REGLA 7: SIEMPRE seguir la nomenclatura de archivos

| Tipo de archivo | Formato del nombre | Ejemplo |
|----------------|-------------------|---------|
| Entidad | `[modulo].ts` | `exam.ts` |
| DTO creación | `create-[modulo].dto.ts` | `create-exam.dto.ts` |
| DTO consulta | `get-[modulos].dto.ts` | `get-exams.dto.ts` |
| Controller | `[modulo].controller.ts` | `exam.controller.ts` |
| Gateway | `[modulo].storage.gateway.ts` | `exam.storage.gateway.ts` |
| Interactor | `[accion]-[modulo].interactor.ts` | `create-exam.interactor.ts` |
| Port | `[modulo].repository.ts` | `exam.repository.ts` |
| Vista | `[Modulo][Accion]View.vue` | `ExamListView.vue` |

---

#### REGLA 8: Idioma del código

- **Código** (variables, funciones, clases, archivos, comentarios): **INGLÉS**
- **Texto en la UI** (labels, botones, placeholders, mensajes de validación): **ESPAÑOL**

```typescript
// ✅ CORRECTO
const submitLoginForm = () => { /* ... */ }
// Template:
// <v-btn>Iniciar sesión</v-btn>

// ❌ INCORRECTO
const enviarFormulario = () => { /* ... */ }
```

---

#### REGLA 9: NO importar entre módulos

```typescript
// ❌ PROHIBIDO — Importar desde otro módulo
import { User } from '@/modules/users/entities/user';

// ✅ CORRECTO — Si necesitas un tipo compartido, ponlo en el kernel
import { Entity, ApiResponse } from '@/kernel/types';
```

---

#### REGLA 10: Los componentes de `components/` NO tienen lógica de negocio

```typescript
// ❌ PROHIBIDO en un componente global
import { ExamController } from '@/modules/exams/adapters/exam.controller';

// ✅ CORRECTO — Los componentes solo reciben datos por props
defineProps<{ title: string; data: any[] }>();
```

---

## 18. Cómo Desarrollar una Nueva Funcionalidad

### Ejemplo: Crear el módulo `grades` (calificaciones)

Sigue estos pasos en **este orden exacto**:

---

### Paso 1: Crear la Entidad

**Archivo:** `src/modules/grades/entities/grade.ts`

```typescript
import { Entity } from "@/kernel/types";

export type Grade = Entity<number> & {
  id: number;
  examId: number;
  studentId: number;
  score: number;
  maxScore: number;
  percentage: number;
  status: string;
  gradedAt: string;
  createdAt: string;
  updatedAt: string;
};
```

---

### Paso 2: Crear los DTOs

**Archivo:** `src/modules/grades/entities/create-grade.dto.ts`

```typescript
export type CreateGradeDto = {
  examId: number;
  studentId: number;
  score: number;
  maxScore: number;
};
```

**Archivo:** `src/modules/grades/entities/get-grades.dto.ts`

```typescript
import { PaginationDto } from "@/kernel/types";

export interface GetGradesDto {
  pagination: PaginationDto;
  examId?: number;
  studentId?: number;
}
```

---

### Paso 3: Crear el Repository Port (Interfaz)

**Archivo:** `src/modules/grades/use-cases/ports/grade.repository.ts`

```typescript
import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Grade } from "../../entities/grade";
import { CreateGradeDto } from "../../entities/create-grade.dto";

export interface GradeRepository {
  getGrades(pagination: PaginationDto, examId?: number, studentId?: number): Promise<ApiResponse<Grade[]>>;
  getGradeById(id: number): Promise<ApiResponse<Grade>>;
  createGrade(grade: CreateGradeDto): Promise<ApiResponse<Grade>>;
  deleteGrade(id: number): Promise<ApiResponse<boolean>>;
}
```

---

### Paso 4: Crear los Interactors (Use Cases)

**Archivo:** `src/modules/grades/use-cases/get-grades.interactor.ts`

```typescript
import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Grade } from "../entities/grade";
import { GradeRepository } from "./ports/grade.repository";
import { GetGradesDto } from "../entities/get-grades.dto";

export class GetGradesInteractor implements UseCase<GetGradesDto, ApiResponse<Grade[]>> {
  constructor(private readonly gradeRepository: GradeRepository) {}

  async execute(payload?: GetGradesDto): Promise<ApiResponse<Grade[]>> {
    if (!payload) {
      throw new Error("Missing payload for GetGradesInteractor");
    }
    return this.gradeRepository.getGrades(payload.pagination, payload.examId, payload.studentId);
  }
}
```

**Archivo:** `src/modules/grades/use-cases/create-grade.interactor.ts`

```typescript
import { UseCase } from "@/kernel/contract";
import { ApiResponse } from "@/kernel/types";
import { Grade } from "../entities/grade";
import { GradeRepository } from "./ports/grade.repository";
import { CreateGradeDto } from "../entities/create-grade.dto";

export class CreateGradeInteractor implements UseCase<CreateGradeDto, ApiResponse<Grade>> {
  constructor(private readonly gradeRepository: GradeRepository) {}

  async execute(payload?: CreateGradeDto): Promise<ApiResponse<Grade>> {
    if (!payload) {
      throw new Error("Missing payload for CreateGradeInteractor");
    }
    return this.gradeRepository.createGrade(payload);
  }
}
```

---

### Paso 5: Crear el Storage Gateway

**Archivo:** `src/modules/grades/adapters/grade.storage.gateway.ts`

```typescript
import { ApiResponse, PaginationDto } from "@/kernel/types";
import { Grade } from "../entities/grade";
import { GradeRepository } from "../use-cases/ports/grade.repository";
import { handleRequest } from "@/config/http-client.gateway";
import { CreateGradeDto } from "../entities/create-grade.dto";

export class GradeStorageGateway implements GradeRepository {
  async getGrades(pagination: PaginationDto, examId?: number, studentId?: number): Promise<ApiResponse<Grade[]>> {
    return handleRequest<Grade[], PaginationDto>(
      'post',
      `/api/grades/paged?examId=${examId || ''}&studentId=${studentId || ''}`,
      pagination
    );
  }

  async getGradeById(id: number): Promise<ApiResponse<Grade>> {
    return handleRequest<Grade>('get', `/api/grades/${id}`);
  }

  async createGrade(grade: CreateGradeDto): Promise<ApiResponse<Grade>> {
    return handleRequest<Grade, CreateGradeDto>('post', '/api/grades/save', grade);
  }

  async deleteGrade(id: number): Promise<ApiResponse<boolean>> {
    return handleRequest<boolean>('delete', `/api/grades/${id}`);
  }
}
```

---

### Paso 6: Crear el Controller

**Archivo:** `src/modules/grades/adapters/grade.controller.ts`

```typescript
import { ApiResponse, PaginationDto } from '@/kernel/types';
import { Grade } from '../entities/grade';
import { GradeRepository } from '../use-cases/ports/grade.repository';
import { GradeStorageGateway } from './grade.storage.gateway';
import { GetGradesInteractor } from '../use-cases/get-grades.interactor';
import { CreateGradeDto } from '../entities/create-grade.dto';
import { CreateGradeInteractor } from '../use-cases/create-grade.interactor';

export class GradeController {
  getGrades(pagination: PaginationDto, examId?: number, studentId?: number): Promise<ApiResponse<Grade[]>> {
    const repository: GradeRepository = new GradeStorageGateway();
    const interactor = new GetGradesInteractor(repository);
    return interactor.execute({ pagination, examId, studentId });
  }

  createGrade(grade: CreateGradeDto): Promise<ApiResponse<Grade>> {
    const repository: GradeRepository = new GradeStorageGateway();
    const interactor = new CreateGradeInteractor(repository);
    return interactor.execute(grade);
  }
}
```

---

### Paso 7: Crear la Vista

**Archivo:** `src/modules/grades/adapters/views/GradeListView.vue`

```vue
<template>
  <v-container fluid class="pa-6">
    <HeaderSession title="Calificaciones" />
    <v-row>
      <v-col cols="12">
        <!-- Tu contenido aquí -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import HeaderSession from '@/components/HeaderSession.vue';
import { GradeController } from '../grade.controller';
import type { Grade } from '../../entities/grade';
import type { ApiResponse } from '@/kernel/types';

const controller = new GradeController();
const grades = ref<Grade[]>([]);
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  const response: ApiResponse<Grade[]> = await controller.getGrades({ page: 1, limit: 10 });
  if (response.success && response.data) {
    grades.value = response.data;
  }
  loading.value = false;
});
</script>
```

---

### Paso 8: Registrar la ruta

**Archivo:** `src/router/index.ts`

Agregar dentro de los `children` del layout principal:

```typescript
// Grades
{
  path: 'grades',
  name: 'Grades',
  component: () => import('@/modules/grades/adapters/views/GradeListView.vue'),
  meta: { roles: ['TEACHER', 'ADMIN'] },
},
```

---

### Paso 9: Agregar al menú (si aplica)

**Archivo:** `src/constants/menu-items.ts`

```typescript
// Agregar en el rol correspondiente
{ title: 'Calificaciones', icon: 'mdi-school', to: '/grades' },
```

---

### Estructura final del módulo

```
modules/grades/
├── adapters/
│   ├── grade.controller.ts
│   ├── grade.storage.gateway.ts
│   └── views/
│       └── GradeListView.vue
├── entities/
│   ├── grade.ts
│   ├── create-grade.dto.ts
│   └── get-grades.dto.ts
└── use-cases/
    ├── create-grade.interactor.ts
    ├── get-grades.interactor.ts
    └── ports/
        └── grade.repository.ts
```

---

## 19. Cómo Usar Copilot Correctamente

### Contexto para Copilot

Cuando trabajes con GitHub Copilot o cualquier asistente de IA, **siempre** dale contexto sobre la arquitectura. Copilot no la conoce por defecto y generará código que rompe la estructura si no lo guías.

### Prompts Recomendados

#### Para crear un módulo nuevo

```
Crea un módulo completo llamado "grades" siguiendo la Clean Architecture del proyecto.
El proyecto usa:
- Vue 3 + TypeScript + Vuetify
- Patrón: Entity → DTO → Repository (Port) → Interactor → Gateway → Controller → Vista
- Todos los gateways usan handleRequest de @/config/http-client.gateway
- Todos los interactors implementan UseCase<TInput, TOutput> de @/kernel/contract
- Todos retornan ApiResponse<T> de @/kernel/types

Crea estos archivos:
1. entities/grade.ts (entidad con Entity<number>)
2. entities/create-grade.dto.ts (DTO de creación)
3. entities/get-grades.dto.ts (DTO con PaginationDto)
4. use-cases/ports/grade.repository.ts (interfaz)
5. use-cases/get-grades.interactor.ts
6. use-cases/create-grade.interactor.ts
7. adapters/grade.storage.gateway.ts (implementa el repository)
8. adapters/grade.controller.ts (instancia gateway + interactor)
9. adapters/views/GradeListView.vue (usa el Controller)

NO generes lógica de negocio en la vista.
NO llames a axios directamente.
Código en INGLÉS, textos de UI en ESPAÑOL.
```

#### Para crear una vista con tabla

```
Crea una vista Vue 3 con Vuetify que muestre una tabla de exámenes.
- Usa el componente Table de @/components/Table.vue
- Usa el componente HeaderSession de @/components/HeaderSession.vue
- Carga los datos usando ExamController desde ../exam.controller
- NO llames a la API directamente
- Usa ref<Exam[]> para tipar los datos
- Verifica response.success antes de asignar datos
- Textos de UI en español
- Código TypeScript en inglés
```

#### Para agregar una operación nueva

```
Agrega la operación "updateExam" al módulo exams siguiendo el patrón existente:
1. Crea update-exam.dto.ts en entities/
2. Agrega updateExam al ExamRepository (port)
3. Crea update-exam.interactor.ts
4. Implementa updateExam en ExamStorageGateway (usa handleRequest con 'put')
5. Agrega updateExam al ExamController
NO rompas la arquitectura Clean Architecture.
```

### Lo que NUNCA debes pedirle a Copilot

```
❌ "Crea un componente que obtenga datos de la API"
   → Va a hacer un axios.get() directamente

❌ "Haz un fetch a /api/exams desde el componente"
   → Rompe la arquitectura completamente

❌ "Agrega esta lógica en el template de Vue"
   → Poner lógica de negocio en el template
```

### Lo que SIEMPRE debes recordarle

```
✅ "Usa el patrón Controller → Interactor → Gateway"
✅ "No pongas lógica de negocio en la vista"
✅ "Usa handleRequest de @/config/http-client.gateway"
✅ "Retorna ApiResponse<T>"
✅ "Implementa UseCase<TInput, TOutput>"
✅ "Código en inglés, UI en español"
```

---

## 20. Buenas Prácticas

### Tipado Fuerte

```typescript
// ❌ Evitar
const data: any = response.data;
const items = ref([]);

// ✅ Preferir
const data: Exam[] = response.data!;
const items = ref<Exam[]>([]);
```

### Principio de Responsabilidad Única

Cada archivo, clase y función debe tener **una sola responsabilidad**:

| Archivo | Responsabilidad ÚNICA |
|---------|----------------------|
| `exam.ts` | Definir la forma de un Examen |
| `create-exam.dto.ts` | Definir los datos para crear un examen |
| `exam.repository.ts` | Definir el contrato de operaciones |
| `create-exam.interactor.ts` | Ejecutar la lógica de crear un examen |
| `exam.storage.gateway.ts` | Comunicarse con el backend |
| `exam.controller.ts` | Orquestar gateway + interactor |
| `ExamListView.vue` | Mostrar la lista de exámenes al usuario |

### Componentes Reutilizables

Antes de crear un componente nuevo, verifica si ya existe uno en `components/`:

| Necesito... | Ya existe |
|-------------|-----------|
| Una tabla con paginación | `Table.vue` |
| Un botón de acción en una tabla | `TableButton.vue` |
| Un diálogo de confirmación | `ConfirmDialog.vue` |
| Un encabezado de página | `HeaderSession.vue` |
| Un estado vacío | `EmptyState.vue` |
| Un indicador de carga | `Loader.vue` |
| Un botón para volver | `BackButton.vue` |
| Migas de pan | `BreadCrumb.vue` |

### Modularidad

- Cada módulo es **independiente** y **autocontenido**.
- Si necesitas compartir tipos entre módulos, ponlos en `kernel/types.ts`.
- Si necesitas compartir utilidades, ponlas en `kernel/utils.ts`.
- Si necesitas un componente reutilizable, ponlo en `components/`.
- **Nunca** importes directamente desde otro módulo.

### Convenciones de Nombrado

| Concepto | Convención | Ejemplo |
|----------|------------|---------|
| Archivos TypeScript | kebab-case | `create-exam.dto.ts` |
| Archivos Vue | PascalCase | `ExamListView.vue` |
| Clases | PascalCase | `ExamController` |
| Interfaces | PascalCase | `ExamRepository` |
| Tipos | PascalCase | `CreateExamDto` |
| Variables | camelCase | `examList` |
| Funciones | camelCase | `getExams()` |
| Constantes | camelCase | `roleMenus` |

---

## 21. Conclusión

### ¿Por qué respetar la arquitectura?

La Clean Architecture en este proyecto **no es opcional**. Es la base que permite:

1. **Escalabilidad:** Agregar nuevos módulos sin modificar los existentes.
2. **Mantenibilidad:** Cuando hay un bug en la comunicación con la API, solo se revisa el Gateway. Cuando hay un error de lógica, solo se revisa el Interactor.
3. **Trabajo en equipo:** Cada desarrollador puede trabajar en un módulo diferente sin conflictos.
4. **Testabilidad:** Los interactors y gateways se pueden probar de forma aislada.
5. **Consistencia:** Todo el equipo escribe código de la misma manera.

### El costo de romper la arquitectura

Si un desarrollador decide "ahorrar tiempo" llamando a Axios directamente desde una vista:

- ❌ Pierde el manejo centralizado de errores.
- ❌ Pierde el token refresh automático.
- ❌ Pierde el tipado de `ApiResponse<T>`.
- ❌ Crea inconsistencia en el código base.
- ❌ Hace imposible cambiar la implementación del backend sin tocar cada vista.
- ❌ Hace imposible testear la lógica de forma aislada.

### Resumen del flujo

```
Vista → Controller → Interactor → Repository (Port) → Gateway → handleRequest → API
```

**Cada capa existe por una razón. Respétalas todas.**

---

*Documento generado como guía técnica oficial del proyecto SEA-front.*  
*Cualquier duda sobre la arquitectura debe resolverse consultando esta guía antes de escribir código.*
