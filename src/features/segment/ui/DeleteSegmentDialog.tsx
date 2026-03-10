import { toast } from '@/shared/lib/toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/ui/alert-dialog';
import { useDeleteSegment } from '@/entities/segment';
import type { Segment } from '@/entities/segment';
import type { ProblemDetails } from '@/shared/types/auth';

interface DeleteSegmentDialogProps {
  segment: Segment;
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteSegmentDialog({
  segment,
  projectId,
  open,
  onOpenChange,
}: DeleteSegmentDialogProps) {
  const deleteSegment = useDeleteSegment();

  const handleDelete = async () => {
    try {
      await deleteSegment.mutateAsync({ projectId, segmentId: segment.id });
      toast.success('segment', 'deleted');
      onOpenChange(false);
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('segment', 'delete', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{segment.name}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>This action cannot be undone.</p>
              <p className="font-medium text-destructive">
                Warning: If this segment is used in targeting rules, deleting it will remove all
                associated conditions from those rules.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleteSegment.isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteSegment.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteSegment.isPending ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
