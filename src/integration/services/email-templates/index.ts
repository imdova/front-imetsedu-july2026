import { api, type Result } from "@integration/services/http/client";
import { API_EMAIL_TEMPLATES_SEND } from "@integration/constants/api/email-templates";

export interface SendEmailInput {
  email: string;
  subject: string;
  body: string;
}

export function sendEmail(input: SendEmailInput): Promise<Result<void>> {
  return api.post<void>(API_EMAIL_TEMPLATES_SEND, input);
}
