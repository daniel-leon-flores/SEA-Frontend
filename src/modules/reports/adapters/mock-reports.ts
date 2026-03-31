// ============================================================
// MOCK DATA — Solo para demostración mientras los endpoints
// de reportes y exámenes no están implementados en el backend.
// Eliminar o deshabilitar MOCK_ENABLED cuando estén listos.
// ============================================================

import type {
  ExamOption,
  StudentOption,
  ExamReportData,
  PeriodReportData,
  GroupReportData,
  StudentReportData,
  StudentExamDetailData,
  GradeDistribution,
  SummaryMetrics,
} from '../entities/report-data';

export const MOCK_ENABLED = true;

// --- Opciones de exámenes (dropdown) ---
export const MOCK_EXAM_OPTIONS: ExamOption[] = [
  { id: 1, label: 'Parcial 1 — Matemáticas' },
  { id: 2, label: 'Parcial 2 — Matemáticas' },
  { id: 3, label: 'Extraordinario — Matemáticas' },
];

// --- Opciones de alumnos (dropdown) ---
export const MOCK_STUDENT_OPTIONS: StudentOption[] = [
  { id: 101, label: 'ALU001 - Juan Pérez López' },
  { id: 102, label: 'ALU002 - María García Ramírez' },
  { id: 103, label: 'ALU003 - Carlos Hernández Díaz' },
  { id: 104, label: 'ALU004 - Ana Torres Sánchez' },
  { id: 105, label: 'ALU005 - Luis Martínez Flores' },
];

// --- Helpers internos ---
const GRADE_DIST: GradeDistribution[] = [
  { range: '0-59',   count: 3,  percentage: 10 },
  { range: '60-69',  count: 4,  percentage: 13.3 },
  { range: '70-79',  count: 8,  percentage: 26.7 },
  { range: '80-89',  count: 9,  percentage: 30 },
  { range: '90-100', count: 6,  percentage: 20 },
];

const METRICS: SummaryMetrics = {
  totalStudents: 30,
  totalExams: 3,
  averageGrade: 78.4,
  approvalRate: 76.7,
  highestGrade: 98,
  lowestGrade: 42,
};

// --- Reporte Por Examen ---
export function mockExamReport(examId: number): ExamReportData {
  const titles: Record<number, string> = {
    1: 'Parcial 1',
    2: 'Parcial 2',
    3: 'Extraordinario',
  };
  return {
    examId,
    examTitle: titles[examId] ?? 'Examen Demo',
    subjectName: 'Matemáticas',
    teacherName: 'Prof. García López',
    creationDate: '2026-03-01',
    metrics: METRICS,
    statusBreakdown: { pending: 2, inProgress: 1, finished: 25, notPresented: 2 },
    gradeDistribution: GRADE_DIST,
    students: [
      { studentId: 101, matricula: 'ALU001', fullName: 'Juan Pérez López',       grade: 85,   status: 'finished',       startDatetime: '2026-03-15T09:00:00Z', endDatetime: '2026-03-15T09:45:00Z' },
      { studentId: 102, matricula: 'ALU002', fullName: 'María García Ramírez',   grade: 92,   status: 'finished',       startDatetime: '2026-03-15T09:01:00Z', endDatetime: '2026-03-15T09:42:00Z' },
      { studentId: 103, matricula: 'ALU003', fullName: 'Carlos Hernández Díaz',  grade: 55,   status: 'finished',       startDatetime: '2026-03-15T09:02:00Z', endDatetime: '2026-03-15T09:50:00Z' },
      { studentId: 104, matricula: 'ALU004', fullName: 'Ana Torres Sánchez',     grade: 78,   status: 'finished',       startDatetime: '2026-03-15T09:00:00Z', endDatetime: '2026-03-15T09:40:00Z' },
      { studentId: 105, matricula: 'ALU005', fullName: 'Luis Martínez Flores',   grade: null, status: 'not_presented',  startDatetime: null, endDatetime: null },
      { studentId: 106, matricula: 'ALU006', fullName: 'Sofía López Gutiérrez',  grade: 98,   status: 'finished',       startDatetime: '2026-03-15T09:03:00Z', endDatetime: '2026-03-15T09:35:00Z' },
      { studentId: 107, matricula: 'ALU007', fullName: 'Diego Ramírez Castro',   grade: 67,   status: 'finished',       startDatetime: '2026-03-15T09:01:00Z', endDatetime: '2026-03-15T09:55:00Z' },
      { studentId: 108, matricula: 'ALU008', fullName: 'Valentina Cruz Morales', grade: 42,   status: 'finished',       startDatetime: '2026-03-15T09:05:00Z', endDatetime: '2026-03-15T09:48:00Z' },
      { studentId: 109, matricula: 'ALU009', fullName: 'Ricardo Moreno Vargas',  grade: null, status: 'pending',        startDatetime: null, endDatetime: null },
      { studentId: 110, matricula: 'ALU010', fullName: 'Isabella Jiménez Ruiz',  grade: 81,   status: 'finished',       startDatetime: '2026-03-15T09:02:00Z', endDatetime: '2026-03-15T09:44:00Z' },
    ],
  };
}

// --- Reporte Por Periodo ---
export function mockPeriodReport(periodId: number): PeriodReportData {
  return {
    periodId,
    periodName: 'Enero-Abril',
    year: 2026,
    startDate: '2026-01-11',
    endDate: '2026-04-30',
    metrics: { ...METRICS, totalStudents: 120, totalExams: 6 },
    gradeDistribution: [
      { range: '0-59',   count: 12, percentage: 10 },
      { range: '60-69',  count: 16, percentage: 13.3 },
      { range: '70-79',  count: 32, percentage: 26.7 },
      { range: '80-89',  count: 36, percentage: 30 },
      { range: '90-100', count: 24, percentage: 20 },
    ],
    exams: [
      { examId: 1, examTitle: 'Parcial 1',     subjectName: 'Matemáticas', groupLetter: '1A', averageGrade: 78.5, approvalRate: 83.3, totalStudents: 30 },
      { examId: 2, examTitle: 'Parcial 2',     subjectName: 'Matemáticas', groupLetter: '1A', averageGrade: 74.2, approvalRate: 76.7, totalStudents: 30 },
      { examId: 3, examTitle: 'Extraordinario',subjectName: 'Matemáticas', groupLetter: '1A', averageGrade: 65.0, approvalRate: 60.0, totalStudents: 10 },
      { examId: 4, examTitle: 'Parcial 1',     subjectName: 'Matemáticas', groupLetter: '1B', averageGrade: 81.3, approvalRate: 86.7, totalStudents: 30 },
      { examId: 5, examTitle: 'Parcial 2',     subjectName: 'Matemáticas', groupLetter: '1B', averageGrade: 77.9, approvalRate: 80.0, totalStudents: 30 },
      { examId: 6, examTitle: 'Extraordinario',subjectName: 'Matemáticas', groupLetter: '1B', averageGrade: 68.5, approvalRate: 62.5, totalStudents: 8  },
    ],
  };
}

// --- Reporte Por Grupo ---
export function mockGroupReport(groupId: number): GroupReportData {
  const letters: Record<number, string> = { 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'A', 6: 'B', 7: 'A' };
  return {
    groupId,
    groupLetter: letters[groupId] ?? 'A',
    academicLevel: 1,
    generationYear: 2026,
    metrics: METRICS,
    gradeDistribution: GRADE_DIST,
    students: [
      { studentId: 101, matricula: 'ALU001', fullName: 'Juan Pérez López',       totalExams: 3, averageGrade: 85.0, approvalRate: 100  },
      { studentId: 102, matricula: 'ALU002', fullName: 'María García Ramírez',   totalExams: 3, averageGrade: 91.3, approvalRate: 100  },
      { studentId: 103, matricula: 'ALU003', fullName: 'Carlos Hernández Díaz',  totalExams: 3, averageGrade: 58.7, approvalRate: 33.3 },
      { studentId: 104, matricula: 'ALU004', fullName: 'Ana Torres Sánchez',     totalExams: 3, averageGrade: 76.3, approvalRate: 100  },
      { studentId: 105, matricula: 'ALU005', fullName: 'Luis Martínez Flores',   totalExams: 2, averageGrade: 70.0, approvalRate: 50.0 },
      { studentId: 106, matricula: 'ALU006', fullName: 'Sofía López Gutiérrez',  totalExams: 3, averageGrade: 95.7, approvalRate: 100  },
      { studentId: 107, matricula: 'ALU007', fullName: 'Diego Ramírez Castro',   totalExams: 3, averageGrade: 65.3, approvalRate: 66.7 },
      { studentId: 108, matricula: 'ALU008', fullName: 'Valentina Cruz Morales', totalExams: 3, averageGrade: 48.7, approvalRate: 0    },
      { studentId: 109, matricula: 'ALU009', fullName: 'Ricardo Moreno Vargas',  totalExams: 1, averageGrade: 80.0, approvalRate: 100  },
      { studentId: 110, matricula: 'ALU010', fullName: 'Isabella Jiménez Ruiz',  totalExams: 3, averageGrade: 82.3, approvalRate: 100  },
    ],
  };
}

// --- Reporte Por Alumno ---
export function mockStudentReport(studentId: number): StudentReportData {
  const students: Record<number, { matricula: string; fullName: string }> = {
    101: { matricula: 'ALU001', fullName: 'Juan Pérez López' },
    102: { matricula: 'ALU002', fullName: 'María García Ramírez' },
    103: { matricula: 'ALU003', fullName: 'Carlos Hernández Díaz' },
    104: { matricula: 'ALU004', fullName: 'Ana Torres Sánchez' },
    105: { matricula: 'ALU005', fullName: 'Luis Martínez Flores' },
  };
  const s = students[studentId] ?? { matricula: 'ALU001', fullName: 'Alumno Demo' };
  return {
    studentId,
    matricula: s.matricula,
    fullName: s.fullName,
    groupLetter: 'A',
    academicLevel: 1,
    metrics: {
      totalStudents: 1,
      totalExams: 3,
      averageGrade: 78.3,
      approvalRate: 66.7,
      highestGrade: 92,
      lowestGrade: 55,
    },
    gradeDistribution: [
      { range: '0-59',   count: 0, percentage: 0    },
      { range: '60-69',  count: 1, percentage: 33.3 },
      { range: '70-79',  count: 1, percentage: 33.3 },
      { range: '80-89',  count: 0, percentage: 0    },
      { range: '90-100', count: 1, percentage: 33.3 },
    ],
    exams: [
      { examId: 1, examTitle: 'Parcial 1',      subjectName: 'Matemáticas', grade: 92,   status: 'finished',      startDatetime: '2026-02-15T09:00:00Z', endDatetime: '2026-02-15T09:45:00Z' },
      { examId: 2, examTitle: 'Parcial 2',      subjectName: 'Matemáticas', grade: 73,   status: 'finished',      startDatetime: '2026-03-10T09:00:00Z', endDatetime: '2026-03-10T09:50:00Z' },
      { examId: 3, examTitle: 'Extraordinario', subjectName: 'Matemáticas', grade: null, status: 'not_presented', startDatetime: null, endDatetime: null },
    ],
  };
}

// --- Reporte Detalle Alumno–Examen ---
export function mockStudentExamDetail(studentId: number, examId: number): StudentExamDetailData {
  const students: Record<number, { matricula: string; fullName: string }> = {
    101: { matricula: 'ALU001', fullName: 'Juan Pérez López' },
    102: { matricula: 'ALU002', fullName: 'María García Ramírez' },
    103: { matricula: 'ALU003', fullName: 'Carlos Hernández Díaz' },
    104: { matricula: 'ALU004', fullName: 'Ana Torres Sánchez' },
    105: { matricula: 'ALU005', fullName: 'Luis Martínez Flores' },
  };
  const s = students[studentId] ?? { matricula: 'ALU001', fullName: 'Alumno Demo' };
  const titles: Record<number, string> = { 1: 'Parcial 1', 2: 'Parcial 2', 3: 'Extraordinario' };
  return {
    studentId,
    matricula: s.matricula,
    fullName: s.fullName,
    examId,
    examTitle: titles[examId] ?? 'Examen Demo',
    subjectName: 'Matemáticas',
    grade: 85,
    status: 'finished',
    startDatetime: '2026-03-15T09:00:00Z',
    endDatetime: '2026-03-15T09:45:00Z',
    totalQuestions: 10,
    correctAnswers: 8,
    answers: [
      { questionOrder: 1,  statement: '¿Cuál es la derivada de x²?',                bloomLevel: 'Aplicación',    selectedAnswer: '2x',                     correctAnswer: '2x',                     isCorrect: true  },
      { questionOrder: 2,  statement: '¿Qué es una integral definida?',              bloomLevel: 'Comprensión',   selectedAnswer: 'Una suma infinita',       correctAnswer: 'El área bajo la curva',  isCorrect: false },
      { questionOrder: 3,  statement: 'Resuelve: ∫2x dx',                            bloomLevel: 'Aplicación',    selectedAnswer: 'x² + C',                 correctAnswer: 'x² + C',                 isCorrect: true  },
      { questionOrder: 4,  statement: '¿Cuál es la regla de la cadena?',             bloomLevel: 'Conocimiento',  selectedAnswer: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)', correctAnswer: 'd/dx[f(g(x))] = f\'(g(x))·g\'(x)', isCorrect: true },
      { questionOrder: 5,  statement: '¿Qué es un límite en matemáticas?',           bloomLevel: 'Comprensión',   selectedAnswer: 'El valor al que se acerca una función', correctAnswer: 'El valor al que se acerca una función', isCorrect: true },
      { questionOrder: 6,  statement: 'Derivada de sen(x)',                          bloomLevel: 'Conocimiento',  selectedAnswer: '-cos(x)',                correctAnswer: 'cos(x)',                 isCorrect: false },
      { questionOrder: 7,  statement: '¿Cuánto es ∫₀¹ x dx?',                       bloomLevel: 'Aplicación',    selectedAnswer: '1/2',                    correctAnswer: '1/2',                    isCorrect: true  },
      { questionOrder: 8,  statement: '¿Qué representa la segunda derivada?',        bloomLevel: 'Análisis',      selectedAnswer: 'La concavidad de la función', correctAnswer: 'La concavidad de la función', isCorrect: true },
      { questionOrder: 9,  statement: 'Derivada de e^x',                             bloomLevel: 'Conocimiento',  selectedAnswer: 'e^x',                    correctAnswer: 'e^x',                    isCorrect: true  },
      { questionOrder: 10, statement: '¿Qué es una función continua?',               bloomLevel: 'Comprensión',   selectedAnswer: 'Una función sin saltos ni huecos', correctAnswer: 'Una función sin saltos ni huecos', isCorrect: true },
    ],
  };
}
