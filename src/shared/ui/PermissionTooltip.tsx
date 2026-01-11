import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';

/**
 * Permission tooltip component that wraps disabled actions with explanatory tooltips.
 *
 * Shows a tooltip explaining the required permission when the user doesn't have access.
 * Simply renders children without tooltip when permission is granted.
 *
 * @example
 * const canManage = canPerformProjectAction(ProjectPermission.ManageUsers);
 *
 * <PermissionTooltip hasPermission={canManage} permissionLabel="Manage Users">
 *   <Button disabled={!canManage}>Invite User</Button>
 * </PermissionTooltip>
 */

interface PermissionTooltipProps {
  hasPermission: boolean;
  permissionLabel: string;
  children: ReactNode;
}

export function PermissionTooltip({
  hasPermission,
  permissionLabel,
  children,
}: PermissionTooltipProps) {
  if (hasPermission) {
    return <>{children}</>;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div>{children}</div>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-sm">You don't have permission to perform this action.</p>
        <p className="text-xs text-muted-foreground mt-1">Required: {permissionLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}
