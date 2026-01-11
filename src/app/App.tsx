import { AppProviders } from './providers';
import { AppRoutes } from './routes';
import { AppErrorBoundary } from '@/shared/ui/AppErrorBoundary';

function App() {
  return (
    <AppProviders>
      <AppErrorBoundary>
        <AppRoutes />
      </AppErrorBoundary>
    </AppProviders>
  );
}

export default App;
