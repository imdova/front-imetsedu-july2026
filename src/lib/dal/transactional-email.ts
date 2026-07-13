/** Transactional email templates DAL — LIVE. The system emails the platform
 * sends to customers (enrollment / purchase / access / certificate), backed by
 * the NestJS `mail` module's EmailTemplate collection (/email-templates). */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/email-templates";

export interface TxEmailTemplate {
  id: string;
  key: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

const map = (d: svc.EmailTemplateDto): TxEmailTemplate => ({
  id: d._id,
  key: d.key ?? "",
  name: d.name,
  subject: d.subject,
  body: d.body,
  variables: d.variables ?? [],
  isActive: d.isActive ?? true,
});

/** Only the keyed (transactional) templates — not ad-hoc marketing ones. */
export async function fetchTemplates(): Promise<Result<TxEmailTemplate[]>> {
  const res = await svc.getEmailTemplates();
  return res.ok ? ok(res.data.filter((d) => d.key).map(map)) : res;
}

export async function updateTemplate(
  id: string,
  patch: Partial<Pick<TxEmailTemplate, "subject" | "body" | "isActive" | "name">>,
): Promise<Result<TxEmailTemplate>> {
  const res = await svc.updateEmailTemplate(id, patch);
  return res.ok ? ok(map(res.data)) : res;
}

export async function sendTest(email: string, subject: string, body: string): Promise<Result<boolean>> {
  const res = await svc.sendEmail({ email, subject, body });
  return res.ok ? ok(true) : res;
}
