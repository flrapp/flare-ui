export type ComparisonOperator = number;

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
