import { GlobalRole } from './entities';

export interface User {
  userId: string;
  username: string;
  fullName: string;
  globalRole: GlobalRole;
  mustChangePassword: boolean;
}

export interface LoginDto {
  username: string;
  password: string;
}

export interface AuthResultDto {
  userId: string;
  username: string;
  fullName: string;
  globalRole: GlobalRole;
  mustChangePassword: boolean;
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}
