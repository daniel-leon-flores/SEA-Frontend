import { Entity } from "@/kernel/types";

export type Question = Entity<number> & {
  id: number;
  text: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
  subjectId: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
};
