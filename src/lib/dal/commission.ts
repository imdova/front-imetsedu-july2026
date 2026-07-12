/**
 * Commission DAL — LIVE. Sales-team deals + aggregated insights, backed by the
 * NestJS `commission` module (`/admin/crm/commissions`). Staff see/manage their
 * own deals; super-admins see the whole team plus overview aggregations.
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/commission";
import type { CommissionDeal, CommissionDealInput, CommissionOverview, CommissionPlan } from "@/lib/db/commission";

const mapDeal = (d: svc.CommissionDealDto): CommissionDeal => ({
  id: d._id,
  ownerId: d.ownerId,
  ownerName: d.ownerName,
  ownerEmail: d.ownerEmail,
  customerName: d.customerName,
  courseName: d.courseName,
  commission: d.commission,
  month: d.month,
  createdAt: d.createdAt,
});

export async function fetchDeals(month?: string): Promise<Result<CommissionDeal[]>> {
  const res = await svc.listDeals(month);
  return res.ok ? ok(res.data.map(mapDeal)) : res;
}

export async function fetchOverview(month?: string): Promise<Result<CommissionOverview>> {
  const res = await svc.getOverview(month);
  return res.ok ? ok(res.data as CommissionOverview) : res;
}

export async function createDeal(input: CommissionDealInput): Promise<Result<CommissionDeal>> {
  const res = await svc.createDeal(input);
  return res.ok ? ok(mapDeal(res.data)) : res;
}

export async function updateDeal(
  id: string,
  patch: Partial<CommissionDealInput>,
): Promise<Result<CommissionDeal>> {
  const res = await svc.updateDeal(id, patch);
  return res.ok ? ok(mapDeal(res.data)) : res;
}

export async function deleteDeal(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteDeal(id);
  return res.ok ? ok(true) : res;
}

export async function fetchPlan(): Promise<Result<CommissionPlan>> {
  const res = await svc.getPlan();
  return res.ok
    ? ok({ programs: res.data.programs ?? [], roles: res.data.roles ?? [], existingCustomerNote: res.data.existingCustomerNote ?? "" })
    : res;
}

export async function updatePlan(plan: CommissionPlan): Promise<Result<CommissionPlan>> {
  const res = await svc.updatePlan(plan);
  return res.ok
    ? ok({ programs: res.data.programs ?? [], roles: res.data.roles ?? [], existingCustomerNote: res.data.existingCustomerNote ?? "" })
    : res;
}
