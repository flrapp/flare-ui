import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { Button } from '@/shared/ui/button';
import { GlobalRole } from '@/shared/types/entities';
import { Users } from 'lucide-react';

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const getRoleLabel = (role: number) => {
    return role === GlobalRole.Admin ? 'Admin' : 'User';
  };

  const isAdmin = user?.globalRole === GlobalRole.Admin;

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-6">
            <Link to="/projects">
              <h1 className="text-xl font-bold text-gray-900 hover:text-gray-700">Flare</h1>
            </Link>
            {isAdmin && (
              <Link to="/admin/users">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Users className="h-4 w-4" />
                  User Management
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <span className="font-medium">{user.fullName}</span>
                <div>{getRoleLabel(user.globalRole)}</div>
              </div>
            )}
            <Button variant="outline" onClick={handleLogout}>
              Sign out
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
