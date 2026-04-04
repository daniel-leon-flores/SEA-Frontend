import { Entity } from "@/kernel/types";

export type Exam = Entity<number> & {
  id_exam: number;
  name: string;
  title: string;
  id_subject: number;
  subject_name: string;
  subject_level: number;
  unit_number: number;
  unit_name: string | null;
  difficulty_level: string;
  difficulty_label: string;
  secure_mode: boolean;
  minimum_score: string;
  creation_date: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  // Only present in ExamSerializer (GET /api/exams/)
  id_teacher?: number;
  teacher_name?: string;
};
