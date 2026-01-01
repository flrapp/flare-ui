import { useAuthStore } from '@/shared/stores/authStore';
import { ProjectPermission, ScopePermission } from '@/shared/types/entities';
import {
  hasProjectPermission,
  hasScopePermission,
  canPerformProjectAction,
  canPerformScopeAction,
  isAdmin
} from '@/shared/lib/permissions';
import { useMyPermissions } from '@/entities/project/model/useProjects';

export function usePermissions(projectId: string | undefined) {
  const user = useAuthStore(state => state.user);
  const { data: permissions, isLoading } = useMyPermissions(projectId);

  return {
    permissions: permissions ?? null,
    isLoading,
    isAdmin: isAdmin(user),
    hasProjectPermission: (permission: ProjectPermission) =>
      hasProjectPermission(permissions ?? null, permission),
    hasScopePermission: (scopeId: string, permission: ScopePermission) =>
      hasScopePermission(permissions ?? null, scopeId, permission),
    canPerformProjectAction: (permission: ProjectPermission) =>
      canPerformProjectAction(user, permissions ?? null, permission),
    canPerformScopeAction: (scopeId: string, permission: ScopePermission) =>
      canPerformScopeAction(permissions ?? null, scopeId, permission),
  };
}
