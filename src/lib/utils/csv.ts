/**
 * Client-side CSV export — array of rows → CSV blob → browser download.
 * Respects whatever (already-filtered) rows the caller passes.
 */
export function downloadCsv(
  filename: string,
  rows: readonly object[],
  columns?: { key: string; header: string }[],
): void {
  if (typeof window === "undefined") return;

  const cols =
    columns ??
    (rows[0]
      ? Object.keys(rows[0]).map((k) => ({ key: k, header: k }))
      : []);

  const escape = (val: unknown): string => {
    const s = val == null ? "" : String(val);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };

  const head = cols.map((c) => escape(c.header)).join(",");
  const body = rows
    .map((row) =>
      cols.map((c) => escape((row as Record<string, unknown>)[c.key])).join(","),
    )
    .join("\n");
  const csv = `${head}\n${body}`;

  const blob = new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename.endsWith(".csv") ? filename : `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
