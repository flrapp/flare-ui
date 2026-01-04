import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
import { AlertCircle } from 'lucide-react';
import { PermissionEditor } from './PermissionEditor';
import { useUpdateUserPermissions } from '@/entities/project-user';
import { useAuthStore } from '@/shared/stores/authStore';
import { ProjectPermission } from '@/shared/types/entities';
import type { ProjectUser } from '@/shared/types/entities';
import type { ProblemDetails } from '@/shared/types/auth';

interface EditUserPermissionsDialogProps {
  projectId: string;
  user: ProjectUser;
  children?: React.ReactNode;
}

export function EditUserPermissionsDialog({ projectId, user, children }: EditUserPermissionsDialogProps) {
  const [open, setOpen] = useState(false);
  const [permissions, setPermissions] = useState<{
    projectPermissions: number[];
    scopePermissions: Record<string, number[]>;
  }>({
    projectPermissions: user.projectPermissions,
    scopePermissions: user.scopePermissions,
  });

  const updatePermissions = useUpdateUserPermissions();
  const currentUser = useAuthStore((state) => state.user);

  const isSelf = currentUser?.userId === user.userId;

  useEffect(() => {
    if (open) {
      setPermissions({
        projectPermissions: user.projectPermissions,
        scopePermissions: user.scopePermissions,
      });
    }
  }, [open, user]);

  const handleUpdate = async () => {
    // Validate: cannot remove ManageUsers from yourself
    if (isSelf && !permissions.projectPermissions.includes(ProjectPermission.ManageUsers)) {
      toast.error('You cannot remove the "Manage Users" permission from yourself');
      return;
    }

    const totalPermissions =
      permissions.projectPermissions.length + Object.values(permissions.scopePermissions).flat().length;

    if (totalPermissions === 0) {
      toast.error('Please assign at least one permission');
      return;
    }

    try {
      await updatePermissions.mutateAsync({
        projectId,
        userId: user.userId,
        data: {
          projectPermissions: permissions.projectPermissions,
          scopePermissions: permissions.scopePermissions,
        },
      });
      toast.success('Permissions updated successfully');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(problemDetails?.detail || problemDetails?.title || 'Failed to update permissions');
    }
  };

  const hasManageUsers = user.projectPermissions.includes(ProjectPermission.ManageUsers);
  const willLoseManageUsers =
    isSelf && hasManageUsers && !permissions.projectPermissions.includes(ProjectPermission.ManageUsers);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="outline">Edit Permissions</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit User Permissions</DialogTitle>
          <DialogDescription>
            Update permissions for {user.fullName} ({user.username})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <PermissionEditor projectId={projectId} value={permissions} onChange={setPermissions} />

          {willLoseManageUsers && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
              <div className="text-sm text-destructive">
                <p className="font-medium">Warning: Cannot remove your own access</p>
                <p className="mt-1">You cannot remove the "Manage Users" permission from yourself.</p>
              </div>
            </div>
          )}

          {permissions.projectPermissions.length === 0 &&
            Object.values(permissions.scopePermissions).flat().length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">No permissions selected</p>
                  <p className="mt-1">User must have at least one permission.</p>
                </div>
              </div>
            )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={updatePermissions.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={updatePermissions.isPending || willLoseManageUsers}>
            {updatePermissions.isPending ? 'Updating...' : 'Update Permissions'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
