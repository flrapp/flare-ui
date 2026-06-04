import { Switch } from '@/shared/ui/switch';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import { formatDateTime } from '@/shared/lib/format-date';

interface ScopeToggleProps {
  scopeName: string;
  currentValue: boolean;
  isEnabled: boolean;
  lastUpdated?: string;
  isPending: boolean;
  onToggle: (checked: boolean) => void;
}

export function ScopeToggle({
  scopeName,
  currentValue,
  isEnabled,
  lastUpdated,
  isPending,
  onToggle,
}: ScopeToggleProps) {
  const toggleContent = (
    <div className="flex items-center justify-center">
      {isPending ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Switch
          checked={currentValue}
          onCheckedChange={onToggle}
          disabled={!isEnabled || isPending}
        />
      )}
    </div>
  );

  if (!isEnabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="cursor-not-allowed">{toggleContent}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>No permission to update flags in {scopeName}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (lastUpdated) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{toggleContent}</div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Last updated: {formatDateTime(lastUpdated)}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return toggleContent;
}
