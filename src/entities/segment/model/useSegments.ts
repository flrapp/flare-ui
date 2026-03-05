import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as segmentApi from '../api/segmentApi';
import type { CreateSegmentDto, UpdateSegmentDto } from './types';

export const segmentKeys = {
  all: ['segments'] as const,
  lists: () => [...segmentKeys.all, 'list'] as const,
  byProject: (projectId: string) => [...segmentKeys.lists(), projectId] as const,
};

export function useSegments(projectId: string) {
  return useQuery({
    queryKey: segmentKeys.byProject(projectId),
    queryFn: () => segmentApi.getSegments(projectId),
    enabled: !!projectId,
  });
}

export function useCreateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: CreateSegmentDto }) =>
      segmentApi.createSegment(projectId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.byProject(projectId) });
    },
  });
}

export function useUpdateSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      segmentId,
      data,
    }: {
      projectId: string;
      segmentId: string;
      data: UpdateSegmentDto;
    }) => segmentApi.updateSegment(projectId, segmentId, data),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.byProject(projectId) });
    },
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, segmentId }: { projectId: string; segmentId: string }) =>
      segmentApi.deleteSegment(projectId, segmentId),
    onSuccess: (_data, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: segmentKeys.byProject(projectId) });
    },
  });
}
