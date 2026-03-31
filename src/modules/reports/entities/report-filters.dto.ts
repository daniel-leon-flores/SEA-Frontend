// Filters DTO — aligned with backend models:
// Period (id_period, year, period_name, start_date, end_date)
// Group (id_group, id_generation, id_period, group_letter, academic_level)
// Subject (id_subject, name, level_number)
// Exam (id_exam, id_subject, id_teacher, title)
// User/Student (id_user, first_name, last_name, matricula)

import { ReportType } from './report-types';

export interface ReportFiltersDto {
  reportType: ReportType;
  examId?: number;
  periodId?: number;
  groupId?: number;
  studentId?: number;
  subjectId?: number;
  dateFrom?: string;
  dateTo?: string;
}
