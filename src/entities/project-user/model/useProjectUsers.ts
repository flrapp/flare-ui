import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { projectUserApi } from '../api';
import { projectKeys } from '@/entities/project/model/useProjects';
import type {
  InviteUserDto,
  PaginatedResponse,
  ProjectUserListParams,
  UpdateUserPermissionsDto,
} from '@/shared/types/dtos';
import type { ProjectUser, ProjectPermission, ScopePermission } from '@/shared/types/entities';

// Query keys
export const projectUserKeys = {
  all: ['project-users'] as const,
  lists: () => [...projectUserKeys.all, 'list'] as const,
  list: (projectId: string, params?: ProjectUserListParams) =>
    [...projectUserKeys.lists(), projectId, params] as const,
  details: () => [...projectUserKeys.all, 'detail'] as const,
  detail: (projectId: string, userId: string) =>
    [...projectUserKeys.details(), projectId, userId] as const,
  available: (projectId: string) => [...projectUserKeys.all, 'available', projectId] as const,
};

// Query hooks
export function useAvailableUsers(projectId: string | undefined, search?: string) {
  return useQuery({
    queryKey: [...projectUserKeys.available(projectId!), search],
    queryFn: () => projectUserApi.getAvailableUsers(projectId!, search ? { search } : undefined),
    enabled: !!projectId,
  });
}

export function useProjectUsers(projectId: string | undefined, params?: ProjectUserListParams) {
  return useQuery({
    queryKey: projectUserKeys.list(projectId!, params),
    queryFn: () => projectUserApi.getProjectUsers(projectId!, params),
    enabled: !!projectId,
    placeholderData: keepPreviousData,
  });
}

// Mutation hooks
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: InviteUserDto }) =>
      projectUserApi.inviteUser(projectId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectUserKeys.available(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId }: { projectId: string; userId: string }) =>
      projectUserApi.removeUser(projectId, userId),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectUserKeys.available(projectId) });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
}

export function useUpdateUserPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, userId, data }: { projectId: string; userId: string; data: UpdateUserPermissionsDto }) =>
      projectUserApi.updateUserPermissions(projectId, userId, data),
    onMutate: async ({ projectId, userId, data }) => {
      await queryClient.cancelQueries({ queryKey: projectUserKeys.lists() });
      await queryClient.cancelQueries({ queryKey: projectUserKeys.detail(projectId, userId) });

      const allListQueries = queryClient.getQueriesData<PaginatedResponse<ProjectUser>>({
        queryKey: [...projectUserKeys.lists(), projectId],
      });

      for (const [queryKey, cached] of allListQueries) {
        if (cached) {
          queryClient.setQueryData<PaginatedResponse<ProjectUser>>(queryKey, {
            ...cached,
            items: cached.items.map((user) =>
              user.userId === userId
                ? {
                    ...user,
                    projectPermissions:
                      (data.projectPermissions as ProjectPermission[] | undefined) ??
                      user.projectPermissions,
                    scopePermissions:
                      (data.scopePermissions as Record<string, ScopePermission[]> | undefined) ??
                      user.scopePermissions,
                  }
                : user
            ),
          });
        }
      }

      const previousUser = queryClient.getQueryData<ProjectUser>(
        projectUserKeys.detail(projectId, userId)
      );

      if (previousUser) {
        queryClient.setQueryData<ProjectUser>(projectUserKeys.detail(projectId, userId), {
          ...previousUser,
          projectPermissions:
            (data.projectPermissions as ProjectPermission[] | undefined) ??
            previousUser.projectPermissions,
          scopePermissions:
            (data.scopePermissions as Record<string, ScopePermission[]> | undefined) ??
            previousUser.scopePermissions,
        });
      }

      return { allListQueries, previousUser };
    },
    onError: (_err, { projectId, userId }, context) => {
      if (context?.allListQueries) {
        for (const [queryKey, cached] of context.allListQueries) {
          queryClient.setQueryData(queryKey, cached);
        }
      }
      if (context?.previousUser) {
        queryClient.setQueryData(projectUserKeys.detail(projectId, userId), context.previousUser);
      }
    },
    onSettled: (_data, _error, { projectId, userId }) => {
      queryClient.invalidateQueries({ queryKey: projectUserKeys.lists() });
      queryClient.invalidateQueries({ queryKey: projectUserKeys.detail(projectId, userId) });
    },
  });
}
