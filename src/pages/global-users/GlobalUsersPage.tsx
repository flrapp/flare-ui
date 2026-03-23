import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '@/shared/ui/skeleton';
import { TableSkeleton } from '@/shared/ui/TableSkeleton';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { CreateUserDialog } from '@/features/user';
import { GlobalUsersTable } from '@/widgets/users';
import { useUsers } from '@/entities/user';
import { useAuthStore } from '@/shared/stores/authStore';
import { GlobalRole } from '@/shared/types/entities';
import { UserPlus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';

type ActiveFilter = 'all' | 'active' | 'inactive';

function filterToParam(filter: ActiveFilter): boolean | undefined {
  if (filter === 'active') return true;
  if (filter === 'inactive') return false;
  return undefined;
}

export function GlobalUsersPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('all');
  const { data: users, isLoading, error, refetch } = useUsers(filterToParam(activeFilter));

  useEffect(() => {
    if (user && user.globalRole !== GlobalRole.Admin) {
      navigate('/projects', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="space-y-1.5">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-44" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
        <TableSkeleton rows={5} columns={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto p-8">
        <ErrorMessage
          title="Failed to load users"
          message="There was an error loading the user list. Please try again."
          retry={() => refetch()}
        />
      </div>
    );
  }

  const isFiltered = activeFilter !== 'all';
  const userList = users ?? [];

  const emptyNode = (
    <EmptyState
      icon={<UserPlus className="h-16 w-16" />}
      title={isFiltered ? `No ${activeFilter} users` : 'No users yet'}
      description={
        isFiltered
          ? `There are no ${activeFilter} users. Try a different filter.`
          : 'Get started by creating your first user account.'
      }
      action={
        !isFiltered ? (
          <CreateUserDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </CreateUserDialog>
        ) : undefined
      }
    />
  );

  return (
    <div className="max-w-5xl mx-auto p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">User Management</h1>
          <p className="text-sm text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <div className="flex items-center gap-3">
          <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as ActiveFilter)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="inactive">Inactive</TabsTrigger>
            </TabsList>
          </Tabs>
          <CreateUserDialog>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </CreateUserDialog>
        </div>
      </div>
      <GlobalUsersTable users={userList} emptyNode={emptyNode} />
    </div>
  );
}
