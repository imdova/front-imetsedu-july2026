import { api, type Result } from "@integration/services/http/client";

export interface CreateInvoiceDto {
  invoiceNumber?: string;
  poNumber?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms?: string;
  leadId: string;
  coursicesIds?: string[];
  currency: string;
  discount: number;
  taxPercent: number;
  subtotal: number;
  totalDue: number;
  status: string;
  paymentMethod?: string;
  paidOn?: string;
  paymentReceipt?: string;
  notes?: string;
}

export interface BackendInvoice {
  _id: string;
  _type: "installment" | "manual_invoice";
  fullName: string;
  phone: string;
  phoneCountryCode?: string;
  country?: string;
  email?: string;
  leadId: string;
  paymentPlanIndex: number;
  installmentIndex: number;
  installment: {
    index: number;
    total: number;
    amount: number;
    dueDate: string;
    status: string;
    paidDate?: string;
  };
  paymentPlan: {
    totalAmount: number;
    currency: string;
    paymentMethod: string;
    status: string;
    createdAt: string;
  };
  receipts?: Array<{
    id: string;
    scope: number;
    name: string;
    size: number;
    type: string;
    attachedAt: string;
    previewUrl: string;
  }>;
  courses: string[];
  group?: {
    _id: string;
    title: string;
  };
}

/** Shape returned for a manual (non-installment) invoice */
export interface ManualBackendInvoice {
  _id: string;
  invoiceNumber: string;
  poNumber?: string;
  issueDate: string;
  dueDate: string;
  paymentTerms?: string;
  leadId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    country?: string;
  };
  coursicesIds: string[];
  currency: string;
  subtotal: number;
  discount: number;
  taxPercent: number;
  totalDue: number;
  status: string;
  notes?: string;
  lineItems?: Array<{ description?: string; qty?: number; unitPrice?: number }>;
  paymentReceipt?: any;
  paidOn?: string;
  paidAt?: string;
  activityLog?: Array<{ _id: string; action: string; performedAt: string }>;
}

export interface GetInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  leadId?: string;
  type?: "installment" | "manual_invoice";
}

interface InvoiceStatSection {
  total: number;
  totalAmount: number;
  collected: number;
  paidCount: number;
  outstanding: number;
  notPaidCount?: number;
  overdue: number;
  overdueCount: number;
}

export interface GetInvoicesResponse {
  stats: InvoiceStatSection & {
    installments: InvoiceStatSection;
    manualInvoices: InvoiceStatSection;
  };
  data: BackendInvoice[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Create a new invoice (Standard or Already Paid) on the backend.
 */
export function createInvoice(input: CreateInvoiceDto): Promise<Result<any>> {
  return api.post<any>("/crm/invoices", input);
}

/**
 * Get all invoices from backend with filters, stats, and pagination.
 */
export function getInvoices(params?: GetInvoicesParams): Promise<Result<GetInvoicesResponse>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", String(params.page));
  if (params?.limit) query.append("limit", String(params.limit));
  if (params?.search) query.append("search", params.search);
  if (params?.status && params.status !== "all") query.append("status", params.status);
  if (params?.leadId) query.append("leadId", params.leadId);
  if (params?.type) query.append("type", params.type);

  const queryString = query.toString() ? `?${query.toString()}` : "";
  return api.get<GetInvoicesResponse>(`/crm/invoices${queryString}`);
}

/**
 * Get a specific invoice by ID (with activity log) from backend.
 */
export function getInvoiceById(id: string): Promise<Result<BackendInvoice | ManualBackendInvoice>> {
  return api.get<BackendInvoice | ManualBackendInvoice>(`/crm/invoices/${id}`);
}

export function isInstallmentInvoice(inv: BackendInvoice | ManualBackendInvoice): inv is BackendInvoice {
  return "installment" in inv && inv.installment != null;
}

/**
 * Update an invoice on backend.
 */
export function updateInvoice(id: string, input: any): Promise<Result<any>> {
  return api.patch<any>(`/crm/invoices/${id}`, input);
}

/**
 * Download an invoice as a PDF file.
 */
export function downloadInvoicePdf(id: string, filename: string): Promise<Result<any>> {
  return api.download(`/crm/invoices/${id}/pdf`, filename);
}

/**
 * Export all invoices as Excel (CSV-like) file.
 */
export function exportInvoices(filename: string): Promise<Result<any>> {
  return api.download(`/crm/invoices/export`, filename);
}

/**
 * Delete an invoice on backend.
 */
export function deleteInvoice(id: string): Promise<Result<any>> {
  return api.delete<any>(`/crm/invoices/${id}`);
}

/**
 * Send payment reminder for an invoice.
 */
export function sendInvoiceReminder(id: string): Promise<Result<any>> {
  return api.post<any>(`/crm/invoices/${id}/reminder`);
}

/**
 * Update invoice status (mark paid, cancel, etc.) on backend.
 */
export function updateInvoiceStatus(id: string, status: string): Promise<Result<any>> {
  return api.patch<any>(`/crm/invoices/${id}/status`, undefined, { params: { status } });
}

/**
 * Mark an invoice as paid, attaching the receipt URL.
 */
export function markInvoicePaid(
  id: string,
  receiptUrl: string,
  paidOn?: string
): Promise<Result<any>> {
  return api.patch<any>(`/crm/invoices/${id}`, {
    status: "paid",
    paymentReceipt: receiptUrl,
    paidOn: paidOn ?? new Date().toISOString(),
  });
}
