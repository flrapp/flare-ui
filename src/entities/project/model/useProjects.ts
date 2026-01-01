import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProjectDetail, CreateProjectDto, UpdateProjectDto } from '@/shared/types';
import * as projectApi from '../api/projectApi';

// Query keys
export const projectKeys = {
  all: ['projects'] as const,
  lists: () => [...projectKeys.all, 'list'] as const,
  details: () => [...projectKeys.all, 'detail'] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
  byAlias: (alias: string) => [...projectKeys.all, 'alias', alias] as const,
  permissions: (projectId: string) => [...projectKeys.detail(projectId), 'permissions'] as const,
};

// Query hooks
export function useProjects() {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectApi.getProjects,
  });
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: () => projectApi.getProjectById(id!),
    enabled: !!id,
  });
}

export function useProjectByAlias(alias: string | undefined) {
  return useQuery({
    queryKey: projectKeys.byAlias(alias!),
    queryFn: () => projectApi.getProjectByAlias(alias!),
    enabled: !!alias,
  });
}

export function useMyPermissions(projectId: string | undefined) {
  return useQuery({
    queryKey: projectKeys.permissions(projectId!),
    queryFn: () => projectApi.getMyPermissions(projectId!),
    enabled: !!projectId,
  });
}

// Mutation hooks
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectDto) => projectApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectDto }) =>
      projectApi.updateProject(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });
      const previousProject = queryClient.getQueryData<ProjectDetail>(projectKeys.detail(id));

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(projectKeys.detail(id), {
          ...previousProject,
          ...data,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousProject };
    },
    onError: (_err, { id }, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
      }
    },
    onSettled: (_data, _error, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useArchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.archiveProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });
      const previousProject = queryClient.getQueryData<ProjectDetail>(projectKeys.detail(id));

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(projectKeys.detail(id), {
          ...previousProject,
          isArchived: true,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousProject };
    },
    onError: (_err, id, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useUnarchiveProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.unarchiveProject(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: projectKeys.detail(id) });
      const previousProject = queryClient.getQueryData<ProjectDetail>(projectKeys.detail(id));

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(projectKeys.detail(id), {
          ...previousProject,
          isArchived: false,
          updatedAt: new Date().toISOString(),
        });
      }

      return { previousProject };
    },
    onError: (_err, id, context) => {
      if (context?.previousProject) {
        queryClient.setQueryData(projectKeys.detail(id), context.previousProject);
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: projectKeys.lists() });
    },
  });
}

export function useRegenerateApiKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectApi.regenerateApiKey(id),
    onSuccess: (data, id) => {
      const previousProject = queryClient.getQueryData<ProjectDetail>(projectKeys.detail(id));

      if (previousProject) {
        queryClient.setQueryData<ProjectDetail>(projectKeys.detail(id), {
          ...previousProject,
          apiKey: data.apiKey,
          updatedAt: data.regeneratedAt,
        });
      }
    },
    onSettled: (_data, _error, id) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
}
