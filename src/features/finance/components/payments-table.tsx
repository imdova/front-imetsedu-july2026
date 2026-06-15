"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import type { Payment } from "@/lib/db/finance";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table/data-table";
import { PaymentStatusBadge } from "./finance-badges";

export function PaymentsTable({ initialData }: { initialData: Payment[] }) {
  const t = useTranslations("Finance");

  const columns = React.useMemo<ColumnDef<Payment>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("colPayment"),
        cell: ({ row }) => (
          <span className="font-mono text-sm font-medium">{row.original.number}</span>
        ),
      },
      {
        accessorKey: "studentName",
        header: t("colStudent"),
        cell: ({ row }) => <span className="text-sm font-medium">{row.original.studentName}</span>,
      },
      {
        accessorKey: "invoiceNumber",
        header: t("colInvoice"),
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">{row.original.invoiceNumber}</span>
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
        accessorKey: "method",
        header: t("colMethod"),
        cell: ({ row }) => <Badge variant="secondary">{row.original.method}</Badge>,
      },
      {
        accessorKey: "date",
        header: t("colDate"),
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">{row.original.date}</span>
        ),
      },
      {
        accessorKey: "status",
        header: t("colStatus"),
        cell: ({ row }) => <PaymentStatusBadge value={row.original.status} />,
      },
    ],
    [t],
  );

  return <DataTable columns={columns} data={initialData} pageSize={10}
    emptyState={<p className="text-sm text-muted-foreground">{t("noResults")}</p>} />;
}
