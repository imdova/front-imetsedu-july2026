/**
 * Dashboard DAL — headline stats, sales series, and the editorial task board.
 */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as db from "@/lib/db/dashboard";
import type { AdminStats, SalesData } from "@/types";

export async function fetchAdminStats(): Promise<Result<AdminStats>> {
  try {
    return ok(await db.getAdminStats());
  } catch (err) {
    return fail(toMessage(err, "Failed to load stats"));
  }
}

export async function fetchSalesSeries(): Promise<Result<SalesData[]>> {
  try {
    return ok(await db.getSalesSeries());
  } catch (err) {
    return fail(toMessage(err, "Failed to load sales"));
  }
}

export async function fetchDashboardTasks(): Promise<
  Result<db.DashboardTask[]>
> {
  try {
    return ok(await db.getDashboardTasks());
  } catch (err) {
    return fail(toMessage(err, "Failed to load tasks"));
  }
}

export async function fetchDashboardBoard(): Promise<Result<db.BoardColumn[]>> {
  try {
    return ok(await db.getDashboardBoard());
  } catch (err) {
    return fail(toMessage(err, "Failed to load board"));
  }
}
