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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { Button } from '@/shared/ui/button';
import { useCreateSegment } from '@/entities/segment';
import type { ProblemDetails } from '@/shared/types/auth';

const createSegmentSchema = z.object({
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

type CreateSegmentFormData = z.infer<typeof createSegmentSchema>;

interface CreateSegmentDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateSegmentDialog({ projectId, open, onOpenChange }: CreateSegmentDialogProps) {
  const createSegment = useCreateSegment();

  const form = useForm<CreateSegmentFormData>({
    resolver: zodResolver(createSegmentSchema) as Resolver<CreateSegmentFormData>,
    defaultValues: { name: '', description: '' },
  });

  const onSubmit = async (data: CreateSegmentFormData) => {
    try {
      await createSegment.mutateAsync({
        projectId,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });
      toast.success('segment', 'created');
      onOpenChange(false);
      form.reset();
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('segment', 'create', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) form.reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Create Segment</DialogTitle>
          <DialogDescription>
            Segments let you group targeting keys for use in feature flag rules.
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
                    <Input placeholder="Beta Users" {...field} />
                  </FormControl>
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
                      placeholder="Users enrolled in the beta program"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => { form.reset(); onOpenChange(false); }}
                disabled={createSegment.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createSegment.isPending}>
                {createSegment.isPending ? 'Creating...' : 'Create Segment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
