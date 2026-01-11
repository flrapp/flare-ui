import type { MyPermissions, User } from '@/shared/types';
import { ProjectPermission, ScopePermission, GlobalRole } from '@/shared/types/entities';

/**
 * Permission System
 *
 * Two-level permission system:
 * 1. Project-level permissions (ManageUsers, ManageFeatureFlags, etc.)
 * 2. Scope-level permissions (ReadFeatureFlags, UpdateFeatureFlags)
 *
 * Admin Bypass:
 * - Admins bypass ALL project-level permission checks
 * - Admins DO NOT bypass scope-level permission checks
 * - Reason: Scope permissions control environment access (prod, stage, dev)
 *
 * Usage:
 * - Use canPerformProjectAction() for project operations
 * - Use canPerformScopeAction() for scope operations
 * - In React components, use usePermissions() hook
 */

export function hasProjectPermission(
  permissions: MyPermissions | null,
  permission: ProjectPermission
): boolean {
  if (!permissions) return false;
  return permissions.projectPermissions.includes(permission);
}

export function hasScopePermission(
  permissions: MyPermissions | null,
  scopeId: string,
  permission: ScopePermission
): boolean {
  if (!permissions) return false;
  const scopePerms = permissions.scopePermissions[scopeId];
  return scopePerms ? scopePerms.includes(permission) : false;
}

export function isAdmin(user: User | null): boolean {
  return user?.globalRole === GlobalRole.Admin;
}

// Admin bypass - admins can perform any project-level action
export function canPerformProjectAction(
  user: User | null,
  permissions: MyPermissions | null,
  permission: ProjectPermission
): boolean {
  return isAdmin(user) || hasProjectPermission(permissions, permission);
}

// Scope actions still respect permissions even for admins
export function canPerformScopeAction(
  permissions: MyPermissions | null,
  scopeId: string,
  permission: ScopePermission
): boolean {
  return hasScopePermission(permissions, scopeId, permission);
}

// Permission label helpers
export function getProjectPermissionLabel(permission: ProjectPermission): string {
  switch (permission) {
    case ProjectPermission.ManageUsers:
      return 'Manage Users';
    case ProjectPermission.ManageFeatureFlags:
      return 'Manage Feature Flags';
    case ProjectPermission.ManageScopes:
      return 'Manage Scopes';
    case ProjectPermission.ViewApiKey:
      return 'View API Key';
    case ProjectPermission.RegenerateApiKey:
      return 'Regenerate API Key';
    case ProjectPermission.ManageProjectSettings:
      return 'Manage Project Settings';
    case ProjectPermission.DeleteProject:
      return 'Delete Project';
    default:
      return 'Unknown Permission';
  }
}

export function getScopePermissionLabel(permission: ScopePermission): string {
  switch (permission) {
    case ScopePermission.ReadFeatureFlags:
      return 'Read Feature Flags';
    case ScopePermission.UpdateFeatureFlags:
      return 'Update Feature Flags';
    default:
      return 'Unknown Permission';
  }
}

// Get all available permissions
export function getAllProjectPermissions(): ProjectPermission[] {
  return [
    ProjectPermission.ManageUsers,
    ProjectPermission.ManageFeatureFlags,
    ProjectPermission.ManageScopes,
    ProjectPermission.ViewApiKey,
    ProjectPermission.RegenerateApiKey,
    ProjectPermission.ManageProjectSettings,
    ProjectPermission.DeleteProject,
  ];
}

export function getAllScopePermissions(): ScopePermission[] {
  return [ScopePermission.ReadFeatureFlags, ScopePermission.UpdateFeatureFlags];
}
