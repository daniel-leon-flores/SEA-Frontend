export type CreateQuestionDto = {
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
  subjectId: number;
  difficulty: string;
};
