export interface CreateExamDto {
  name: string;
  id_subject: number;
  unit_number: number;
  difficulty_level: 'easy' | 'medium' | 'hard';
  secure_mode: boolean;
  minimum_score: string;
}

export interface UpdateExamDto extends CreateExamDto {
  status: boolean;
}
