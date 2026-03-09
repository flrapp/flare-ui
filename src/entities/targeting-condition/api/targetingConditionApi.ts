import { apiClient } from '@/shared/api/client';
import type { TargetingRule } from '@/entities/targeting-rule/model/types';
import type { CreateTargetingConditionDto, UpdateTargetingConditionDto } from '../model/types';

const BASE_PATH = '/v1';

export async function createTargetingCondition(
  ruleId: string,
  data: CreateTargetingConditionDto
): Promise<TargetingRule> {
  const response = await apiClient.post<TargetingRule>(
    `${BASE_PATH}/targeting-rules/${ruleId}/conditions`,
    data
  );
  return response.data;
}

export async function updateTargetingCondition(
  conditionId: string,
  data: UpdateTargetingConditionDto
): Promise<TargetingRule> {
  const response = await apiClient.put<TargetingRule>(
    `${BASE_PATH}/targeting-conditions/${conditionId}`,
    data
  );
  return response.data;
}

export async function deleteTargetingCondition(conditionId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/targeting-conditions/${conditionId}`);
}
