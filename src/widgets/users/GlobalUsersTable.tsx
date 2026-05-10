import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { Pencil, Trash2, KeyRound, UserX, UserCheck, ShieldOff } from 'lucide-react';
import { EditUserDialog, DeleteUserDialog, ResetPasswordDialog, ActivateUserDialog, DeactivateUserDialog, UnlockUserDialog } from '@/features/user';
import { GlobalRole } from '@/shared/types/entities';
import { useAuthStore } from '@/shared/stores/authStore';
import { formatDate } from '@/shared/lib/format-date';
import { useUsers } from '@/entities/user';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Pagination } from '@/shared/ui/Pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';

interface GlobalUsersTableProps {
  search: string;
  isActive?: boolean;
  emptyNode?: ReactNode;
}

export function GlobalUsersTable({ search, isActive, emptyNode }: GlobalUsersTableProps) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  useEffect(() => {
    setPage(1);
  }, [search, isActive, pageSize]);

  const currentUser = useAuthStore((state) => state.user);
  const isAdmin = currentUser?.globalRole === GlobalRole.Admin;

  const { data: usersPage, isLoading, isFetching, error, refetch } = useUsers({
    search: search || undefined,
    isActive,
    page,
    pageSize,
  });

  const getRoleLabel = (role: number) => {
    return role === GlobalRole.Admin ? 'Admin' : 'User';
  };

  if (isLoading) {
    return <TableSkeleton rows={5} columns={7} />;
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load users"
        message="There was an error loading the user list. Please try again."
        retry={() => refetch()}
      />
    );
  }

  const users = usersPage?.items ?? [];
  const totalPages = usersPage?.totalPages ?? 1;
  const totalCount = usersPage?.totalCount ?? 0;

  if (users.length === 0 && !search) {
    return <>{emptyNode}</>;
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        {totalCount} {totalCount === 1 ? 'user' : 'users'}
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
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.userId} className={!user.isActive ? 'opacity-60' : undefined}>
                  <TableCell>
                    <span className="font-mono text-sm">{user.username}</span>
                  </TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getRoleLabel(user.globalRole)}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={user.isActive ? 'success' : 'secondary'}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {user.isBruteForceLocked && (
                        <Badge variant="destructive">Locked (brute force)</Badge>
                      )}
                    </div>
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
                      {isAdmin && user.isBruteForceLocked && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <UnlockUserDialog user={user}>
                              <Button variant="ghost" size="sm" className="text-amber-600 hover:text-amber-700">
                                <ShieldOff className="h-4 w-4" />
                              </Button>
                            </UnlockUserDialog>
                          </TooltipTrigger>
                          <TooltipContent>Unlock user (brute force)</TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-2 px-1">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => setPageSize(Number(v))}
            disabled={isFetching}
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
          disabled={isFetching}
        />
      </div>
    </div>
  );
}
