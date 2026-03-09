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
import { Button } from '@/shared/ui/button';
import { UserX } from 'lucide-react';
import { useDeactivateUser } from '@/entities/user';
import { useAuthStore } from '@/shared/stores/authStore';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

interface DeactivateUserDialogProps {
  user: UserResponseDto;
  children?: React.ReactNode;
}

export function DeactivateUserDialog({ user, children }: DeactivateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const deactivateUser = useDeactivateUser();
  const currentUser = useAuthStore((state) => state.user);

  const isSelf = currentUser?.userId === user.userId;

  const handleDeactivate = async () => {
    try {
      await deactivateUser.mutateAsync(user.userId);
      toast.success('user', 'deactivated');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'deactivate', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  if (isSelf) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="outline">Deactivate User</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserX className="h-5 w-5" />
            Deactivate User
          </DialogTitle>
          <DialogDescription>
            Deactivate <strong>{user.username}</strong>? They will lose access to the system immediately but their
            account and data will be preserved.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={deactivateUser.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeactivate} disabled={deactivateUser.isPending}>
            {deactivateUser.isPending ? 'Deactivating...' : 'Deactivate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
