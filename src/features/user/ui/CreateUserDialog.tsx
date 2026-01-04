import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
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
import { Copy, CheckCircle } from 'lucide-react';
import { useCreateUser } from '@/entities/user';
import { GlobalRole } from '@/shared/types/entities';
import type { ProblemDetails } from '@/shared/types/auth';

const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(100, 'Username must not exceed 100 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, hyphens, and underscores'),
  fullName: z.string().min(1, 'Full name is required').max(255, 'Full name must not exceed 255 characters'),
  temporaryPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
  globalRole: z.nativeEnum(GlobalRole),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;

interface CreateUserDialogProps {
  children?: React.ReactNode;
}

export function CreateUserDialog({ children }: CreateUserDialogProps) {
  const [open, setOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdPassword, setCreatedPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const createUser = useCreateUser();

  const form = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      fullName: '',
      temporaryPassword: '',
      globalRole: GlobalRole.User,
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    try {
      await createUser.mutateAsync(data);
      setCreatedPassword(data.temporaryPassword);
      setShowPassword(true);
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      if (error.response?.status === 409) {
        form.setError('username', {
          message: 'This username is already taken',
        });
      } else {
        toast.error(problemDetails?.detail || problemDetails?.title || 'Failed to create user');
      }
    }
  };

  const handleCopyPassword = async () => {
    if (createdPassword) {
      await navigator.clipboard.writeText(createdPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Password copied to clipboard');
    }
  };

  const handlePasswordAlertClose = () => {
    setShowPassword(false);
    setCreatedPassword(null);
    setCopied(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {children || <Button>Create User</Button>}
        </DialogTrigger>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
            <DialogDescription>
              Create a new user with a temporary password. The user will be required to change their password on first
              login.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="john_doe" {...field} />
                    </FormControl>
                    <FormDescription>
                      3-100 characters. Letters, numbers, hyphens, and underscores only.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                name="temporaryPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temporary Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter temporary password" {...field} />
                    </FormControl>
                    <FormDescription>Minimum 8 characters. User must change on first login.</FormDescription>
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
                    <FormDescription>Users have standard access. Admins have full system access.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={createUser.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createUser.isPending}>
                  {createUser.isPending ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showPassword} onOpenChange={handlePasswordAlertClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              User Created Successfully
            </AlertDialogTitle>
            <AlertDialogDescription>
              The user has been created. Please copy the temporary password and share it securely with the user. This
              password will not be shown again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <code className="text-sm font-mono">{createdPassword}</code>
              <Button size="sm" variant="outline" onClick={handleCopyPassword}>
                {copied ? 'Copied!' : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handlePasswordAlertClose}>I've copied the password</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
