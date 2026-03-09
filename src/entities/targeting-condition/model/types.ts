export const ComparisonOperator = {
  Equals: 0,
  NotEquals: 1,
  Contains: 2,
  In: 3,
  NotIn: 4,
  StartsWith: 5,
  EndsWith: 6,
  GreaterThan: 7,
  LessThan: 8,
  InSegment: 9,
  NotInSegment: 10,
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
