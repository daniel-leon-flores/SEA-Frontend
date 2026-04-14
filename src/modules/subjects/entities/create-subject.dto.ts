/**
 * POST /api/academic/subjects/
 * number_of_units is write-only; backend auto-creates units when > 0.
 */
export type CreateSubjectDto = {
  name: string;
  level_number: number;
  number_of_units?: number;
  status?: boolean;
};
