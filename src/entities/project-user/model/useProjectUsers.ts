import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectUserApi } from '../api';
import { projectKeys } from '@/entities/project/model/useProjects';
import type {
  InviteUserDto,
  UpdateUserPermissionsDto,
} from '@/shared/types/dtos';
import type { ProjectUser, ProjectPermission, ScopePermission } from '@/shared/types/entities';

// Query keys
export const projectUserKeys = {
  all: ['project-users'] as const,
  lists: () => [...projectUserKeys.all, 'list'] as const,
  list: (projectId: string) => [...projectUserKeys.lists(), projectId] as const,
  details: () => [...projectUserKeys.all, 'detail'] as const,
  detail: (projectId: string, userId: string) => [...projectUserKeys.details(), projectId, userId] as const,
  available: (projectId: string) => [...projectUserKeys.all, 'available', projectId] as const,
};

// Query hooks
export function useAvailableUsers(projectId: string | undefined) {
  return useQuery({
    queryKey: projectUserKeys.available(projectId!),
    queryFn: () => projectUserApi.getAvailableUsers(projectId!),
    enabled: !!projectId,
  });
}

export function useProjectUsers(projectId: string | undefined) {
  return useQuery({
    queryKey: projectUserKeys.list(projectId!),
    queryFn: () => projectUserApi.getProjectUsers(projectId!),
    enabled: !!projectId,
  });
}

// Mutation hooks
export function useInviteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: InviteUserDto }) =>
      projectUserApi.inviteUser(projectId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: projectUserKeys.list(projectId) });
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
      queryClient.invalidateQueries({ queryKey: projectUserKeys.list(projectId) });
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
      await queryClient.cancelQueries({ queryKey: projectUserKeys.list(projectId) });
      await queryClient.cancelQueries({ queryKey: projectUserKeys.detail(projectId, userId) });

      const previousUsers = queryClient.getQueryData<ProjectUser[]>(projectUserKeys.list(projectId));
      const previousUser = queryClient.getQueryData<ProjectUser>(projectUserKeys.detail(projectId, userId));

      if (previousUsers) {
        queryClient.setQueryData<ProjectUser[]>(
          projectUserKeys.list(projectId),
          previousUsers.map((user) =>
            user.userId === userId
              ? {
                  ...user,
                  projectPermissions: (data.projectPermissions as ProjectPermission[] | undefined) ?? user.projectPermissions,
                  scopePermissions: (data.scopePermissions as Record<string, ScopePermission[]> | undefined) ?? user.scopePermissions,
                }
              : user
          )
        );
      }

      if (previousUser) {
        queryClient.setQueryData<ProjectUser>(projectUserKeys.detail(projectId, userId), {
          ...previousUser,
          projectPermissions: (data.projectPermissions as ProjectPermission[] | undefined) ?? previousUser.projectPermissions,
          scopePermissions: (data.scopePermissions as Record<string, ScopePermission[]> | undefined) ?? previousUser.scopePermissions,
        });
      }

      return { previousUsers, previousUser };
    },
    onError: (_err, { projectId, userId }, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(projectUserKeys.list(projectId), context.previousUsers);
      }
      if (context?.previousUser) {
        queryClient.setQueryData(projectUserKeys.detail(projectId, userId), context.previousUser);
      }
    },
    onSettled: (_data, _error, { projectId, userId }) => {
      queryClient.invalidateQueries({ queryKey: projectUserKeys.list(projectId) });
      queryClient.invalidateQueries({ queryKey: projectUserKeys.detail(projectId, userId) });
    },
  });
}
