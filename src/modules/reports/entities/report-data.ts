// Response types for each report — aligned with backend models

// --- Shared metric types ---
export interface SummaryMetrics {
  totalStudents: number;
  totalExams: number;
  averageGrade: number;
  approvalRate: number;
  highestGrade: number;
  lowestGrade: number;
}

export interface GradeDistribution {
  range: string;       // e.g. "0-59", "60-69", "70-79", "80-89", "90-100"
  count: number;
  percentage: number;
}

export interface ExamStatusBreakdown {
  pending: number;
  inProgress: number;
  finished: number;
  notPresented: number;
}

// --- Report: By Exam ---
// Source: Exam + ExamPerson (grades, status) + User (student info)
export interface ExamReportRow {
  studentId: number;
  matricula: string;
  fullName: string;
  grade: number | null;
  status: string;          // 'pending' | 'in_progress' | 'finished' | 'not_presented'
  startDatetime: string | null;
  endDatetime: string | null;
}

export interface ExamReportData {
  examId: number;
  examTitle: string;
  subjectName: string;
  teacherName: string;
  creationDate: string;
  metrics: SummaryMetrics;
  statusBreakdown: ExamStatusBreakdown;
  gradeDistribution: GradeDistribution[];
  students: ExamReportRow[];
}

// --- Report: By Period ---
// Source: Period + Group + Exam + ExamPerson (aggregated)
export interface PeriodExamSummary {
  examId: number;
  examTitle: string;
  subjectName: string;
  groupLetter: string;
  averageGrade: number;
  approvalRate: number;
  totalStudents: number;
}

// --- Report: By Group ---
// Source: Group + StudentProfile + ExamPerson + Exam
export interface GroupStudentRow {
  studentId: number;
  matricula: string;
  fullName: string;
  totalExams: number;
  averageGrade: number;
  approvalRate: number;
}

export interface GroupReportData {
  groupId: number;
  groupLetter: string;
  academicLevel: number;
  generationYear: number;
  metrics: SummaryMetrics;
  gradeDistribution: GradeDistribution[];
  students: GroupStudentRow[];
}

// --- Report: By Student (history) ---
// Source: User + StudentProfile + ExamPerson + Exam + Subject
export interface StudentExamRow {
  examId: number;
  examTitle: string;
  subjectName: string;
  grade: number | null;
  status: string;
  startDatetime: string | null;
  endDatetime: string | null;
}

export interface StudentReportData {
  studentId: number;
  matricula: string;
  fullName: string;
  groupLetter: string;
  academicLevel: number;
  metrics: SummaryMetrics;
  gradeDistribution: GradeDistribution[];
  exams: StudentExamRow[];
}

// --- Report: Student–Exam Detail ---
// Source: ExamPerson + ExamQuestion + Question + Answer
export interface StudentAnswerRow {
  questionOrder: number;
  statement: string;
  bloomLevel: string;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface StudentExamDetailData {
  studentId: number;
  matricula: string;
  fullName: string;
  examId: number;
  examTitle: string;
  subjectName: string;
  grade: number | null;
  status: string;
  startDatetime: string | null;
  endDatetime: string | null;
  totalQuestions: number;
  correctAnswers: number;
  answers: StudentAnswerRow[];
}

// --- Filter option types (for dropdowns) ---
export interface PeriodOption {
  id: number;
  label: string; // "Enero-Abril 2026"
}

export interface GroupOption {
  id: number;
  label: string; // "1A - Nivel 3"
}

export interface SubjectOption {
  id: number;
  label: string;
}

export interface ExamOption {
  id: number;
  label: string;
}

export interface StudentOption {
  id: number;
  label: string; // "ALU001 - Juan Pérez"
}
