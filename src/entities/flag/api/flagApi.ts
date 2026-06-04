import { apiClient } from '@/shared/api/client';
import type {
  FeatureFlag,
  FeatureFlagValue,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  UpdateFeatureFlagValueDto,
  PaginatedResponse,
  FlagListParams,
} from '@/shared/types';

// The API returns jsonValue as a JsonElement (parsed object); convert to string for the frontend
function deserializeFlagValue(v: Record<string, unknown>): FeatureFlagValue {
  return {
    ...(v as unknown as FeatureFlagValue),
    jsonValue: v.jsonValue != null ? JSON.stringify(v.jsonValue) : null,
  };
}

function deserializeFlag(flag: Record<string, unknown>): FeatureFlag {
  const values = flag.values as Record<string, unknown>[];
  return {
    ...(flag as unknown as FeatureFlag),
    values: Array.isArray(values) ? values.map(deserializeFlagValue) : [],
  };
}

export async function getFeatureFlags(
  projectId: string,
  params?: FlagListParams
): Promise<PaginatedResponse<FeatureFlag>> {
  const response = await apiClient.get<{
    items: Record<string, unknown>[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }>(`/v1/projects/${projectId}/feature-flags`, { params });
  return {
    items: response.data.items.map(deserializeFlag),
    totalCount: response.data.totalCount,
    page: response.data.page,
    pageSize: response.data.pageSize,
    totalPages: response.data.totalPages,
  };
}

export async function getFeatureFlagById(flagId: string): Promise<FeatureFlag> {
  const response = await apiClient.get<Record<string, unknown>>(
    `/v1/feature-flags/${flagId}`
  );
  return deserializeFlag(response.data);
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
