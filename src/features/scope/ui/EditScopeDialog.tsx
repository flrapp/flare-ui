import { useState, useEffect } from 'react';
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
import { useUpdateScope } from '@/entities/scope/model/useScopes';
import type { Scope, ProblemDetails } from '@/shared/types';

const updateScopeSchema = z.object({
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

type UpdateScopeFormData = z.infer<typeof updateScopeSchema>;

interface EditScopeDialogProps {
  scope: Scope;
  children?: React.ReactNode;
}

export function EditScopeDialog({ scope, children }: EditScopeDialogProps) {
  const [open, setOpen] = useState(false);
  const updateScope = useUpdateScope();

  const form = useForm<UpdateScopeFormData>({
    resolver: zodResolver(updateScopeSchema) as Resolver<UpdateScopeFormData>,
    defaultValues: {
      name: scope.name,
      description: scope.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: scope.name,
        description: scope.description || '',
      });
    }
  }, [open, scope, form]);

  const onSubmit = async (data: UpdateScopeFormData) => {
    try {
      await updateScope.mutateAsync({
        scopeId: scope.id,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });
      toast.success('scope', 'updated');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('scope', 'update', problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Edit Scope</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Scope</DialogTitle>
          <DialogDescription>Update the scope's name and description.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Scope Alias</label>
              <code className="block bg-muted px-3 py-2 rounded text-sm font-mono">
                {scope.alias}
              </code>
              <p className="text-xs text-muted-foreground">
                The alias is auto-generated and cannot be changed.
              </p>
            </div>
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
                disabled={updateScope.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateScope.isPending}>
                {updateScope.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
