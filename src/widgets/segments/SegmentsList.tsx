import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { useSegments } from '@/entities/segment';
import { CreateSegmentDialog } from '@/features/segment/ui/CreateSegmentDialog';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Badge } from '@/shared/ui/badge';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';

interface SegmentsListProps {
  projectId: string;
  canManage: boolean;
}

export function SegmentsList({ projectId, canManage }: SegmentsListProps) {
  const navigate = useNavigate();
  const { data: segments, isLoading, error, refetch } = useSegments(projectId);

  const [createOpen, setCreateOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <LoadingSpinner text="Loading segments..." />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load segments"
        message="There was an error loading segments. Please try again."
        retry={() => refetch()}
      />
    );
  }

  if (!segments || segments.length === 0) {
    return (
      <>
        <EmptyState
          icon={<Users className="h-16 w-16" />}
          title="No segments yet"
          description="Create segments to group users or entities for use in targeting rules."
          action={
            canManage ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Segment
              </Button>
            ) : undefined
          }
        />
        {canManage && (
          <CreateSegmentDialog
            projectId={projectId}
            open={createOpen}
            onOpenChange={setCreateOpen}
          />
        )}
      </>
    );
  }

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Segment
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate(`/projects/${projectId}/segments/${segment.id}`)}
          >
            <CardContent className="pt-5 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{segment.name}</p>
                  {segment.description && (
                    <p className="text-sm text-muted-foreground truncate mt-0.5">
                      {segment.description}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {segment.memberCount} {segment.memberCount === 1 ? 'member' : 'members'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                Created {new Date(segment.createdAt).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {canManage && (
        <CreateSegmentDialog
          projectId={projectId}
          open={createOpen}
          onOpenChange={setCreateOpen}
        />
      )}
    </div>
  );
}
