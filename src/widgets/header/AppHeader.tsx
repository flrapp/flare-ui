import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { Button } from '@/shared/ui/button';

export function AppHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Flare UI</h1>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <div className="text-sm text-gray-700">
                <span className="font-medium">{user.fullName}</span>
                <span className="ml-2 text-gray-500">({user.globalRole})</span>
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
