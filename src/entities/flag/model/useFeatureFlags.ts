import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import type { InfiniteData } from '@tanstack/react-query';
import type {
  FeatureFlag,
  FeatureFlagValue,
  CreateFeatureFlagDto,
  UpdateFeatureFlagDto,
  UpdateFeatureFlagValueDto,
  PaginatedResponse,
} from '@/shared/types';
import * as flagApi from '../api/flagApi';
import { projectKeys } from '@/entities/project';

// Query keys
export const flagKeys = {
  all: ['feature-flags'] as const,
  byProject: (projectId: string) => [...flagKeys.all, 'project', projectId] as const,
  byProjectSearch: (projectId: string, search: string) =>
    [...flagKeys.byProject(projectId), { search }] as const,
  detail: (flagId: string) => [...flagKeys.all, 'detail', flagId] as const,
};

// Query hooks
export function useFeatureFlags(projectId: string | undefined, search: string = '') {
  return useInfiniteQuery({
    queryKey: flagKeys.byProjectSearch(projectId!, search),
    queryFn: ({ pageParam }) =>
      flagApi.getFeatureFlags(projectId!, {
        pageSize: 10,
        cursor: pageParam as string | undefined,
        search: search || undefined,
      }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: !!projectId,
  });
}

export function useFeatureFlagById(projectId: string | undefined, flagId: string | undefined) {
  return useQuery({
    queryKey: flagKeys.detail(flagId!),
    queryFn: () => flagApi.getFeatureFlagById(flagId!),
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

export function useUpdateFeatureFlagValue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ flagId, data }: { flagId: string; projectId?: string; data: UpdateFeatureFlagValueDto }) =>
      flagApi.updateFeatureFlagValue(flagId, data),
    onMutate: async ({ flagId, projectId, data }) => {
      await queryClient.cancelQueries({ queryKey: flagKeys.detail(flagId) });

      const previousFlag = queryClient.getQueryData<FeatureFlag>(flagKeys.detail(flagId));
      const resolvedProjectId = previousFlag?.projectId ?? projectId;

      if (resolvedProjectId) {
        await queryClient.cancelQueries({ queryKey: flagKeys.byProject(resolvedProjectId) });
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

      // Optimistically update detail cache
      if (previousFlag) {
        queryClient.setQueryData<FeatureFlag>(flagKeys.detail(flagId), {
          ...previousFlag,
          values: previousFlag.values.map(applyUpdate),
        });
      }

      // Optimistically update all paginated list caches for this project
      let previousListData: Array<[readonly unknown[], InfiniteData<PaginatedResponse<FeatureFlag>> | undefined]> = [];
      if (resolvedProjectId) {
        const entries = queryClient.getQueriesData<InfiniteData<PaginatedResponse<FeatureFlag>>>({
          queryKey: flagKeys.byProject(resolvedProjectId),
        });
        previousListData = entries;

        for (const [key, data_] of entries) {
          if (!data_) continue;
          queryClient.setQueryData<InfiniteData<PaginatedResponse<FeatureFlag>>>(key as readonly unknown[], {
            ...data_,
            pages: data_.pages.map((page) => ({
              ...page,
              items: page.items.map((f) =>
                f.id === flagId ? { ...f, values: f.values.map(applyUpdate) } : f
              ),
            })),
          });
        }
      }

      return { previousFlag, previousListData, resolvedProjectId };
    },
    onError: (_err, { flagId }, context) => {
      if (context?.previousFlag) {
        queryClient.setQueryData(flagKeys.detail(flagId), context.previousFlag);
      }
      if (context?.previousListData) {
        for (const [key, data_] of context.previousListData) {
          if (data_) {
            queryClient.setQueryData(key as readonly unknown[], data_);
          }
        }
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
