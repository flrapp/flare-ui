import { ReactNode } from 'react';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission, ScopePermission } from '@/shared/types/entities';

/**
 * Permission gate component that conditionally renders children based on permissions.
 *
 * Wraps children and only renders them if the user has the required permission.
 * Shows optional fallback content when permission is denied.
 *
 * @example
 * // Project permission
 * <PermissionGate
 *   projectId={projectId}
 *   projectPermission={ProjectPermission.ManageUsers}
 * >
 *   <Button>Invite User</Button>
 * </PermissionGate>
 *
 * @example
 * // Scope permission
 * <PermissionGate
 *   projectId={projectId}
 *   scopePermission={{ scopeId: 'scope-123', permission: ScopePermission.UpdateFeatureFlags }}
 * >
 *   <Button>Toggle Flag</Button>
 * </PermissionGate>
 *
 * @example
 * // With fallback
 * <PermissionGate
 *   projectId={projectId}
 *   projectPermission={ProjectPermission.ManageScopes}
 *   fallback={<div>You need permission to manage scopes</div>}
 * >
 *   <CreateScopeButton />
 * </PermissionGate>
 */

interface PermissionGateProps {
  projectId?: string;
  projectPermission?: ProjectPermission;
  scopePermission?: { scopeId: string; permission: ScopePermission };
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({
  projectId,
  projectPermission,
  scopePermission,
  fallback = null,
  children,
}: PermissionGateProps) {
  const { canPerformProjectAction, canPerformScopeAction } = usePermissions(projectId);

  let hasPermission = false;

  if (projectPermission !== undefined) {
    hasPermission = canPerformProjectAction(projectPermission);
  } else if (scopePermission) {
    hasPermission = canPerformScopeAction(scopePermission.scopeId, scopePermission.permission);
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
