import { Entity } from "@/kernel/types";

export type Exam = Entity<number> & {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  groupId: number;
  createdBy: number;
  duration: number;
  totalQuestions: number;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
};
