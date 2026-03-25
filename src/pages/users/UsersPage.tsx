import { useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { InviteUserDialog } from '@/features/project-user';
import { ProjectUsersTable } from '@/widgets/project-users';
import { useProjectUsers } from '@/entities/project-user';
import { useProject } from '@/entities/project';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { UserPlus } from 'lucide-react';

export function UsersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { data: users, isLoading: isLoadingUsers, error, refetch } = useProjectUsers(projectId);
  const { canPerformProjectAction } = usePermissions(projectId);

  const canManageUsers = canPerformProjectAction(ProjectPermission.ManageUsers);

  if (isLoadingProject || isLoadingUsers) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
          <Skeleton className="h-9 w-28" />
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <ErrorMessage
          title="Failed to load team members"
          message="There was an error loading the project team members. Please try again."
          retry={() => refetch()}
        />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <PageHeader
          title="Team Members"
          subtitle={project?.name}
          backTo={`/projects/${projectId}`}
        />
        <EmptyState
          icon={<UserPlus className="h-16 w-16" />}
          title="No team members yet"
          description="Invite users to collaborate on this project and assign their permissions."
          action={
            canManageUsers ? (
              <InviteUserDialog projectId={projectId!}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </InviteUserDialog>
            ) : undefined
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <PageHeader
        title="Team Members"
        subtitle={project?.name}
        backTo={`/projects/${projectId}`}
        actions={
          canManageUsers ? (
            <InviteUserDialog projectId={projectId!}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Invite User
              </Button>
            </InviteUserDialog>
          ) : undefined
        }
      />
      <ProjectUsersTable projectId={projectId!} users={users} canManageUsers={canManageUsers} />
    </div>
  );
}
