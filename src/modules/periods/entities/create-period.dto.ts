import type { PeriodName } from './period';

export type CreatePeriodDto = {
  year: number;
  period_name: PeriodName;
  start_date: string;
  end_date: string;
  status: boolean;
};
