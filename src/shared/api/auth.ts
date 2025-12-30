import { apiClient } from './client';
import type { LoginDto, AuthResultDto } from '@/shared/types/auth';

const AUTH_BASE = '/v1/auth';

export const authApi = {
  login: async (data: LoginDto): Promise<AuthResultDto> => {
    const response = await apiClient.post<AuthResultDto>(`${AUTH_BASE}/login`, data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(`${AUTH_BASE}/logout`);
  },

  getCurrentUser: async (): Promise<AuthResultDto> => {
    const response = await apiClient.get<AuthResultDto>(`${AUTH_BASE}/me`);
    return response.data;
  },
};
