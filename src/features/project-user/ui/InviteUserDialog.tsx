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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { Label } from '@/shared/ui/label';
import { AlertCircle } from 'lucide-react';
import { PermissionEditor } from './PermissionEditor';
import { useAvailableUsers, useInviteUser } from '@/entities/project-user';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import type { ProblemDetails } from '@/shared/types/auth';

interface InviteUserDialogProps {
  projectId: string;
  children?: React.ReactNode;
}

export function InviteUserDialog({ projectId, children }: InviteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [permissions, setPermissions] = useState<{
    projectPermissions: number[];
    scopePermissions: Record<string, number[]>;
  }>({
    projectPermissions: [],
    scopePermissions: {},
  });

  const { data: availableUsers, isLoading: isLoadingUsers } = useAvailableUsers(projectId);
  const inviteUser = useInviteUser();

  useEffect(() => {
    if (!open) {
      setSelectedUserId('');
      setPermissions({
        projectPermissions: [],
        scopePermissions: {},
      });
    }
  }, [open]);

  const handleInvite = async () => {
    if (!selectedUserId) {
      toast.info('Please select a user to invite');
      return;
    }

    const totalPermissions =
      permissions.projectPermissions.length + Object.values(permissions.scopePermissions).flat().length;

    if (totalPermissions === 0) {
      toast.info('Please assign at least one permission');
      return;
    }

    try {
      await inviteUser.mutateAsync({
        projectId,
        data: {
          userId: selectedUserId,
          projectPermissions: permissions.projectPermissions.length > 0 ? permissions.projectPermissions : undefined,
          scopePermissions:
            Object.keys(permissions.scopePermissions).length > 0 ? permissions.scopePermissions : undefined,
        },
      });
      toast.success('user', 'invited');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'invite', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  const nonMembers = availableUsers?.filter((user) => !user.isAlreadyMember) || [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button>Invite User</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Invite User to Project</DialogTitle>
          <DialogDescription>Select a user and assign their permissions for this project.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Selection */}
          <div className="space-y-2">
            <Label>Select User</Label>
            {isLoadingUsers ? (
              <div className="py-4">
                <LoadingSpinner text="Loading users..." />
              </div>
            ) : nonMembers.length === 0 ? (
              <div className="border rounded-lg p-4 text-center text-muted-foreground">
                <p className="text-sm">All users are already members of this project.</p>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a user to invite" />
                </SelectTrigger>
                <SelectContent>
                  {nonMembers.map((user) => (
                    <SelectItem key={user.userId} value={user.userId}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{user.username}</span>
                        <span className="text-muted-foreground">- {user.fullName}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Permission Editor */}
          {selectedUserId && (
            <>
              <div className="border-t pt-4">
                <PermissionEditor projectId={projectId} value={permissions} onChange={setPermissions} />
              </div>

              {permissions.projectPermissions.length === 0 &&
                Object.values(permissions.scopePermissions).flat().length === 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      <p className="font-medium">No permissions selected</p>
                      <p className="mt-1">Please assign at least one permission to invite this user.</p>
                    </div>
                  </div>
                )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={inviteUser.isPending}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={!selectedUserId || inviteUser.isPending || nonMembers.length === 0}>
            {inviteUser.isPending ? 'Inviting...' : 'Invite User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
