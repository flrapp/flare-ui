import { useState, useEffect, useRef } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Pencil, Trash2, UserPlus, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { PermissionBadges } from '@/shared/ui/PermissionBadges';
import { EditUserPermissionsDialog, RemoveUserDialog, InviteUserDialog } from '@/features/project-user';
import { useScopes } from '@/entities/scope';
import { getScopePermissionLabel } from '@/shared/lib/permissions';
import { formatDate } from '@/shared/lib/format-date';
import { useProjectUsers } from '@/entities/project-user';
import { Pagination } from '@/shared/ui/Pagination';
import { PageSizeSelect } from '@/shared/ui/PageSizeSelect';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import type { ProjectUser, ScopePermission } from '@/shared/types/entities';

interface ProjectUsersTableProps {
  projectId: string;
  search: string;
  canManageUsers: boolean;
}

export function ProjectUsersTable({ projectId, search, canManageUsers }: ProjectUsersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const isMounted = useRef(false);

  const { data, isLoading, isFetching } = useProjectUsers(projectId, { search, page, pageSize });
  const { data: scopes } = useScopes(projectId);

  const scopeNameMap = new Map(scopes?.map((s) => [s.id, s.name]) ?? []);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    setPage(1);
  }, [search]);

  const getTotalPermissionsCount = (user: ProjectUser) => {
    const projectPerms = user.projectPermissions.length;
    const scopePerms = Object.values(user.scopePermissions).flat().length;
    return projectPerms + scopePerms;
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  const users = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalCount = data?.totalCount ?? 0;

  if (users.length === 0) {
    return (
      <EmptyState
        icon={<UserPlus className="h-16 w-16" />}
        title={search ? 'No members found' : 'No team members yet'}
        description={
          search
            ? 'Try a different search term.'
            : 'Invite users to collaborate on this project and assign their permissions.'
        }
        action={
          !search && canManageUsers ? (
            <InviteUserDialog projectId={projectId}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </InviteUserDialog>
          ) : undefined
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? 'member' : 'members'}
      </div>

      <div className={`border border-border rounded-lg overflow-hidden transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions</TableHead>
              {canManageUsers && (
                <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const totalPermissions = getTotalPermissionsCount(user);
              const scopeEntries = Object.entries(user.scopePermissions);
              const totalScopePerms = scopeEntries.reduce((sum, [, perms]) => sum + perms.length, 0);

              return (
                <TableRow key={user.userId}>
                  <TableCell>
                    <span className="font-mono text-sm">{user.username}</span>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(user.joinedAt)}</span>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2">
                      {user.projectPermissions.length > 0 && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Project:</div>
                          <PermissionBadges permissions={user.projectPermissions} type="project" max={2} />
                        </div>
                      )}
                      {totalScopePerms > 0 && (
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">Scopes:</div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="text-xs text-muted-foreground cursor-pointer underline-offset-4 hover:underline hover:text-foreground">
                                {totalScopePerms} {totalScopePerms === 1 ? 'permission' : 'permissions'} across{' '}
                                {scopeEntries.length} {scopeEntries.length === 1 ? 'scope' : 'scopes'}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <div className="space-y-1">
                                {scopeEntries.map(([scopeId, perms]) => (
                                  <div key={scopeId}>
                                    <span className="font-mono">{scopeNameMap.get(scopeId) ?? scopeId}</span>
                                    <span className="text-primary-foreground/70">: </span>
                                    <span className="font-mono">
                                      {perms.map((p) => getScopePermissionLabel(p as ScopePermission)).join(', ')}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      )}
                      {totalPermissions === 0 && (
                        <span className="text-sm text-muted-foreground italic">No permissions</span>
                      )}
                    </div>
                  </TableCell>
                  {canManageUsers && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <EditUserPermissionsDialog projectId={projectId} user={user}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                <Pencil className="h-4 w-4" />
                              </Button>
                            </EditUserPermissionsDialog>
                          </TooltipTrigger>
                          <TooltipContent>Edit permissions</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <RemoveUserDialog projectId={projectId} user={user}>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </RemoveUserDialog>
                          </TooltipTrigger>
                          <TooltipContent>Remove from project</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <PageSizeSelect
            value={pageSize}
            onChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            disabled={isFetching}
          />
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} disabled={isFetching} />
        </div>
      )}
    </div>
  );
}
