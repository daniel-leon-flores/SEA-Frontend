// ===== REPORT REQUEST DTOs =====

// --- By Exam ---
export interface ByExamDto {
  examId: number;
}

// --- By Group ---
export interface ByGroupDto {
  groupId: number;
}

// --- By Student ---
export interface ByStudentDto {
  studentId: number;
}

// --- Student Exam Detail ---
export interface StudentExamDetailDto {
  studentId: number;
  examId: number;
}