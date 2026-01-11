import { LoadingSpinner } from './LoadingSpinner';

/**
 * Centralized full-page loader component.
 *
 * Displays a large loading spinner centered in the viewport.
 * Use for page-level loading states.
 *
 * @example
 * if (isLoading) {
 *   return <PageLoader message="Loading projects..." />;
 * }
 */

interface PageLoaderProps {
  message?: string;
}

export function PageLoader({ message = 'Loading...' }: PageLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" text={message} />
    </div>
  );
}
