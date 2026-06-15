"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, CheckCircle2, Bell, Download } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { Invoice } from "@/lib/db/finance";
import { dal } from "@/lib/dal";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table/data-table";
import { InvoiceStatusBadge } from "./finance-badges";

export function InvoicesTable({
  initialData,
  basePath,
}: {
  initialData: Invoice[];
  basePath: string;
}) {
  const t = useTranslations("Finance");
  const router = useRouter();
  const [rows, setRows] = React.useState<Invoice[]>(initialData);

  const markPaid = async (inv: Invoice) => {
    const res = await dal.finance.markInvoicePaid(inv.id);
    if (res.ok && res.data) {
      setRows((prev) => prev.map((r) => (r.id === inv.id ? res.data! : r)));
      toast.success(t("markPaidDone"));
    }
  };

  const columns = React.useMemo<ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("colInvoice"),
        cell: ({ row }) => (
          <button type="button" onClick={() => router.push(`${basePath}/invoices/${row.original.id}`)}
            className="font-mono text-sm font-medium hover:text-primary">
            {row.original.number}
          </button>
        ),
      },
      {
        accessorKey: "studentName",
        header: t("colStudent"),
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">{getInitials(row.original.studentName)}</AvatarFallback></Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-tight">{row.original.studentName}</p>
              <p className="truncate text-xs text-muted-foreground">{row.original.group || row.original.studentEmail}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: t("colType"),
        cell: ({ row }) => {
          const n = row.original.installments?.length ?? 0;
          return (
            <Badge variant="secondary" className="font-normal">
              {row.original.type === "installment"
                ? t("invInstallments", { n })
                : t("typeOneOff")}
            </Badge>
          );
        },
      },
      {
        accessorKey: "amount",
        header: t("colAmount"),
        cell: ({ row }) => {
          const inv = row.original;
          const pct = inv.amount > 0 ? Math.min(100, Math.round((inv.paid / inv.amount) * 100)) : 0;
          const partial = inv.paid > 0 && inv.paid < inv.amount;
          return (
            <div className="min-w-[120px] space-y-1">
              <span className="font-medium tabular-nums">{formatCurrency(inv.amount, inv.currency)}</span>
              {partial && (
                <>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[0.65rem] text-muted-foreground tabular-nums">{t("invPaidOf", { paid: formatCurrency(inv.paid, inv.currency), total: formatCurrency(inv.amount, inv.currency) })}</p>
                </>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("colStatus"),
        cell: ({ row }) => <InvoiceStatusBadge value={row.original.status} />,
      },
      {
        accessorKey: "issuedDate",
        header: t("colIssued"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.issuedDate}</span>
        ),
      },
      {
        accessorKey: "dueDate",
        header: t("colDue"),
        cell: ({ row }) => (
          <span className={cn("text-xs", row.original.status === "overdue" ? "font-medium text-destructive" : "text-muted-foreground")}>
            {row.original.dueDate}
          </span>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const inv = row.original;
          return (
            <div className="text-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onClick={() => router.push(`${basePath}/invoices/${inv.id}`)}>
                    <Eye className="size-4" /> {t("colInvoice")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => markPaid(inv)} disabled={inv.status === "paid"}>
                    <CheckCircle2 className="size-4" /> {t("markPaid")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success(t("reminderSent"))}>
                    <Bell className="size-4" /> {t("sendReminder")}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => toast.success(t("pdfDownloaded"))}>
                    <Download className="size-4" /> {t("downloadPdf")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, router, basePath],
  );

  return <DataTable columns={columns} data={rows} pageSize={10}
    emptyState={<p className="text-sm text-muted-foreground">{t("noResults")}</p>} />;
}
