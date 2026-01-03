import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { useCreateFeatureFlag } from '@/entities/flag';
import type { ProblemDetails } from '@/shared/types/auth';

const createFeatureFlagSchema = z.object({
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

type CreateFeatureFlagFormData = z.infer<typeof createFeatureFlagSchema>;

interface CreateFeatureFlagDialogProps {
  projectId: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function CreateFeatureFlagDialog({
  projectId,
  open: controlledOpen,
  onOpenChange,
  children,
}: CreateFeatureFlagDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const createFlag = useCreateFeatureFlag();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<CreateFeatureFlagFormData>({
    resolver: zodResolver(createFeatureFlagSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmit = async (data: CreateFeatureFlagFormData) => {
    try {
      await createFlag.mutateAsync({
        projectId,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });
      toast.success('Feature flag created successfully');
      setOpen(false);
      form.reset();
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(
        problemDetails?.detail || problemDetails?.title || 'Failed to create feature flag'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create New Feature Flag</DialogTitle>
          <DialogDescription>
            Create a new feature flag to control features across different environments. The flag
            will be initialized as disabled in all scopes.
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
                    <Input placeholder="New Dashboard" {...field} />
                  </FormControl>
                  <FormDescription>
                    A descriptive name for this flag (2-255 characters). An alias will be
                    auto-generated.
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
                      placeholder="Enables the new redesigned dashboard"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of what this flag controls (max 1000 characters).
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
                disabled={createFlag.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createFlag.isPending}>
                {createFlag.isPending ? 'Creating...' : 'Create Flag'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
