export type CreateUserDto = {
  first_name: string;
  last_name: string;
  email: string;
  matricula: string;
  role: 'student' | 'teacher' | 'admin';
  status: boolean;
  id_group?: number | null;
  subject_ids?: number[];
};
