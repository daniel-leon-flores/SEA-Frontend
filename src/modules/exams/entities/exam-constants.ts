export const DIFFICULTY_OPTIONS = [
  { label: 'Fácil', value: 'easy' },
  { label: 'Medio', value: 'medium' },
  { label: 'Difícil', value: 'hard' },
] as const;

export const STATUS_OPTIONS = [
  { label: 'Activos', value: 'true' },
  { label: 'Inactivos', value: 'false' },
] as const;

export const STUDENT_STATUS_OPTIONS = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'En progreso', value: 'in_progress' },
  { label: 'Completado', value: 'completed' },
] as const;

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'success',
  medium: 'warning',
  hard: 'error',
};

const STUDENT_STATUS_COLORS: Record<string, string> = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
};

export function getDifficultyColor(level: string): string {
  return DIFFICULTY_COLORS[level] ?? 'grey';
}

export function getStudentStatusColor(status: string): string {
  return STUDENT_STATUS_COLORS[status] ?? 'grey';
}

export function formatGroupLabel(academicLevel: number, groupLabel: string): string {
  return `${academicLevel}${groupLabel}`;
}

export const MAX_SCORE = 10;
export const MIN_SCORE = 0;
export const PAGE_SIZE_OPTIONS = [
  { title: '5', value: 5 },
  { title: '10', value: 10 },
  { title: '20', value: 20 },
  { title: '50', value: 50 },
  { title: '100', value: 100 },
];
