"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Send, CheckCircle2, Printer, Download, Ban, Trash2, Paperclip,
  GraduationCap, Mail, CalendarDays, Clock,
} from "lucide-react";
import { toast } from "sonner";

import type { Invoice } from "@/lib/db/finance";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InvoiceStatusBadge } from "./finance-badges";
import { MarkAsPaidModal, ReceiptPreview, type Receipt } from "./mark-as-paid-modal";

export function InvoiceDetail({ invoice: initial }: { invoice: Invoice }) {
  const t = useTranslations("Finance");
  const [invoice, setInvoice] = React.useState(initial);
  const [markOpen, setMarkOpen] = React.useState(false);
  const [receipt, setReceipt] = React.useState<Receipt | null>(null);

  const isPaid = invoice.status === "paid";
  const terms = "Vodafone Cash";

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
                      {invoice.courseThumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={invoice.courseThumbnail} alt={invoice.courseTitle ?? ""} className="size-10 shrink-0 rounded-md border object-cover" />
                      ) : (
                        <span className="grid size-9 place-items-center rounded-md bg-primary/10 text-primary"><GraduationCap className="size-4" /></span>
                      )}
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{invoice.courseTitle ?? invoice.group ?? t("invTuition")}</span>
                        {invoice.group && invoice.courseTitle && <span className="block truncate text-xs text-muted-foreground">{invoice.group}</span>}
                      </span>
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

      {/* Mark as Paid modal — requires a receipt upload before confirming */}
      <MarkAsPaidModal
        invoice={invoice}
        open={markOpen}
        onOpenChange={setMarkOpen}
        onConfirmed={(updated, r) => { setInvoice(updated); setReceipt(r); }}
      />
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

