"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Eye, CheckCircle2, Bell, Download } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import type { Invoice } from "@/lib/db/finance";
import { dal } from "@/lib/dal";
import { formatCurrency } from "@/lib/utils";
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
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{row.original.studentName}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.group}</p>
          </div>
        ),
      },
      {
        accessorKey: "type",
        header: t("colType"),
        cell: ({ row }) => (
          <Badge variant="secondary">
            {t(row.original.type === "installment" ? "typeInstallment" : "typeOneOff")}
          </Badge>
        ),
      },
      {
        accessorKey: "amount",
        header: t("colAmount"),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "status",
        header: t("colStatus"),
        cell: ({ row }) => <InvoiceStatusBadge value={row.original.status} />,
      },
      {
        accessorKey: "dueDate",
        header: t("colDue"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.dueDate}</span>
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
