import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Pencil, Trash2, Search } from 'lucide-react';
import { PermissionBadges } from '@/shared/ui/PermissionBadges';
import { EditUserPermissionsDialog, RemoveUserDialog } from '@/features/project-user';
import { GlobalRole } from '@/shared/types/entities';
import type { ProjectUser } from '@/shared/types/entities';

interface ProjectUsersTableProps {
  projectId: string;
  users: ProjectUser[];
  canManageUsers: boolean;
}

export function ProjectUsersTable({ projectId, users, canManageUsers }: ProjectUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleLabel = (role: number) => {
    return role === GlobalRole.Admin ? 'Admin' : 'User';
  };

  const getRoleBadgeVariant = (role: number) => {
    return role === GlobalRole.Admin ? 'destructive' : 'secondary';
  };

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

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Global Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Permissions</TableHead>
              {canManageUsers && <TableHead className="text-right">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={canManageUsers ? 6 : 5} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No team members found matching your search.' : 'No team members yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const totalPermissions = getTotalPermissionsCount(user);
                return (
                  <TableRow key={user.userId}>
                    <TableCell className="font-medium">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{user.username}</code>
                    </TableCell>
                    <TableCell>{user.fullName}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.projectPermissions[0] || 0)}>
                        {getRoleLabel(user.projectPermissions[0] || 0)}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.joinedAt)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {user.projectPermissions.length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Project:</div>
                            <PermissionBadges permissions={user.projectPermissions} type="project" max={2} />
                          </div>
                        )}
                        {Object.values(user.scopePermissions).flat().length > 0 && (
                          <div>
                            <div className="text-xs text-muted-foreground mb-1">Scopes:</div>
                            <Badge variant="outline" className="text-xs">
                              {Object.values(user.scopePermissions).flat().length} permissions across{' '}
                              {Object.keys(user.scopePermissions).length} scopes
                            </Badge>
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
                          <EditUserPermissionsDialog projectId={projectId} user={user}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </EditUserPermissionsDialog>
                          <RemoveUserDialog projectId={projectId} user={user}>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </RemoveUserDialog>
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
