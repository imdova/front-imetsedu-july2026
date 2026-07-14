/** Important links DAL — LIVE against the NestJS `important-links` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/important-links";

export interface ImportantLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: string;
  order: number;
}

export type ImportantLinkInput = {
  title: string;
  url: string;
  description?: string;
  category?: string;
  order?: number;
};

const map = (d: svc.ImportantLinkDto): ImportantLink => ({
  id: d._id,
  title: d.title,
  url: d.url,
  description: d.description ?? "",
  category: d.category ?? "",
  order: d.order ?? 0,
});

export async function fetchImportantLinks(): Promise<Result<ImportantLink[]>> {
  const res = await svc.list();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createImportantLink(input: ImportantLinkInput): Promise<Result<ImportantLink>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updateImportantLink(id: string, input: Partial<ImportantLinkInput>): Promise<Result<ImportantLink>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deleteImportantLink(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
