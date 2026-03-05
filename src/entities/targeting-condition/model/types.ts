export const ComparisonOperator = {
  Equals: 0,
  NotEquals: 1,
  Contains: 2,
  NotContains: 3,
  In: 4,
  NotIn: 5,
  StartsWith: 6,
  EndsWith: 7,
  GreaterThan: 8,
  LessThan: 9,
  InSegment: 10,
  NotInSegment: 11,
} as const;

export type ComparisonOperator = typeof ComparisonOperator[keyof typeof ComparisonOperator];

export interface TargetingCondition {
  id: string;
  attributeKey: string;
  operator: ComparisonOperator;
  value: string;
}

export interface CreateTargetingConditionDto {
  attributeKey: string;
  operator: ComparisonOperator;
  value: string;
}

export interface UpdateTargetingConditionDto {
  attributeKey: string;
  operator: ComparisonOperator;
  value: string;
}
