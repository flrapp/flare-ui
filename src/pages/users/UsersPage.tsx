import { useParams, Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
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
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading team members..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
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
      <div className="p-8">
        <div className="mb-6">
          <Link to={`/projects/${projectId}`}>
            <Button variant="ghost" size="sm" className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              Back to Project
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Team Members</h1>
            <p className="text-muted-foreground mt-1">
              {project?.name} - Manage project team and permissions
            </p>
          </div>
        </div>
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
    <div className="p-8">
      <div className="mb-6">
        <Link to={`/projects/${projectId}`}>
          <Button variant="ghost" size="sm" className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Back to Project
          </Button>
        </Link>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground mt-1">
            {project?.name} - {users.length} {users.length === 1 ? 'member' : 'members'}
          </p>
        </div>
        {canManageUsers && (
          <InviteUserDialog projectId={projectId!}>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite User
            </Button>
          </InviteUserDialog>
        )}
      </div>
      <ProjectUsersTable projectId={projectId!} users={users} canManageUsers={canManageUsers} />
    </div>
  );
}
