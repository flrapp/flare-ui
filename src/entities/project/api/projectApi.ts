import { apiClient } from '@/shared/api/client';
import type {
  Project,
  ProjectDetail,
  MyPermissions,
  CreateProjectDto,
  UpdateProjectDto,
  RegenerateApiKeyResponseDto,
} from '@/shared/types';

const BASE_PATH = '/v1/projects';

export async function getProjects(): Promise<Project[]> {
  const response = await apiClient.get<Project[]>(BASE_PATH);
  return response.data;
}

export async function getProjectById(id: string): Promise<ProjectDetail> {
  const response = await apiClient.get<ProjectDetail>(`${BASE_PATH}/${id}`);
  return response.data;
}

export async function createProject(data: CreateProjectDto): Promise<ProjectDetail> {
  const response = await apiClient.post<ProjectDetail>(BASE_PATH, data);
  return response.data;
}

export async function updateProject(id: string, data: UpdateProjectDto): Promise<ProjectDetail> {
  const response = await apiClient.put<ProjectDetail>(`${BASE_PATH}/${id}`, data);
  return response.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/${id}`);
}

export async function archiveProject(id: string): Promise<void> {
  await apiClient.post(`${BASE_PATH}/${id}/archive`);
}

export async function unarchiveProject(id: string): Promise<void> {
  await apiClient.post(`${BASE_PATH}/${id}/unarchive`);
}

export async function regenerateApiKey(id: string): Promise<RegenerateApiKeyResponseDto> {
  const response = await apiClient.post<RegenerateApiKeyResponseDto>(
    `${BASE_PATH}/${id}/regenerate-api-key`
  );
  return response.data;
}

export async function getMyPermissions(projectId: string): Promise<MyPermissions> {
  const response = await apiClient.get<MyPermissions>(`${BASE_PATH}/${projectId}/my-permissions`);
  return response.data;
}
