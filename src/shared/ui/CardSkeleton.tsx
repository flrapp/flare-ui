import { Card, CardContent, CardHeader } from './card';

/**
 * Skeleton loader for card components.
 *
 * Provides a card skeleton structure with header and content placeholders.
 *
 * @example
 * if (isLoading) {
 *   return <CardSkeleton count={3} />;
 * }
 */

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 1 }: CardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={`card-skeleton-${index}`}>
          <CardHeader>
            <div className="h-6 bg-muted animate-pulse rounded w-3/4 mb-2" />
            <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded w-full" />
              <div className="h-4 bg-muted animate-pulse rounded w-5/6" />
              <div className="h-4 bg-muted animate-pulse rounded w-4/6" />
            </div>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
