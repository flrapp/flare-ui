import { Search } from 'lucide-react';
import { Input } from './input';
import { InlineSpinner } from './InlineSpinner';
import { cn } from '@/shared/lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isLoading?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'Search…',
  isLoading = false,
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-8 pr-8"
      />
      {isLoading && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
          <InlineSpinner size="xs" />
        </span>
      )}
    </div>
  );
}
