import { useState } from 'react';
import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Pencil, Trash2, Search, KeyRound, UserX, UserCheck } from 'lucide-react';
import { EditUserDialog, DeleteUserDialog, ResetPasswordDialog, ActivateUserDialog, DeactivateUserDialog } from '@/features/user';
import { GlobalRole } from '@/shared/types/entities';
import { useAuthStore } from '@/shared/stores/authStore';
import type { UserResponseDto } from '@/shared/types/dtos';

interface GlobalUsersTableProps {
  users: UserResponseDto[];
  emptyNode?: ReactNode;
}

export function GlobalUsersTable({ users, emptyNode }: GlobalUsersTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.globalRole === GlobalRole.Admin;

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleLabel = (role: number) => {
    return role === GlobalRole.Admin ? 'Admin' : 'User';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Username</TableHead>
              <TableHead>Full Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Last Login</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className={users.length === 0 && emptyNode ? undefined : 'text-center py-8 text-muted-foreground'}
                >
                  {users.length === 0 && emptyNode
                    ? emptyNode
                    : searchQuery
                    ? 'No users found matching your search.'
                    : 'No users yet.'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId} className={!user.isActive ? 'opacity-60' : undefined}>
                  <TableCell>
                    <span className="font-mono text-sm">{user.username}</span>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(user.globalRole)}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.isActive ? 'success' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">{formatDate(user.createdAt)}</span>
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt ? (
                      <span className="text-sm text-muted-foreground">{formatDate(user.lastLoginAt)}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">Never</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {user.isActive ? (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <EditUserDialog user={user}>
                                <Button variant="ghost" size="sm">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </EditUserDialog>
                            </TooltipTrigger>
                            <TooltipContent>Edit user</TooltipContent>
                          </Tooltip>
                          {isAdmin && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <ResetPasswordDialog user={user}>
                                  <Button variant="ghost" size="sm">
                                    <KeyRound className="h-4 w-4" />
                                  </Button>
                                </ResetPasswordDialog>
                              </TooltipTrigger>
                              <TooltipContent>Reset password</TooltipContent>
                            </Tooltip>
                          )}
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DeactivateUserDialog user={user}>
                                <Button variant="ghost" size="sm">
                                  <UserX className="h-4 w-4" />
                                </Button>
                              </DeactivateUserDialog>
                            </TooltipTrigger>
                            <TooltipContent>Deactivate user</TooltipContent>
                          </Tooltip>
                        </>
                      ) : (
                        <>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <ActivateUserDialog user={user}>
                                <Button variant="ghost" size="sm">
                                  <UserCheck className="h-4 w-4" />
                                </Button>
                              </ActivateUserDialog>
                            </TooltipTrigger>
                            <TooltipContent>Activate user</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <DeleteUserDialog user={user}>
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DeleteUserDialog>
                            </TooltipTrigger>
                            <TooltipContent>Delete user</TooltipContent>
                          </Tooltip>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
