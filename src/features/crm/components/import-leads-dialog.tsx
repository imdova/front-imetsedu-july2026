"use client";

import * as React from "react";
import { FileSpreadsheet, Loader2, CheckCircle2, AlertTriangle, UploadCloud, Users, X } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { Counselor, CreateLeadInput } from "@/lib/db/crm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ParsedRow { phone: string; fullName?: string; email?: string; whatsApp?: string }

const PHONE_KEYS = /phone|mobile|tel|رقم|هاتف|جوال|موبايل/i;
const WA_KEYS = /whats|واتس/i;
const NAME_KEYS = /name|اسم/i;
const EMAIL_KEYS = /e-?mail|بريد|ايميل|إيميل/i;

const cell = (v: unknown) => String(v ?? "").trim();
const phoneOf = (v: unknown) => cell(v).replace(/[^\d+]/g, "");
const digitsLen = (v: string) => v.replace(/\D/g, "").length;

export function ImportLeadsDialog({
  counselors,
  onImported,
}: {
  counselors: Counselor[];
  onImported: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [parsing, setParsing] = React.useState(false);
  const [rows, setRows] = React.useState<ParsedRow[]>([]);
  const [skipped, setSkipped] = React.useState(0);
  const [fileName, setFileName] = React.useState("");
  const [phoneCol, setPhoneCol] = React.useState("");
  const [assignee, setAssignee] = React.useState("none"); // "none" = keep unassigned
  const [importing, setImporting] = React.useState(false);
  const [result, setResult] = React.useState<{ created: number; duplicates: number; failed: number } | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const reset = () => {
    setParsing(false); setRows([]); setSkipped(0); setFileName(""); setPhoneCol("");
    setAssignee("none"); setImporting(false); setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true); setResult(null); setRows([]);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const aoa = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, blankrows: false, defval: "" });
      if (!aoa.length) { toast.error("The sheet is empty"); return; }

      // Detect a header row: does row 0 contain phone/name/email-ish labels (not just numbers)?
      const header = (aoa[0] as unknown[]).map(cell);
      const hasHeader = header.some((h) => PHONE_KEYS.test(h) || WA_KEYS.test(h) || NAME_KEYS.test(h) || EMAIL_KEYS.test(h));

      let phoneIdx = 0, nameIdx = -1, emailIdx = -1, waIdx = -1;
      let dataRows: unknown[][];
      if (hasHeader) {
        waIdx = header.findIndex((h) => WA_KEYS.test(h));
        phoneIdx = header.findIndex((h) => PHONE_KEYS.test(h) && !WA_KEYS.test(h));
        if (phoneIdx === -1) phoneIdx = waIdx >= 0 ? waIdx : 0;
        nameIdx = header.findIndex((h) => NAME_KEYS.test(h));
        emailIdx = header.findIndex((h) => EMAIL_KEYS.test(h));
        setPhoneCol(header[phoneIdx] || `Column ${phoneIdx + 1}`);
        dataRows = aoa.slice(1) as unknown[][];
      } else {
        phoneIdx = 0;
        setPhoneCol("first column");
        dataRows = aoa as unknown[][];
      }

      const seen = new Set<string>();
      const parsed: ParsedRow[] = [];
      let skip = 0;
      for (const r of dataRows) {
        const phone = phoneOf(r[phoneIdx]);
        if (digitsLen(phone) < 6) { skip++; continue; }
        if (seen.has(phone)) { skip++; continue; } // in-file duplicate
        seen.add(phone);
        parsed.push({
          phone,
          fullName: nameIdx >= 0 ? cell(r[nameIdx]) || undefined : undefined,
          email: emailIdx >= 0 ? cell(r[emailIdx]) || undefined : undefined,
          whatsApp: waIdx >= 0 ? phoneOf(r[waIdx]) || undefined : undefined,
        });
      }
      setRows(parsed); setSkipped(skip); setFileName(file.name);
      if (!parsed.length) toast.error("No valid phone numbers found in the file");
    } catch {
      toast.error("Couldn't read the file — make sure it's a valid .xlsx or .csv");
    } finally {
      setParsing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const doImport = async () => {
    if (!rows.length) return;
    setImporting(true);
    const counselorId = assignee === "none" ? undefined : assignee;
    const inputs: CreateLeadInput[] = rows.map((r) => ({
      phone: r.phone,
      phoneCountryCode: "",
      fullName: r.fullName,
      email: r.email,
      whatsApp: r.whatsApp,
      counselorId,
      leadType: "cold",
      source: "Excel import",
    }));
    const res = await dal.crm.bulkCreateLeads(inputs);
    setImporting(false);
    if (!res.ok) { toast.error(res.error); return; }
    setResult({ created: res.data.created, duplicates: res.data.duplicates, failed: res.data.failed.length });
    if (res.data.created > 0) { toast.success(`Imported ${res.data.created} lead(s)`); onImported(); }
  };

  const assigneeName = assignee === "none" ? null : counselors.find((c) => c.id === assignee)?.name;

  return (
    <>
      <Button variant="outline" size="sm" className="mb-1 gap-1.5" onClick={() => { reset(); setOpen(true); }}>
        <FileSpreadsheet className="size-4" /> Import from Excel
      </Button>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="inline-flex items-center gap-2"><FileSpreadsheet className="size-5 text-primary" /> Import leads from Excel</DialogTitle>
            <DialogDescription>Upload an .xlsx or .csv file. Only a <strong>phone number</strong> is required per row — name, email and WhatsApp are picked up if present.</DialogDescription>
          </DialogHeader>

          {result ? (
            // ── Result summary ──
            <div className="space-y-4 py-2">
              <div className="flex flex-col items-center gap-2 rounded-2xl border bg-muted/30 py-6 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-success/15 text-success"><CheckCircle2 className="size-7" /></span>
                <p className="text-lg font-semibold">{result.created} lead{result.created === 1 ? "" : "s"} imported</p>
                <p className="text-sm text-muted-foreground">
                  {assigneeName ? `Assigned to ${assigneeName}` : "Kept unassigned"}
                </p>
              </div>
              {(result.duplicates > 0 || result.failed > 0) && (
                <div className="space-y-1.5 rounded-xl border border-warning/30 bg-warning/5 p-3 text-sm">
                  {result.duplicates > 0 && <p className="inline-flex items-center gap-1.5 text-warning-foreground"><AlertTriangle className="size-4 text-warning" /> {result.duplicates} skipped — a lead with that phone already exists.</p>}
                  {result.failed > 0 && <p className="inline-flex items-center gap-1.5"><X className="size-4 text-destructive" /> {result.failed} failed to import.</p>}
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={reset}>Import another file</Button>
                <Button onClick={() => setOpen(false)}>Done</Button>
              </DialogFooter>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload zone */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={parsing}
                className={cn(
                  "flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border/70 bg-muted/20 py-8 text-center transition-colors hover:border-primary/50 hover:bg-primary/5",
                  parsing && "opacity-70",
                )}
              >
                {parsing ? <Loader2 className="size-7 animate-spin text-primary" /> : <UploadCloud className="size-7 text-primary" />}
                <span className="text-sm font-medium">{parsing ? "Reading file…" : fileName || "Click to choose an Excel / CSV file"}</span>
                <span className="text-xs text-muted-foreground">.xlsx · .xls · .csv</span>
              </button>
              <input ref={inputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={onFile} />

              {/* Parse summary */}
              {rows.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border bg-card p-3 text-center">
                      <p className="text-2xl font-bold tabular-nums text-primary">{rows.length}</p>
                      <p className="text-xs text-muted-foreground">valid leads to import</p>
                    </div>
                    <div className="rounded-xl border bg-card p-3 text-center">
                      <p className="text-2xl font-bold tabular-nums text-muted-foreground">{skipped}</p>
                      <p className="text-xs text-muted-foreground">rows skipped (no/duplicate phone)</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Phone read from: <span className="font-medium text-foreground">{phoneCol}</span>. First few: <span className="tabular-nums" dir="ltr">{rows.slice(0, 3).map((r) => r.phone).join(" · ")}{rows.length > 3 ? " …" : ""}</span></p>

                  {/* Assignment */}
                  <div className="space-y-1.5">
                    <Label className="inline-flex items-center gap-1.5"><Users className="size-4" /> Assign all imported leads to</Label>
                    <Select value={assignee} onValueChange={setAssignee}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Keep unassigned</SelectItem>
                        {counselors.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">You can reassign them later from the leads table.</p>
                  </div>
                </>
              )}

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)} disabled={importing}>Cancel</Button>
                <Button onClick={doImport} disabled={importing || !rows.length} className="gap-1.5">
                  {importing && <Loader2 className="size-4 animate-spin" />}
                  {importing ? "Importing…" : `Import ${rows.length || ""} lead${rows.length === 1 ? "" : "s"}`.trim()}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
