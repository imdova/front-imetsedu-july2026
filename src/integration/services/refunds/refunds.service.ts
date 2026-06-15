import { api, type Result } from "@integration/services/http/client";

// ── Types ────────────────────────────────────────────────────────────────────

export type RefundStatus =
  | "pending"
  | "approved"
  | "processed"
  | "rejected"
  | "disputed";

export type RefundMethod =
  | "bank_transfer"
  | "vodafone_cash"
  | "instapay"
  | "payment_link"
  | "cash"
  | "other";

export interface RefundActivityLog {
  _id: string;
  action: string;
  details: string;
  performedAt: string;
}

export interface Refund {
  _id: string;
  refundNumber: string;
  customer?: string;
  refundAmount: number;
  currency: string;
  type: "full" | "partial";
  status: RefundStatus;
  reasonDetails: string;
  refundMethod: RefundMethod;
  notes: string;
  activityLog: RefundActivityLog[];
  createdAt: string;
  updatedAt: string;
}

export interface RefundStats {
  totalRefunded: number;
  fullRefunds: number;
  partialRefunds: number;
  disputed: number;
}

export interface RefundListResponse {
  data: Refund[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  stats: RefundStats;
}

export interface CreateRefundInput {
  customer: string;
  refundAmount: number;
  currency: string;
  type: "full" | "partial";
  status: RefundStatus;
  reasonDetails: string;
  refundMethod: RefundMethod;
  notes: string;
}

export interface GetRefundsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  type?: string;
}

// ── Service functions ─────────────────────────────────────────────────────────

export function getRefunds(
  params?: GetRefundsParams
): Promise<Result<RefundListResponse>> {
  return api.get<RefundListResponse>("/refunds", { params: params as any });
}

export function createRefund(
  input: CreateRefundInput
): Promise<Result<Refund>> {
  return api.post<Refund>("/refunds", input);
}

export function updateRefundStatus(
  id: string,
  status: RefundStatus
): Promise<Result<Refund>> {
  return api.patch<Refund>(`/refunds/${id}/status`, { status });
}

export function exportRefunds(filename = "refunds.xlsx"): Promise<Result<void>> {
  return api.download("/refunds/export", filename);
}
