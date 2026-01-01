// Enums (using const objects for TypeScript compatibility)
export const ProjectPermission = {
  ManageUsers: 0,
  ManageFeatureFlags: 1,
  ManageScopes: 2,
  ViewApiKey: 3,
  RegenerateApiKey: 4,
  ManageProjectSettings: 5,
  DeleteProject: 6,
} as const;

export type ProjectPermission = typeof ProjectPermission[keyof typeof ProjectPermission];

export const ScopePermission = {
  ReadFeatureFlags: 0,
  UpdateFeatureFlags: 1,
} as const;

export type ScopePermission = typeof ScopePermission[keyof typeof ScopePermission];

export const GlobalRole = {
  User: 0,
  Admin: 1,
} as const;

export type GlobalRole = typeof GlobalRole[keyof typeof GlobalRole];

// Entity interfaces
export interface Project {
  id: string;
  alias: string;
  name: string;
  description: string | null;
  createdBy: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDetail extends Project {
  apiKey: string | null;
  memberCount: number;
  scopeCount: number;
  featureFlagCount: number;
}

export interface Scope {
  id: string;
  projectId: string;
  alias: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface FeatureFlagValue {
  id: string;
  scopeId: string;
  scopeName: string;
  scopeAlias: string;
  isEnabled: boolean;
  updatedAt: string;
}

export interface FeatureFlag {
  id: string;
  projectId: string;
  key: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  values: FeatureFlagValue[];
}

export interface ProjectUser {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  joinedAt: string;
  projectPermissions: ProjectPermission[];
  scopePermissions: Record<string, ScopePermission[]>; // scopeId -> permissions
}

export interface MyPermissions {
  userId: string;
  projectId: string;
  projectPermissions: ProjectPermission[];
  scopePermissions: Record<string, ScopePermission[]>; // scopeId -> permissions
}
