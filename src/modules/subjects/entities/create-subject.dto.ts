/**
 * POST /api/academic/subjects/
 * - Si envías `units`, se crean esas unidades (sustituye el flujo por número).
 * - Si no envías `units`, `number_of_units` (opcional) crea "Unidad 1"…"Unidad n" (compatibilidad API).
 */
export type CreateSubjectUnitDto = {
  unit_name: string;
  unit_number: number;
};

export type CreateSubjectDto = {
  name: string;
  level_number: number;
  status?: boolean;
  /** Lista explícita desde el modal (nombre + número por unidad). */
  units?: CreateSubjectUnitDto[];
  number_of_units?: number;
};
