import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

/**
 * Global error boundary that catches unhandled errors and prevents app crashes.
 *
 * Shows full-page error fallback with reload and go back options.
 * Logs errors to console (ready for error tracking integration).
 *
 * @example
 * <AppErrorBoundary>
 *   <App />
 * </AppErrorBoundary>
 */

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  constructor(props: AppErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('App Error:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background">
          <div className="mb-6 text-destructive">
            <AlertCircle className="h-16 w-16" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground mb-6 text-center max-w-md">
            An unexpected error occurred. Please try reloading the page or go back to the previous
            page.
          </p>
          {this.state.error && (
            <p className="text-sm text-muted-foreground mb-6 font-mono text-center max-w-md">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-4">
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
