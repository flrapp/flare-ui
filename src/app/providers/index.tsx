import { QueryProvider } from './QueryProvider';
import { RouterProvider } from './RouterProvider';
import { ThemeProvider } from './ThemeProvider';
import { Toaster } from '@/shared/ui/sonner';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <RouterProvider>{children}</RouterProvider>
        <Toaster />
      </QueryProvider>
    </ThemeProvider>
  );
}
