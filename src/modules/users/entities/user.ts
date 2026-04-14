import { Entity } from "@/kernel/types";

export type UserGroup = {
  id_group: number;
  group_letter: string;
  academic_level: number;
  generation_year: number;
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
  first_name: string;
  last_name: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  status: boolean;
  status_display: string;
  is_active: boolean;
  date_joined: string;
  group: UserGroup | null;
  subjects: UserSubject[];
  teaching_groups: UserGroup[];
};
