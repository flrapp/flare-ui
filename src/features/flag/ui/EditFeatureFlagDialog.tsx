import { useState, useEffect } from 'react';
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
import { useUpdateFeatureFlag } from '@/entities/flag';
import type { FeatureFlag } from '@/shared/types';
import type { ProblemDetails } from '@/shared/types/auth';

const updateFeatureFlagSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(255, 'Name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
  key: z
      .string()
      .min(2, 'Key must be at least 2 character')
      .max(255, 'Key must not exceed 255 characters'),
});

type UpdateFeatureFlagFormData = z.infer<typeof updateFeatureFlagSchema>;

interface EditFeatureFlagDialogProps {
  flag: FeatureFlag;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export function EditFeatureFlagDialog({
  flag,
  open: controlledOpen,
  onOpenChange,
  children,
}: EditFeatureFlagDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const updateFlag = useUpdateFeatureFlag();

  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;

  const form = useForm<UpdateFeatureFlagFormData>({
    resolver: zodResolver(updateFeatureFlagSchema),
    defaultValues: {
      name: flag.name,
      description: flag.description || '',
      key: flag.key
    },
  });

  useEffect(() => {
    form.reset({
      name: flag.name,
      description: flag.description || '',
      key: flag.key
    });
  }, [flag, form]);

  const onSubmit = async (data: UpdateFeatureFlagFormData) => {
    try {
      await updateFlag.mutateAsync({
        flagId: flag.id,
        data: {
          name: data.name,
          description: data.description || null,
          key: data.key,
        },
      });
      toast.success('Feature flag updated successfully');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(
        problemDetails?.detail || problemDetails?.title || 'Failed to update feature flag'
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Feature Flag</DialogTitle>
          <DialogDescription>
            Update the name or description of this feature flag. The alias and values cannot be
            changed here.
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
                    A descriptive name for this flag (2-255 characters).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
                control={form.control}
                name="key"
                render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alias</FormLabel>
                      <FormControl>
                        <Input
                            placeholder="newDashboard" {...field}
                        />
                      </FormControl>
                      <FormDescription>A key to access this flag (2-225 characters)</FormDescription>
                      <FormMessage/>
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
                disabled={updateFlag.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateFlag.isPending}>
                {updateFlag.isPending ? 'Updating...' : 'Update Flag'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
