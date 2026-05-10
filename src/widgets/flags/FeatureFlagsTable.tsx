import { useState, useEffect, useMemo } from 'react';
import { useFeatureFlags } from '@/entities/flag';
import { useScopes } from '@/entities/scope';
import { ScopeToggle } from '@/features/flag/ui/ScopeToggle';
import { StringValuePopover } from '@/features/flag/ui/StringValuePopover';
import { NumberValuePopover } from '@/features/flag/ui/NumberValuePopover';
import { JsonValuePopover } from '@/features/flag/ui/JsonValuePopover';
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
import { Pagination } from '@/shared/ui/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Plus, Flag, Pencil, Trash2, Search } from 'lucide-react';
import { canPerformScopeAction } from '@/shared/lib/permissions';
import { FeatureFlagType } from '@/shared/types/entities';
import type { MyPermissions, FeatureFlag, FeatureFlagValue } from '@/shared/types';
import { ScopePermission } from '@/shared/types/entities';

interface FeatureFlagsTableProps {
  projectId: string;
  search?: string;
  permissions: MyPermissions | null;
  canManageFlags: boolean;
  onFetchingChange?: (isFetching: boolean) => void;
  onCreateFlag?: () => void;
  onEditFlag?: (flag: FeatureFlag) => void;
  onDeleteFlag?: (flag: FeatureFlag) => void;
}

type PopoverState = {
  type: 'string' | 'number' | 'json';
  flagId: string;
  projectId: string;
  scopeId: string;
  currentValue: unknown;
  position: { top: number; left: number };
};

function truncate(str: string, max: number): string {
  return str.length <= max ? str : str.slice(0, max) + '…';
}

interface TypedValueDisplayProps {
  flagType: FeatureFlagType;
  value: FeatureFlagValue;
}

function TypedValueDisplay({ flagType, value }: TypedValueDisplayProps) {
  if (flagType === FeatureFlagType.String) {
    const display = value.stringValue != null ? truncate(value.stringValue, 16) : '—';
    const full = value.stringValue ?? '';
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block font-mono text-xs bg-muted rounded px-1.5 py-0.5 cursor-default max-w-[120px] truncate">
            {display}
          </span>
        </TooltipTrigger>
        {full.length > 16 && (
          <TooltipContent>
            <p className="font-mono">{full}</p>
          </TooltipContent>
        )}
      </Tooltip>
    );
  }

  if (flagType === FeatureFlagType.Number) {
    return (
      <span className="text-xs text-muted-foreground">
        {value.numberValue ?? '—'}
      </span>
    );
  }

  if (flagType === FeatureFlagType.Json) {
    return (
      <span className="text-xs text-muted-foreground font-mono">{'{ … }'}</span>
    );
  }

  return null;
}

export function FeatureFlagsTable({
  projectId,
  search = '',
  permissions,
  canManageFlags,
  onFetchingChange,
  onCreateFlag,
  onEditFlag,
  onDeleteFlag,
}: FeatureFlagsTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [popover, setPopover] = useState<PopoverState | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const {
    data: flagPage,
    isLoading: flagsLoading,
    isFetching: flagsFetching,
    error: flagsError,
    refetch: refetchFlags,
  } = useFeatureFlags(projectId, search, page, pageSize);

  useEffect(() => {
    onFetchingChange?.(flagsFetching);
  }, [flagsFetching, onFetchingChange]);

  const {
    data: scopes,
    isLoading: scopesLoading,
    error: scopesError,
    refetch: refetchScopes,
  } = useScopes(projectId);

  const scopePermissions = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const scope of scopes ?? []) {
      map.set(scope.id, canPerformScopeAction(permissions, scope.id, ScopePermission.UpdateFeatureFlags));
    }
    return map;
  }, [permissions, scopes]);

  const flags = flagPage?.items ?? [];
  const totalPages = flagPage?.totalPages ?? 1;

  if (scopesLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (scopesError || flagsError) {
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

  if (!scopes || scopes.length === 0) {
    return (
      <ErrorMessage
        title="No scopes available"
        message="You need to create at least one scope before managing feature flags."
      />
    );
  }

  if (!flagsLoading && flags.length === 0 && !search) {
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

  const isSearching = flagsFetching && flagPage === undefined;

  const handlePopoverOpen = (
    e: React.MouseEvent<HTMLButtonElement>,
    type: 'string' | 'number' | 'json',
    flagId: string,
    flagProjectId: string,
    scopeId: string,
    currentValue: unknown
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopover({ type, flagId, projectId: flagProjectId, scopeId, currentValue, position: { top: rect.bottom + 4, left: rect.left + rect.width / 2 } });
  };

  const closePopover = () => setPopover(null);

  return (
    <div className="space-y-4">
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
        {isSearching ? (
          <TableSkeleton rows={3} columns={scopes.length + 2} />
        ) : flags.length === 0 ? (
          <EmptyState
            icon={<Search className="h-16 w-16" />}
            title="No flags found"
            description={`No flags match "${search}".`}
          />
        ) : (
          <>
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
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <span className="cursor-help">{flag.name}</span>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>{flag.description}</p>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span>{flag.name}</span>
                              )}
                            </div>
                            <span className="block text-xs font-mono text-muted-foreground mt-0.5">{flag.key}</span>
                          </div>
                        </TableCell>
                        {scopes.map((scope) => {
                          const value = flag.values.find((v) => v.scopeId === scope.id);
                          const canUpdate = scopePermissions.get(scope.id) ?? false;

                          return (
                            <TableCell key={scope.id} className="text-center px-3 py-3">
                              {value ? (
                                flag.type === FeatureFlagType.Boolean ? (
                                  <ScopeToggle
                                    featureFlagId={flag.id}
                                    scopeId={scope.id}
                                    scopeName={scope.name}
                                    currentValue={value.booleanValue ?? false}
                                    flagType={FeatureFlagType.Boolean}
                                    isEnabled={canUpdate}
                                    lastUpdated={value.updatedAt}
                                    onToggle={() => {
                                      refetchFlags();
                                      refetchScopes();
                                    }}
                                  />
                                ) : canUpdate ? (
                                  <>
                                    {flag.type === FeatureFlagType.String && (
                                      <button
                                        onClick={(e) => handlePopoverOpen(e, 'string', flag.id, flag.projectId, scope.id, value.stringValue)}
                                        className="inline-block font-mono text-xs bg-muted rounded px-1.5 py-0.5 cursor-pointer hover:bg-accent max-w-[120px] truncate transition-colors"
                                      >
                                        {value.stringValue != null ? truncate(value.stringValue, 16) : '—'}
                                      </button>
                                    )}
                                    {flag.type === FeatureFlagType.Number && (
                                      <button
                                        onClick={(e) => handlePopoverOpen(e, 'number', flag.id, flag.projectId, scope.id, value.numberValue)}
                                        className="text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-1"
                                      >
                                        {value.numberValue ?? '—'}
                                      </button>
                                    )}
                                    {flag.type === FeatureFlagType.Json && (
                                      <button
                                        onClick={(e) => handlePopoverOpen(e, 'json', flag.id, flag.projectId, scope.id, value.jsonValue)}
                                        className="font-mono text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors px-1"
                                      >
                                        {'{ … }'}
                                      </button>
                                    )}
                                  </>
                                ) : (
                                  <TypedValueDisplay flagType={flag.type} value={value} />
                                )
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
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => onEditFlag(flag)}>
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit flag</TooltipContent>
                                </Tooltip>
                              )}
                              {onDeleteFlag && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => onDeleteFlag(flag)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Delete flag</TooltipContent>
                                </Tooltip>
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

            <div className="flex items-center justify-between py-2 px-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(v) => setPageSize(Number(v))}
                  disabled={flagsFetching}
                >
                  <SelectTrigger className="h-8 w-18">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                disabled={flagsFetching}
              />
            </div>
          </>
        )}
      </FeatureErrorBoundary>

      {popover?.type === 'string' && (
        <StringValuePopover
          position={popover.position}
          flagId={popover.flagId}
          projectId={popover.projectId}
          scopeId={popover.scopeId}
          currentValue={popover.currentValue as string | null | undefined}
          onClose={closePopover}
        />
      )}
      {popover?.type === 'number' && (
        <NumberValuePopover
          position={popover.position}
          flagId={popover.flagId}
          projectId={popover.projectId}
          scopeId={popover.scopeId}
          currentValue={popover.currentValue as number | null | undefined}
          onClose={closePopover}
        />
      )}
      {popover?.type === 'json' && (
        <JsonValuePopover
          position={popover.position}
          flagId={popover.flagId}
          projectId={popover.projectId}
          scopeId={popover.scopeId}
          currentValue={popover.currentValue as string | null | undefined}
          onClose={closePopover}
        />
      )}
    </div>
  );
}
