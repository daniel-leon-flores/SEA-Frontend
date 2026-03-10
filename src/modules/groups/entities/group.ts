import { Entity } from "@/kernel/types";

export type Group = Entity<number> & {
  id: number;
  name: string;
  termId: number;
  program: string;
  shift: string;
  totalStudents: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
