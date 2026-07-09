/** Pricing sheet DAL — LIVE against the NestJS `pricing` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/pricing";

export interface PriceRow {
  id: string;
  program: string;
  egyptCash: string;
  egypt2: string;
  egypt3: string;
  arabCash: string;
  arab2: string;
  arab3: string;
  saudiCash: string;
  saudi2: string;
  saudi3: string;
  order: number;
}

export type PriceRowInput = Omit<PriceRow, "id">;

const map = (d: svc.PriceRowDto): PriceRow => ({
  id: d._id,
  program: d.program,
  egyptCash: d.egyptCash ?? "",
  egypt2: d.egypt2 ?? "",
  egypt3: d.egypt3 ?? "",
  arabCash: d.arabCash ?? "",
  arab2: d.arab2 ?? "",
  arab3: d.arab3 ?? "",
  saudiCash: d.saudiCash ?? "",
  saudi2: d.saudi2 ?? "",
  saudi3: d.saudi3 ?? "",
  order: d.order ?? 0,
});

export async function fetchPriceRows(): Promise<Result<PriceRow[]>> {
  const res = await svc.list();
  return res.ok ? ok(res.data.map(map)) : res;
}

export async function createPriceRow(input: Partial<PriceRowInput>): Promise<Result<PriceRow>> {
  const res = await svc.create(input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function updatePriceRow(id: string, input: Partial<PriceRowInput>): Promise<Result<PriceRow>> {
  const res = await svc.update(id, input);
  return res.ok ? ok(map(res.data)) : res;
}

export async function deletePriceRow(id: string): Promise<Result<boolean>> {
  const res = await svc.remove(id);
  return res.ok ? ok(true) : res;
}
