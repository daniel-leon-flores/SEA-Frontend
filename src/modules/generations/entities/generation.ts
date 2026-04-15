import { Entity } from '@/kernel/types';

export type Generation = Entity<number> & {
  id_generation: number;
  year: number;
  total_levels: number;
  end_year: number | null;
  status: boolean;
};
