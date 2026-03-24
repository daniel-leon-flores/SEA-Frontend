import { Entity } from "@/kernel/types";

export type UserGroup = {
  id_group: number;
  group_letter: string;
  academic_level: number;
};

export type UserSubject = {
  id_subject: number;
  name: string;
};

export type User = Entity<number> & {
  id_user: number;
  username: string;
  email: string;
  matricula: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: 'student' | 'teacher' | 'admin';
  isActive: boolean;
  dateJoined: string;
  group: UserGroup | null;
  subjects: UserSubject[];
};
