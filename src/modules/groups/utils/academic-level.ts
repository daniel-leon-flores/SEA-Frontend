const TERMS_PER_YEAR = 3;
const FIRST_TERM_LAST_MONTH = 4;
const SECOND_TERM_LAST_MONTH = 8;
const DEFAULT_START_TERM_INDEX = 3;

const getCurrentTermIndex = (date: Date): number => {
  const month = date.getMonth() + 1;
  if (month <= FIRST_TERM_LAST_MONTH) return 1;
  if (month <= SECOND_TERM_LAST_MONTH) return 2;
  return 3;
};

export const calculateAcademicLevel = (
  generationYear: number,
  totalLevels: number,
  date: Date = new Date(),
  startTermIndex: number = DEFAULT_START_TERM_INDEX
): number => {
  if (!Number.isFinite(generationYear) || generationYear <= 0) {
    return 1;
  }

  const safeTotalLevels = Math.max(1, totalLevels || 1);
  const currentYear = date.getFullYear();
  const currentTermIndex = getCurrentTermIndex(date);

  const elapsedTerms = ((currentYear - generationYear) * TERMS_PER_YEAR) + (currentTermIndex - startTermIndex);
  const rawLevel = elapsedTerms + 1;

  return Math.min(Math.max(rawLevel, 1), safeTotalLevels);
};
