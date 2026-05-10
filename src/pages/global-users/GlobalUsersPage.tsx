import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Plus } from 'lucide-react';
import { EmptyState } from '@/shared/ui/EmptyState';
import { CreateUserDialog } from '@/features/user';
import { GlobalUsersTable } from '@/widgets/users';
import { useAuthStore } from '@/shared/stores/authStore';
import { GlobalRole } from '@/shared/types/entities';
import { UserPlus } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SearchInput } from '@/shared/ui/SearchInput';
import { useDebounce } from '@/shared/lib/useDebounce';

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
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 300);

  useEffect(() => {
    if (user && user.globalRole !== GlobalRole.Admin) {
      navigate('/projects', { replace: true });
    }
  }, [user, navigate]);

  const isFiltered = activeFilter !== 'all';

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

      <div className="mb-4">
        <SearchInput
          value={searchInput}
          onChange={setSearchInput}
          placeholder="Search users..."
          className="max-w-sm"
        />
      </div>

      <GlobalUsersTable
        search={search}
        isActive={filterToParam(activeFilter)}
        emptyNode={emptyNode}
      />
    </div>
  );
}
