import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  FeatureFlag,
  FeatureFlagValue,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  UpdateFeatureFlagValueDto,
} from '@/shared/types';
import * as flagApi from '../api/flagApi';
import { projectKeys } from '@/entities/project';

// Query keys
export const flagKeys = {
  all: ['feature-flags'] as const,
  byProject: (projectId: string) => [...flagKeys.all, 'project', projectId] as const,
  detail: (flagId: string) => [...flagKeys.all, 'detail', flagId] as const,
};

// Query hooks
export function useFeatureFlags(projectId: string | undefined) {
  return useQuery({
    queryKey: flagKeys.byProject(projectId!),
    queryFn: () => flagApi.getFeatureFlags(projectId!),
    enabled: !!projectId,
  });
}

export function useFeatureFlagById(projectId: string | undefined, flagId: string | undefined) {
  return useQuery({
    queryKey: flagKeys.byProject(projectId!),
    queryFn: () => flagApi.getFeatureFlags(projectId!),
    select: (flags) => flags.find((f) => f.id === flagId),
    enabled: !!projectId && !!flagId,
  });
}

// Mutation hooks
export function useCreateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateFeatureFlagDto }) =>
      flagApi.createFeatureFlag(projectId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useUpdateFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, data }: { flagId: string; data: UpdateFeatureFlagDto }) =>
      flagApi.updateFeatureFlag(flagId, data),
    onMutate: async ({ flagId, data }) => {
      await queryClient.cancelQueries({ queryKey: flagKeys.detail(flagId) });
      const previousFlag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));

      if (previousFlag) {
        queryClient.setQueryData<FeatureFlag>(flagKeys.detail(flagId), {
          ...previousFlag,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousFlag };
    },
    onError: (_err, { flagId }, context) => {
      if (context?.previousFlag) {
        queryClient.setQueryData(flagKeys.detail(flagId), context.previousFlag);
      }
    },
    onSettled: (_data, _error, { flagId }) => {
      const flag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));
      if (flag) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(flag.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: flagKeys.detail(flagId) });
    },
  });
}

export function useDeleteFeatureFlag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId }: { flagId: string; projectId: string }) =>
      flagApi.deleteFeatureFlag(flagId),
    onSuccess: (_data, { flagId, projectId }) => {
      queryClient.invalidateQueries({ queryKey: flagKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      queryClient.removeQueries({ queryKey: flagKeys.detail(flagId) });
    },
  });
}

/**
 * Updates feature flag value with optimistic UI updates.
 *
 * Optimistic update flow:
 * 1. Cancel ongoing queries to prevent race conditions
 * 2. Snapshot current cache state (both detail and list) for rollback
 * 3. Optimistically update both caches with new value
 * 4. On error: Rollback both caches to snapshot
 * 5. On settled: Refetch to ensure consistency
 *
 * This pattern ensures instant UI feedback while maintaining data integrity.
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
 */
export function useUpdateFeatureFlagValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, data }: { flagId: string; projectId?: string; data: UpdateFeatureFlagValueDto }) =>
      flagApi.updateFeatureFlagValue(flagId, data),
    onMutate: async ({ flagId, projectId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: flagKeys.detail(flagId) });

      // Snapshot the previous value from detail cache (flag edit page)
      const previousFlag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));

      // Resolve projectId from detail cache or caller-supplied value
      const resolvedProjectId = previousFlag?.projectId ?? projectId;

      // Snapshot and cancel project list cache (flags table page)
      let previousProjectFlags: FeatureFlag[] | undefined;
      if (resolvedProjectId) {
        await queryClient.cancelQueries({ queryKey: flagKeys.byProject(resolvedProjectId) });
        previousProjectFlags = queryClient.getQueryData<FeatureFlag[]>(
          flagKeys.byProject(resolvedProjectId)
        );
      }

      const applyUpdate = (v: FeatureFlagValue): FeatureFlagValue =>
        v.scopeId === data.scopeId
          ? {
              ...v,
              updatedAt: new Date().toISOString(),
              ...(data.booleanValue !== undefined && { booleanValue: data.booleanValue }),
              ...(data.stringValue !== undefined && { stringValue: data.stringValue }),
              ...(data.numberValue !== undefined && { numberValue: data.numberValue }),
              ...(data.jsonValue !== undefined && { jsonValue: data.jsonValue }),
            }
          : v;

      // Optimistically update detail cache if present
      if (previousFlag) {
        const updatedFlag: FeatureFlag = {
          ...previousFlag,
          values: previousFlag.values.map(applyUpdate),
        };
        queryClient.setQueryData<FeatureFlag>(flagKeys.detail(flagId), updatedFlag);
      }

      // Optimistically update project list cache if present
      if (previousProjectFlags && resolvedProjectId) {
        queryClient.setQueryData<FeatureFlag[]>(
          flagKeys.byProject(resolvedProjectId),
          previousProjectFlags.map((f) =>
            f.id === flagId ? { ...f, values: f.values.map(applyUpdate) } : f
          )
        );
      }

      return { previousFlag, previousProjectFlags, resolvedProjectId };
    },
    onError: (_err, { flagId }, context) => {
      if (context?.previousFlag) {
        queryClient.setQueryData(flagKeys.detail(flagId), context.previousFlag);
      }
      if (context?.previousProjectFlags && context.resolvedProjectId) {
        queryClient.setQueryData(
          flagKeys.byProject(context.resolvedProjectId),
          context.previousProjectFlags
        );
      }
    },
    onSettled: (_data, _error, { flagId, projectId }) => {
      const flag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));
      const pid = flag?.projectId ?? projectId;
      if (pid) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(pid) });
      }
      queryClient.invalidateQueries({ queryKey: flagKeys.detail(flagId) });
    },
  });
}
