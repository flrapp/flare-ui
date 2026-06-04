import { toast } from '@/shared/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { UserCheck } from 'lucide-react';
import { useActivateUser } from '@/entities/user';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

interface ActivateUserDialogProps {
  user: UserResponseDto;
  open: boolean;
  onClose: () => void;
}

export function ActivateUserDialog({ user, open, onClose }: ActivateUserDialogProps) {
  const activateUser = useActivateUser();

  const handleActivate = async () => {
    try {
      await activateUser.mutateAsync(user.userId);
      toast.success('user', 'activated');
      onClose();
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'activate', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Activate User
          </DialogTitle>
          <DialogDescription>
            Activate <strong>{user.username}</strong>? They will regain access to the system immediately.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={activateUser.isPending}>
            Cancel
          </Button>
          <Button onClick={handleActivate} disabled={activateUser.isPending}>
            {activateUser.isPending ? 'Activating...' : 'Activate'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
