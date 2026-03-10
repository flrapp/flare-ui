import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as segmentMemberApi from '../api/segmentMemberApi';
import { segmentKeys } from './useSegments';
import type { SegmentMembersParams } from './types';

export const segmentMemberKeys = {
  all: ['segment-members'] as const,
  lists: () => [...segmentMemberKeys.all, 'list'] as const,
  list: (segmentId: string, params?: SegmentMembersParams) =>
    [...segmentMemberKeys.lists(), segmentId, params] as const,
};

export function useSegmentMembers(segmentId: string, params?: SegmentMembersParams) {
  return useQuery({
    queryKey: segmentMemberKeys.list(segmentId, params),
    queryFn: () => segmentMemberApi.getSegmentMembers(segmentId, params),
    enabled: !!segmentId,
  });
}

export function useAddSegmentMembers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      segmentId,
      targetingKeys,
    }: {
      segmentId: string;
      targetingKeys: string[];
    }) => segmentMemberApi.addSegmentMembers(segmentId, targetingKeys),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentMemberKeys.lists() });
      // Invalidate all segment lists so memberCount stays in sync
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
    },
  });
}

export function useRemoveSegmentMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ segmentId, memberKey }: { segmentId: string; memberKey: string }) =>
      segmentMemberApi.removeSegmentMember(segmentId, memberKey),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: segmentMemberKeys.lists() });
      queryClient.invalidateQueries({ queryKey: segmentKeys.lists() });
    },
  });
}
