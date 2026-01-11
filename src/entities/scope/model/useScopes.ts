import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Scope, CreateScopeDto, UpdateScopeDto } from '@/shared/types';
import * as scopeApi from '../api/scopeApi';
import { projectKeys } from '@/entities/project/model/useProjects';

// Query keys
export const scopeKeys = {
  all: ['scopes'] as const,
  lists: () => [...scopeKeys.all, 'list'] as const,
  list: (projectId: string) => [...scopeKeys.lists(), projectId] as const,
  details: () => [...scopeKeys.all, 'detail'] as const,
  detail: (id: string) => [...scopeKeys.details(), id] as const,
};

// Query hooks
export function useScopes(projectId: string | undefined) {
  return useQuery({
    queryKey: scopeKeys.list(projectId!),
    queryFn: () => scopeApi.getScopes(projectId!),
    enabled: !!projectId,
  });
}

// Mutation hooks
export function useCreateScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateScopeDto }) =>
      scopeApi.createScope(projectId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: scopeKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useUpdateScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ scopeId, data }: { scopeId: string; data: UpdateScopeDto }) =>
      scopeApi.updateScope(scopeId, data),
    onMutate: async ({ scopeId, data }) => {
      await queryClient.cancelQueries({ queryKey: scopeKeys.detail(scopeId) });
      const previousScope = queryClient.getQueryData<Scope>(scopeKeys.detail(scopeId));

      if (previousScope) {
        queryClient.setQueryData<Scope>(scopeKeys.detail(scopeId), {
          ...previousScope,
          ...data,
        });
      }

      return { previousScope };
    },
    onError: (_err, { scopeId }, context) => {
      if (context?.previousScope) {
        queryClient.setQueryData(scopeKeys.detail(scopeId), context.previousScope);
      }
    },
    onSettled: (_data, _error, { scopeId }) => {
      const scope = queryClient.getQueryData<Scope>(scopeKeys.detail(scopeId));
      if (scope) {
        queryClient.invalidateQueries({ queryKey: scopeKeys.list(scope.projectId) });
      }
      queryClient.invalidateQueries({ queryKey: scopeKeys.detail(scopeId) });
    },
  });
}

export function useDeleteScope() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (scopeId: string) => scopeApi.deleteScope(scopeId),
    onSuccess: (_data, scopeId) => {
      const scope = queryClient.getQueryData<Scope>(scopeKeys.detail(scopeId));
      if (scope) {
        queryClient.invalidateQueries({ queryKey: scopeKeys.list(scope.projectId) });
        queryClient.invalidateQueries({ queryKey: projectKeys.detail(scope.projectId) });
      }
    },
  });
}
