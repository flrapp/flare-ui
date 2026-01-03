import { apiClient } from '@/shared/api/client';
import type {
  FeatureFlag,
  FeatureFlagValue,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  UpdateFeatureFlagValueDto,
} from '@/shared/types';

export async function getFeatureFlags(projectId: string): Promise<FeatureFlag[]> {
  const response = await apiClient.get<FeatureFlag[]>(`/v1/projects/${projectId}/feature-flags`);
  return response.data;
}

export async function getFeatureFlagById(flagId: string): Promise<FeatureFlag> {
  const response = await apiClient.get<FeatureFlag>(`/v1/feature-flags/${flagId}`);
  return response.data;
}

export async function createFeatureFlag(
  projectId: string,
  data: CreateFeatureFlagDto
): Promise<FeatureFlag> {
  const response = await apiClient.post<FeatureFlag>(
    `/v1/projects/${projectId}/feature-flags`,
    data
  );
  return response.data;
}

export async function updateFeatureFlag(
  flagId: string,
  data: UpdateFeatureFlagDto
): Promise<FeatureFlag> {
  const response = await apiClient.put<FeatureFlag>(`/v1/feature-flags/${flagId}`, data);
  return response.data;
}

export async function deleteFeatureFlag(flagId: string): Promise<void> {
  await apiClient.delete(`/v1/feature-flags/${flagId}`);
}

export async function updateFeatureFlagValue(
  flagId: string,
  data: UpdateFeatureFlagValueDto
): Promise<FeatureFlagValue> {
  const response = await apiClient.put<FeatureFlagValue>(
    `/v1/feature-flags/${flagId}/values`,
    data
  );
  return response.data;
}
