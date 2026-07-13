import { api, type Result } from "@integration/services/http/client";
import type { InvoiceTemplate, InvoiceTemplatePatch } from "@/types/invoice-template";

const API_ADMIN = "/admin/invoice-template";

type TemplateDoc = InvoiceTemplate & { _id?: string };

export const getInvoiceTemplate = (): Promise<Result<TemplateDoc>> => api.get<TemplateDoc>(API_ADMIN);
export const updateInvoiceTemplate = (patch: InvoiceTemplatePatch): Promise<Result<TemplateDoc>> =>
  api.patch<TemplateDoc>(API_ADMIN, patch);
