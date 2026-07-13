import { api, type Result } from "@integration/services/http/client";
import {
  API_EMAIL_TEMPLATES,
  apiEmailTemplate,
  API_EMAIL_TEMPLATES_SEND,
} from "@integration/constants/api/email-templates";

export interface EmailTemplateDto {
  _id: string;
  key?: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
}

export interface SendEmailInput {
  email: string;
  subject: string;
  body: string;
}

export function getEmailTemplates(): Promise<Result<EmailTemplateDto[]>> {
  return api.get<EmailTemplateDto[]>(API_EMAIL_TEMPLATES);
}

export function updateEmailTemplate(id: string, patch: Partial<EmailTemplateDto>): Promise<Result<EmailTemplateDto>> {
  return api.patch<EmailTemplateDto>(apiEmailTemplate(id), patch);
}

export function sendEmail(input: SendEmailInput): Promise<Result<void>> {
  return api.post<void>(API_EMAIL_TEMPLATES_SEND, input);
}
