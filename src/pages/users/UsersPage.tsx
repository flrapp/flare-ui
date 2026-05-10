import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { PageHeader } from '@/shared/ui/page-header';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { SearchInput } from '@/shared/ui/SearchInput';
import { InviteUserDialog } from '@/features/project-user';
import { ProjectUsersTable } from '@/widgets/project-users';
import { useProject } from '@/entities/project';
import { usePermissions } from '@/shared/hooks/usePermissions';
import { ProjectPermission } from '@/shared/types/entities';
import { useDebounce } from '@/shared/lib/useDebounce';

export function UsersPage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { data: project, isLoading: isLoadingProject } = useProject(projectId);
  const { canPerformProjectAction } = usePermissions(projectId);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const canManageUsers = canPerformProjectAction(ProjectPermission.ManageUsers);

  if (isLoadingProject) {
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
      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search team members..."
          className="max-w-sm"
        />
      </div>
      <ProjectUsersTable
        projectId={projectId!}
        search={debouncedSearch}
        canManageUsers={canManageUsers}
      />
    </div>
  );
}
