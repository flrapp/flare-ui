import { useParams, Link } from 'react-router-dom';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { ScopesList } from '@/widgets/scopes/ScopesList';
import { PageLoader } from '@/shared/ui/PageLoader';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { ChevronLeft } from 'lucide-react';

export function ScopesPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { canPerformProjectAction, isLoading: permissionsLoading } = usePermissions(projectId);

  if (isLoading || permissionsLoading) {
    return <PageLoader message="Loading scopes..." />;
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
    <div className="p-8">
      <div className="mb-6">
        <Link
          to={`/projects/${projectId}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to {project.name}
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Scopes</h1>
          <p className="text-muted-foreground mt-1">
            Manage scopes for {project.name}
          </p>
        </div>
      </div>

      <ScopesList projectId={projectId} canManage={canManageScopes} />
    </div>
  );
}
