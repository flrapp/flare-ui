import { apiClient } from '@/shared/api/client';
import type {
  AvailableUserDto,
  InviteUserDto,
  UpdateUserPermissionsDto,
} from '@/shared/types/dtos';
import type { ProjectUser } from '@/shared/types/entities';

const BASE_PATH = '/v1/projects';

export async function getAvailableUsers(projectId: string): Promise<AvailableUserDto[]> {
  const response = await apiClient.get<AvailableUserDto[]>(`${BASE_PATH}/${projectId}/users/available`);
  return response.data;
}

export async function inviteUser(projectId: string, data: InviteUserDto): Promise<ProjectUser> {
  const response = await apiClient.post<ProjectUser>(`${BASE_PATH}/${projectId}/users`, data);
  return response.data;
}

export async function getProjectUsers(projectId: string): Promise<ProjectUser[]> {
  const response = await apiClient.get<ProjectUser[]>(`${BASE_PATH}/${projectId}/users`);
  return response.data;
}

export async function removeUser(projectId: string, userId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${projectId}/users/${userId}`);
}

export async function updateUserPermissions(
  projectId: string,
  userId: string,
  data: UpdateUserPermissionsDto
): Promise<ProjectUser> {
  const response = await apiClient.put<ProjectUser>(`${BASE_PATH}/${projectId}/users/${userId}/permissions`, data);
  return response.data;
}
