import { cn } from '@/shared/lib/utils';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  className?: string;
  retry?: () => void;
}

export function ErrorMessage({ title = 'Error', message, className, retry }: ErrorMessageProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-8 px-4 text-center',
        className
      )}
    >
      <div className="mb-4 text-destructive">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-md">{message}</p>
      {retry && (
        <button
          onClick={retry}
          className="text-sm text-primary hover:underline font-medium"
        >
          Try again
        </button>
      )}
    </div>
  );
}
