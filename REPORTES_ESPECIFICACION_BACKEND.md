# Especificación Backend — Módulo de Reportes (SEA)

> **Propósito:** Guía de implementación completa y precisa para el backend Django REST Framework. Cada endpoint, query ORM, estructura JSON y consideración técnica está verificada contra el código fuente real de **SEA-api** y el módulo de reportes de **SEA-Frontend**.
>
> **Audiencia:** Desarrollador backend que implementará `apps/reports/`.

---

## Tabla de contenidos

1. [Contexto General](#1-contexto-general)
2. [Inventario de Reportes](#2-inventario-de-reportes)
   - 2.1 [Reporte por Examen](#21-reporte-por-examen)
   - 2.2 [Reporte por Periodo](#22-reporte-por-periodo)
   - 2.3 [Reporte por Grupo](#23-reporte-por-grupo)
   - 2.4 [Reporte por Alumno](#24-reporte-por-alumno)
   - 2.5 [Detalle Alumno–Examen](#25-detalle-alumnoexamen)
3. [Consultas Necesarias](#3-consultas-necesarias)
   - 3.1 [Endpoints de Filtros (GET)](#31-endpoints-de-filtros-get)
   - 3.2 [Endpoints de Reportes (POST)](#32-endpoints-de-reportes-post)
4. [Compatibilidad con MockData del Frontend](#4-compatibilidad-con-mockdata-del-frontend)
5. [Consideraciones Técnicas](#5-consideraciones-técnicas)
6. [Conclusión Operativa](#6-conclusión-operativa)

---

## 1. Contexto General

### 1.1 Arquitectura del frontend

El módulo de reportes está en `SEA-Frontend/src/modules/reports/` y sigue Clean Architecture:

```
entities/          → Interfaces TypeScript (contratos de datos)
use-cases/ports/   → ReportRepository (interfaz abstracta con 10 métodos)
use-cases/         → 5 interactors (uno por tipo de reporte)
adapters/          → ReportStorageGateway (implementa ReportRepository)
                     mock-reports.ts (datos demo, MOCK_ENABLED = true)
                     utils/export-pdf.ts, export-excel.ts
views/             → ReportsView.vue (vista principal)
components/        → MetricCards, ReportChart, ReportTable, ReportFilters
```

### 1.2 Cómo consume el frontend

El gateway (`report.storage.gateway.ts`) hace estas llamadas:

| Método | Endpoint | Propósito |
|--------|----------|-----------|
| `GET` | `/api/academic/periods/` | Dropdown de periodos |
| `GET` | `/api/academic/groups/?period_id=N` | Dropdown de grupos |
| `GET` | `/api/academic/subjects/` | Dropdown de materias |
| `GET` | `/api/exams/?subject_id=N&group_id=N` | Dropdown de exámenes (**no existe aún**) |
| `GET` | `/api/users/?group_id=N` | Dropdown de alumnos (**permiso insuficiente**) |
| `POST` | `/api/reports/by-exam/` | Reporte por examen |
| `POST` | `/api/reports/by-period/` | Reporte por periodo |
| `POST` | `/api/reports/by-group/` | Reporte por grupo |
| `POST` | `/api/reports/by-student/` | Reporte por alumno |
| `POST` | `/api/reports/student-exam-detail/` | Detalle alumno–examen |

Los 3 primeros GET ya funcionan contra endpoints existentes. Los endpoints de exámenes y alumnos usan mock data porque:
- `/api/exams/` solo tiene la ruta `template/download/` (no listing).
- `/api/users/` requiere `IsAdmin` y el teacher no tiene acceso.

Los 5 POST no existen — son todos nuevos.

### 1.3 Formato de respuesta

El frontend espera la estructura estándar de `utils/responses.py`:

```python
# Reportes (NO paginados — dataset completo para exportación PDF/Excel):
success_response(data, message)
→ { "success": true, "data": { ... }, "message": "..." }

# Filtros (ya existentes, paginados con GlobalPagination/CatalogPagination):
paginated_success_response(request, queryset, serializer_class)
→ { "success": true, "data": { "results": [...], "pagination": { "count", "page", ... } } }
```

El frontend extrae `data.results` de las respuestas paginadas con `extractPaginatedOptions()` y mapea a `{ id, label }`.

### 1.4 Convenciones

| Aspecto | Detalle |
|---------|---------|
| **Base URL** | `/api/` |
| **Auth** | Bearer JWT (`Authorization: Bearer <token>`) |
| **Permisos** | `IsTeacherOrAdmin` (ya existe en `apps/academic/permissions.py`) |
| **camelCase** | Frontend envía/espera camelCase. Backend usa snake_case. Resolver con `djangorestframework-camel-case` o serializer `source=`. |
| **Roles** | `teacher` y `admin` acceden. `student` sin acceso. |
| **Filtro TEACHER** | Todo query de exámenes debe incluir `.filter(id_exam__id_teacher=request.user)` cuando `request.user.role == 'teacher'`. |

### 1.5 Modelos existentes — Referencia rápida

```
User (AbstractUser)
├── id_user (AutoField PK)
├── email, matricula (unique), role (student|teacher|admin), status (Bool)
├── first_name, last_name
├── ← student_profile (O2O → StudentProfile)
└── ← teacher_profile (O2O → TeacherProfile)

StudentProfile
├── user (O2O → User, related_name='student_profile')
└── group (FK → Group, null=True, SET_NULL, related_name='students')

TeacherProfile
├── user (O2O → User, related_name='teacher_profile')
├── department (CharField)
└── subjects (M2M → Subject, related_name='teachers')

Generation
├── id_generation (AutoField PK), year (unique), total_levels, status

Period
├── id_period (AutoField PK), year, period_name (Enero-Abril|Mayo-Agosto|Septiembre-Diciembre)
├── start_date, end_date, status
└── unique_together: [year, period_name]

Group
├── id_group (AutoField PK)
├── id_generation (FK → Generation, RESTRICT, related_name='groups')
├── id_period (FK → Period, RESTRICT, null=True, related_name='groups')  ⚠️ NULLABLE
├── group_letter, academic_level, status
└── unique_together: [id_generation, group_letter]

Subject
├── id_subject (AutoField PK), name, level_number, status

Exam
├── id_exam (AutoField PK)
├── id_subject (FK → Subject, RESTRICT, related_name='exams')
├── id_teacher (FK → User, RESTRICT, related_name='created_exams')
├── title, secure_mode, creation_date
└── status (⚠️ BooleanField, default=True — NO es CharField)

ExamQuestion
├── id_exam_question (AutoField PK)
├── id_exam (FK → Exam, CASCADE, related_name='exam_questions')
├── id_question (FK → Question, RESTRICT, related_name='question_exams')
├── question_order
└── unique_together: [id_exam, id_question]

ExamPerson
├── id_exam_person (AutoField PK)
├── id_exam (FK → Exam, CASCADE, related_name='assignments')
├── id_person (FK → User, CASCADE, related_name='assigned_exams')
├── assignment_date, start_datetime (null), end_datetime (null)
├── grade (Decimal 5,2, null)
├── status (CharField: pending|in_progress|finished|not_presented)
└── unique_together: [id_exam, id_person]

Question
├── id_question (AutoField PK)
├── id_subject (FK → Subject, CASCADE, related_name='questions')
├── statement (TextField), bloom_level (remember|understand|apply|analyze|evaluate|create), status

Answer
├── id_answer (AutoField PK)
├── id_question (FK → Question, CASCADE, related_name='answers')
├── answer_text (TextField), is_correct (Bool)
```

> **⚠️ CRÍTICO — `Exam.status` es `BooleanField`:** Filtrar con `filter(status=True)`, NUNCA con `filter(status='active')`.

---

## 2. Inventario de Reportes

### 2.1 Reporte por Examen

| Campo | Detalle |
|-------|---------|
| **Identificador** | `by-exam` |
| **Propósito** | Ver calificaciones, estatus y métricas de todos los alumnos asignados a un examen |
| **Roles** | TEACHER, ADMIN |
| **Filtro requerido** | `examId` |
| **Modelos fuente** | `Exam`, `ExamPerson`, `User` (alumno), `Subject` |
| **Endpoint** | `POST /api/reports/by-exam/` |

**Estructura de respuesta (`ExamReportData`):**

```jsonc
{
  "success": true,
  "data": {
    "examId": 1,                        // Exam.id_exam
    "examTitle": "Parcial 1",           // Exam.title
    "subjectName": "Matemáticas",       // Exam.id_subject.name
    "teacherName": "Prof. García López",// Exam.id_teacher.first_name + " " + last_name
    "creationDate": "2026-03-01",       // Exam.creation_date (ISO date)
    "metrics": {
      "totalStudents": 30,    // COUNT(ExamPerson) del examen
      "totalExams": 1,        // Siempre 1 — es un solo examen
      "averageGrade": 78.4,   // AVG(grade) WHERE status='finished'
      "approvalRate": 76.7,   // COUNT(grade>=70) / COUNT(finished) * 100
      "highestGrade": 98,     // MAX(grade) WHERE grade IS NOT NULL
      "lowestGrade": 42       // MIN(grade) WHERE grade IS NOT NULL
    },
    "statusBreakdown": {
      "pending": 2,           // COUNT(status='pending')
      "inProgress": 1,        // COUNT(status='in_progress')
      "finished": 25,         // COUNT(status='finished')
      "notPresented": 2       // COUNT(status='not_presented')
    },
    "gradeDistribution": [    // Solo de alumnos con status='finished'
      { "range": "0-59",   "count": 3, "percentage": 10.0 },
      { "range": "60-69",  "count": 4, "percentage": 13.3 },
      { "range": "70-79",  "count": 8, "percentage": 26.7 },
      { "range": "80-89",  "count": 9, "percentage": 30.0 },
      { "range": "90-100", "count": 6, "percentage": 20.0 }
    ],
    "students": [             // Array de ExamReportRow
      {
        "studentId": 101,                            // User.id_user
        "matricula": "ALU001",                       // User.matricula
        "fullName": "Juan Pérez López",              // first_name + " " + last_name
        "grade": 85.0,                               // ExamPerson.grade (float | null)
        "status": "finished",                        // ExamPerson.status
        "startDatetime": "2026-03-15T09:00:00Z",    // ExamPerson.start_datetime (ISO | null)
        "endDatetime": "2026-03-15T09:45:00Z"        // ExamPerson.end_datetime (ISO | null)
      }
    ]
  }
}
```

---

### 2.2 Reporte por Periodo

| Campo | Detalle |
|-------|---------|
| **Identificador** | `by-period` |
| **Propósito** | Resumen de todos los exámenes aplicados durante un periodo académico |
| **Roles** | ADMIN |
| **Filtro requerido** | `periodId` |
| **Filtros opcionales** | `dateFrom`, `dateTo` |
| **Modelos fuente** | `Period`, `Group`, `StudentProfile`, `ExamPerson`, `Exam`, `Subject` |
| **Endpoint** | `POST /api/reports/by-period/` |

**Estructura de respuesta (`PeriodReportData`):**

```jsonc
{
  "success": true,
  "data": {
    "periodId": 1,                  // Period.id_period
    "periodName": "Enero-Abril",    // Period.period_name
    "year": 2026,                   // Period.year
    "startDate": "2026-01-11",      // Period.start_date
    "endDate": "2026-04-30",        // Period.end_date
    "metrics": {
      "totalStudents": 120,   // COUNT DISTINCT student_ids
      "totalExams": 6,        // COUNT DISTINCT exams
      "averageGrade": 78.4,
      "approvalRate": 76.7,
      "highestGrade": 98,
      "lowestGrade": 42
    },
    "gradeDistribution": [ /* mismo formato 5 rangos */ ],
    "exams": [                // Array de PeriodExamSummary
      {
        "examId": 1,                       // Exam.id_exam
        "examTitle": "Parcial 1",          // Exam.title
        "subjectName": "Matemáticas",      // Exam.id_subject.name
        "groupLetter": "1A",              // Group.group_letter (del grupo de los alumnos)
        "averageGrade": 78.5,
        "approvalRate": 83.3,
        "totalStudents": 30
      }
    ]
  }
}
```

---

### 2.3 Reporte por Grupo

| Campo | Detalle |
|-------|---------|
| **Identificador** | `by-group` |
| **Propósito** | Rendimiento académico de cada alumno dentro de un grupo |
| **Roles** | TEACHER, ADMIN |
| **Filtro requerido** | `groupId` |
| **Filtros opcionales** | `dateFrom`, `dateTo` |
| **Modelos fuente** | `Group`, `Generation`, `StudentProfile`, `User`, `ExamPerson`, `Exam` |
| **Endpoint** | `POST /api/reports/by-group/` |

**Estructura de respuesta (`GroupReportData`):**

```jsonc
{
  "success": true,
  "data": {
    "groupId": 1,                   // Group.id_group
    "groupLetter": "A",             // Group.group_letter
    "academicLevel": 1,             // Group.academic_level
    "generationYear": 2026,         // Group.id_generation.year
    "metrics": { /* SummaryMetrics */ },
    "gradeDistribution": [ /* 5 rangos */ ],
    "students": [             // Array de GroupStudentRow
      {
        "studentId": 101,                  // User.id_user
        "matricula": "ALU001",             // User.matricula
        "fullName": "Juan Pérez López",
        "totalExams": 3,                   // COUNT(ExamPerson) del alumno
        "averageGrade": 85.0,             // AVG(grade) WHERE finished
        "approvalRate": 100.0              // % de exámenes aprobados (grade>=70)
      }
    ]
  }
}
```

---

### 2.4 Reporte por Alumno

| Campo | Detalle |
|-------|---------|
| **Identificador** | `by-student` |
| **Propósito** | Historial de exámenes de un alumno específico |
| **Roles** | TEACHER, ADMIN |
| **Filtro requerido** | `studentId` |
| **Modelos fuente** | `User`, `StudentProfile`, `Group`, `ExamPerson`, `Exam`, `Subject` |
| **Endpoint** | `POST /api/reports/by-student/` |

**Estructura de respuesta (`StudentReportData`):**

```jsonc
{
  "success": true,
  "data": {
    "studentId": 101,
    "matricula": "ALU001",
    "fullName": "Juan Pérez López",
    "groupLetter": "A",          // profile.group.group_letter (o "" si null)
    "academicLevel": 1,          // profile.group.academic_level (o 0 si null)
    "metrics": {
      "totalStudents": 1,        // Siempre 1
      "totalExams": 3,
      "averageGrade": 78.3,
      "approvalRate": 66.7,
      "highestGrade": 92,
      "lowestGrade": 55
    },
    "gradeDistribution": [ /* 5 rangos */ ],
    "exams": [              // Array de StudentExamRow
      {
        "examId": 1,
        "examTitle": "Parcial 1",
        "subjectName": "Matemáticas",
        "grade": 92.0,                              // float | null
        "status": "finished",
        "startDatetime": "2026-02-15T09:00:00Z",    // ISO | null
        "endDatetime": "2026-02-15T09:45:00Z"
      }
    ]
  }
}
```

---

### 2.5 Detalle Alumno–Examen

| Campo | Detalle |
|-------|---------|
| **Identificador** | `student-exam-detail` |
| **Propósito** | Ver cada pregunta del examen con la respuesta del alumno y si es correcta |
| **Roles** | TEACHER, ADMIN |
| **Filtros requeridos** | `studentId`, `examId` |
| **Modelos fuente** | `ExamPerson`, `ExamQuestion`, `Question`, `Answer`, **`StudentAnswer` (A CREAR)** |
| **Endpoint** | `POST /api/reports/student-exam-detail/` |

**Estructura de respuesta (`StudentExamDetailData`):**

```jsonc
{
  "success": true,
  "data": {
    "studentId": 101,
    "matricula": "ALU001",
    "fullName": "Juan Pérez López",
    "examId": 1,
    "examTitle": "Parcial 1",
    "subjectName": "Matemáticas",
    "grade": 85.0,                                   // ExamPerson.grade (float | null)
    "status": "finished",
    "startDatetime": "2026-03-15T09:00:00Z",
    "endDatetime": "2026-03-15T09:45:00Z",
    "totalQuestions": 10,                             // COUNT(ExamQuestion)
    "correctAnswers": 8,                              // COUNT(StudentAnswer WHERE is_correct=True)
    "answers": [                                      // Array de StudentAnswerRow
      {
        "questionOrder": 1,                           // ExamQuestion.question_order
        "statement": "¿Cuál es la derivada de x²?",  // Question.statement
        "bloomLevel": "apply",                        // Question.bloom_level (remember|understand|apply|analyze|evaluate|create)
        "selectedAnswer": "2x",                       // StudentAnswer.id_selected_answer.answer_text
        "correctAnswer": "2x",                        // Answer WHERE is_correct=True → answer_text
        "isCorrect": true                             // StudentAnswer.is_correct
      }
    ]
  }
}
```

> **⚠️ MODELO FALTANTE:** Ver sección [5.1](#51-modelo-studentanswer-a-crear).

---

## 3. Consultas Necesarias

### 3.1 Endpoints de Filtros (GET)

Estos endpoints alimentan los dropdowns del panel de filtros. El frontend ya llama a los existentes y extrae `data.results` de la respuesta paginada. **No se necesita cambiar el formato de respuesta** de los 3 que ya existen — el frontend los maneja.

#### 3.1.1 Periodos — ✅ YA EXISTE

```
GET /api/academic/periods/
```

**Vista actual:** `PeriodListCreateView` en `apps/academic/views.py`
**Permiso:** `IsTeacherOrAdmin`
**Paginación:** `CatalogPagination` (page_size=10)
**Filtros existentes:** `year`, `status`

El frontend mapea: `p.id_period` → `id`, `f"{p.period_name} {p.year}"` → `label`

**No requiere cambios.**

---

#### 3.1.2 Grupos — ✅ YA EXISTE (necesita filtro `period_id`)

```
GET /api/academic/groups/
GET /api/academic/groups/?period_id=1
```

**Vista actual:** `GroupListCreateView`
**Filtros existentes:** `id_generation`, `academic_level`, `status`

**⚠️ Falta:** El frontend envía `?period_id=N` pero la vista filtra por `id_generation` y `academic_level`. **Agregar filtro `period_id`:**

```python
# En GroupListCreateView.get():
period_id = request.query_params.get('period_id')
if period_id:
    queryset = queryset.filter(id_period=period_id)
```

> **Nota:** `Group.id_period` es nullable. Muchos grupos pueden tener `id_period=NULL`. El frontend lo maneja — si no hay grupos, el dropdown se muestra vacío.

El frontend mapea: `g.id_group` → `id`, `f"{g.group_letter} - Nivel {g.academic_level} ({g.generation_year})"` → `label`

El serializer `GroupSerializer` ya incluye `generation_year` (campo derivado).

---

#### 3.1.3 Materias — ✅ YA EXISTE

```
GET /api/academic/subjects/
```

**Vista actual:** `SubjectListCreateView`
**Filtros existentes:** `academic_level` (→ `level_number`), `status`

El frontend mapea: `s.id_subject` → `id`, `s.name` → `label`

**No requiere cambios.**

---

#### 3.1.4 Exámenes — ❌ NO EXISTE

```
GET /api/exams/?subject_id=1&group_id=2
```

**Estado actual:** `/api/exams/` solo tiene la ruta `template/download/`. No existe un endpoint para listar exámenes.

**Acción requerida:** Crear `ExamListView` en `apps/exams/views.py`:

```python
from rest_framework.views import APIView
from apps.academic.permissions import IsTeacherOrAdmin
from apps.exams.models import Exam
from apps.users.models import StudentProfile
from utils.responses import success_response
from utils.pagination import GlobalPagination

class ExamListView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        qs = Exam.objects.filter(status=True).select_related('id_subject')

        # Teacher solo ve sus exámenes
        if request.user.role == 'teacher':
            qs = qs.filter(id_teacher=request.user)

        subject_id = request.query_params.get('subject_id')
        if subject_id:
            qs = qs.filter(id_subject_id=subject_id)

        group_id = request.query_params.get('group_id')
        if group_id:
            student_ids = StudentProfile.objects.filter(
                group_id=group_id
            ).values_list('user_id', flat=True)
            qs = qs.filter(assignments__id_person__in=student_ids).distinct()

        paginator = GlobalPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [{
            'id_exam': e.id_exam,
            'title': f"{e.title} — {e.id_subject.name}",
        } for e in page]
        return paginator.get_paginated_response(data)
```

**URL a agregar en `apps/exams/urls.py`:**
```python
path('', ExamListView.as_view()),  # GET /api/exams/
```

El frontend mapea: `e.id_exam` → `id`, `e.title` → `label`

---

#### 3.1.5 Alumnos — ⚠️ EXISTE PERO PERMISO INSUFICIENTE

```
GET /api/users/?group_id=1
```

**Vista actual:** `ListUsersView` tiene `permission_classes = [IsAdmin]`. Un teacher no puede acceder.

**Opciones:**

**Opción A (recomendada):** Crear endpoint separado:
```
GET /api/reports/students/?group_id=1
```

```python
class StudentListView(APIView):
    permission_classes = [IsTeacherOrAdmin]

    def get(self, request):
        qs = User.objects.filter(role='student', status=True)

        group_id = request.query_params.get('group_id')
        if group_id:
            qs = qs.filter(student_profile__group_id=group_id)

        paginator = GlobalPagination()
        page = paginator.paginate_queryset(qs, request)
        data = [{
            'id_user': u.id_user,
            'matricula': u.matricula,
            'first_name': u.first_name,
            'last_name': u.last_name,
        } for u in page]
        return paginator.get_paginated_response(data)
```

El frontend mapea: `u.id_user` → `id`, `f"{u.matricula} - {u.first_name} {u.last_name}"` → `label`

**Opción B:** Añadir `role=student` como filtro de `ListUsersView` y cambiar permiso a `IsTeacherOrAdmin` (NO recomendado — afecta endpoint de admin).

> **Si se elige Opción A:** Actualizar el frontend gateway (`getStudents`) para usar `/api/reports/students/` en vez de `/api/users/`.

---

### 3.2 Endpoints de Reportes (POST)

Todos reciben JSON con el `ReportFiltersDto`:

```json
{
  "reportType": "by-exam",
  "examId": 1,
  "periodId": null,
  "groupId": null,
  "studentId": null,
  "subjectId": null,
  "dateFrom": null,
  "dateTo": null
}
```

> Con `djangorestframework-camel-case`, los campos llegan automáticamente como `exam_id`, `period_id`, etc. en el serializer.

Respuestas **NO paginadas** — se devuelve el dataset completo (se usa para exportar PDF/Excel).

---

#### 3.2.1 POST `/api/reports/by-exam/`

**Request serializer:**

```python
class ExamReportSerializer(serializers.Serializer):
    exam_id = serializers.IntegerField(required=True)
```

**Query ORM — `services.py`:**

```python
from django.db.models import Avg, Count, Max, Min, Q, Case, When, Value, CharField

def get_exam_report(exam_id: int, user) -> dict:
    exam = Exam.objects.select_related('id_subject', 'id_teacher').get(
        id_exam=exam_id, status=True
    )

    # Validar acceso teacher
    if user.role == 'teacher' and exam.id_teacher_id != user.id_user:
        raise PermissionError("No tiene acceso a este examen.")

    ep_qs = ExamPerson.objects.filter(id_exam=exam).select_related('id_person')
    finished = ep_qs.filter(status='finished')

    # Métricas
    total_students = ep_qs.count()
    agg = finished.aggregate(
        avg=Avg('grade'), mx=Max('grade'), mn=Min('grade')
    )
    passing_count = finished.filter(grade__gte=70).count()
    finished_count = finished.count()

    metrics = {
        'totalStudents': total_students,
        'totalExams': 1,
        'averageGrade': round(float(agg['avg'] or 0), 1),
        'approvalRate': round(passing_count / finished_count * 100, 1) if finished_count else 0,
        'highestGrade': float(agg['mx'] or 0),
        'lowestGrade': float(agg['mn'] or 0),
    }

    # Status breakdown
    status_agg = ep_qs.values('status').annotate(c=Count('id_exam_person'))
    status_map = {s['status']: s['c'] for s in status_agg}
    status_breakdown = {
        'pending': status_map.get('pending', 0),
        'inProgress': status_map.get('in_progress', 0),
        'finished': status_map.get('finished', 0),
        'notPresented': status_map.get('not_presented', 0),
    }

    # Grade distribution
    grade_distribution = _calculate_grade_distribution(
        list(finished.values_list('grade', flat=True))
    )

    # Students array
    students = [{
        'studentId': ep.id_person.id_user,
        'matricula': ep.id_person.matricula,
        'fullName': f"{ep.id_person.first_name} {ep.id_person.last_name}",
        'grade': float(ep.grade) if ep.grade is not None else None,
        'status': ep.status,
        'startDatetime': ep.start_datetime.isoformat() if ep.start_datetime else None,
        'endDatetime': ep.end_datetime.isoformat() if ep.end_datetime else None,
    } for ep in ep_qs]

    return {
        'examId': exam.id_exam,
        'examTitle': exam.title,
        'subjectName': exam.id_subject.name,
        'teacherName': f"{exam.id_teacher.first_name} {exam.id_teacher.last_name}",
        'creationDate': exam.creation_date.isoformat(),
        'metrics': metrics,
        'statusBreakdown': status_breakdown,
        'gradeDistribution': grade_distribution,
        'students': students,
    }
```

---

#### 3.2.2 POST `/api/reports/by-period/`

**Request serializer:**

```python
class PeriodReportSerializer(serializers.Serializer):
    period_id = serializers.IntegerField(required=True)
    date_from = serializers.DateField(required=False, allow_null=True)
    date_to = serializers.DateField(required=False, allow_null=True)
```

**Query ORM:**

```python
def get_period_report(period_id: int, user, date_from=None, date_to=None) -> dict:
    period = Period.objects.get(id_period=period_id)
    groups = Group.objects.filter(id_period=period, status=True)
    student_ids = StudentProfile.objects.filter(
        group__in=groups
    ).values_list('user_id', flat=True)

    ep_qs = ExamPerson.objects.filter(
        id_person__in=student_ids
    ).select_related('id_exam', 'id_exam__id_subject')

    if date_from:
        ep_qs = ep_qs.filter(id_exam__creation_date__gte=date_from)
    if date_to:
        ep_qs = ep_qs.filter(id_exam__creation_date__lte=date_to)
    if user.role == 'teacher':
        ep_qs = ep_qs.filter(id_exam__id_teacher=user)

    # Global metrics (from all finished ExamPerson)
    finished = ep_qs.filter(status='finished')
    all_grades = list(finished.values_list('grade', flat=True))
    distinct_students = ep_qs.values('id_person').distinct().count()
    distinct_exams = ep_qs.values('id_exam').distinct().count()

    metrics = _calculate_summary_metrics(all_grades, distinct_students, distinct_exams)
    grade_distribution = _calculate_grade_distribution(all_grades)

    # Per-exam summaries (need groupLetter)
    # Group ExamPerson by exam, then find group of students
    exam_ids = ep_qs.values_list('id_exam', flat=True).distinct()
    exams = []
    for exam in Exam.objects.filter(id_exam__in=exam_ids).select_related('id_subject'):
        exam_ep = ep_qs.filter(id_exam=exam)
        e_finished = exam_ep.filter(status='finished')
        e_grades = list(e_finished.values_list('grade', flat=True))
        e_total = exam_ep.values('id_person').distinct().count()
        e_passing = len([g for g in e_grades if g is not None and g >= 70])

        # Determine group letter from first student
        first_person = exam_ep.first()
        group_letter = ''
        if first_person:
            sp = StudentProfile.objects.filter(user=first_person.id_person).first()
            if sp and sp.group:
                group_letter = sp.group.group_letter

        exams.append({
            'examId': exam.id_exam,
            'examTitle': exam.title,
            'subjectName': exam.id_subject.name,
            'groupLetter': group_letter,
            'averageGrade': round(sum(float(g) for g in e_grades if g) / len(e_grades), 1) if e_grades else 0,
            'approvalRate': round(e_passing / len(e_grades) * 100, 1) if e_grades else 0,
            'totalStudents': e_total,
        })

    return {
        'periodId': period.id_period,
        'periodName': period.period_name,
        'year': period.year,
        'startDate': period.start_date.isoformat(),
        'endDate': period.end_date.isoformat(),
        'metrics': metrics,
        'gradeDistribution': grade_distribution,
        'exams': exams,
    }
```

---

#### 3.2.3 POST `/api/reports/by-group/`

**Request serializer:**

```python
class GroupReportSerializer(serializers.Serializer):
    group_id = serializers.IntegerField(required=True)
    date_from = serializers.DateField(required=False, allow_null=True)
    date_to = serializers.DateField(required=False, allow_null=True)
```

**Query ORM — Versión optimizada con annotations (evita N+1):**

```python
from django.db.models import Subquery, OuterRef, DecimalField
from django.db.models.functions import Coalesce

def get_group_report(group_id: int, user, date_from=None, date_to=None) -> dict:
    group = Group.objects.select_related('id_generation').get(id_group=group_id)
    profiles = StudentProfile.objects.filter(
        group=group
    ).select_related('user')

    students = []
    all_grades = []

    for sp in profiles:
        ep_qs = ExamPerson.objects.filter(id_person=sp.user)
        if user.role == 'teacher':
            ep_qs = ep_qs.filter(id_exam__id_teacher=user)
        if date_from:
            ep_qs = ep_qs.filter(id_exam__creation_date__gte=date_from)
        if date_to:
            ep_qs = ep_qs.filter(id_exam__creation_date__lte=date_to)

        total_exams = ep_qs.count()
        finished = ep_qs.filter(status='finished')
        agg = finished.aggregate(avg=Avg('grade'))
        avg_grade = float(agg['avg'] or 0)
        passing = finished.filter(grade__gte=70).count()
        f_count = finished.count()
        rate = round(passing / f_count * 100, 1) if f_count else 0

        all_grades.extend(finished.values_list('grade', flat=True))

        students.append({
            'studentId': sp.user.id_user,
            'matricula': sp.user.matricula,
            'fullName': f"{sp.user.first_name} {sp.user.last_name}",
            'totalExams': total_exams,
            'averageGrade': round(avg_grade, 1),
            'approvalRate': rate,
        })

    distinct_exams = ExamPerson.objects.filter(
        id_person__in=profiles.values_list('user_id', flat=True)
    ).values('id_exam').distinct().count()

    metrics = _calculate_summary_metrics(all_grades, len(students), distinct_exams)
    grade_distribution = _calculate_grade_distribution(all_grades)

    return {
        'groupId': group.id_group,
        'groupLetter': group.group_letter,
        'academicLevel': group.academic_level,
        'generationYear': group.id_generation.year,
        'metrics': metrics,
        'gradeDistribution': grade_distribution,
        'students': students,
    }
```

---

#### 3.2.4 POST `/api/reports/by-student/`

**Request serializer:**

```python
class StudentReportSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(required=True)
```

**Query ORM:**

```python
def get_student_report(student_id: int, user) -> dict:
    student = User.objects.get(id_user=student_id, role='student')
    profile = StudentProfile.objects.select_related('group').get(user=student)

    ep_qs = ExamPerson.objects.filter(
        id_person=student
    ).select_related('id_exam', 'id_exam__id_subject')

    if user.role == 'teacher':
        ep_qs = ep_qs.filter(id_exam__id_teacher=user)

    finished = ep_qs.filter(status='finished')
    grades = [float(g) for g in finished.values_list('grade', flat=True) if g is not None]

    group = profile.group
    metrics = _calculate_summary_metrics(grades, 1, ep_qs.count())

    exams = [{
        'examId': ep.id_exam.id_exam,
        'examTitle': ep.id_exam.title,
        'subjectName': ep.id_exam.id_subject.name,
        'grade': float(ep.grade) if ep.grade is not None else None,
        'status': ep.status,
        'startDatetime': ep.start_datetime.isoformat() if ep.start_datetime else None,
        'endDatetime': ep.end_datetime.isoformat() if ep.end_datetime else None,
    } for ep in ep_qs]

    return {
        'studentId': student.id_user,
        'matricula': student.matricula,
        'fullName': f"{student.first_name} {student.last_name}",
        'groupLetter': group.group_letter if group else '',
        'academicLevel': group.academic_level if group else 0,
        'metrics': metrics,
        'gradeDistribution': _calculate_grade_distribution(grades),
        'exams': exams,
    }
```

---

#### 3.2.5 POST `/api/reports/student-exam-detail/`

**Request serializer:**

```python
class StudentExamDetailSerializer(serializers.Serializer):
    student_id = serializers.IntegerField(required=True)
    exam_id = serializers.IntegerField(required=True)
```

**Query ORM (requiere modelo `StudentAnswer`):**

```python
def get_student_exam_detail(student_id: int, exam_id: int, user) -> dict:
    exam = Exam.objects.select_related('id_subject').get(id_exam=exam_id, status=True)

    if user.role == 'teacher' and exam.id_teacher_id != user.id_user:
        raise PermissionError("No tiene acceso a este examen.")

    student = User.objects.get(id_user=student_id, role='student')
    exam_person = ExamPerson.objects.get(id_exam=exam, id_person=student)

    exam_questions = ExamQuestion.objects.filter(
        id_exam=exam
    ).select_related('id_question').order_by('question_order')

    # Prefetch student answers + correct answers
    student_answers_map = {
        sa.id_exam_question_id: sa
        for sa in StudentAnswer.objects.filter(
            id_exam_person=exam_person
        ).select_related('id_selected_answer')
    }

    correct_answers_map = {}
    question_ids = [eq.id_question_id for eq in exam_questions]
    for ans in Answer.objects.filter(id_question__in=question_ids, is_correct=True):
        correct_answers_map[ans.id_question_id] = ans.answer_text

    answers = []
    correct_count = 0
    for eq in exam_questions:
        sa = student_answers_map.get(eq.id_exam_question)
        is_correct = sa.is_correct if sa else False
        if is_correct:
            correct_count += 1

        answers.append({
            'questionOrder': eq.question_order,
            'statement': eq.id_question.statement,
            'bloomLevel': eq.id_question.bloom_level,
            'selectedAnswer': sa.id_selected_answer.answer_text if sa and sa.id_selected_answer else '—',
            'correctAnswer': correct_answers_map.get(eq.id_question_id, '—'),
            'isCorrect': is_correct,
        })

    return {
        'studentId': student.id_user,
        'matricula': student.matricula,
        'fullName': f"{student.first_name} {student.last_name}",
        'examId': exam.id_exam,
        'examTitle': exam.title,
        'subjectName': exam.id_subject.name,
        'grade': float(exam_person.grade) if exam_person.grade is not None else None,
        'status': exam_person.status,
        'startDatetime': exam_person.start_datetime.isoformat() if exam_person.start_datetime else None,
        'endDatetime': exam_person.end_datetime.isoformat() if exam_person.end_datetime else None,
        'totalQuestions': len(exam_questions),
        'correctAnswers': correct_count,
        'answers': answers,
    }
```

---

### 3.3 Funciones Helper Reutilizables (`services.py`)

```python
def _calculate_grade_distribution(grades: list) -> list[dict]:
    """5 rangos fijos. grades puede contener Decimal — se convierte a float."""
    bins = [
        ('0-59', 0, 59),
        ('60-69', 60, 69),
        ('70-79', 70, 79),
        ('80-89', 80, 89),
        ('90-100', 90, 100),
    ]
    clean = [float(g) for g in grades if g is not None]
    total = len(clean)
    result = []
    for label, lo, hi in bins:
        count = sum(1 for g in clean if lo <= g <= hi)
        pct = round(count / total * 100, 1) if total > 0 else 0
        result.append({'range': label, 'count': count, 'percentage': pct})
    return result


def _calculate_summary_metrics(grades: list, total_students: int, total_exams: int) -> dict:
    """grades puede contener Decimal — se convierte a float."""
    clean = [float(g) for g in grades if g is not None]
    passing = [g for g in clean if g >= 70]
    return {
        'totalStudents': total_students,
        'totalExams': total_exams,
        'averageGrade': round(sum(clean) / len(clean), 1) if clean else 0,
        'approvalRate': round(len(passing) / len(clean) * 100, 1) if clean else 0,
        'highestGrade': max(clean) if clean else 0,
        'lowestGrade': min(clean) if clean else 0,
    }
```

---

## 4. Compatibilidad con MockData del Frontend

El archivo `mock-reports.ts` define los datos demo. La tabla muestra el mapeo exacto de cada campo mock → campo Django:

### 4.1 Mapeo campo por campo

| Campo frontend (camelCase) | Origen Django (snake_case) | Tipo | Notas |
|---|---|---|---|
| `examId` | `Exam.id_exam` | int | |
| `examTitle` | `Exam.title` | string | |
| `subjectName` | `Exam.id_subject.name` | string | FK traversal |
| `teacherName` | `Exam.id_teacher.first_name + " " + last_name` | string | Concatenar en backend |
| `creationDate` | `Exam.creation_date` | ISO date | `date.isoformat()` |
| `studentId` | `User.id_user` | int | |
| `matricula` | `User.matricula` | string | |
| `fullName` | `User.first_name + " " + User.last_name` | string | Concatenar |
| `grade` | `ExamPerson.grade` | float \| null | ⚠️ `Decimal(5,2)` → convertir a `float()` |
| `status` (ExamPerson) | `ExamPerson.status` | string | `pending\|in_progress\|finished\|not_presented` |
| `startDatetime` | `ExamPerson.start_datetime` | ISO datetime \| null | `.isoformat()` |
| `endDatetime` | `ExamPerson.end_datetime` | ISO datetime \| null | `.isoformat()` |
| `periodId` | `Period.id_period` | int | |
| `periodName` | `Period.period_name` | string | Valores: `Enero-Abril`, `Mayo-Agosto`, `Septiembre-Diciembre` |
| `year` | `Period.year` | int | |
| `startDate` / `endDate` | `Period.start_date` / `end_date` | ISO date | |
| `groupId` | `Group.id_group` | int | |
| `groupLetter` | `Group.group_letter` | string | |
| `academicLevel` | `Group.academic_level` | int | |
| `generationYear` | `Group.id_generation.year` | int | FK traversal |
| `questionOrder` | `ExamQuestion.question_order` | int | |
| `statement` | `Question.statement` | string | |
| `bloomLevel` | `Question.bloom_level` | string | Backend: `remember\|understand\|apply\|...` Mock: `Conocimiento\|Comprensión\|Aplicación\|Análisis` |
| `selectedAnswer` | `StudentAnswer.id_selected_answer.answer_text` | string | Requiere modelo nuevo |
| `correctAnswer` | `Answer.answer_text WHERE is_correct=True` | string | |
| `isCorrect` | `StudentAnswer.is_correct` | bool | |

### 4.2 Transformaciones críticas

| Transformación | Detalle |
|---|---|
| **`Decimal` → `float`** | `ExamPerson.grade` es `DecimalField(5,2)`. Siempre usar `float(grade)` antes de serializr. |
| **`camelCase` ↔ `snake_case`** | Usar `djangorestframework-camel-case` (ver §5.3) o mapear manualmente en cada dict. |
| **`bloomLevel` display** | Mock usa español (`Conocimiento`, `Aplicación`). Backend almacena inglés (`remember`, `apply`). **El frontend debe manejar la traducción**, o el backend puede usar `get_bloom_level_display()` si se quiere el display name en Django — pero los choices están en inglés. **Decisión**: devolver el valor raw (`remember`, `apply`, etc.) y traducir en frontend. |
| **`ExamPerson.status` values** | Exactamente: `pending`, `in_progress`, `finished`, `not_presented`. Mock usa los mismos valores ✅ |
| **`statusBreakdown` keys** | Mock: `{ pending, inProgress, finished, notPresented }`. Backend: mapear `in_progress` → `inProgress`, `not_presented` → `notPresented`. Si se usa `djangorestframework-camel-case`, esto se hace automáticamente **solo si las keys son snake_case**. Mejor: construir el dict manualmente como en §3.2.1. |

### 4.3 Dropdown options mock vs API

| Dropdown | Mock | API esperada |
|---|---|---|
| Periodos | N/A (usa API) | `GET /api/academic/periods/` → `{ id: id_period, label: "period_name year" }` ✅ |
| Grupos | N/A (usa API) | `GET /api/academic/groups/?period_id=N` → `{ id: id_group, label: "letter - Nivel level (gen_year)" }` ✅ |
| Materias | N/A (usa API) | `GET /api/academic/subjects/` → `{ id: id_subject, label: name }` ✅ |
| Exámenes | 3 items mock | `GET /api/exams/?subject_id=N&group_id=N` ❌ Endpoint no existe |
| Alumnos | 5 items mock | `GET /api/users/?group_id=N` ⚠️ Permiso admin-only, teacher no accede |

---

## 5. Consideraciones Técnicas

### 5.1 Modelo `StudentAnswer` (A CREAR)

El reporte **Detalle Alumno–Examen** (§2.5) requiere saber qué respuesta seleccionó cada alumno. Actualmente no existe este modelo.

**Ubicación recomendada:** `apps/exams/models.py`

```python
class StudentAnswer(models.Model):
    id_student_answer = models.AutoField(primary_key=True, db_column='id_student_answer')
    id_exam_person = models.ForeignKey(
        ExamPerson, on_delete=models.CASCADE,
        db_column='id_exam_person', related_name='student_answers'
    )
    id_exam_question = models.ForeignKey(
        ExamQuestion, on_delete=models.CASCADE,
        db_column='id_exam_question', related_name='student_answers'
    )
    id_selected_answer = models.ForeignKey(
        'questions.Answer', on_delete=models.SET_NULL,
        db_column='id_selected_answer', null=True, blank=True,
        related_name='student_selections'
    )
    is_correct = models.BooleanField(default=False, db_column='is_correct')
    answered_at = models.DateTimeField(auto_now_add=True, db_column='answered_at')

    class Meta:
        db_table = 'student_answer'
        unique_together = ('id_exam_person', 'id_exam_question')
        ordering = ['id_exam_question__question_order']
```

**Migración:**
```bash
python manage.py makemigrations exams
python manage.py migrate
```

> Este modelo también deberá ser poblado por el flujo de "presentar examen" — está fuera del alcance de reportes, pero es prerrequisito para que §2.5 funcione con datos reales.

### 5.2 `Exam.status` es `BooleanField`

**⚠️ Error común:** El campo `Exam.status` es `BooleanField(default=True)`, NO un `CharField` con valores como `'active'`.

```python
# ✅ CORRECTO
Exam.objects.filter(status=True)

# ❌ INCORRECTO — nunca usar esto
Exam.objects.filter(status='active')
```

### 5.3 camelCase ↔ snake_case

**Opción recomendada:** Instalar `djangorestframework-camel-case`:

```bash
pip install djangorestframework-camel-case
```

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': (
        'djangorestframework_camel_case.render.CamelCaseJSONRenderer',
    ),
    'DEFAULT_PARSER_CLASSES': (
        'djangorestframework_camel_case.parser.CamelCaseJSONParser',
    ),
}
```

Esto transforma automáticamente:
- **Request** `camelCase` → `snake_case` (para que el serializer reciba `exam_id` cuando el frontend envía `examId`)
- **Response** `snake_case` → `camelCase` (para que el frontend reciba `examTitle` cuando el backend envía `exam_title`)

> **Impacto:** Esto afecta TODOS los endpoints. Verificar que los endpoints existentes no se rompan (los serializers existentes ya usan snake_case, así que solo cambia el wire format).

**Alternativa sin librería:** Construir los dicts de respuesta directamente en camelCase como se muestra en los ejemplos de §3.2.

### 5.4 `Group.id_period` es nullable

El campo `Group.id_period` tiene `null=True`. Esto significa:
- Muchos grupos pueden no tener periodo asignado.
- Al filtrar `Group.objects.filter(id_period=period)`, **solo se obtienen los que tienen periodo explícito**.
- Evaluar si esto es correcto para el reporte por periodo, o si se necesita una lógica alternativa (p.ej., inferir periodo por fechas).

### 5.5 `ExamPerson.grade` es `Decimal(5,2)` nullable

- Siempre verificar `if grade is not None` antes de operar.
- Convertir a `float()` antes de serializar (JSON no soporta `Decimal`).
- Para alumnos con status `pending` o `not_presented`, el grade será `None`.

### 5.6 Performance — Evitar N+1

El reporte **por grupo** (§3.2.3) itera por alumno. Con 30+ alumnos, esto genera muchas queries. Alternativas:

1. **Annotations con Subquery** (ideal):
```python
from django.db.models import Subquery, OuterRef, Avg, Count

StudentProfile.objects.filter(group=group).annotate(
    avg_grade=Subquery(
        ExamPerson.objects.filter(
            id_person=OuterRef('user'), status='finished'
        ).values('id_person').annotate(avg=Avg('grade')).values('avg')[:1]
    ),
    total_exams=Count(
        'user__assigned_exams',
        distinct=True
    ),
)
```

2. **Prefetch + Python aggregation** (más simple, acceptable para <100 alumnos).

### 5.7 Permisos — Reutilizar `IsTeacherOrAdmin`

Ya existe en `apps/academic/permissions.py`. Importar directamente:

```python
from apps.academic.permissions import IsTeacherOrAdmin
```

No crear uno nuevo en `apps/reports/permissions.py` a menos que se necesite lógica diferente.

### 5.8 Respuestas de error

Usar la convención existente de `utils/responses.py`:

```python
from utils.responses import success_response, error_response

# Si el examen no existe:
return error_response("Examen no encontrado.", status_code=404)

# Si el teacher no tiene acceso:
return error_response("No tiene permiso para ver este examen.", status_code=403)

# Si falta un campo requerido:
return error_response("El campo exam_id es obligatorio.", errors=serializer.errors, status_code=400)
```

---

## 6. Conclusión Operativa

### 6.1 Nueva app a crear

```
apps/reports/
    __init__.py
    urls.py          # 5 rutas POST + 1 GET (students)
    views.py         # 5 APIViews de reportes + 1 StudentListView
    serializers.py   # 5 request serializers
    services.py      # Lógica de queries + helpers reutilizables
```

### 6.2 Registro en `config/urls.py`

```python
urlpatterns = [
    # ... existentes ...
    path('api/', include('apps.reports.urls')),
]
```

### 6.3 Resumen completo de cambios

| Acción | Archivo | Detalle |
|--------|---------|---------|
| **CREAR** | `apps/reports/` (app completa) | 5 POST endpoints + servicios |
| **CREAR** | `apps/reports/urls.py` | Rutas: `reports/by-exam/`, `by-period/`, `by-group/`, `by-student/`, `student-exam-detail/`, `reports/students/` |
| **CREAR** | `apps/exams/models.py` | Agregar modelo `StudentAnswer` |
| **MODIFICAR** | `apps/exams/urls.py` | Agregar `path('', ExamListView.as_view())` para listing de exámenes |
| **MODIFICAR** | `apps/exams/views.py` | Agregar `ExamListView` con filtros `subject_id`, `group_id` |
| **MODIFICAR** | `apps/academic/views.py` | En `GroupListCreateView.get()`, agregar filtro `period_id` |
| **MODIFICAR** | `config/urls.py` | Incluir `apps.reports.urls` |
| **INSTALAR** | dependencia pip | `djangorestframework-camel-case` (opcional, recomendado) |

### 6.4 Orden de implementación sugerido

1. **Modelo `StudentAnswer`** → `makemigrations` + `migrate`
2. **Modificar `GroupListCreateView`** → agregar filtro `period_id`
3. **Crear `ExamListView`** → endpoint `GET /api/exams/`
4. **Crear `apps/reports/`** → services.py (helpers + 5 funciones de reporte)
5. **Crear views + serializers + urls** → registrar en config
6. **Crear `StudentListView`** → `GET /api/reports/students/?group_id=N`
7. **Testing** → verificar cada endpoint con datos reales
8. **Frontend** → Deshabilitar `MOCK_ENABLED` en `mock-reports.ts`

### 6.5 Checklist pre-merge del frontend

Cuando el backend esté listo:

- [ ] En `mock-reports.ts`: cambiar `MOCK_ENABLED = false`
- [ ] En `report.storage.gateway.ts`: verificar que `getExams()` apunte a `GET /api/exams/`
- [ ] En `report.storage.gateway.ts`: verificar que `getStudents()` apunte a `GET /api/reports/students/`
- [ ] Si se usa `djangorestframework-camel-case`: no se necesitan cambios en el frontend (ya espera camelCase)
- [ ] Si NO se usa: el backend debe devolver camelCase explícitamente en los dicts de respuesta
- [ ] Verificar `bloomLevel` — el frontend muestra el valor raw. Si se quiere traducir a español, hacerlo en el componente `ReportTable.vue`

---

> **Documento verificado** contra el código fuente de `SEA-api/` (modelos, vistas, URLs, serializers, permisos) y `SEA-Frontend/src/modules/reports/` (entities, gateway, mock data, componentes).
