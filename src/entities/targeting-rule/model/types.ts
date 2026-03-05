import type { TargetingCondition, CreateTargetingConditionDto } from '@/entities/targeting-condition/model/types';

export type { TargetingCondition, CreateTargetingConditionDto };

export interface TargetingRule {
  id: string;
  featureFlagValueId: string;
  priority: number;
  serveValue: boolean;
  conditions: TargetingCondition[];
}

export interface CreateTargetingRuleDto {
  serveValue: boolean;
  conditions: CreateTargetingConditionDto[];
}

export interface UpdateTargetingRuleDto {
  serveValue: boolean;
  priority: number;
}

export interface ReorderTargetingRulesDto {
  ruleIds: string[];
}
