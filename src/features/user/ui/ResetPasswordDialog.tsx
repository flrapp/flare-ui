import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from '@/shared/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useResetUserPassword } from '@/entities/user';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

const resetPasswordSchema = z.object({
  temporaryPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordDialogProps {
  user: UserResponseDto;
  open: boolean;
  onClose: () => void;
}

export function ResetPasswordDialog({ user, open, onClose }: ResetPasswordDialogProps) {
  const resetPassword = useResetUserPassword();

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema) as Resolver<ResetPasswordFormData>,
    defaultValues: { temporaryPassword: '' },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPassword.mutateAsync({ userId: user.userId, data: { temporaryPassword: data.temporaryPassword } });
      toast.success('password', 'reset');
      onClose();
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('password', 'reset', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reset Password</DialogTitle>
          <DialogDescription>
            Set a new temporary password for <strong>{user.username}</strong>.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="temporaryPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temporary Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter temporary password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={resetPassword.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={resetPassword.isPending}>
                {resetPassword.isPending ? 'Resetting...' : 'Reset Password'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
