"use client";

import * as React from "react";
import { Image as ImageIcon, Film, Music, File as FileIcon } from "lucide-react";

import type { WaRecipient } from "@/lib/dal/whatsapp";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** One uploaded campaign/template media attachment (S3 URL + WhatsApp kind). */
export type WaMediaAttachment = { url: string; kind: string; mime: string; filename: string };

export const MEDIA_ICON: Record<string, typeof FileIcon> = { image: ImageIcon, video: Film, audio: Music, document: FileIcon };

/** "phone" or "phone,name" per line → recipients. */
export function parseRecipients(text: string): WaRecipient[] {
  return text.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const [phone, ...rest] = l.split(",");
    return { phone: phone.trim(), name: rest.join(",").trim() || undefined };
  }).filter((r) => r.phone.replace(/\D/g, "").length >= 6);
}

/** mm:ss for timers (voice recording, etc.). */
export function fmtDur(s: number): string {
  const m = Math.floor(s / 60);
  return `${m}:${String(s % 60).padStart(2, "0")}`;
}

/** Parse an .xlsx/.xls/.csv into WhatsApp recipients (phone + optional name columns). */
export async function parseWaRecipientsFile(file: File): Promise<WaRecipient[]> {
  const XLSX = await import("xlsx");
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
  const out: WaRecipient[] = [];
  for (const raw of json) {
    const entries = Object.entries(raw);
    const phoneKey = entries.find(([k]) => /phone|mobile|whats|number|tel/i.test(k));
    const nameKey = entries.find(([k]) => /name/i.test(k));
    const phone = String(phoneKey?.[1] ?? "").replace(/[^\d+]/g, "").trim();
    const name = String(nameKey?.[1] ?? "").trim();
    if (phone.replace(/\D/g, "").length >= 6) out.push({ phone, name: name || undefined });
  }
  return out;
}

/**
 * Download a ready-to-fill .xlsx for the campaign's "Import from Excel" tab.
 *
 * The headers are exactly what `parseWaRecipientsFile` looks for (`phone`, and
 * an optional `name`). Phones are written as TEXT, and the cells below the
 * examples are pre-formatted as text too: in a General cell Excel shows a
 * 12-digit number as 2.01E+11 and a CSV save then keeps the rounded value, which
 * would send to the wrong people. The examples and the how-to live on a second
 * sheet — the importer only reads the first one, so neither is imported.
 */
export async function downloadWaRecipientsTemplate(): Promise<void> {
  const XLSX = await import("xlsx");

  const rows: string[][] = [
    ["phone", "name"],
    ["201001234567", "Ahmed Hassan"],
    ["966501234567", "Sara Ali"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const FILLABLE_ROWS = 500;
  for (let r = 1; r < FILLABLE_ROWS; r++) {
    for (const c of [0, 1]) {
      const ref = XLSX.utils.encode_cell({ r, c });
      const cell = ws[ref] ?? { t: "s", v: "" };
      ws[ref] = { ...cell, t: "s", z: "@" };
    }
  }
  ws["!ref"] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: FILLABLE_ROWS - 1, c: 1 } });
  ws["!cols"] = [{ wch: 20 }, { wch: 28 }];

  const help = XLSX.utils.aoa_to_sheet([
    ["How to fill the Recipients sheet"],
    [""],
    ["phone", "Required. Full international number, digits only, no + (Egypt 2010…, Saudi 9665…)."],
    ["name", "Optional. Used wherever your message has {{name}}."],
    [""],
    ["The first two rows are examples — replace them. Keep the column headings (phone, name) as they are."],
  ]);
  help["!cols"] = [{ wch: 12 }, { wch: 90 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Recipients");
  XLSX.utils.book_append_sheet(wb, help, "How to fill");
  XLSX.writeFile(wb, "whatsapp-recipients-template.xlsx");
}

/** WhatsApp-style rendered media preview (image / video / audio / document chip). */
export function MediaPreview({ media, className }: { media: WaMediaAttachment; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- user-uploaded S3 media, no next/image optimization
  if (media.kind === "image") return <img src={media.url} alt="" className={cn("max-h-52 rounded-lg object-contain", className)} />;
  if (media.kind === "video") return <video src={media.url} controls className={cn("max-h-52 rounded-lg", className)} />;
  if (media.kind === "audio") return <audio src={media.url} controls className={cn("w-full", className)} />;
  const Icon = MEDIA_ICON[media.kind] ?? FileIcon;
  return (
    <a href={media.url} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm", className)}>
      <Icon className="size-4 text-primary" /> <span className="truncate">{media.filename || "Attachment"}</span>
    </a>
  );
}

export function DetailRow({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className="min-w-0 truncate text-right">{v}</span>
    </div>
  );
}

/** Campaign lifecycle status → badge. */
export function CampaignStatusBadge({ status }: { status: string }) {
  if (status === "sent") return <Badge className="bg-success/12 text-success hover:bg-success/15">Sent</Badge>;
  // Meta accepted none of the messages — distinct from a sent campaign with some failures.
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (status === "sending") return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300">Sending…</Badge>;
  return <Badge variant="secondary" className="capitalize">{status || "draft"}</Badge>;
}

/** Per-recipient delivery status → badge (report table). */
export function DeliveryStatusBadge({ status }: { status: string }) {
  if (status === "read") return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/40 dark:text-blue-300">Read</Badge>;
  if (status === "delivered") return <Badge className="bg-success/12 text-success hover:bg-success/15">Delivered</Badge>;
  if (status === "failed") return <Badge variant="destructive">Failed</Badge>;
  if (status === "not_sent") return <Badge variant="outline" className="text-muted-foreground">Not sent</Badge>;
  return <Badge variant="secondary">Accepted</Badge>;
}
