import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProject } from '@/entities/project/model/useProjects';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { FeatureFlagsTable } from '@/widgets/flags/FeatureFlagsTable';
import { CreateFeatureFlagDialog } from '@/features/flag/ui/CreateFeatureFlagDialog';
import { DeleteFeatureFlagDialog } from '@/features/flag/ui/DeleteFeatureFlagDialog';
import { PageLoader } from '@/shared/ui/PageLoader';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { ChevronLeft } from 'lucide-react';
import type { FeatureFlag } from '@/shared/types';

export function FlagsPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { data: project, isLoading, error, refetch } = useProject(projectId);
  const { permissions, canPerformProjectAction, isLoading: permissionsLoading } =
    usePermissions(projectId);

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deletingFlag, setDeletingFlag] = useState<FeatureFlag | null>(null);

  if (isLoading || permissionsLoading) {
    return <PageLoader message="Loading feature flags..." />;
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

  const canManageFlags = canPerformProjectAction(ProjectPermission.ManageFeatureFlags);

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
          <h1 className="text-3xl font-bold">Feature Flags</h1>
          <p className="text-muted-foreground mt-1">Manage feature flags for {project.name}</p>
        </div>
      </div>

      <FeatureFlagsTable
        projectId={projectId}
        permissions={permissions}
        canManageFlags={canManageFlags}
        onCreateFlag={() => setCreateDialogOpen(true)}
        onEditFlag={(flag) => navigate(`/projects/${projectId}/flags/${flag.id}/edit`)}
        onDeleteFlag={(flag) => setDeletingFlag(flag)}
      />

      {/* Create Dialog */}
      <CreateFeatureFlagDialog
        projectId={projectId}
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/* Delete Dialog */}
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
