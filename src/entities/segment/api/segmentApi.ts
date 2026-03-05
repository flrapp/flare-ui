import { apiClient } from '@/shared/api/client';
import type { Segment, CreateSegmentDto, UpdateSegmentDto } from '../model/types';

const BASE_PATH = '/v1';

export async function getSegments(projectId: string): Promise<Segment[]> {
  const response = await apiClient.get<Segment[]>(`${BASE_PATH}/projects/${projectId}/segments`);
  return response.data;
}

export async function createSegment(projectId: string, data: CreateSegmentDto): Promise<Segment> {
  const response = await apiClient.post<Segment>(
    `${BASE_PATH}/projects/${projectId}/segments`,
    data
  );
  return response.data;
}

export async function updateSegment(
  projectId: string,
  segmentId: string,
  data: UpdateSegmentDto
): Promise<Segment> {
  const response = await apiClient.put<Segment>(
    `${BASE_PATH}/projects/${projectId}/segments/${segmentId}`,
    data
  );
  return response.data;
}

export async function deleteSegment(projectId: string, segmentId: string): Promise<void> {
  await apiClient.delete(`${BASE_PATH}/projects/${projectId}/segments/${segmentId}`);
}
