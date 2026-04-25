import { useMutation, useQueryClient } from '@tanstack/react-query';
import { targetingRuleKeys } from '@/entities/targeting-rule/model/useTargetingRules';
import { flagKeys } from '@/entities/flag/model/useFeatureFlags';
import * as targetingConditionApi from '../api/targetingConditionApi';
import type { CreateTargetingConditionDto, UpdateTargetingConditionDto } from './types';

export function useCreateTargetingCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      data,
    }: {
      ruleId: string;
      flagValueId: string;
      projectId?: string;
      data: CreateTargetingConditionDto;
    }) => targetingConditionApi.createTargetingCondition(ruleId, data),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
    },
  });
}

export function useUpdateTargetingCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      conditionId,
      data,
    }: {
      conditionId: string;
      flagValueId: string;
      projectId?: string;
      data: UpdateTargetingConditionDto;
    }) => targetingConditionApi.updateTargetingCondition(conditionId, data),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
    },
  });
}

export function useDeleteTargetingCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId }: { conditionId: string; flagValueId: string; projectId?: string }) =>
      targetingConditionApi.deleteTargetingCondition(conditionId),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
    },
  });
}
