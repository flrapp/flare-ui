import { apiClient } from '@/shared/api/client';
import type { Scope, CreateScopeDto, UpdateScopeDto } from '@/shared/types';

export async function getScopes(projectId: string): Promise<Scope[]> {
  const response = await apiClient.get<Scope[]>(`/v1/projects/${projectId}/scopes`);
  return response.data;
}

export async function getScopeById(scopeId: string): Promise<Scope> {
  const response = await apiClient.get<Scope>(`/v1/scopes/${scopeId}`);
  return response.data;
}

export async function createScope(
  projectId: string,
  data: CreateScopeDto
): Promise<Scope> {
  const response = await apiClient.post<Scope>(`/v1/projects/${projectId}/scopes`, data);
  return response.data;
}

export async function updateScope(scopeId: string, data: UpdateScopeDto): Promise<Scope> {
  const response = await apiClient.put<Scope>(`/v1/scopes/${scopeId}`, data);
  return response.data;
}

export async function deleteScope(scopeId: string): Promise<void> {
  await apiClient.delete(`/v1/scopes/${scopeId}`);
}
