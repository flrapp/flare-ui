import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { getProjectPermissionLabel, getScopePermissionLabel } from '@/shared/lib/permissions';
import type { ProjectPermission, ScopePermission } from '@/shared/types/entities';

interface PermissionBadgesProps {
  permissions: number[];
  type: 'project' | 'scope';
  max?: number;
}

export function PermissionBadges({ permissions, type, max = 3 }: PermissionBadgesProps) {
  if (permissions.length === 0) {
    return <span className="text-sm text-muted-foreground italic">No permissions</span>;
  }

  const getLabel = type === 'project' ? getProjectPermissionLabel : getScopePermissionLabel;

  const visiblePermissions = permissions.slice(0, max);
  const hiddenPermissions = permissions.slice(max);

  return (
    <div className="flex flex-wrap gap-1 items-center">
      {visiblePermissions.map((permission) => (
        <Badge key={permission} variant="secondary" className="text-xs font-normal">
          {getLabel(permission as ProjectPermission & ScopePermission)}
        </Badge>
      ))}
      {hiddenPermissions.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground cursor-pointer underline-offset-4 hover:underline hover:text-foreground">
              +{hiddenPermissions.length} more
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-0.5">
              {hiddenPermissions.map((permission) => (
                <div key={permission}>
                  {getLabel(permission as ProjectPermission & ScopePermission)}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
}
