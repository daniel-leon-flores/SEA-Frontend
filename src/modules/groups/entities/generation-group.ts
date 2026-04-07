import { Entity } from '@/kernel/types';

export type GenerationGroup = Entity<number> & {
  id_group: number;
  id_generation: number;
  generation_year: number;
  generation_total_levels: number;
  id_period: number | null;
  period_info: string | null;
  group_letter: string;
  academic_level: number;
  students_count: number;
  status: boolean;
};
