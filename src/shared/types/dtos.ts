// Project DTOs
export interface CreateProjectDto {
  name: string; // 3-255 chars
  description?: string | null; // max 1000 chars
}

export interface UpdateProjectDto {
  name: string; // 3-255 chars
  description?: string | null; // max 1000 chars
}

export interface RegenerateApiKeyResponseDto {
  apiKey: string;
  regeneratedAt: string;
}
