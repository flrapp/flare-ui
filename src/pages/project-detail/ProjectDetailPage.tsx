import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from '@/shared/lib/toast';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { CreateFeatureFlagDialog } from '@/features/flag/ui/CreateFeatureFlagDialog';
import { DeleteFeatureFlagDialog } from '@/features/flag/ui/DeleteFeatureFlagDialog';
import { DeleteProjectDialog } from '@/features/project/ui/DeleteProjectDialog';
import { FeatureFlagsTable } from '@/widgets/flags/FeatureFlagsTable';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageHeader } from '@/shared/ui/page-header';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import {
  useArchiveProject,
  useUnarchiveProject,
} from '@/entities/project/model/useProjects';
import {
  Archive,
  ArchiveRestore,
  Settings,
  Users,
  Shield,
  Plus,
  Trash2,
  Layers,
} from 'lucide-react';
import type { ProblemDetails, FeatureFlag } from '@/shared/types';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const {
    canPerformProjectAction,
    permissions,
    isLoading: permissionsLoading,
  } = usePermissions(projectId);

  const archiveProject = useArchiveProject();
  const unarchiveProject = useUnarchiveProject();

  const [showCreateFlagDialog, setShowCreateFlagDialog] = useState(false);
  const [showDeleteProjectDialog, setShowDeleteProjectDialog] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState<FeatureFlag | null>(null);

  if (isLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-36" />
              <Skeleton className="h-9 w-56" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-9 w-28" />
          </div>
          <div className="border rounded-lg">
            <div className="flex items-center justify-between p-6 pb-4">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-9 w-32" />
            </div>
            <div className="px-6 pb-6">
              <TableSkeleton rows={5} columns={5} />
            </div>
          </div>
        </div>
      </div>
    );
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
      toast.error('project', action, problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  const canManageSettings = canPerformProjectAction(ProjectPermission.ManageProjectSettings);
  const canManageFlags = canPerformProjectAction(ProjectPermission.ManageFeatureFlags);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6">
        <PageHeader
          title={project.name}
          subtitle={project.description || 'No description provided'}
          backLink={{ href: '/projects', label: 'Back to Projects' }}
          actions={
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  <Settings className="size-4 mr-2" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link to={`/projects/${project.id}/users`}>
                    <Users className="size-4 mr-2" />
                    Team Management
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/projects/${project.id}/scopes`}>
                    <Shield className="size-4 mr-2" />
                    Scope Management
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to={`/projects/${project.id}/segments`}>
                    <Layers className="size-4 mr-2" />
                    Segments
                  </Link>
                </DropdownMenuItem>
                {canManageSettings && <DropdownMenuSeparator />}
                {canManageSettings && (
                  <DropdownMenuItem asChild>
                    <Link to={`/projects/${project.id}/settings`}>
                      <Settings className="size-4 mr-2" />
                      Project Settings
                    </Link>
                  </DropdownMenuItem>
                )}
                {canManageSettings && <DropdownMenuSeparator />}
                {canManageSettings && (
                  <DropdownMenuItem
                    onClick={handleArchiveToggle}
                    disabled={archiveProject.isPending || unarchiveProject.isPending}
                    className={project.isArchived ? '' : 'text-destructive'}
                  >
                    {project.isArchived ? (
                      <>
                        <ArchiveRestore className="size-4 mr-2" />
                        Unarchive Project
                      </>
                    ) : (
                      <>
                        <Archive className="size-4 mr-2" />
                        Archive Project
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {canManageSettings && project.isArchived && <DropdownMenuSeparator />}
                {canManageSettings && project.isArchived && (
                  <DropdownMenuItem
                    onClick={() => setShowDeleteProjectDialog(true)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="size-4 mr-2" />
                    Delete Project
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          }
        />

        {/* Feature Toggles Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium">Feature Toggles</CardTitle>
              </div>
              {canManageFlags && (
                <Button onClick={() => setShowCreateFlagDialog(true)}>
                  <Plus className="size-4 mr-2" />
                  New Feature
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <FeatureFlagsTable
              projectId={project.id}
              permissions={permissions}
              canManageFlags={canManageFlags}
              onEditFlag={(flag) => navigate(`/projects/${project.id}/flags/${flag.id}/edit`)}
              onDeleteFlag={(flag) => setDeletingFlag(flag)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <DeleteProjectDialog
        project={project}
        open={showDeleteProjectDialog}
        onOpenChange={setShowDeleteProjectDialog}
      />

      <CreateFeatureFlagDialog
        projectId={project.id}
        open={showCreateFlagDialog}
        onOpenChange={setShowCreateFlagDialog}
      />

      {deletingFlag && (
        <DeleteFeatureFlagDialog
          flag={deletingFlag}
          open={!!deletingFlag}
          onOpenChange={(open) => !open && setDeletingFlag(null)}
        />
      )}
    </div>
  );
}
