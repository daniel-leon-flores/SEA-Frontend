// All report type definitions aligned with backend models

export type ReportType =
  | 'by-exam'
  | 'by-period'
  | 'by-group'
  | 'by-student'
  | 'student-exam-detail';

export interface ReportTypeOption {
  value: ReportType;
  label: string;
  description: string;
  icon: string;
  roles: string[];
}

export const REPORT_TYPE_OPTIONS: ReportTypeOption[] = [
  {
    value: 'by-exam',
    label: 'Por Examen',
    description: 'Resultados generales de un examen específico',
    icon: 'mdi-file-document-outline',
    roles: ['TEACHER', 'ADMIN'],
  },
  {
    value: 'by-period',
    label: 'Por Periodo',
    description: 'Resumen académico de un periodo (cuatrimestre)',
    icon: 'mdi-calendar-range',
    roles: ['TEACHER', 'ADMIN'],
  },
  {
    value: 'by-group',
    label: 'Por Grupo',
    description: 'Rendimiento de un grupo en sus exámenes',
    icon: 'mdi-account-group',
    roles: ['TEACHER', 'ADMIN'],
  },
  {
    value: 'by-student',
    label: 'Por Alumno',
    description: 'Historial de exámenes de un alumno',
    icon: 'mdi-account-school',
    roles: ['TEACHER', 'ADMIN'],
  },
  {
    value: 'student-exam-detail',
    label: 'Detalle Alumno–Examen',
    description: 'Respuestas y calificación de un alumno en un examen',
    icon: 'mdi-clipboard-text-search',
    roles: ['TEACHER', 'ADMIN'],
  },
];
