"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Check, Cog, X } from "lucide-react";
import { toast } from "sonner";

import type { Refund, RefundStatus } from "@/lib/db/finance";
import { dal } from "@/lib/dal";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table/data-table";
import { RefundStatusBadge } from "./finance-badges";

export function RefundsTable({ initialData }: { initialData: Refund[] }) {
  const t = useTranslations("Finance");
  const [rows, setRows] = React.useState<Refund[]>(initialData);

  const setStatus = async (refund: Refund, status: RefundStatus, labelKey: string) => {
    const res = await dal.finance.updateRefundStatus(refund.id, status);
    if (res.ok && res.data) {
      setRows((prev) => prev.map((r) => (r.id === refund.id ? res.data! : r)));
      toast.success(t("refundUpdated", { status: t(labelKey) }));
    }
  };

  const columns = React.useMemo<ColumnDef<Refund>[]>(
    () => [
      {
        accessorKey: "number",
        header: t("colRefund"),
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
        accessorKey: "amount",
        header: t("colAmount"),
        cell: ({ row }) => (
          <span className="font-medium tabular-nums">
            {formatCurrency(row.original.amount, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: "reason",
        header: t("colReason"),
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">{row.original.reason}</span>
        ),
      },
      {
        accessorKey: "status",
        header: t("colStatus"),
        cell: ({ row }) => <RefundStatusBadge value={row.original.status} />,
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const r = row.original;
          return (
            <div className="text-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-8">
                    <MoreHorizontal className="size-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatus(r, "approved", "statusApproved")}>
                    <Check className="size-4" /> {t("approve")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatus(r, "processed", "statusProcessed")}>
                    <Cog className="size-4" /> {t("process")}
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => setStatus(r, "rejected", "statusRejected")}>
                    <X className="size-4" /> {t("reject")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return <DataTable columns={columns} data={rows} pageSize={10}
    emptyState={<p className="text-sm text-muted-foreground">{t("noResults")}</p>} />;
}
