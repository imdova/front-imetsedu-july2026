"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Send, CheckCircle2, Printer, Download, Ban, Trash2, Paperclip,
  GraduationCap, Mail, CalendarDays, Clock, UploadCloud, ImageIcon, FileText, X,
} from "lucide-react";
import { toast } from "sonner";

import type { Invoice } from "@/lib/db/finance";
import { dal } from "@/lib/dal";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { InvoiceStatusBadge } from "./finance-badges";

interface Receipt {
  name: string;
  paidOn: string;
  url: string | null; // object URL for images; null for non-image files (e.g. PDF)
  size: string;
}

export function InvoiceDetail({ invoice: initial }: { invoice: Invoice }) {
  const t = useTranslations("Finance");
  const [invoice, setInvoice] = React.useState(initial);
  const [markOpen, setMarkOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);

  // staged file inside the modal, before confirming
  const [staged, setStaged] = React.useState<Receipt | null>(null);
  const [dragOver, setDragOver] = React.useState(false);

  const isPaid = invoice.status === "paid";
  const terms = "Vodafone Cash";

  // Clean up any object URLs we created.
  React.useEffect(() => () => {
    if (staged?.url) URL.revokeObjectURL(staged.url);
  }, [staged]);

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return;
    const tooBig = f.size > 10 * 1024 * 1024;
    if (tooBig) {
      toast.error(t("receiptTooLarge"));
      return;
    }
    const isImage = f.type.startsWith("image/");
    setStaged({
      name: f.name,
      paidOn: invoice.dueDate,
      url: isImage ? URL.createObjectURL(f) : null,
      size: formatBytes(f.size),
    });
  };

  const closeModal = () => {
    setStaged(null);
    setMarkOpen(false);
  };

  const confirmPaid = async () => {
    if (!staged) return;
    const res = await dal.finance.markInvoicePaid(invoice.id);
    if (res.ok && res.data) setInvoice(res.data);
    setReceipt(staged);
    setStaged(null);
    setMarkOpen(false);
    toast.success(t("markPaidDone"));
  };

  return (
    <div className="space-y-5">
      {/* Header: number + status + status-aware actions */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="flex items-center gap-3 font-heading text-2xl font-bold tracking-tight">
          {invoice.number}<InvoiceStatusBadge value={invoice.status} />
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          {!isPaid && (
            <>
              <Button className="gap-1.5" onClick={() => toast.success(t("reminderSent"))}><Send className="size-4" />{t("sendReminder")}</Button>
              <Button variant="outline" className="gap-1.5" onClick={() => setMarkOpen(true)}><CheckCircle2 className="size-4" />{t("markPaid")}</Button>
            </>
          )}
          <Button variant="outline" className="gap-1.5" onClick={() => toast.info(t("printBtn"))}><Printer className="size-4" />{t("printBtn")}</Button>
          <Button variant="outline" className="gap-1.5" onClick={() => toast.success(t("pdfDownloaded"))}><Download className="size-4" />{t("downloadBtn")}</Button>
          {isPaid && <Button variant="outline" className="gap-1.5" onClick={() => toast.info(t("receiptBtn"))}><Paperclip className="size-4" />{t("receiptBtn")}</Button>}
          {!isPaid && <Button variant="outline" className="gap-1.5 text-destructive" onClick={() => toast.error(t("invoiceCancelled"))}><Ban className="size-4" />{t("cancelInvoice")}</Button>}
          <Button variant="outline" className="gap-1.5 text-destructive" onClick={() => toast.error(t("invoiceDeleted"))}><Trash2 className="size-4" />{t("deleteInvoice")}</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Invoice document */}
        <Card>
          <CardContent className="space-y-6 pt-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-lg bg-gradient-to-br from-primary to-[oklch(0.55_0.2_286)] text-white"><GraduationCap className="size-5" /></span>
                  <span className="font-heading text-lg font-bold">IMETS</span>
                </div>
                <p className="mt-3 font-semibold">{t("invCompanyName")}</p>
                <p className="text-sm text-muted-foreground">{t("invCompanyAddr")}</p>
              </div>
              <div className="text-end">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("invLabel")}</p>
                <p className="font-heading text-xl font-bold">{invoice.number}</p>
              </div>
            </div>

            <div className="border-t" />

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("invBillTo")}</p>
                <p className="mt-1 font-semibold">{invoice.studentName}</p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Mail className="size-3.5" />{invoice.studentEmail}</p>
              </div>
              <div className="space-y-3 text-end">
                <Meta icon={CalendarDays} label={t("invIssueDate")} value={invoice.issuedDate} />
                <Meta icon={Clock} label={t("invDueDate")} value={invoice.dueDate} />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("invTerms")}</p>
                  <p className="font-medium">{terms}</p>
                </div>
              </div>
            </div>

            <div className="border-t" />

            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 text-start font-semibold">{t("invDescription")}</th>
                  <th className="pb-2 text-center font-semibold">{t("invQty")}</th>
                  <th className="pb-2 text-end font-semibold">{t("invUnitPrice")}</th>
                  <th className="pb-2 text-end font-semibold">{t("invTotal")}</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="py-3">
                    <span className="inline-flex items-center gap-2.5">
                      <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary"><GraduationCap className="size-4" /></span>
                      {invoice.group ?? "Tuition"}
                    </span>
                  </td>
                  <td className="py-3 text-center tabular-nums">1</td>
                  <td className="py-3 text-end tabular-nums">{formatCurrency(invoice.amount, invoice.currency)}</td>
                  <td className="py-3 text-end tabular-nums">{formatCurrency(invoice.amount, invoice.currency)}</td>
                </tr>
              </tbody>
            </table>

            <div className="ms-auto max-w-xs space-y-2">
              <div className="flex items-center justify-between border-t pt-3 text-sm">
                <span className="text-muted-foreground">{t("invSubtotal")}</span>
                <span className="tabular-nums">{formatCurrency(invoice.amount, invoice.currency)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-3 text-base font-bold">
                <span>{t("invTotalDue")}</span>
                <span className="tabular-nums">{formatCurrency(invoice.amount, invoice.currency)}</span>
              </div>
            </div>

            {receipt && (
              <div className="space-y-2 border-t pt-5">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><Paperclip className="size-3.5" />{t("paymentReceiptLabel")}</p>
                <ReceiptPreview receipt={receipt} className="h-44 max-w-md" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          {receipt && (
            <Card>
              <CardHeader><CardTitle className="inline-flex items-center gap-1.5 text-base"><Paperclip className="size-4" />{t("paymentReceiptLabel")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <ReceiptPreview receipt={receipt} className="h-36" />
                <div className="space-y-1.5 text-sm">
                  <Row label={t("fileLabel")} value={`${receipt.name} (${receipt.size})`} />
                  <Row label={t("paidOnLabel")} value={receipt.paidOn} />
                </div>
                <Button asChild variant="outline" size="sm" className="w-full gap-1.5">
                  {receipt.url ? (
                    <a href={receipt.url} download={receipt.name}><Download className="size-4" />{t("downloadBtn")}</a>
                  ) : (
                    <span><Download className="size-4" />{t("downloadBtn")}</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader><CardTitle className="text-base">{t("activityLabel")}</CardTitle></CardHeader>
            <CardContent>
              <ol className="relative space-y-4 ps-5 before:absolute before:inset-y-1 before:start-[7px] before:w-px before:bg-border">
                {[
                  isPaid ? { text: t("actInvoicePaid"), ago: receipt?.paidOn ?? invoice.dueDate } : null,
                  { text: t("actInvoiceSent"), ago: invoice.issuedDate },
                  { text: t("actInvoiceCreated"), ago: invoice.issuedDate },
                ].filter((e): e is { text: string; ago: string } => Boolean(e)).map((ev, i) => (
                  <li key={i} className="relative">
                    <span className="absolute -start-5 top-1 size-3 rounded-full bg-primary/20 ring-2 ring-primary/40" />
                    <p className="text-sm font-medium">{ev.text}</p>
                    <p className="text-xs text-muted-foreground">{ev.ago}</p>
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mark as Paid modal */}
      <Dialog open={markOpen} onOpenChange={(o) => (o ? setMarkOpen(true) : closeModal())}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-lg bg-success/15 text-success"><CheckCircle2 className="size-5" /></span>
              <span>{t("markAsPaid")}<br /><span className="text-sm font-normal text-muted-foreground">{invoice.number}</span></span>
            </DialogTitle>
            <DialogDescription>{t("markPaidDesc")}</DialogDescription>
          </DialogHeader>

          {staged ? (
            <div className="space-y-3 rounded-xl border p-3">
              <ReceiptPreview receipt={staged} className="h-48" />
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="inline-flex min-w-0 items-center gap-1.5">
                  <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                  <span className="truncate font-medium">{staged.name}</span>
                  <span className="shrink-0 text-muted-foreground">({staged.size})</span>
                </span>
                <Button variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={() => setStaged(null)}>
                  <X className="size-4" />{t("removeReceipt")}
                </Button>
              </div>
            </div>
          ) : (
            <label
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); acceptFile(e.dataTransfer.files?.[0]); }}
              className={cn(
                "grid cursor-pointer place-items-center gap-2 rounded-xl border-2 border-dashed py-10 text-center transition-colors",
                dragOver ? "border-primary bg-primary/5" : "hover:bg-muted/30",
              )}
            >
              <div className="flex items-center gap-2 text-muted-foreground"><UploadCloud className="size-7" /><ImageIcon className="size-7" /></div>
              <p className="font-medium">{t("dropReceipt")}</p>
              <p className="text-xs text-muted-foreground">{t("receiptFormats")}</p>
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => acceptFile(e.target.files?.[0])} />
            </label>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>{t("cancelInvoice")}</Button>
            <Button
              className="gap-1.5 bg-success text-white hover:bg-success/90 disabled:opacity-60"
              onClick={confirmPaid}
              disabled={!staged}
            >
              <CheckCircle2 className="size-4" />{t("confirmPayment")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Meta({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="inline-flex items-center gap-1.5 font-medium"><Icon className="size-3.5 text-muted-foreground" />{value}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="truncate font-medium">{value}</span>
    </div>
  );
}

/** Renders the attached receipt: the image itself, or a file tile for PDFs. */
function ReceiptPreview({ receipt, className }: { receipt: Receipt; className?: string }) {
  if (receipt.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={receipt.url} alt={receipt.name} className={cn("w-full rounded-lg border bg-muted/40 object-contain", className)} />
    );
  }
  return (
    <div className={cn("grid place-items-center gap-1.5 rounded-lg border bg-muted/40 text-muted-foreground", className)}>
      <FileText className="size-9 opacity-50" />
      <span className="max-w-[80%] truncate text-xs">{receipt.name}</span>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
