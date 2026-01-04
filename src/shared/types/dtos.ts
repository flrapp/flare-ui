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

// User Management DTOs
export interface CreateUserDto {
  username: string; // 3-100 chars, alphanumeric + underscore
  fullName: string; // 1-255 chars
  temporaryPassword: string; // min 8 chars
}

export interface UpdateUserDto {
  fullName: string; // 1-255 chars
  globalRole?: number; // GlobalRole enum
}

export interface UserResponseDto {
  userId: string;
  username: string;
  fullName: string;
  globalRole: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Project User DTOs
export interface AvailableUserDto {
  userId: string;
  username: string;
  fullName: string;
  isAlreadyMember: boolean;
}

export interface InviteUserDto {
  userId: string;
  projectPermissions?: number[]; // ProjectPermission[]
  scopePermissions?: Record<string, number[]>; // scopeId -> ScopePermission[]
}

export interface UpdateUserPermissionsDto {
  projectPermissions?: number[]; // ProjectPermission[]
  scopePermissions?: Record<string, number[]>; // scopeId -> ScopePermission[]
}
