/** Labels for UI (Spanish) */
export const QUESTION_TYPE_OPTIONS = [
  { value: 'MULTIPLE_CHOICE', label: 'Opción múltiple (una correcta)' },
  { value: 'MULTIPLE_SELECTION', label: 'Selección múltiple' },
  { value: 'OPEN', label: 'Respuesta abierta' },
  { value: 'CODE', label: 'Código (Python)' },
];

export const DIFFICULTY_OPTIONS = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Medio' },
  { value: 'hard', label: 'Difícil' },
];

export const BLOOM_OPTIONS = [
  { value: 'remember', label: 'Recordar' },
  { value: 'understand', label: 'Comprender' },
  { value: 'apply', label: 'Aplicar' },
  { value: 'analyze', label: 'Analizar' },
  { value: 'evaluate', label: 'Evaluar' },
  { value: 'create', label: 'Crear' },
];

export const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

export function labelQuestionType(value: string): string {
  return QUESTION_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelDifficulty(value: string): string {
  return DIFFICULTY_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export function labelBloom(value: string): string {
  return BLOOM_OPTIONS.find((o) => o.value === value)?.label ?? value;
}
