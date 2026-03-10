export type CreateExamDto = {
  title: string;
  description: string;
  subjectId: number;
  groupId: number;
  duration: number;
  questionIds: number[];
  startDate: string;
  endDate: string;
};
