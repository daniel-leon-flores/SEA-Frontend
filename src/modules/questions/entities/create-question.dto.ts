import type { AnswerOption, CodeQuestionPayload } from './question-bank';

export type CreateQuestionDto = {
  text: string;
  question_type: string;
  difficulty: string;
  bloom_level: string;
  id_subject: number;
  points?: number;
  image_url?: string | null;
  status?: boolean;
  answer_options?: AnswerOption[];
  code_question?: CodeQuestionPayload | null;
};

export type UpdateQuestionDto = Partial<CreateQuestionDto>;