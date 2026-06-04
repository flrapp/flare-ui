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
import { ShieldOff } from 'lucide-react';
import { useUnlockUser } from '@/entities/user';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

interface UnlockUserDialogProps {
  user: UserResponseDto;
  open: boolean;
  onClose: () => void;
}

export function UnlockUserDialog({ user, open, onClose }: UnlockUserDialogProps) {
  const unlockUser = useUnlockUser();

  const handleUnlock = async () => {
    try {
      await unlockUser.mutateAsync(user.userId);
      toast.success('user', 'unlocked');
      onClose();
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'unlock', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldOff className="h-5 w-5" />
            Unlock User
          </DialogTitle>
          <DialogDescription>
            Unlock <strong>{user.username}</strong>? This will clear their brute force lock and reset failed login attempts.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={unlockUser.isPending}>
            Cancel
          </Button>
          <Button onClick={handleUnlock} disabled={unlockUser.isPending}>
            {unlockUser.isPending ? 'Unlocking...' : 'Unlock'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
