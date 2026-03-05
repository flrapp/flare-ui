import { apiClient } from '@/shared/api/client';
import type {
  TargetingRule,
  CreateTargetingRuleDto,
  UpdateTargetingRuleDto,
  ReorderTargetingRulesDto,
} from '../model/types';

const BASE_PATH = '/v1';

export async function getTargetingRules(flagValueId: string): Promise<TargetingRule[]> {
  const response = await apiClient.get<TargetingRule[]>(
    `${BASE_PATH}/feature-flag-values/${flagValueId}/targeting-rules`
  );
  return response.data;
}

export async function createTargetingRule(
  flagValueId: string,
  data: CreateTargetingRuleDto
): Promise<TargetingRule> {
  const response = await apiClient.post<TargetingRule>(
    `${BASE_PATH}/feature-flag-values/${flagValueId}/targeting-rules`,
    data
  );
  return response.data;
}

export async function updateTargetingRule(
  ruleId: string,
  data: UpdateTargetingRuleDto
): Promise<TargetingRule> {
  const response = await apiClient.put<TargetingRule>(
    `${BASE_PATH}/targeting-rules/${ruleId}`,
    data
  );
  return response.data;
}

export async function deleteTargetingRule(ruleId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/targeting-rules/${ruleId}`);
}

export async function reorderTargetingRules(
  flagValueId: string,
  data: ReorderTargetingRulesDto
): Promise<TargetingRule[]> {
  const response = await apiClient.put<TargetingRule[]>(
    `${BASE_PATH}/feature-flag-values/${flagValueId}/targeting-rules/reorder`,
    data
  );
  return response.data;
}
