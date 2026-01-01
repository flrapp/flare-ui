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
import { useUpdateProject } from '@/entities/project/model/useProjects';
import type { ProjectDetail, ProblemDetails } from '@/shared/types';

const updateProjectSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must not exceed 255 characters'),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .nullable(),
});

type UpdateProjectFormData = z.infer<typeof updateProjectSchema>;

interface EditProjectDialogProps {
  project: ProjectDetail;
  children?: React.ReactNode;
}

export function EditProjectDialog({ project, children }: EditProjectDialogProps) {
  const [open, setOpen] = useState(false);
  const updateProject = useUpdateProject();

  const form = useForm<UpdateProjectFormData>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      name: project.name,
      description: project.description || '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project.name,
        description: project.description || '',
      });
    }
  }, [open, project, form]);

  const onSubmit = async (data: UpdateProjectFormData) => {
    try {
      await updateProject.mutateAsync({
        id: project.id,
        data: {
          name: data.name,
          description: data.description || null,
        },
      });
      toast.success('Project updated successfully');
      setOpen(false);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error(problemDetails?.detail || problemDetails?.title || 'Failed to update project');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || <Button variant="outline">Edit Project</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Update your project's name and description.
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
                    <Input placeholder="My Project" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique name for your project (3-255 characters).
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
                      placeholder="Project description"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief description of this project (max 1000 characters).
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
                disabled={updateProject.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
