export const GlobalRole = {
  Admin: 'Admin',
  User: 'User',
} as const;

export type GlobalRole = typeof GlobalRole[keyof typeof GlobalRole];

export interface User {
  userId: string;
  username: string;
  fullName: string;
  globalRole: GlobalRole;
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
}

export interface ProblemDetails {
  type?: string | null;
  title?: string | null;
  status?: number | null;
  detail?: string | null;
  instance?: string | null;
}
