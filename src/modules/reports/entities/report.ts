import { Entity } from "@/kernel/types";

export type Report = Entity<number> & {
  id: number;
  title: string;
  type: string;
  generatedBy: number;
  filters: Record<string, any>;
  data: any;
  createdAt: string;
};
