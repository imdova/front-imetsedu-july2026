import { api, type Result } from "@integration/services/http/client";

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  courseId?: string;
  groupId?: string;
  paymentMethod?: string;
  status?: string;
}

/**
 * Fetch CRM payment records with stats, filters, and pagination.
 */
export function getPayments(params?: GetPaymentsParams): Promise<Result<any>> {
  return api.get<any>("/crm/payments", { params: params as any });
}

/**
 * Export all CRM payments as Excel file.
 */
export function exportPayments(filename: string): Promise<Result<void>> {
  return api.download("/crm/payments/export", filename);
}

