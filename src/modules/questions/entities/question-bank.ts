import { Entity } from "@/kernel/types";

export type QuestionBank = Entity<number> & {
  id: number;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
  subjectId: number;
  difficulty: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};
