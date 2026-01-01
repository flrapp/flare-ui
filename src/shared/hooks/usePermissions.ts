import { useAuthStore } from '@/shared/stores/authStore';
import type { MyPermissions } from '@/shared/types';
import { ProjectPermission, ScopePermission } from '@/shared/types/entities';
import {
  hasProjectPermission,
  hasScopePermission,
  canPerformProjectAction,
  canPerformScopeAction,
  isAdmin
} from '@/shared/lib/permissions';

// This hook will be enhanced later to fetch permissions from API
export function usePermissions(_projectId: string | undefined) {
  const user = useAuthStore(state => state.user);

  // TODO: Fetch permissions from API in Phase 4
  const permissions: MyPermissions | null = null;
  const isLoading = false;

  return {
    permissions,
    isLoading,
    isAdmin: isAdmin(user),
    hasProjectPermission: (permission: ProjectPermission) =>
      hasProjectPermission(permissions, permission),
    hasScopePermission: (scopeId: string, permission: ScopePermission) =>
      hasScopePermission(permissions, scopeId, permission),
    canPerformProjectAction: (permission: ProjectPermission) =>
      canPerformProjectAction(user, permissions, permission),
    canPerformScopeAction: (scopeId: string, permission: ScopePermission) =>
      canPerformScopeAction(permissions, scopeId, permission),
  };
}
