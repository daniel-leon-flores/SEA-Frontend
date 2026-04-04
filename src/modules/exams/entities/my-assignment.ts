export type MyAssignment = {
  id_assignment: number;
  exam_id: number;
  exam_name: string;
  exam_title: string;
  subject_name: string;
  unit_number: number;
  difficulty_level: string;
  difficulty_label: string;
  secure_mode: boolean;
  group_id: number;
  group_label: string;
  status: 'pending' | 'in_progress' | 'completed';
  score: string | null;
  is_passed: boolean | null;
  assigned_at: string;
  available_from: string;
  available_to: string;
  attempt_date: string | null;
  is_available: boolean;
  is_expired: boolean;
  can_start: boolean;
};

export interface GetMyAssignmentsDto {
  status?: 'pending' | 'in_progress' | 'completed';
  include_completed?: boolean;
}
