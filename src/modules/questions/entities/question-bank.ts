import type { Entity } from '@/kernel/types';

/** Answer option as returned by QuestionSerializer */
export type AnswerOption = {
  id?: number;
  text: string;
  is_correct: boolean;
};

/** Code extension for CODE questions */
export type CodeQuestionPayload = {
  language: string;
  test_cases: string[];
};

/** Question bank row / detail — matches apps.questions.serializers */
export type QuestionBank = Entity<number> & {
  id: number;
  text: string;
  question_type: string;
  difficulty: string;
  bloom_level: string;
  points: number;
  id_subject: number;
  status?: boolean;
  image_url?: string | null;
  answer_options?: AnswerOption[];
  code_question?: CodeQuestionPayload | null;
  created_at?: string;
  modified_at?: string;
};

/** Paginated list payload inside ApiResponse.data */
export type QuestionListPayload = {
  results: QuestionBank[];
  pagination: {
    count: number;
    page: number;
    page_size: number;
    total_pages: number;
    next: string | null;
    previous: string | null;
  };
};
