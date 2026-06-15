/**
 * Finance DAL — invoices, payments, refunds, finance KPIs. UI imports here only;
 * swap for the integration `invoices` / `payments` / `refunds` services to go live.
 */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as invoicesSvc from "@integration/services/invoices";
import * as paymentsSvc from "@integration/services/payments";
import * as refundsSvc from "@integration/services/refunds";
import * as db from "@/lib/db/finance";
import { mapInvoice, mapFinanceStats, mapPayments } from "@/lib/finance/map-finance";
import { mapRefund } from "@/lib/admin/map-misc";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

/** LIVE: finance KPIs from GET /crm/invoices stats. */
export const fetchFinanceStats = async (): Promise<Result<db.FinanceStats>> => {
  const res = await invoicesSvc.getInvoices({ limit: 1 } as never);
  if (!res.ok) return res;
  try {
    return ok(mapFinanceStats((res.data as { stats?: unknown })?.stats));
  } catch (err) {
    return fail(toMessage(err, "Failed to map finance stats"));
  }
};

/** LIVE: invoices from GET /crm/invoices, mapped to the UI shape. */
export const fetchInvoices = async (): Promise<Result<db.Invoice[]>> => {
  const res = await invoicesSvc.getInvoices({ limit: 200 } as never);
  if (!res.ok) return res;
  try {
    const rows: unknown[] = Array.isArray((res.data as { data?: unknown[] })?.data) ? (res.data as { data: unknown[] }).data : [];
    return ok(rows.map(mapInvoice));
  } catch (err) {
    return fail(toMessage(err, "Failed to map invoices"));
  }
};
/** LIVE: single invoice (or installment) by id from GET /crm/invoices/:id. */
export const fetchInvoice = async (id: string): Promise<Result<db.Invoice>> => {
  const res = await invoicesSvc.getInvoiceById(id);
  if (!res.ok) return res;
  try {
    return ok(mapInvoice(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to load invoice"));
  }
};
/** LIVE: payments derived from paid installments (GET /crm/payments → leadPayments). */
export const fetchPayments = async (): Promise<Result<db.Payment[]>> => {
  const res = await paymentsSvc.getPayments({ limit: 200 } as never);
  if (!res.ok) return res;
  try {
    const rows: unknown[] = (res.data as { leadPayments?: { data?: unknown[] } })?.leadPayments?.data ?? [];
    return ok(mapPayments(rows as any[]));
  } catch (err) {
    return fail(toMessage(err, "Failed to map payments"));
  }
};
/** LIVE: refunds from GET /refunds, mapped. */
export const fetchRefunds = async (): Promise<Result<db.Refund[]>> => {
  const res = await refundsSvc.getRefunds({ limit: 200 } as never);
  if (!res.ok) return res;
  try {
    const rows: unknown[] = Array.isArray(res.data) ? res.data : ((res.data as { data?: unknown[] })?.data ?? []);
    return ok(rows.map(mapRefund));
  } catch (err) {
    return fail(toMessage(err, "Failed to load refunds"));
  }
};
/**
 * LIVE: mark an invoice paid via PATCH /crm/invoices/:id/status. The backend
 * mirrors the new status onto the linked lead installment (and therefore the
 * student portal, which reads the same lead.data.paymentPlans), so a single
 * write reflects everywhere.
 */
export const markInvoicePaid = async (id: string): Promise<Result<db.Invoice>> => {
  const res = await invoicesSvc.updateInvoiceStatus(id, "paid");
  if (!res.ok) return res;
  try {
    return ok(mapInvoice(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to mark paid"));
  }
};

// The dummy DB and the backend disagree on one label: "requested" ↔ "pending".
const REFUND_STATUS_TO_API: Record<db.RefundStatus, refundsSvc.RefundStatus> = {
  requested: "pending",
  approved: "approved",
  processed: "processed",
  rejected: "rejected",
};

/** LIVE: update a refund's status via PATCH /refunds/:id/status. */
export const updateRefundStatus = async (id: string, status: db.RefundStatus): Promise<Result<db.Refund>> => {
  const res = await refundsSvc.updateRefundStatus(id, REFUND_STATUS_TO_API[status]);
  if (!res.ok) return res;
  try {
    return ok(mapRefund(res.data));
  } catch (err) {
    return fail(toMessage(err, "Failed to update refund"));
  }
};
