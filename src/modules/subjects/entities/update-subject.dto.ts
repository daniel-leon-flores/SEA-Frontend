/**
 * PUT /api/academic/subjects/:id/
 * Optional `units` replaces all units when provided (admin edit).
 * Omit `number_of_units` en PUT; en POST el modal envía `units` explícitas.
 */
export type UpdateSubjectUnitDto = {
  id_unit?: number;
  unit_name: string;
  unit_number: number;
};

export type UpdateSubjectDto = {
  name: string;
  level_number: number;
  status: boolean;
  units?: UpdateSubjectUnitDto[];
};
