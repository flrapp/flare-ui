import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as targetingRuleApi from '../api/targetingRuleApi';
import type { CreateTargetingRuleDto, UpdateTargetingRuleDto, ReorderTargetingRulesDto } from './types';

export const targetingRuleKeys = {
  all: ['targeting-rules'] as const,
  lists: () => [...targetingRuleKeys.all, 'list'] as const,
  byFlagValue: (flagValueId: string) =>
    [...targetingRuleKeys.lists(), flagValueId] as const,
};

export function useTargetingRules(flagValueId: string) {
  return useQuery({
    queryKey: targetingRuleKeys.byFlagValue(flagValueId),
    queryFn: () => targetingRuleApi.getTargetingRules(flagValueId),
    enabled: !!flagValueId,
  });
}

export function useCreateTargetingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagValueId, data }: { flagValueId: string; data: CreateTargetingRuleDto }) =>
      targetingRuleApi.createTargetingRule(flagValueId, data),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
    },
  });
}

export function useUpdateTargetingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      data,
    }: {
      ruleId: string;
      flagValueId: string;
      data: UpdateTargetingRuleDto;
    }) => targetingRuleApi.updateTargetingRule(ruleId, data),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
    },
  });
}

export function useDeleteTargetingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string; flagValueId: string }) =>
      targetingRuleApi.deleteTargetingRule(ruleId),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
    },
  });
}

export function useReorderTargetingRules() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flagValueId,
      data,
    }: {
      flagValueId: string;
      data: ReorderTargetingRulesDto;
    }) => targetingRuleApi.reorderTargetingRules(flagValueId, data),
    onSuccess: (_data, { flagValueId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
    },
  });
}
