import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select';

const PAGE_SIZE_OPTIONS = [10, 20, 25] as const;

interface PageSizeSelectProps {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function PageSizeSelect({ value, onChange, disabled }: PageSizeSelectProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>Rows per page</span>
      <Select
        value={String(value)}
        onValueChange={(v) => onChange(Number(v))}
        disabled={disabled}
      >
        <SelectTrigger className="h-8 w-18">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PAGE_SIZE_OPTIONS.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
