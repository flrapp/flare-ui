import { useState } from 'react';
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
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { AlertCircle } from 'lucide-react';
import { useRemoveUser } from '@/entities/project-user';
import { useAuthStore } from '@/shared/stores/authStore';
import type { ProjectUser } from '@/shared/types/entities';
import type { ProblemDetails } from '@/shared/types/auth';

interface RemoveUserDialogProps {
  projectId: string;
  user: ProjectUser;
  children?: React.ReactNode;
}

export function RemoveUserDialog({ projectId, user, children }: RemoveUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const removeUser = useRemoveUser();
  const currentUser = useAuthStore((state) => state.user);

  const isConfirmValid = confirmUsername === user.username;
  const isSelf = currentUser?.userId === user.userId;

  const handleRemove = async () => {
    if (!isConfirmValid) return;

    try {
      await removeUser.mutateAsync({
        projectId,
        userId: user.userId,
      });
      toast.success('user', 'removed from project');
      setOpen(false);
      setConfirmUsername('');
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'remove', problemDetails?.detail || problemDetails?.title);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setConfirmUsername('');
    }
  };

  if (isSelf) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children || <Button variant="destructive">Remove User</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Remove User from Project
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will remove {user.fullName} from the project and revoke all their
            permissions.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">The user will lose access to:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>All project resources and settings</li>
              <li>All feature flags and scopes</li>
              <li>Project-level and scope-level permissions</li>
            </ul>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">
              Type <code className="bg-muted px-1 py-0.5 rounded">{user.username}</code> to confirm:
            </label>
            <Input
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              placeholder={user.username}
              className={confirmUsername && !isConfirmValid ? 'border-destructive' : ''}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={removeUser.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRemove} disabled={!isConfirmValid || removeUser.isPending}>
            {removeUser.isPending ? 'Removing...' : 'Remove User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
