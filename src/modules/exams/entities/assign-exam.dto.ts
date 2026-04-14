export interface AssignExamDto {
  exam_id: number;
  group_ids: number[];
  available_from: string;
  available_to: string;
}

export interface ExamGroupAssignment {
  group_id: number;
  group_label: string;
  academic_level: number;
  students_assigned: number;
  available_from: string;
  available_to: string;
}

export interface AcademicGroup {
  id_group: number;
  id_generation: number;
  generation_year: number;
  generation_total_levels: number;
  id_period: number;
  period_info: string;
  group_letter: string;
  academic_level: number;
  status: boolean;
  subject_name: string | null;
}

export interface Subject {
  id_subject: number;
  name: string;
  level_number: number;
  status: boolean;
  units: SubjectUnit[];
}

export interface SubjectUnit {
  id_unit: number;
  id_subject: number;
  unit_name: string;
  unit_number: number;
}

export interface GroupStats {
  group_id: number;
  group_label: string;
  total_students: number;
  average_score: string | null;
  highest_score: string | null;
  lowest_score: string | null;
  approval_rate: string | null;
  pending_count: number;
  in_progress_count: number;
  completed_count: number;
}

export interface GroupStudent {
  assignment_id: number;
  student_id: number;
  matricula: string;
  full_name: string;
  status: 'pending' | 'in_progress' | 'completed';
  status_label: string;
  score: string | null;
  is_passed: boolean | null;
  attempt_date: string | null;
  available_from: string;
  available_to: string;
}

export interface GetGroupStudentsDto {
  page?: number;
  page_size?: number;
  search?: string;
  status?: string;
}
