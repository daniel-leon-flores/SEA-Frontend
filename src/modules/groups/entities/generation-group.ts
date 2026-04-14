import { Entity } from '@/kernel/types';

export type GroupTeacherAssignment = {
  id_assignment: number;
  subject: {
    id_subject: number;
    name: string;
  };
  teacher: {
    id_teacher: number;
    full_name: string;
    email: string;
  };
};

export type GenerationGroup = Entity<number> & {
  id_group: number;
  id_generation: number;
  generation_year: number;
  generation_total_levels: number;
  id_period: number | null;
  period_info: string | null;
  group_letter: string;
  academic_level: number;
  students_count: number;
  assignments: GroupTeacherAssignment[];
  status: boolean;
};

export type AvailableTeacher = {
  id_teacher: number;
  full_name: string;
  email: string;
};

export type CreateAssignmentDto = {
  teacher_id: number;
  subject_id: number;
};
