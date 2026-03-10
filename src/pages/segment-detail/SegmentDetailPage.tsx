import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ChevronLeft, Trash2 } from 'lucide-react';
import { toast } from '@/shared/lib/toast';
import { useSegmentById, useUpdateSegment } from '@/entities/segment';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { PageLoader } from '@/shared/ui/PageLoader';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/ui/form';
import { Input } from '@/shared/ui/input';
import { SegmentMembersSection } from '@/features/segment/ui/SegmentMembersSection';
import { DeleteSegmentDialog } from '@/features/segment/ui/DeleteSegmentDialog';
import type { ProblemDetails } from '@/shared/types/auth';

const segmentSchema = z.object({
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

type SegmentFormData = z.infer<typeof segmentSchema>;

export function SegmentDetailPage() {
  const { projectId, segmentId } = useParams<{ projectId: string; segmentId: string }>();
  const { data: segment, isLoading, error } = useSegmentById(projectId, segmentId);
  const { canPerformProjectAction, isLoading: permissionsLoading } = usePermissions(projectId);
  const updateSegment = useUpdateSegment();

  const [deleteOpen, setDeleteOpen] = useState(false);

  const form = useForm<SegmentFormData>({
    resolver: zodResolver(segmentSchema) as Resolver<SegmentFormData>,
    defaultValues: { name: '', description: '' },
  });

  useEffect(() => {
    if (segment) {
      form.reset({ name: segment.name, description: segment.description ?? '' });
    }
  }, [segment, form]);

  if (isLoading || permissionsLoading) {
    return <PageLoader message="Loading segment..." />;
  }

  if (error || !segment || !segmentId || !projectId) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="Failed to load segment"
          message="The segment could not be found or there was an error loading it."
        />
      </div>
    );
  }

  const canManage = canPerformProjectAction(ProjectPermission.ManageSegments);

  const onSubmit = async (data: SegmentFormData) => {
    try {
      await updateSegment.mutateAsync({
        projectId,
        segmentId,
        data: { name: data.name, description: data.description || null },
      });
      toast.success('segment', 'updated');
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('segment', 'update', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <Link
        to={`/projects/${projectId}/segments`}
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to Segments
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{segment.name}</h1>
        {canManage && (
          <Button variant="destructive" size="sm" onClick={() => setDeleteOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </div>

      {/* Edit form */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Beta Users" {...field} disabled={!canManage} />
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
                        disabled={!canManage}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {canManage && (
                <div className="flex justify-end">
                  <Button type="submit" disabled={updateSegment.isPending}>
                    {updateSegment.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Members */}
      <Card>
        <CardContent className="pt-6">
          <SegmentMembersSection segmentId={segmentId} canManage={canManage} />
        </CardContent>
      </Card>

      <DeleteSegmentDialog
        segment={segment}
        projectId={projectId}
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
      />
    </div>
  );
}
