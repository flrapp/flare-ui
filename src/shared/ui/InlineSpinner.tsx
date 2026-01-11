import { cn } from '@/shared/lib/utils';

/**
 * Small spinner for inline usage in buttons and other UI elements.
 *
 * Provides 'xs' and 'sm' sizes optimized for button loading states.
 *
 * @example
 * <Button disabled={isLoading}>
 *   {isLoading && <InlineSpinner className="mr-2" />}
 *   Submit
 * </Button>
 */

interface InlineSpinnerProps {
  size?: 'xs' | 'sm';
  className?: string;
}

const sizeClasses = {
  xs: 'h-3 w-3 border',
  sm: 'h-4 w-4 border-2',
};

export function InlineSpinner({ size = 'sm', className }: InlineSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  );
}
