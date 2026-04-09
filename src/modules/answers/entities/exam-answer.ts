// ──────────────────────────────────────────────
// Submit endpoint
// ──────────────────────────────────────────────

export type SubmitAnswerItemDto = {
  question_id: number;
  selected_answer?: number;
  selected_answers?: number[];
  answer_text?: string;
  code_answer?: string;
};

export type SubmitExamAnswersDto = {
  exam_assignment_id: number;
  answers: SubmitAnswerItemDto[];
};

export type GradedAnswerDetail = {
  question_id: number;
  graded: boolean;
  is_correct: boolean | null;
  score: string | number | null;
  feedback: GradingFeedbackItem[];
};

export type GradingFeedbackItem = {
  test_case?: number;
  status?: 'passed' | 'failed' | 'error';
  error?: string;
} | string;

export type SubmitExamScoreSummary = {
  score: string | number;
  is_passed: boolean;
  status: 'completed' | 'in_progress' | 'pending';
};

export type SubmitExamAnswersResult = {
  assignment_id: number;
  status: 'completed' | 'in_progress' | 'pending';
  submitted_count: number;
  total_questions: number;
  score_summary: SubmitExamScoreSummary | null;
  graded_answers: GradedAnswerDetail[];
};

// ──────────────────────────────────────────────
// Assignment answers (GET)
// ──────────────────────────────────────────────

export type StudentAnswerRecord = {
  id_student_answer: number;
  exam_assignment: number;
  question: number;
  question_type: 'MULTIPLE_CHOICE' | 'MULTIPLE_SELECTION' | 'OPEN' | 'CODE';
  question_statement: string;
  question_points: number;
  question_difficulty: 'easy' | 'medium' | 'hard';
  question_bloom_level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  selected_answer: number | null;
  selected_answer_text: string | null;
  selected_answers: number[];
  selected_answers_texts: string[];
  correct_answer_text: string | null;
  correct_answers_texts: string[];
  answer_text: string | null;
  code_answer: string | null;
  is_correct: boolean | null;
  score: string | null;
  evaluated_at: string | null;
  created_at: string | null;
  modified_at: string | null;
};

export type AssignmentAnswersResult = {
  assignment_id: number;
  answers: StudentAnswerRecord[];
};

// ──────────────────────────────────────────────
// Manual grade endpoint
// ──────────────────────────────────────────────

export type ManualGradeDto = {
  student_answer_id: number;
  score: number;
  is_correct: boolean;
};

export type ManualGradeAssignmentSummary = {
  score: string | number;
  is_passed: boolean;
  status: 'completed' | 'in_progress' | 'pending';
};

export type ManualGradeResult = {
  student_answer: StudentAnswerRecord;
  assignment_summary: ManualGradeAssignmentSummary;
};
