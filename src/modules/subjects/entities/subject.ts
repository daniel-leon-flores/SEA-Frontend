import { Entity } from "@/kernel/types";

export type Subject = Entity<number> & {
  id: number;
  name: string;
  code: string;
  description: string;
  credits: number;
  teacherId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
