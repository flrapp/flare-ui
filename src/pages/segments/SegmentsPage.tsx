import { useParams } from 'react-router-dom';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { SegmentsList } from '@/widgets/segments/SegmentsList';
import { PageHeader } from '@/shared/ui/page-header';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';

export function SegmentsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { canPerformProjectAction, isLoading: permissionsLoading } = usePermissions(projectId);

  if (isLoading || permissionsLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="space-y-1.5">
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <TableSkeleton rows={5} columns={3} />
      </div>
    );
  }

  if (error || !project || !projectId) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="Failed to load project"
          message="There was an error loading the project. Please try again."
          retry={() => refetch()}
        />
      </div>
    );
  }

  const canManage = canPerformProjectAction(ProjectPermission.ManageSegments);

  return (
    <div className="p-8">
      <PageHeader
        title="Segments"
        subtitle={`Manage segments for ${project.name}`}
        backTo={`/projects/${projectId}`}
      />
      <SegmentsList projectId={projectId} canManage={canManage} />
    </div>
  );
}
