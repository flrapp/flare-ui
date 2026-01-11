import { toast } from '@/shared/lib/toast';
import { Switch } from '@/shared/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import { useUpdateFeatureFlagValue } from '@/entities/flag';
import { LoadingSpinner } from '@/shared/ui/LoadingSpinner';
import type { ProblemDetails } from '@/shared/types/auth';

interface ScopeToggleProps {
  featureFlagId: string;
  scopeId: string;
  scopeName: string;
  currentValue: boolean;
  isEnabled: boolean;
  lastUpdated?: string;
  onToggle: () => void;
}

export function ScopeToggle({
  featureFlagId,
  scopeId,
  scopeName,
  currentValue,
  isEnabled,
  lastUpdated,
}: ScopeToggleProps) {
  const updateValue = useUpdateFeatureFlagValue();

  const handleToggle = async (checked: boolean) => {
    if (!isEnabled) return;

    try {
      await updateValue.mutateAsync({
        flagId: featureFlagId,
        data: {
          scopeId,
          isEnabled: checked,
        },
      });
      toast.info(`Feature flag ${checked ? 'enabled' : 'disabled'} for ${scopeName}`);
    } catch (error: any) {
      const problemDetails = error.response?.data as ProblemDetails | undefined;
      toast.error('flag value', 'update', problemDetails?.detail || problemDetails?.title);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const toggleContent = (
    <div className="flex items-center justify-center">
      {updateValue.isPending ? (
        <LoadingSpinner size="sm" />
      ) : (
        <Switch
          checked={currentValue}
          onCheckedChange={handleToggle}
          disabled={!isEnabled || updateValue.isPending}
        />
      )}
    </div>
  );

  if (!isEnabled) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-not-allowed">{toggleContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>No permission to update flags in {scopeName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (lastUpdated) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>{toggleContent}</div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Last updated: {formatDate(lastUpdated)}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return toggleContent;
}
