/**
 * Maps the backend CRM dashboard (`GET /crm/dashboard`) to the UI `CrmStats`
 * shape. Funnel stages are collapsed into the UI's canonical 5-stage vocabulary
 * (the dashboard renders STAGE_ACCENT/STAGE_LABEL_KEY by key, so keys must be
 * canonical). Pure + client-safe.
 */
import type { CrmStats } from "@/lib/db/crm";
import { getInitials } from "@/lib/utils";
import { STAGE_MAP, mapLead } from "@/lib/crm/map-lead";

const CANONICAL_STAGES = ["new", "contacted", "waiting_payment", "enrolled", "lost"] as const;

export function mapCrmStats(raw: any): CrmStats {
  const counts: Record<string, number> = {};
  for (const f of raw?.pipelineFunnel ?? []) {
    const key = STAGE_MAP[f?.stage] ?? "new";
    counts[key] = (counts[key] ?? 0) + (f?.count ?? 0);
  }
  const byStage = CANONICAL_STAGES.map((key) => ({ key, name: key, count: counts[key] ?? 0 }));

  return {
    totalLeads: raw?.totalLeads ?? 0,
    newThisWeek: raw?.newLeads ?? 0,
    conversionRate: Math.round(raw?.conversion ?? 0),
    pipelineValue: raw?.pipelineValue ?? 0,
    byStage,
    bySource: (raw?.leadSources ?? []).map((s: any) => ({ source: s?.source ?? "—", count: s?.count ?? 0 })),
    byCounselor: (raw?.topCounselors ?? []).map((c: any) => ({
      name: c?.name ?? "Unassigned",
      initials: getInitials(c?.name ?? "Unassigned"),
      leads: c?.totalLeads ?? 0,
      conversion: c?.totalLeads ? Math.round(((c?.enrolled ?? 0) / c.totalLeads) * 100) : 0,
      hot: c?.hot ?? 0,
    })),
    overdueFollowUps: raw?.lateFollowUps ?? 0,
    hotLeads: raw?.hotLeads ?? 0,
    inFlight: raw?.inFlight ?? 0,
    recentLeads: (raw?.recentLeads ?? []).map(mapLead),
  };
}
