import { useFeatureFlags } from '@/entities/flag';
import { useScopes } from '@/entities/scope';
import { ScopeToggle } from '@/features/flag/ui/ScopeToggle';
import { Button } from '@/shared/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { FeatureErrorBoundary } from '@/shared/ui/FeatureErrorBoundary';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { Plus, Flag, Pencil, Trash2 } from 'lucide-react';
import { canPerformScopeAction } from '@/shared/lib/permissions';
import type { MyPermissions, FeatureFlag } from '@/shared/types';
import { ScopePermission } from '@/shared/types/entities';

interface FeatureFlagsTableProps {
  projectId: string;
  permissions: MyPermissions | null;
  canManageFlags: boolean;
  onCreateFlag?: () => void;
  onEditFlag?: (flag: FeatureFlag) => void;
  onDeleteFlag?: (flag: FeatureFlag) => void;
}

export function FeatureFlagsTable({
  projectId,
  permissions,
  canManageFlags,
  onCreateFlag,
  onEditFlag,
  onDeleteFlag,
}: FeatureFlagsTableProps) {
  const {
    data: flags,
    isLoading: flagsLoading,
    error: flagsError,
    refetch: refetchFlags,
  } = useFeatureFlags(projectId);

  const {
    data: scopes,
    isLoading: scopesLoading,
    error: scopesError,
    refetch: refetchScopes,
  } = useScopes(projectId);

  const isLoading = flagsLoading || scopesLoading;
  const error = flagsError || scopesError;

  if (isLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load feature flags"
        message="There was an error loading feature flags. Please try again."
        retry={() => {
          refetchFlags();
          refetchScopes();
        }}
      />
    );
  }

  if (!flags || flags.length === 0) {
    return (
      <EmptyState
        icon={<Flag className="h-16 w-16" />}
        title="No feature flags yet"
        description="Create your first flag to control features across different environments."
        action={
          canManageFlags &&
          onCreateFlag && (
            <Button onClick={onCreateFlag}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Flag
            </Button>
          )
        }
      />
    );
  }

  if (!scopes || scopes.length === 0) {
    return (
      <ErrorMessage
        title="No scopes available"
        message="You need to create at least one scope before managing feature flags."
      />
    );
  }

  return (
    <div className="space-y-4">
      {canManageFlags && onCreateFlag && (
        <div className="flex justify-end">
          <Button onClick={onCreateFlag}>
            <Plus className="h-4 w-4 mr-2" />
            Create Feature Flag
          </Button>
        </div>
      )}

      <FeatureErrorBoundary
        fallback={
          <ErrorMessage
            title="Failed to render feature flags table"
            message="There was an error rendering the feature flags table. Please try refreshing the page."
            retry={() => {
              refetchFlags();
              refetchScopes();
            }}
          />
        }
      >
        <div className="overflow-hidden [&_tr]:border-0">
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-card z-10 min-w-62.5">
                  Feature Flag
                </TableHead>
                {scopes.map((scope) => (
                  <TableHead key={scope.id} className="text-center min-w-30">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help">{scope.name}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Alias: <span className="font-mono">{scope.alias}</span>
                          </p>
                          {scope.description && <p className="mt-1">{scope.description}</p>}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableHead>
                ))}
                {canManageFlags && (
                  <TableHead className="text-right sticky right-0 bg-card z-10 min-w-25">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {flags.map((flag) => (
                <TableRow key={flag.id}>
                  <TableCell className="sticky left-0 bg-card z-10 px-3 py-3">
                    <div>
                      <div className="text-sm font-medium">
                        {flag.description ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help">{flag.name}</span>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{flag.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span>{flag.name}</span>
                        )}
                      </div>
                      <span className="block text-xs font-mono text-muted-foreground mt-0.5">{flag.key}</span>
                    </div>
                  </TableCell>
                  {scopes.map((scope) => {
                    const value = flag.values.find((v) => v.scopeId === scope.id);
                    const canUpdate = canPerformScopeAction(
                      permissions,
                      scope.id,
                      ScopePermission.UpdateFeatureFlags
                    );

                    return (
                      <TableCell key={scope.id} className="text-center px-3 py-3">
                        {value ? (
                          <ScopeToggle
                            featureFlagId={flag.id}
                            scopeId={scope.id}
                            scopeName={scope.name}
                            currentValue={value.isEnabled}
                            isEnabled={canUpdate}
                            lastUpdated={value.updatedAt}
                            onToggle={ () =>{
                              refetchFlags();
                              refetchScopes();
                              }
                            }
                          />
                        ) : (
                          <div></div>
                        )}
                      </TableCell>
                    );
                  })}
                  {canManageFlags && (
                    <TableCell className="text-right sticky right-0 bg-card z-10 px-3 py-3">
                      <div className="flex justify-end gap-2">
                        {onEditFlag && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEditFlag(flag)}>
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit flag</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {onDeleteFlag && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDeleteFlag(flag)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete flag</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      </FeatureErrorBoundary>
    </div>
  );
}
