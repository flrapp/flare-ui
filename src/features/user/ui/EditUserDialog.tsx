import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
  DialogTrigger,
} from '@/shared/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';
import { AlertCircle } from 'lucide-react';
import { useUpdateUser } from '@/entities/user';
import { GlobalRole } from '@/shared/types/entities';
import type { UserResponseDto } from '@/shared/types/dtos';
import type { ProblemDetails } from '@/shared/types/auth';

const updateUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(255, 'Full name must not exceed 255 characters'),
  globalRole: z.nativeEnum(GlobalRole),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface EditUserDialogProps {
  user: UserResponseDto;
  children?: React.ReactNode;
}

export function EditUserDialog({ user, children }: EditUserDialogProps) {
  const [open, setOpen] = useState(false);
  const updateUser = useUpdateUser();

  const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      fullName: user.fullName,
      globalRole: user.globalRole,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        fullName: user.fullName,
        globalRole: user.globalRole,
      });
    }
  }, [open, user, form]);

  const onSubmit = async (data: UpdateUserFormData) => {
    try {
      await updateUser.mutateAsync({
        userId: user.userId,
        data: {
          fullName: data.fullName,
          globalRole: data.globalRole,
        },
      });
      toast.success('user', 'updated');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('user', 'update', problemDetails?.detail || problemDetails?.title);
    }
  };

  const isChangingToAdmin = form.watch('globalRole') === GlobalRole.Admin && user.globalRole !== GlobalRole.Admin;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children || <Button variant="outline">Edit User</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update user information and permissions.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <div className="mt-1.5">
                <code className="text-sm bg-muted px-2 py-1 rounded">{user.username}</code>
                <p className="text-sm text-muted-foreground mt-1">Username cannot be changed</p>
              </div>
            </div>
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="globalRole"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Global Role</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={GlobalRole.User.toString()}>User</SelectItem>
                      <SelectItem value={GlobalRole.Admin.toString()}>Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isChangingToAdmin && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Warning: Granting Admin Access</p>
                  <p className="mt-1">
                    This user will have full system access, including the ability to manage all users and projects.
                  </p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={updateUser.isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateUser.isPending}>
                {updateUser.isPending ? 'Updating...' : 'Update User'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
