import { useState } from 'react';
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
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { AlertCircle } from 'lucide-react';
import { useDeleteUser } from '@/entities/user';
import { useAuthStore } from '@/shared/stores/authStore';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

interface DeleteUserDialogProps {
  user: UserResponseDto;
  children?: React.ReactNode;
}

export function DeleteUserDialog({ user, children }: DeleteUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');
  const deleteUser = useDeleteUser();
  const currentUser = useAuthStore((state) => state.user);

  const isConfirmValid = confirmUsername === user.username;
  const isSelf = currentUser?.userId === user.userId;

  const handleDelete = async () => {
    if (!isConfirmValid) return;

    try {
      await deleteUser.mutateAsync(user.userId);
      toast.success('User deleted successfully');
      setOpen(false);
      setConfirmUsername('');
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(problemDetails?.detail || problemDetails?.title || 'Failed to delete user');
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
      <DialogTrigger asChild>{children || <Button variant="destructive">Delete User</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            Delete User
          </DialogTitle>
          <DialogDescription>
            This action cannot be undone. This will permanently delete the user account and remove them from all
            projects.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">The following will be deleted:</p>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>User account and credentials</li>
              <li>All project memberships and permissions</li>
              <li>User activity history</li>
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
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={deleteUser.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={!isConfirmValid || deleteUser.isPending}>
            {deleteUser.isPending ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
