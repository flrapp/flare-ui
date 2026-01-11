import { cn } from '@/shared/lib/utils';

/**
 * Skeleton loader for tables.
 *
 * Provides a better loading experience by showing a table skeleton
 * instead of a generic spinner, improving perceived performance.
 *
 * @example
 * if (isLoading) {
 *   return <TableSkeleton rows={5} columns={4} />;
 * }
 */

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, columns = 4, className }: TableSkeletonProps) {
  return (
    <div className={cn('space-y-2', className)}>
      {/* Header row */}
      <div className="flex gap-4 pb-2 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`header-${i}`} className="h-4 bg-muted animate-pulse rounded flex-1" />
        ))}
      </div>
      {/* Body rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4 py-3">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-4 bg-muted animate-pulse rounded flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
