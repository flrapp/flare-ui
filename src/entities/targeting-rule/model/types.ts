import type { FeatureFlagType } from '@/shared/types/entities';
import type { TargetingCondition, CreateTargetingConditionDto } from '@/entities/targeting-condition/model/types';

export type { TargetingCondition, CreateTargetingConditionDto };

/** Matches API's TypedValueDto: { type, bool?, string?, number?, json? } */
export interface TypedValue {
  type: FeatureFlagType;
  bool?: boolean | null;
  string?: string | null;
  number?: number | null;
  json?: string | null;
}

export interface TargetingRule {
  id: string;
  featureFlagValueId: string;
  priority: number;
  serveValue: TypedValue;
  conditions: TargetingCondition[];
}

export interface CreateTargetingRuleDto {
  serveValue: TypedValue;
  conditions: CreateTargetingConditionDto[];
}

export interface UpdateTargetingRuleDto {
  serveValue: TypedValue;
  priority: number;
}

export interface ReorderTargetingRulesDto {
  ruleIds: string[];
}
