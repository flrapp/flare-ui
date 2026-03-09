import { useMutation, useQueryClient } from '@tanstack/react-query';
import { targetingRuleKeys } from '@/entities/targeting-rule/model/useTargetingRules';
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
      data: CreateTargetingConditionDto;
    }) => targetingConditionApi.createTargetingCondition(ruleId, data),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
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
      data: UpdateTargetingConditionDto;
    }) => targetingConditionApi.updateTargetingCondition(conditionId, data),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
    },
  });
}

export function useDeleteTargetingCondition() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conditionId }: { conditionId: string; flagValueId: string }) =>
      targetingConditionApi.deleteTargetingCondition(conditionId),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
    },
  });
}
