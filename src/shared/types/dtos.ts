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

// Scope DTOs
export interface CreateScopeDto {
  name: string; // 2-255 chars
  description?: string | null; // max 1000 chars
}

export interface UpdateScopeDto {
  name: string; // 2-255 chars
  description?: string | null; // max 1000 chars
}

// Feature Flag DTOs
export interface CreateFeatureFlagDto {
  name: string; // 2-255 chars
  description?: string | null; // max 1000 chars
  // Note: defaultValue removed from DTO, backend handles initialization
}

export interface UpdateFeatureFlagDto {
  name: string; // 2-255 chars
  description?: string | null; // max 1000 chars
}

export interface UpdateFeatureFlagValueDto {
  scopeId: string;
  isEnabled: boolean;
}
