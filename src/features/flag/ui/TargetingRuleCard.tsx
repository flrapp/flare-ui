import { useState } from 'react';
import { ChevronUp, ChevronDown, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/ui/alert-dialog';
import { useDeleteTargetingRule } from '@/entities/targeting-rule';
import { OPERATOR_LABELS, SEGMENT_OPERATORS } from './operatorConfig';
import type { TargetingRule } from '@/entities/targeting-rule/model/types';
import type { Segment } from '@/entities/segment/model/types';
import { toast } from '@/shared/lib/toast';
import type { ProblemDetails } from '@/shared/types/auth';

interface TargetingRuleCardProps {
  rule: TargetingRule;
  index: number;
  totalRules: number;
  flagValueId: string;
  segments: Segment[];
  canManage: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
}

export function TargetingRuleCard({
  rule,
  index,
  totalRules,
  flagValueId,
  segments,
  canManage,
  onMoveUp,
  onMoveDown,
  onEdit,
}: TargetingRuleCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteRule = useDeleteTargetingRule();

  const handleDelete = async () => {
    try {
      await deleteRule.mutateAsync({ ruleId: rule.id, flagValueId });
      toast.success('targeting rule', 'deleted');
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('targeting rule', 'delete', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Rule {index + 1}</span>
            {rule.serveValue ? (
              <Badge className="bg-[hsl(var(--success)/0.1)] text-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.1)]">
                ON
              </Badge>
            ) : (
              <Badge variant="secondary">OFF</Badge>
            )}
          </div>
          <ConditionsSummary rule={rule} segments={segments} />
        </div>

        {canManage && (
          <TooltipProvider>
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMoveUp}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move up</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onMoveDown}
                  disabled={index === totalRules - 1}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move down</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit rule</TooltipContent>
            </Tooltip>

            <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <Tooltip>
              <TooltipTrigger asChild>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              </TooltipTrigger>
              <TooltipContent>Delete rule</TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Rule {index + 1}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the rule and all its conditions. This action cannot
                    be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleteRule.isPending}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleteRule.isPending ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}

interface ConditionsSummaryProps {
  rule: TargetingRule;
  segments: Segment[];
}

function ConditionsSummary({ rule, segments }: ConditionsSummaryProps) {
  if (rule.conditions.length === 0) {
    return <p className="text-sm text-muted-foreground italic">No conditions</p>;
  }

  return (
    <p className="font-mono text-sm text-muted-foreground break-words">
      {rule.conditions.map((cond, i) => {
        const operatorLabel = OPERATOR_LABELS[cond.operator] ?? String(cond.operator);
        const isSegmentOp = SEGMENT_OPERATORS.has(cond.operator);
        const valueLabel = isSegmentOp
          ? (segments.find((s) => s.id === cond.value)?.name ?? cond.value)
          : cond.value;

        return (
          <span key={cond.id}>
            {i > 0 && <span className="font-sans font-medium text-foreground mx-1">AND</span>}
            {cond.attributeKey}
            {' '}
            <span className="font-sans">{operatorLabel}</span>
            {' '}
            {valueLabel}
          </span>
        );
      })}
    </p>
  );
}
