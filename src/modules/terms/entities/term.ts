import { Entity } from "@/kernel/types";

export type Term = Entity<number> & {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
