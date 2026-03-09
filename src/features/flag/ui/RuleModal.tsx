import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { toast } from '@/shared/lib/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Label } from '@/shared/ui/label';
import { Switch } from '@/shared/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select';
import { useCreateTargetingRule, useUpdateTargetingRule } from '@/entities/targeting-rule';
import {
  useCreateTargetingCondition,
  useUpdateTargetingCondition,
  useDeleteTargetingCondition,
} from '@/entities/targeting-condition';
import { useSegments } from '@/entities/segment';
import { ComparisonOperator } from '@/entities/targeting-condition/model/types';
import { OPERATOR_OPTIONS, SEGMENT_OPERATORS } from './operatorConfig';
import type { TargetingRule } from '@/entities/targeting-rule/model/types';
import type { ProblemDetails } from '@/shared/types/auth';


const conditionSchema = z.object({
  _id: z.string().optional(),
  attributeKey: z.string().min(1, 'Required').max(255),
  operator: z.number(),
  value: z.string().min(1, 'Required'),
});

const ruleSchema = z.object({
  serveValue: z.boolean(),
  conditions: z.array(conditionSchema).min(1, 'At least one condition is required'),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface RuleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flagValueId: string;
  projectId: string;
  rule?: TargetingRule;
}

export function RuleModal({ open, onOpenChange, flagValueId, projectId, rule }: RuleModalProps) {
  const isEdit = !!rule;

  const createRule = useCreateTargetingRule();
  const updateRule = useUpdateTargetingRule();
  const createCondition = useCreateTargetingCondition();
  const updateCondition = useUpdateTargetingCondition();
  const deleteCondition = useDeleteTargetingCondition();

  const { data: segments = [] } = useSegments(projectId);

  const isPending =
    createRule.isPending ||
    updateRule.isPending ||
    createCondition.isPending ||
    updateCondition.isPending ||
    deleteCondition.isPending;

  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: buildDefaultValues(rule),
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'conditions',
  });

  useEffect(() => {
    if (open) {
      form.reset(buildDefaultValues(rule));
    }
  }, [open, rule, form]);

  const onSubmit = async (data: RuleFormData) => {
    try {
      if (!isEdit) {
        await createRule.mutateAsync({
          flagValueId,
          data: {
            serveValue: data.serveValue,
            conditions: data.conditions.map((c) => ({
              attributeKey: c.attributeKey,
              operator: c.operator as ComparisonOperator,
              value: c.value,
            })),
          },
        });
        toast.success('targeting rule', 'created');
      } else {
        if (data.serveValue !== rule.serveValue) {
          await updateRule.mutateAsync({
            ruleId: rule.id,
            flagValueId,
            data: { serveValue: data.serveValue, priority: rule.priority },
          });
        }

        const existingIds = data.conditions.filter((c) => c._id).map((c) => c._id!);
        const deletedConditions = rule.conditions.filter((c) => !existingIds.includes(c.id));
        for (const cond of deletedConditions) {
          await deleteCondition.mutateAsync({ conditionId: cond.id, flagValueId });
        }

        for (const fc of data.conditions.filter((c) => c._id)) {
          const original = rule.conditions.find((oc) => oc.id === fc._id);
          if (
            original &&
            (original.attributeKey !== fc.attributeKey ||
              original.operator !== fc.operator ||
              original.value !== fc.value)
          ) {
            await updateCondition.mutateAsync({
              conditionId: fc._id!,
              flagValueId,
              data: { attributeKey: fc.attributeKey, operator: fc.operator as ComparisonOperator, value: fc.value },
            });
          }
        }

        for (const fc of data.conditions.filter((c) => !c._id)) {
          await createCondition.mutateAsync({
            ruleId: rule.id,
            flagValueId,
            data: { attributeKey: fc.attributeKey, operator: fc.operator as ComparisonOperator, value: fc.value },
          });
        }

        toast.success('targeting rule', 'updated');
      }
      onOpenChange(false);
    } catch (error: any) {
      const pd = error.response?.data as ProblemDetails | undefined;
      toast.error('targeting rule', isEdit ? 'update' : 'create', pd?.detail ?? pd?.title ?? undefined);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Rule' : 'Add Rule'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Update the conditions and serve value for this rule.' : 'Create a new targeting rule with conditions.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Serve Value */}
          <div className="flex items-center gap-3">
            <Controller
              control={form.control}
              name="serveValue"
              render={({ field }) => (
                <Switch
                  id="serveValue"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isPending}
                />
              )}
            />
            <Label htmlFor="serveValue" className="cursor-pointer">
              Serve value:{' '}
              <span className="font-semibold">
                {form.watch('serveValue') ? 'ON' : 'OFF'}
              </span>
            </Label>
          </div>

          {/* Conditions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Conditions</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ attributeKey: '', operator: ComparisonOperator.Equals, value: '' })}
                disabled={isPending}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Condition
              </Button>
            </div>

            {form.formState.errors.conditions?.root && (
              <p className="text-sm text-destructive">
                {form.formState.errors.conditions.root.message}
              </p>
            )}

            {fields.map((field, index) => (
              <ConditionRow
                key={field.id}
                index={index}
                form={form}
                segments={segments}
                projectId={projectId}
                isPending={isPending}
                canRemove={fields.length > 1}
                onRemove={() => remove(index)}
              />
            ))}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Rule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function buildDefaultValues(rule?: TargetingRule): RuleFormData {
  return {
    serveValue: rule?.serveValue ?? false,
    conditions: rule
      ? rule.conditions.map((c) => ({
          _id: c.id,
          attributeKey: c.attributeKey,
          operator: c.operator,
          value: c.value,
        }))
      : [{ attributeKey: '', operator: ComparisonOperator.Equals, value: '' }],
  };
}

interface ConditionRowProps {
  index: number;
  form: ReturnType<typeof useForm<RuleFormData>>;
  segments: { id: string; name: string }[];
  projectId: string;
  isPending: boolean;
  canRemove: boolean;
  onRemove: () => void;
}

function ConditionRow({ index, form, segments, projectId, isPending, canRemove, onRemove }: ConditionRowProps) {
  const operator = form.watch(`conditions.${index}.operator`);
  const isSegmentOp = SEGMENT_OPERATORS.has(operator);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr_auto] gap-2 items-start">
      {/* Attribute Key */}
      <AttributeKeyInput
        value={form.watch(`conditions.${index}.attributeKey`)}
        onChange={(v) => form.setValue(`conditions.${index}.attributeKey`, v, { shouldValidate: true })}
        disabled={isPending}
        error={form.formState.errors.conditions?.[index]?.attributeKey?.message}
      />

      {/* Operator */}
      <Controller
        control={form.control}
        name={`conditions.${index}.operator`}
        render={({ field }) => (
          <Select
            value={String(field.value)}
            onValueChange={(v) => {
              field.onChange(Number(v));
              form.setValue(`conditions.${index}.value`, '');
            }}
            disabled={isPending}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {OPERATOR_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />

      {/* Value — text input or segment dropdown */}
      <Controller
        control={form.control}
        name={`conditions.${index}.value`}
        render={({ field, fieldState }) => (
          <div className="space-y-1">
            {isSegmentOp ? (
              <Select value={field.value} onValueChange={field.onChange} disabled={isPending}>
                <SelectTrigger>
                  <SelectValue placeholder="Select segment..." />
                </SelectTrigger>
                <SelectContent>
                  {segments.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      No segments yet.{' '}
                      <Link
                        to={`/projects/${projectId}/segments`}
                        className="underline hover:text-foreground"
                      >
                        Create one
                      </Link>
                    </div>
                  ) : (
                    segments.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="value" {...field} disabled={isPending} />
            )}
            {fieldState.error && (
              <p className="text-xs text-destructive">{fieldState.error.message}</p>
            )}
          </div>
        )}
      />

      {/* Remove */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onRemove}
        disabled={!canRemove || isPending}
        className="mt-0.5"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

interface AttributeKeyInputProps {
  value: string;
  onChange: (v: string) => void;
  disabled: boolean;
  error?: string;
}

function AttributeKeyInput({ value, onChange, disabled, error }: AttributeKeyInputProps) {
  return (
    <div className="space-y-1">
      <Input
        placeholder="targetingKey"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
