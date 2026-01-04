import { Badge } from '@/shared/ui/badge';
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
  const variant = type === 'project' ? 'default' : 'secondary';

  const visiblePermissions = permissions.slice(0, max);
  const remainingCount = permissions.length - max;

  return (
    <div className="flex flex-wrap gap-1">
      {visiblePermissions.map((permission) => (
        <Badge key={permission} variant={variant} className="text-xs">
          {getLabel(permission as ProjectPermission & ScopePermission)}
        </Badge>
      ))}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount} more
        </Badge>
      )}
    </div>
  );
}
