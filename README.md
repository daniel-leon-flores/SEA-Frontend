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
cd SEA-frontend

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
```

---

## Credenciales de prueba (Mock Auth)

| Matrícula     | Contraseña   | Rol       |
|---------------|-------------|-----------|
| 20233TN001    | student123  | STUDENT   |
| 20233TN002    | teacher123  | TEACHER   |
| 20233TN003    | admin123    | ADMIN     |

> Las credenciales están definidas en `src/config/mock-auth.ts`. Son temporales hasta la integración con el backend.

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
    └── views/               # Vistas Vue
```

### Flujo de datos

```
Vista (Vue) → Controller → Interactor → Repository (Gateway) → API
```

---

## Mapeo de Módulos (Project Charter → Carpeta)

| Módulo del Project Charter          | Carpeta del proyecto                       | Descripción                                       |
|-------------------------------------|--------------------------------------------|----------------------------------------------------|
| Gestión de Usuarios                 | `src/modules/users/`                       | CRUD de usuarios (estudiantes, profesores, admin)  |
| Gestión de Exámenes                 | `src/modules/exams/`                       | Crear, asignar y gestionar exámenes                |
| Banco de Preguntas                  | `src/modules/questions/`                   | Gestión del banco de preguntas por materia          |
| Gestión de Grupos                   | `src/modules/groups/`                      | Administración de grupos académicos                |
| Gestión de Materias                 | `src/modules/subjects/`                    | Catálogo de materias y asignación a profesores     |
| Gestión de Cuatrimestres            | `src/modules/cuatrimestres/`               | Períodos cuatrimestrales                           |
| Reportes y Estadísticas             | `src/modules/reports/`                     | Generación y visualización de reportes             |
| Panel de Control (Dashboard)        | `src/modules/dashboard/`                   | Vista principal con resumen del sistema            |
| Autenticación                       | `src/modules/auth/`                        | Login y gestión de sesión                          |

---

## Estructura del proyecto

```
SEA-frontend/
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
├── .env.example
├── src/
│   ├── App.vue
│   ├── main.ts
│   ├── env.d.ts
│   ├── vite-env.d.ts
│   ├── components/          # Componentes compartidos (SideBar, Table, etc.)
│   ├── config/              # Axios, HTTP client, mock auth
│   ├── constants/           # Menú items por rol
│   ├── kernel/              # Contratos, tipos, utilidades
│   ├── modules/             # Módulos de negocio (Clean Architecture)
│   │   ├── auth/
│   │   ├── cuatrimestres/
│   │   ├── dashboard/
│   │   ├── exams/
│   │   ├── groups/
│   │   ├── questions/
│   │   ├── reports/
│   │   ├── subjects/
│   │   └── users/
│   ├── plugins/             # Vuetify
│   ├── router/              # Vue Router con guards
│   ├── types/               # Declaraciones TypeScript
│   └── views/               # Vistas globales (Unauthorized, Settings)
```

---

## Tecnologías

- **Vue 3.4** (Composition API)
- **Vite 5** (bundler)
- **TypeScript 5** (strict mode)
- **Vuetify 3.5** (component library + Material Design Icons)
- **Axios** (HTTP client)
- **Vue Router 4** (enrutamiento con guards por rol)
- **Pinia** (store - disponible para uso futuro)

---

## Convenciones de código

- **PascalCase** para componentes Vue y sus archivos
- **kebab-case** para nombres de archivos TS (entities, DTOs, interactors)
- Todos los repositorios devuelven `Promise<ApiResponse<T>>`
- Todas las gateway usan `handleRequest()` de `src/config/http-client.gateway.ts`
- Los controllers instancian gateway + interactor en cada método

---

## Referencia

Este proyecto frontend fue generado siguiendo la estructura y patrones de **MediTriage-frontend** como arquitectura de referencia, adaptado al dominio de un Sistema de Exámenes Autogestionados conforme al Project Charter del proyecto SEA.
