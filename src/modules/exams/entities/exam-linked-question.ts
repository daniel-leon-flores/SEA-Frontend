/** Row from GET/PUT /api/exams/{id}/questions/ */
export type ExamLinkedQuestion = {
  id_exam_question: number;
  id_exam: number;
  id_question: number;
  text: string;
  question_type: string;
  difficulty: string;
  bloom_level: string;
  points?: number;
  answers?: Array<{
    id_answer: number;
    answer_text: string;
  }>;
  code_question?: {
    language: string;
    test_cases: unknown[];
  } | null;
};

export type ExamQuestionsResponse = {
  questions: ExamLinkedQuestion[];
};

export type ReplaceExamQuestionsDto = {
  question_ids: number[];
};
