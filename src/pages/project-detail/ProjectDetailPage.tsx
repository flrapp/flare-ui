import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from '@/shared/lib/toast';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { CreateFeatureFlagDialog } from '@/features/flag/ui/CreateFeatureFlagDialog';
import { EditFeatureFlagDialog } from '@/features/flag/ui/EditFeatureFlagDialog';
import { DeleteFeatureFlagDialog } from '@/features/flag/ui/DeleteFeatureFlagDialog';
import { FeatureFlagsTable } from '@/widgets/flags/FeatureFlagsTable';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { PageLoader } from '@/shared/ui/PageLoader';
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
  ChevronLeft,
  Archive,
  ArchiveRestore,
  Settings,
  Users,
  Shield,
  Plus,
} from 'lucide-react';
import type { ProblemDetails, FeatureFlag } from '@/shared/types';

export function ProjectDetailPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const {
    canPerformProjectAction,
    permissions,
    isLoading: permissionsLoading,
  } = usePermissions(projectId);

  const archiveProject = useArchiveProject();
  const unarchiveProject = useUnarchiveProject();

  const [showCreateFlagDialog, setShowCreateFlagDialog] = useState(false);
  const [editingFlag, setEditingFlag] = useState<FeatureFlag | null>(null);
  const [deletingFlag, setDeletingFlag] = useState<FeatureFlag | null>(null);

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
      toast.error('project', action, problemDetails?.detail ?? problemDetails?.title ?? undefined);
    }
  };

  const canManageSettings = canPerformProjectAction(ProjectPermission.ManageProjectSettings);
  const canManageFlags = canPerformProjectAction(ProjectPermission.ManageFeatureFlags);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button variant="ghost" size="sm" className="gap-2" asChild>
                <Link to="/projects">
                  <ChevronLeft className="size-4" />
                  Back to Projects
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-sm text-muted-foreground">
              {project.description || 'No description provided'}
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
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
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Feature Toggles Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feature Toggles</CardTitle>
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
              onEditFlag={(flag) => setEditingFlag(flag)}
              onDeleteFlag={(flag) => setDeletingFlag(flag)}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <CreateFeatureFlagDialog
        projectId={project.id}
        open={showCreateFlagDialog}
        onOpenChange={setShowCreateFlagDialog}
      />

      {editingFlag && (
        <EditFeatureFlagDialog
          flag={editingFlag}
          open={!!editingFlag}
          onOpenChange={(open) => !open && setEditingFlag(null)}
        />
      )}

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
