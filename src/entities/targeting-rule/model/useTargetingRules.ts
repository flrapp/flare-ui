import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as targetingRuleApi from '../api/targetingRuleApi';
import type { CreateTargetingRuleDto, UpdateTargetingRuleDto, ReorderTargetingRulesDto } from './types';
import { flagKeys } from '@/entities/flag/model/useFeatureFlags';

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
    mutationFn: ({ flagValueId, data }: { flagValueId: string; projectId?: string; data: CreateTargetingRuleDto }) =>
      targetingRuleApi.createTargetingRule(flagValueId, data),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
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
      projectId?: string;
      data: UpdateTargetingRuleDto;
    }) => targetingRuleApi.updateTargetingRule(ruleId, data),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
    },
  });
}

export function useDeleteTargetingRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: string; flagValueId: string; projectId?: string }) =>
      targetingRuleApi.deleteTargetingRule(ruleId),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
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
      projectId?: string;
      data: ReorderTargetingRulesDto;
    }) => targetingRuleApi.reorderTargetingRules(flagValueId, data),
    onSuccess: (_data, { flagValueId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: targetingRuleKeys.byFlagValue(flagValueId) });
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      }
    },
  });
}
