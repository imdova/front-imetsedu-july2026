"use client";

import { Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export type CsvSection = { title: string; header: string[]; rows: (string | number)[][] };

const cell = (v: string | number) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** Export the report as CSV (one file, a block per section) or print it / save as PDF. */
export function OrientationReportActions({ fileName, sections }: { fileName: string; sections: CsvSection[] }) {
  const exportCsv = () => {
    const lines: string[] = [];
    for (const s of sections) {
      lines.push(cell(s.title), s.header.map(cell).join(","), ...s.rows.map((r) => r.map(cell).join(",")), "");
    }
    // BOM so Excel opens Arabic text correctly.
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv}>
        <Download className="size-3.5" /> Export CSV
      </Button>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => window.print()}>
        <Printer className="size-3.5" /> Print / PDF
      </Button>
    </div>
  );
}
