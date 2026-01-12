import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './button';

/**
 * Feature-level error boundary for graceful degradation.
 *
 * Shows inline error fallback with retry option instead of crashing the entire page.
 * Allows features to fail gracefully without affecting the rest of the application.
 *
 * @example
 * <FeatureErrorBoundary>
 *   <ComplexFeature />
 * </FeatureErrorBoundary>
 *
 * @example
 * <FeatureErrorBoundary fallback={<CustomErrorUI />} onReset={handleReset}>
 *   <ComplexFeature />
 * </FeatureErrorBoundary>
 */

interface FeatureErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface FeatureErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FeatureErrorBoundary extends Component<
  FeatureErrorBoundaryProps,
  FeatureErrorBoundaryState
> {
  constructor(props: FeatureErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): FeatureErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Feature Error:', error, errorInfo);
    // TODO: Send to error tracking service (Sentry, etc.)
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-6 border border-destructive rounded-lg bg-background">
          <div className="flex items-start gap-4">
            <div className="text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Error loading content</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button size="sm" onClick={this.resetError}>
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
