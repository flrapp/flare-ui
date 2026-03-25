import { useParams } from 'react-router-dom';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { ScopesList } from '@/widgets/scopes/ScopesList';
import { CreateScopeDialog } from '@/features/scope/ui/CreateScopeDialog';
import { PageHeader } from '@/shared/ui/page-header';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { Plus } from 'lucide-react';

export function ScopesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { canPerformProjectAction, isLoading: permissionsLoading } = usePermissions(projectId);

  if (isLoading || permissionsLoading) {
    return (
      <div className="p-8">
        <div className="mb-6">
          <Skeleton className="h-4 w-36 mb-4" />
          <div className="space-y-1.5">
            <Skeleton className="h-9 w-28" />
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

  const canManageScopes = canPerformProjectAction(ProjectPermission.ManageScopes);

  return (
    <div className="p-8 max-w-5xl">
      <PageHeader
        title="Scopes"
        subtitle={`Manage scopes for ${project.name}`}
        backTo={`/projects/${projectId}`}
        actions={
          canManageScopes && (
            <CreateScopeDialog projectId={projectId}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Scope
              </Button>
            </CreateScopeDialog>
          )
        }
      />
      <ScopesList projectId={projectId} canManage={canManageScopes} />
    </div>
  );
}
