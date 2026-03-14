import { Entity } from '@/kernel/types';

export type Generation = Entity<number> & {
  id_generation: number;
  year: number;
  total_levels: number;
  status: boolean;
};
