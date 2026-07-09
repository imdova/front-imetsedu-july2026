/** Message templates DAL — LIVE against the NestJS `message-templates` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/message-templates";

export interface MessageTemplate {
  id: string;
  title: string;
  body: string;
  courseId: string; // "" = general
  order: number;
}

export type MessageTemplateInput = {
  title: string;
  body: string;
  courseId?: string;
  order?: number;
};

const map = (d: svc.MessageTemplateDto): MessageTemplate => ({
  id: d._id,
  title: d.title,
  body: d.body,
  courseId: d.courseId ?? "",
  order: d.order ?? 0,
});

export async function fetchTemplates(courseId?: string): Promise<Result<MessageTemplate[]>> {
  const res = await svc.list(courseId);
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function fetchTemplate(id: string): Promise<Result<MessageTemplate>> {
  const res = await svc.get(id);
  return res.ok ? ok(map(res.data)) : res;
}

export async function createTemplate(input: MessageTemplateInput): Promise<Result<MessageTemplate>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updateTemplate(id: string, input: Partial<MessageTemplateInput>): Promise<Result<MessageTemplate>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deleteTemplate(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
