/**
 * PUT /api/academic/subjects/:id/
 * units are read-only on the serializer; omit number_of_units on update.
 */
export type UpdateSubjectDto = {
  name: string;
  level_number: number;
  status: boolean;
};
