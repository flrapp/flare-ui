import { useState, useEffect } from 'react';
import { toast } from '@/shared/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Label } from '@/shared/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { PermissionEditor } from './PermissionEditor';
import { useAvailableUsers, useInviteUser } from '@/entities/project-user';
import { SearchInput } from '@/shared/ui/SearchInput';
import { InlineSpinner } from '@/shared/ui/InlineSpinner';
import { useDebounce } from '@/shared/lib/useDebounce';
import type { ProblemDetails } from '@/shared/types/auth';
import type { AvailableUserDto } from '@/shared/types/dtos';

interface InviteUserDialogProps {
  projectId: string;
  children?: React.ReactNode;
}

export function InviteUserDialog({ projectId, children }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<AvailableUserDto | null>(null);
  const [permissions, setPermissions] = useState<{
    projectPermissions: number[];
    scopePermissions: Record<string, number[]>;
  }>({
    projectPermissions: [],
    scopePermissions: {},
  });

  const debouncedSearch = useDebounce(search, 300);
  const { data: availableUsers, isLoading: isLoadingUsers, isFetching } = useAvailableUsers(
    open ? projectId : undefined,
    debouncedSearch || undefined
  );
  const inviteUser = useInviteUser();

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedUser(null);
      setPermissions({ projectPermissions: [], scopePermissions: {} });
    }
  }, [open]);

  useEffect(() => {
    if (selectedUser && availableUsers) {
      const stillAvailable = availableUsers.find((u) => u.userId === selectedUser.userId);
      if (!stillAvailable) setSelectedUser(null);
    }
  }, [availableUsers, selectedUser]);

  const handleInvite = async () => {
    if (!selectedUser) {
      toast.info('Please select a user to invite');
      return;
    }

    const totalPermissions =
      permissions.projectPermissions.length +
      Object.values(permissions.scopePermissions).flat().length;

    if (totalPermissions === 0) {
      toast.info('Please assign at least one permission');
      return;
    }

    try {
      await inviteUser.mutateAsync({
        projectId,
        data: {
          userId: selectedUser.userId,
          projectPermissions:
            permissions.projectPermissions.length > 0 ? permissions.projectPermissions : undefined,
          scopePermissions:
            Object.keys(permissions.scopePermissions).length > 0
              ? permissions.scopePermissions
              : undefined,
        },
      });
      toast.success('user', 'invited');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'invite', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button>Invite User</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite User to Project</DialogTitle>
          <DialogDescription>
            Select a user and assign their permissions for this project.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Select User</Label>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search users..."
              isLoading={isFetching}
            />
            <div className="border rounded-lg overflow-hidden">
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground gap-2">
                  <InlineSpinner />
                  <span className="text-sm">Loading users...</span>
                </div>
              ) : !availableUsers || availableUsers.length === 0 ? (
                <div className="py-6 text-center text-sm text-muted-foreground">
                  {debouncedSearch
                    ? 'No users found matching your search.'
                    : 'All users are already members of this project.'}
                </div>
              ) : (
                <ul className="max-h-48 overflow-y-auto divide-y divide-border">
                  {availableUsers.map((user) => {
                    const isSelected = selectedUser?.userId === user.userId;
                    return (
                      <li key={user.userId}>
                        <button
                          type="button"
                          onClick={() => setSelectedUser(isSelected ? null : user)}
                          className={`w-full flex items-center justify-between px-3 py-2.5 text-sm text-left transition-colors hover:bg-muted/50 ${
                            isSelected ? 'bg-muted' : ''
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-medium">{user.username}</span>
                            <span className="text-muted-foreground">— {user.fullName}</span>
                          </div>
                          {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>

          {/* Permission Editor */}
          {selectedUser && (
            <>
              <div className="border-t pt-4">
                <PermissionEditor
                  projectId={projectId}
                  value={permissions}
                  onChange={setPermissions}
                />
              </div>

              {permissions.projectPermissions.length === 0 &&
                Object.values(permissions.scopePermissions).flat().length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">No permissions selected</p>
                      <p className="mt-1">
                        Please assign at least one permission to invite this user.
                      </p>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setOpen(false)}
            disabled={inviteUser.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvite}
            disabled={!selectedUser || inviteUser.isPending}
          >
            {inviteUser.isPending ? 'Inviting...' : 'Invite User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
