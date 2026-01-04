import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { EmptyState } from '@/shared/ui/EmptyState';
import { CreateUserDialog } from '@/features/user';
import { GlobalUsersTable } from '@/widgets/users';
import { useUsers } from '@/entities/user';
import { useAuthStore } from '@/shared/stores/authStore';
import { GlobalRole } from '@/shared/types/entities';
import { UserPlus } from 'lucide-react';

export function GlobalUsersPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { data: users, isLoading, error, refetch } = useUsers();

  useEffect(() => {
    if (user && user.globalRole !== GlobalRole.Admin) {
      navigate('/projects', { replace: true });
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner text="Loading users..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <ErrorMessage
          title="Failed to load users"
          message="There was an error loading the user list. Please try again."
          retry={() => refetch()}
        />
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage system users and their permissions</p>
          </div>
        </div>
        <EmptyState
          icon={<UserPlus className="h-16 w-16" />}
          title="No users yet"
          description="Get started by creating your first user account."
          action={
            <CreateUserDialog>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </CreateUserDialog>
          }
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and their permissions ({users.length} {users.length === 1 ? 'user' : 'users'})
          </p>
        </div>
        <CreateUserDialog>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create User
          </Button>
        </CreateUserDialog>
      </div>
      <GlobalUsersTable users={users} />
    </div>
  );
}
