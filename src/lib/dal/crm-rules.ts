/** CRM Rules & Regulations DAL — LIVE against the NestJS `crm-rules` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/crm-rules";

export type RuleAudience = "staff" | "students" | "general";

export interface CrmRule {
  id: string;
  title: string;
  audience: RuleAudience;
  body: string;
  order: number;
}

export type CrmRuleInput = {
  title: string;
  audience?: RuleAudience;
  body?: string;
  order?: number;
};

const map = (d: svc.CrmRuleDto): CrmRule => ({
  id: d._id,
  title: d.title,
  audience: (d.audience as RuleAudience) ?? "staff",
  body: d.body ?? "",
  order: d.order ?? 0,
});

export async function fetchCrmRules(): Promise<Result<CrmRule[]>> {
  const res = await svc.list();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createCrmRule(input: CrmRuleInput): Promise<Result<CrmRule>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updateCrmRule(id: string, input: Partial<CrmRuleInput>): Promise<Result<CrmRule>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deleteCrmRule(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
