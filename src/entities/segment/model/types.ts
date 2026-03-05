export interface Segment {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  memberCount: number;
  createdAt: string;
}

export interface SegmentMember {
  id: string;
  segmentId: string;
  targetingKey: string;
}

export interface CreateSegmentDto {
  name: string;
  description?: string | null;
}

export interface UpdateSegmentDto {
  name: string;
  description?: string | null;
}

export interface AddSegmentMembersDto {
  targetingKeys: string[];
}

export interface SegmentMembersParams {
  page?: number;
  pageSize?: number;
  search?: string;
}
