import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type {
  FeatureFlag,
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
    mutationFn: (flagId: string) => flagApi.deleteFeatureFlag(flagId),
    onSuccess: (_data, flagId) => {
      const flag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));
      if (flag) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(flag.projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(flag.projectId) });
      }
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
    mutationFn: ({ flagId, data }: { flagId: string; data: UpdateFeatureFlagValueDto }) =>
      flagApi.updateFeatureFlagValue(flagId, data),
    onMutate: async ({ flagId, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: flagKeys.detail(flagId) });

      // Snapshot the previous value
      const previousFlag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));

      // Also get from project flags list
      let previousProjectFlags: FeatureFlag[] | undefined;
      if (previousFlag) {
        await queryClient.cancelQueries({ queryKey: flagKeys.byProject(previousFlag.projectId) });
        previousProjectFlags = queryClient.getQueryData<FeatureFlag[]>(
          flagKeys.byProject(previousFlag.projectId)
        );
      }

      // Optimistically update to the new value
      if (previousFlag) {
        const updatedFlag: FeatureFlag = {
          ...previousFlag,
          values: previousFlag.values.map((v) =>
            v.scopeId === data.scopeId
              ? { ...v, isEnabled: data.isEnabled, updatedAt: new Date().toISOString() }
              : v
          ),
        };

        queryClient.setQueryData<FeatureFlag>(flagKeys.detail(flagId), updatedFlag);

        // Also update in project flags list
        if (previousProjectFlags) {
          queryClient.setQueryData<FeatureFlag[]>(
            flagKeys.byProject(previousFlag.projectId),
            previousProjectFlags.map((f) => (f.id === flagId ? updatedFlag : f))
          );
        }
      }

      return { previousFlag, previousProjectFlags };
    },
    onError: (_err, { flagId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFlag) {
        queryClient.setQueryData(flagKeys.detail(flagId), context.previousFlag);

        if (context.previousProjectFlags) {
          queryClient.setQueryData(
            flagKeys.byProject(context.previousFlag.projectId),
            context.previousProjectFlags
          );
        }
      }
    },
    onSettled: (_data, _error, { flagId }) => {
      // Always refetch after error or success to ensure we're in sync
      const flag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));
      if (flag) {
        queryClient.invalidateQueries({ queryKey: flagKeys.byProject(flag.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: flagKeys.detail(flagId) });
    },
  });
}
