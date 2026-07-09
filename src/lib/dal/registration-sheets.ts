/** Registration Sheets board DAL — LIVE against the NestJS `registration-sheets` module. */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/registration-sheets";

export interface RegColumn {
  id: string;
  title: string;
  icon: string;
  order: number;
}
export interface RegCard {
  id: string;
  columnId: string;
  title: string;
  link: string;
  order: number;
}
export interface RegBoard {
  columns: RegColumn[];
  cards: RegCard[];
}

const mapCol = (d: svc.RegColumnDto): RegColumn => ({ id: d._id, title: d.title, icon: d.icon ?? "ClipboardList", order: d.order ?? 0 });
const mapCard = (d: svc.RegCardDto): RegCard => ({ id: d._id, columnId: d.columnId, title: d.title, link: d.link ?? "", order: d.order ?? 0 });

export async function fetchBoard(): Promise<Result<RegBoard>> {
  const res = await svc.getBoard();
  return res.ok ? ok({ columns: res.data.columns.map(mapCol), cards: res.data.cards.map(mapCard) }) : res;
}

export async function createColumn(input: { title: string; icon?: string; order?: number }): Promise<Result<RegColumn>> {
  const res = await svc.createColumn(input);
  return res.ok ? ok(mapCol(res.data)) : res;
}
export async function updateColumn(id: string, input: Partial<{ title: string; icon: string; order: number }>): Promise<Result<RegColumn>> {
  const res = await svc.updateColumn(id, input);
  return res.ok ? ok(mapCol(res.data)) : res;
}
export async function deleteColumn(id: string): Promise<Result<boolean>> {
  const res = await svc.removeColumn(id);
  return res.ok ? ok(true) : res;
}

export async function createCard(input: { columnId: string; title: string; link?: string; order?: number }): Promise<Result<RegCard>> {
  const res = await svc.createCard(input);
  return res.ok ? ok(mapCard(res.data)) : res;
}
export async function updateCard(id: string, input: Partial<{ title: string; link: string; order: number }>): Promise<Result<RegCard>> {
  const res = await svc.updateCard(id, input);
  return res.ok ? ok(mapCard(res.data)) : res;
}
export async function deleteCard(id: string): Promise<Result<boolean>> {
  const res = await svc.removeCard(id);
  return res.ok ? ok(true) : res;
}
