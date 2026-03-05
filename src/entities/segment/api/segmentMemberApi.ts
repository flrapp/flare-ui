import { apiClient } from '@/shared/api/client';
import type { SegmentMember, AddSegmentMembersDto, SegmentMembersParams } from '../model/types';

const BASE_PATH = '/v1';

export async function getSegmentMembers(
  segmentId: string,
  params?: SegmentMembersParams
): Promise<SegmentMember[]> {
  const response = await apiClient.get<SegmentMember[]>(
    `${BASE_PATH}/segments/${segmentId}/members`,
    { params }
  );
  return response.data;
}

export async function addSegmentMembers(
  segmentId: string,
  targetingKeys: string[]
): Promise<SegmentMember[]> {
  const data: AddSegmentMembersDto = { targetingKeys };
  const response = await apiClient.post<SegmentMember[]>(
    `${BASE_PATH}/segments/${segmentId}/members`,
    data
  );
  return response.data;
}

export async function removeSegmentMember(segmentId: string, memberKey: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/segments/${segmentId}/members/${memberKey}`);
}
