import { apiClient } from '@/shared/api/client';
import type {
  FeatureFlag,
  FeatureFlagValue,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  UpdateFeatureFlagValueDto,
} from '@/shared/types';

// The API returns jsonValue as a JsonElement (parsed object); convert to string for the frontend
function deserializeFlagValue(v: Record<string, unknown>): FeatureFlagValue {
  return {
    ...(v as FeatureFlagValue),
    jsonValue: v.jsonValue != null ? JSON.stringify(v.jsonValue) : null,
  };
}

function deserializeFlag(flag: Record<string, unknown>): FeatureFlag {
  const values = flag.values as Record<string, unknown>[];
  return {
    ...(flag as FeatureFlag),
    values: Array.isArray(values) ? values.map(deserializeFlagValue) : [],
  };
}

export async function getFeatureFlags(projectId: string): Promise<FeatureFlag[]> {
  const response = await apiClient.get<Record<string, unknown>[]>(
    `/v1/projects/${projectId}/feature-flags`
  );
  return response.data.map(deserializeFlag);
}

export async function createFeatureFlag(
  projectId: string,
  data: CreateFeatureFlagDto
): Promise<FeatureFlag> {
  const response = await apiClient.post<Record<string, unknown>>(
    `/v1/projects/${projectId}/feature-flags`,
    data
  );
  return deserializeFlag(response.data);
}

export async function updateFeatureFlag(
  flagId: string,
  data: UpdateFeatureFlagDto
): Promise<FeatureFlag> {
  const response = await apiClient.put<Record<string, unknown>>(
    `/v1/feature-flags/${flagId}`,
    data
  );
  return deserializeFlag(response.data);
}

export async function deleteFeatureFlag(flagId: string): Promise<void> {
  await apiClient.delete(`/v1/feature-flags/${flagId}`);
}

export async function updateFeatureFlagValue(
  flagId: string,
  data: UpdateFeatureFlagValueDto
): Promise<FeatureFlagValue> {
  // jsonValue must be sent as a parsed JSON object (JsonElement), not as a string
  const payload = {
    ...data,
    jsonValue:
      data.jsonValue != null
        ? (() => { try { return JSON.parse(data.jsonValue); } catch { return null; } })()
        : data.jsonValue,
  };
  const response = await apiClient.put<Record<string, unknown>>(
    `/v1/feature-flags/${flagId}/values`,
    payload
  );
  return deserializeFlagValue(response.data);
}
