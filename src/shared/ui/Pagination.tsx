import { Button } from '@/shared/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

function getPageNumbers(page: number, totalPages: number): (number | '...')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);
  const pages: (number | '...')[] = [1];

  if (left > 2) pages.push('...');
  for (let i = left; i <= right; i++) pages.push(i);
  if (right < totalPages - 1) pages.push('...');
  pages.push(totalPages);

  return pages;
}

export function Pagination({ page, totalPages, onPageChange, disabled }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(page - 1)}
        disabled={disabled || page <= 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pageNumbers.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-1.5 text-sm text-muted-foreground select-none">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8 text-sm"
            onClick={() => onPageChange(p)}
            disabled={disabled}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        onClick={() => onPageChange(page + 1)}
        disabled={disabled || page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
