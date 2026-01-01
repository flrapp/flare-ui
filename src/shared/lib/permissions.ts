import type { MyPermissions, User } from '@/shared/types';
import { ProjectPermission, ScopePermission, GlobalRole } from '@/shared/types/entities';

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
