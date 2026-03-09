import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { InlineSpinner } from '@/shared/ui/InlineSpinner';
import { ErrorMessage } from '@/shared/ui/ErrorMessage';
import { useTargetingRules, useReorderTargetingRules } from '@/entities/targeting-rule';
import { useSegments } from '@/entities/segment';
import { TargetingRuleCard } from './TargetingRuleCard';
import { RuleModal } from './RuleModal';
import { toast } from '@/shared/lib/toast';
import type { TargetingRule } from '@/entities/targeting-rule/model/types';
import type { ProblemDetails } from '@/shared/types/auth';

interface TargetingRulesSectionProps {
  flagValueId: string;
  projectId: string;
  canManage: boolean;
}

export function TargetingRulesSection({
  flagValueId,
  projectId,
  canManage,
}: TargetingRulesSectionProps) {
  const [addOpen, setAddOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<TargetingRule | null>(null);

  const {
    data: rules = [],
    isLoading,
    error,
    refetch,
  } = useTargetingRules(flagValueId);

  const { data: segments = [] } = useSegments(projectId);
  const reorder = useReorderTargetingRules();

  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = sortedRules.map((r) => r.id);
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    try {
      await reorder.mutateAsync({ flagValueId, data: { ruleIds: newOrder } });
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('rules', 'reorder', pd?.detail ?? pd?.title);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === sortedRules.length - 1) return;
    const newOrder = sortedRules.map((r) => r.id);
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    try {
      await reorder.mutateAsync({ flagValueId, data: { ruleIds: newOrder } });
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('rules', 'reorder', pd?.detail ?? pd?.title);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <InlineSpinner />
        Loading rules...
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load targeting rules"
        message="There was an error loading the targeting rules."
        retry={() => refetch()}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Targeting Rules</h4>
        {canManage && (
          <Button variant="outline" size="sm" onClick={() => setAddOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Rule
          </Button>
        )}
      </div>

      {sortedRules.length === 0 ? (
        <p className="text-sm text-muted-foreground py-2">
          No targeting rules. The default value will always be served.
        </p>
      ) : (
        <div className="space-y-2">
          {sortedRules.map((rule, index) => (
            <TargetingRuleCard
              key={rule.id}
              rule={rule}
              index={index}
              totalRules={sortedRules.length}
              flagValueId={flagValueId}
              segments={segments}
              canManage={canManage}
              onMoveUp={() => handleMoveUp(index)}
              onMoveDown={() => handleMoveDown(index)}
              onEdit={() => setEditingRule(rule)}
            />
          ))}
        </div>
      )}

      {/* Add Rule Modal */}
      <RuleModal
        open={addOpen}
        onOpenChange={setAddOpen}
        flagValueId={flagValueId}
        projectId={projectId}
      />

      {/* Edit Rule Modal */}
      {editingRule && (
        <RuleModal
          open={!!editingRule}
          onOpenChange={(open) => !open && setEditingRule(null)}
          flagValueId={flagValueId}
          projectId={projectId}
          rule={editingRule}
        />
      )}
    </div>
  );
}
