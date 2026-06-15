"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import type { Transaction, InstructorPayout, TransactionType } from "@/lib/db/admin";
import { cn, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

const TYPE_KEY: Record<TransactionType, string> = {
  payment: "typePayment",
  refund: "typeRefund",
  payout: "typePayout",
};

export function TransactionsModule({
  transactions,
  payouts,
}: {
  transactions: Transaction[];
  payouts: InstructorPayout[];
}) {
  const t = useTranslations("Admin");

  const txnColumns: ColumnDef<Transaction>[] = [
    { accessorKey: "reference", header: t("colReference"), cell: ({ row }) => <span className="font-mono text-xs">{row.original.reference}</span> },
    { accessorKey: "party", header: t("colParty"), cell: ({ row }) => (
      <div className="min-w-0"><p className="truncate font-medium">{row.original.party}</p><p className="truncate text-xs text-muted-foreground">{row.original.detail}</p></div>
    ) },
    { accessorKey: "type", header: t("colType"), cell: ({ row }) => <Badge variant="secondary">{t(TYPE_KEY[row.original.type])}</Badge> },
    { accessorKey: "method", header: t("colMethod"), cell: ({ row }) => <span className="text-muted-foreground">{row.original.method}</span> },
    { accessorKey: "date", header: t("colDate"), cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.date}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
    { accessorKey: "amount", header: t("colAmount"), cell: ({ row }) => (
      <span className={cn("font-medium tabular-nums", row.original.amount < 0 ? "text-destructive" : "")}>{formatCurrency(row.original.amount, "EGP")}</span>
    ) },
  ];

  const payoutColumns: ColumnDef<InstructorPayout>[] = [
    { accessorKey: "instructor", header: t("colInstructor"), cell: ({ row }) => <span className="font-medium">{row.original.instructor}</span> },
    { accessorKey: "period", header: t("colPeriod"), cell: ({ row }) => <span>{row.original.period}</span> },
    { accessorKey: "courses", header: t("colCourses"), cell: ({ row }) => <span className="tabular-nums">{row.original.courses}</span> },
    { accessorKey: "method", header: t("colMethod"), cell: ({ row }) => <span className="text-muted-foreground">{row.original.method}</span> },
    { accessorKey: "date", header: t("colDate"), cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.date}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
    { accessorKey: "amount", header: t("colAmount"), cell: ({ row }) => <span className="font-medium tabular-nums">{formatCurrency(row.original.amount, "EGP")}</span> },
  ];

  return (
    <Tabs defaultValue="transactions" className="space-y-4">
      <TabsList>
        <TabsTrigger value="transactions">{t("tabTransactions")}</TabsTrigger>
        <TabsTrigger value="payouts">{t("tabPayouts")}</TabsTrigger>
      </TabsList>
      <TabsContent value="transactions">
        <DataTable columns={txnColumns} data={transactions} pageSize={8} />
      </TabsContent>
      <TabsContent value="payouts">
        <DataTable columns={payoutColumns} data={payouts} pageSize={8} />
      </TabsContent>
    </Tabs>
  );
}
