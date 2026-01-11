import { useParams, Link } from 'react-router-dom';
import { toast } from '@/shared/lib/toast';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { EditProjectDialog } from '@/features/project/ui/EditProjectDialog';
import { DeleteProjectDialog } from '@/features/project/ui/DeleteProjectDialog';
import { ApiKeySection } from '@/features/project/ui/ApiKeySection';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageLoader } from '@/shared/ui/PageLoader';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import {
  useArchiveProject,
  useUnarchiveProject,
} from '@/entities/project/model/useProjects';
import { ChevronLeft, Archive, ArchiveRestore, Settings, Pencil, Trash2 } from 'lucide-react';
import type { ProblemDetails } from '@/shared/types';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const {
    canPerformProjectAction,
    hasProjectPermission,
    isLoading: permissionsLoading,
  } = usePermissions(projectId);

  const archiveProject = useArchiveProject();
  const unarchiveProject = useUnarchiveProject();

  if (isLoading || permissionsLoading) {
    return <PageLoader message="Loading project..." />;
  }

  if (error || !project) {
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

  const handleArchiveToggle = async () => {
    try {
      if (project.isArchived) {
        await unarchiveProject.mutateAsync(project.id);
        toast.success('project', 'unarchived');
      } else {
        await archiveProject.mutateAsync(project.id);
        toast.success('project', 'archived');
      }
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      const action = project.isArchived ? 'unarchive' : 'archive';
      toast.error('project', action, problemDetails?.detail || problemDetails?.title);
    }
  };

  const canManageSettings = canPerformProjectAction(ProjectPermission.ManageProjectSettings);
  const canDelete = canPerformProjectAction(ProjectPermission.DeleteProject);
  const canViewApiKey = hasProjectPermission(ProjectPermission.ViewApiKey);
  const canRegenerateApiKey = canPerformProjectAction(ProjectPermission.RegenerateApiKey);

  return (
    <div className="p-8">
      <div className="mb-6">
        <Link to="/projects" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Projects
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {project.isArchived && <Badge variant="secondary">Archived</Badge>}
            </div>
            <p className="text-muted-foreground">
              {project.description || 'No description provided'}
            </p>
          </div>
          <div className="flex gap-2">
            {canManageSettings && (
              <EditProjectDialog project={project}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </EditProjectDialog>
            )}
            {canManageSettings && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveToggle}
                disabled={archiveProject.isPending || unarchiveProject.isPending}
              >
                {project.isArchived ? (
                  <>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Unarchive
                  </>
                ) : (
                  <>
                    <Archive className="h-4 w-4 mr-2" />
                    Archive
                  </>
                )}
              </Button>
            )}
            {canDelete && (
              <DeleteProjectDialog project={project}>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </DeleteProjectDialog>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Project Alias</CardTitle>
          </CardHeader>
          <CardContent>
            <code className="text-lg font-mono bg-muted px-2 py-1 rounded">
              {project.alias}
            </code>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              {new Date(project.updatedAt).toLocaleDateString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <ApiKeySection
          project={project}
          canView={canViewApiKey}
          canRegenerate={canRegenerateApiKey}
        />

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Manage scopes, feature flags, and team members for this project.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to={`/projects/${project.id}/scopes`}>
                <Settings className="h-6 w-6 mb-2" />
                Manage Scopes
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to={`/projects/${project.id}/flags`}>
                <Settings className="h-6 w-6 mb-2" />
                Feature Flags
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col" asChild>
              <Link to={`/projects/${project.id}/users`}>
                <Settings className="h-6 w-6 mb-2" />
                Team Members
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
