/** Invoice-template DAL — LIVE. Admin editor for the downloadable invoice PDF
 * (colors, company, sections, labels), backed by the `invoice-template` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/invoice-template";
import type { InvoiceTemplate, InvoiceTemplatePatch } from "@/types/invoice-template";

/** Defaults mirror the backend schema so the editor renders before first save. */
export const DEFAULT_INVOICE_TEMPLATE: InvoiceTemplate = {
  colors: {
    primary: "#0B3FA8",
    headerText: "#FFFFFF",
    accent: "#1B2A4A",
    heading: "#0F172A",
    text: "#111827",
    muted: "#6B7280",
    tableHeaderBg: "#EEF2FB",
    border: "#E5E7EB",
  },
  company: {
    wordmark: "IMETS",
    tagline: "SCHOOL OF BUSINESS",
    name: "IMETS School of Business",
    address: "Cairo, Egypt",
  },
  sections: {
    coloredHeader: true,
    showCompany: true,
    showTerms: true,
    showReceipt: true,
    showFooter: true,
  },
  labels: {
    invoiceTitle: "INVOICE",
    billTo: "BILL TO",
    receipt: "PAYMENT RECEIPT",
    footer: "Thank you for your business.",
  },
};

const GROUPS: (keyof InvoiceTemplate)[] = ["colors", "company", "sections", "labels"];

/** Merge the backend doc onto defaults so missing groups/fields are filled. */
function normalize(raw: Partial<InvoiceTemplate> | undefined): InvoiceTemplate {
  const d = DEFAULT_INVOICE_TEMPLATE;
  return {
    colors: { ...d.colors, ...(raw?.colors ?? {}) },
    company: { ...d.company, ...(raw?.company ?? {}) },
    sections: { ...d.sections, ...(raw?.sections ?? {}) },
    labels: { ...d.labels, ...(raw?.labels ?? {}) },
  };
}

export async function fetchTemplate(): Promise<Result<InvoiceTemplate>> {
  const res = await svc.getInvoiceTemplate();
  return res.ok ? ok(normalize(res.data)) : res;
}

export async function updateTemplate(patch: InvoiceTemplatePatch): Promise<Result<InvoiceTemplate>> {
  // Strip to the 4 known groups so the forbidNonWhitelisted DTO won't 400 on
  // echoed _id/__v/createdAt/updatedAt.
  const clean: InvoiceTemplatePatch = {};
  for (const g of GROUPS) if (patch[g] !== undefined) (clean as Record<string, unknown>)[g] = patch[g];
  const res = await svc.updateInvoiceTemplate(clean);
  return res.ok ? ok(normalize(res.data)) : res;
}
