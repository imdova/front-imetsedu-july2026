"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Paperclip, UploadCloud, ImageIcon, FileText, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { Invoice } from "@/lib/db/finance";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

/** A receipt staged in the browser before confirming payment. */
export interface Receipt {
  name: string;
  paidOn: string;
  url: string | null; // object URL for images; null for non-image files (e.g. PDF)
  size: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ReceiptPreview({ receipt, className }: { receipt: Receipt; className?: string }) {
  const isPdf = receipt.name.toLowerCase().endsWith(".pdf") || (receipt.url && receipt.url.toLowerCase().includes(".pdf"));
  if (receipt.url && !isPdf) {
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

/**
 * "Mark as paid" flow — a receipt MUST be uploaded before the invoice can be
 * marked paid. Shared by the invoice detail page and the invoices list so the
 * requirement is enforced everywhere. The receipt is staged client-side (no
 * upload endpoint yet); on confirm we PATCH the invoice status to paid.
 */
export function MarkAsPaidModal({
  invoice, open, onOpenChange, onConfirmed,
}: {
  invoice: Invoice;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onConfirmed: (updated: Invoice, receipt: Receipt) => void;
}) {
  const t = useTranslations("Finance");
  const [staged, setStaged] = React.useState<Receipt | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => () => { if (staged?.url) URL.revokeObjectURL(staged.url); }, [staged]);

  const acceptFile = (f: File | undefined | null) => {
    if (!f) return;
    if (f.size > 10 * 1024 * 1024) { toast.error(t("receiptTooLarge")); return; }
    const isImage = f.type.startsWith("image/");
    setStaged({ name: f.name, paidOn: invoice.dueDate, url: isImage ? URL.createObjectURL(f) : null, size: formatBytes(f.size) });
  };

  const close = () => { setStaged(null); onOpenChange(false); };

  const confirm = async () => {
    if (!staged) return;
    setSaving(true);
    const res = await dal.finance.markInvoicePaid(invoice.id);
    setSaving(false);
    const updated = res.ok && res.data ? res.data : { ...invoice, status: "paid" as const, paid: invoice.amount };
    onConfirmed(updated, staged);
    setStaged(null);
    onOpenChange(false);
    toast.success(t("markPaidDone"));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
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
            <p className="text-xs font-medium text-warning">{t("receiptRequired")}</p>
            <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => acceptFile(e.target.files?.[0])} />
          </label>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={close} disabled={saving}>{t("cancelInvoice")}</Button>
          <Button
            className="gap-1.5 bg-success text-white hover:bg-success/90 disabled:opacity-60"
            onClick={confirm}
            disabled={!staged || saving}
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            {t("confirmPayment")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
