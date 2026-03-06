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
import { UserCheck } from 'lucide-react';
import { useActivateUser } from '@/entities/user';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

interface ActivateUserDialogProps {
  user: UserResponseDto;
  children?: React.ReactNode;
}

export function ActivateUserDialog({ user, children }: ActivateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const activateUser = useActivateUser();

  const handleActivate = async () => {
    try {
      await activateUser.mutateAsync(user.userId);
      toast.success('user', 'activated');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'activate', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="outline">Activate User</Button>}</DialogTrigger>
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
          <Button variant="outline" onClick={() => setOpen(false)} disabled={activateUser.isPending}>
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
