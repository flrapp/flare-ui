import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Pencil, Trash2, Search } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { PermissionBadges } from '@/shared/ui/PermissionBadges';
import { EditUserPermissionsDialog, RemoveUserDialog } from '@/features/project-user';
import { useScopes } from '@/entities/scope';
import { getScopePermissionLabel } from '@/shared/lib/permissions';
import type { ProjectUser, ScopePermission } from '@/shared/types/entities';

interface ProjectUsersTableProps {
  projectId: string;
  users: ProjectUser[];
  canManageUsers: boolean;
}

export function ProjectUsersTable({ projectId, users, canManageUsers }: ProjectUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: scopes } = useScopes(projectId);

  const scopeNameMap = new Map(scopes?.map((s) => [s.id, s.name]) ?? []);

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getTotalPermissionsCount = (user: ProjectUser) => {
    const projectPerms = user.projectPermissions.length;
    const scopePerms = Object.values(user.scopePermissions).flat().length;
    return projectPerms + scopePerms;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search team members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'member' : 'members'}
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Full Name</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</TableHead>
              <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Permissions</TableHead>
              {canManageUsers && <TableHead className="text-xs font-medium text-muted-foreground uppercase tracking-wider text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageUsers ? 5 : 4} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No team members found matching your search.' : 'No team members yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
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
                                  {totalScopePerms} {totalScopePerms === 1 ? 'permission' : 'permissions'} across {scopeEntries.length} {scopeEntries.length === 1 ? 'scope' : 'scopes'}
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
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
