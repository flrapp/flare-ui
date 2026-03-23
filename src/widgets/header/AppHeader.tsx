import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/shared/stores/authStore';
import { Badge } from '@/shared/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu';
import { GlobalRole } from '@/shared/types/entities';
import { cn } from '@/shared/lib/utils';
import { Flame, ChevronDown, LogOut } from 'lucide-react';

export function AppHeader() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const isAdmin = user?.globalRole === GlobalRole.Admin;

  const navLinks = [
    { to: '/projects', label: 'Projects' },
    ...(isAdmin ? [{ to: '/admin/users', label: 'User Management' }] : []),
  ];

  return (
    <header className="border-b border-border bg-background">
      <div className="flex items-center h-14 px-6 gap-6">
        {/* Logo */}
        <Link to="/projects" className="flex items-center gap-1.5 shrink-0">
          <Flame className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg leading-none">Flare</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex h-14 items-stretch">
          {navLinks.map(({ to, label }) => {
            const isActive = location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  'flex items-center px-3 text-sm font-medium border-b-2 transition-colors',
                  isActive
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right zone */}
        <div className="ml-auto">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1.5 rounded-md px-2 py-1.5 hover:bg-accent transition-colors outline-none">
                <span className="text-sm font-medium">{user.fullName}</span>
                <Badge variant="secondary" className="text-xs">
                  {isAdmin ? 'Admin' : 'User'}
                </Badge>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user.fullName}</div>
                  <div className="text-xs text-muted-foreground">
                    {isAdmin ? 'Admin' : 'User'}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
