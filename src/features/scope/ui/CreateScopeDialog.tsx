import { useState } from 'react';
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useCreateScope } from '@/entities/scope/model/useScopes';
import type { ProblemDetails } from '@/shared/types/auth';

const createScopeSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
});

type CreateScopeFormData = z.infer<typeof createScopeSchema>;

interface CreateScopeDialogProps {
  projectId: string;
  children?: React.ReactNode;
}

export function CreateScopeDialog({ projectId, children }: CreateScopeDialogProps) {
  const [open, setOpen] = useState(false);
  const createScope = useCreateScope();

  const form = useForm<CreateScopeFormData>({
    resolver: zodResolver(createScopeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateScopeFormData) => {
    try {
      await createScope.mutateAsync({
        projectId,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });
      toast.success('scope', 'created');
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('scope', 'create', problemDetails?.detail || problemDetails?.title);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button>Create Scope</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Scope</DialogTitle>
          <DialogDescription>
            Create a new scope to organize feature flags by environment (e.g., dev, staging,
            production).
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Production" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for this scope (2-255 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Production environment"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this scope (max 1000 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createScope.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createScope.isPending}>
                {createScope.isPending ? 'Creating...' : 'Create Scope'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
