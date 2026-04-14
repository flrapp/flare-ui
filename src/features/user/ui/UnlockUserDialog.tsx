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
import { ShieldOff } from 'lucide-react';
import { useUnlockUser } from '@/entities/user';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

interface UnlockUserDialogProps {
  user: UserResponseDto;
  children?: React.ReactNode;
}

export function UnlockUserDialog({ user, children }: UnlockUserDialogProps) {
  const [open, setOpen] = useState(false);
  const unlockUser = useUnlockUser();

  const handleUnlock = async () => {
    try {
      await unlockUser.mutateAsync(user.userId);
      toast.success('user', 'unlocked');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'unlock', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="outline">Unlock User</Button>}</DialogTrigger>
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={unlockUser.isPending}>
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
