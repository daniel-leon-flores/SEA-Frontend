import { Entity } from '@/kernel/types';

export const PERIOD_NAME_OPTIONS = [
  'Enero-Abril',
  'Mayo-Agosto',
  'Septiembre-Diciembre',
] as const;

export type PeriodName = (typeof PERIOD_NAME_OPTIONS)[number];

export type Period = Entity<number> & {
  id_period: number;
  year: number;
  period_name: PeriodName;
  start_date: string;
  end_date: string;
  status: boolean;
};
