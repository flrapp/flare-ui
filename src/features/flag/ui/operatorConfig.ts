import { ComparisonOperator } from '@/entities/targeting-condition/model/types';

export const OPERATOR_LABELS: Record<number, string> = {
  [ComparisonOperator.Equals]: 'equals',
  [ComparisonOperator.NotEquals]: 'not equals',
  [ComparisonOperator.Contains]: 'contains',
  [ComparisonOperator.In]: 'in',
  [ComparisonOperator.NotIn]: 'not in',
  [ComparisonOperator.StartsWith]: 'starts with',
  [ComparisonOperator.EndsWith]: 'ends with',
  [ComparisonOperator.GreaterThan]: 'greater than',
  [ComparisonOperator.LessThan]: 'less than',
  [ComparisonOperator.InSegment]: 'in segment',
  [ComparisonOperator.NotInSegment]: 'not in segment',
};

export const OPERATOR_OPTIONS = Object.entries(OPERATOR_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
}));

export const SEGMENT_OPERATORS = new Set<number>([
  ComparisonOperator.InSegment,
  ComparisonOperator.NotInSegment,
]);
