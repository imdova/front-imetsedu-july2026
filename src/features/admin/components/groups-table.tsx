"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import { useRouter } from "@/i18n/navigation";
import type { Group } from "@/lib/db/admin";
import { formatCurrency } from "@/lib/utils";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

export function GroupsTable({ initialData }: { initialData: Group[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const columns: ColumnDef<Group>[] = [
    { accessorKey: "title", header: t("colTitle"), cell: ({ row }) => (
      <button type="button" onClick={() => router.push(`/admin/groups/${row.original.id}`)} className="font-medium hover:text-primary">{row.original.title}</button>) },
    { accessorKey: "category", header: t("colCategory"), cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.category}</span> },
    { accessorKey: "startDate", header: t("colStart"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.startDate}</span> },
    { accessorKey: "endDate", header: t("colEnd"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.endDate}</span> },
    { accessorKey: "students", header: t("colStudents"), cell: ({ row }) => <span className="tabular-nums">{t("ofCapacity", { n: row.original.students, cap: row.original.capacity })}</span> },
    { accessorKey: "revenue", header: t("colRevenue"), cell: ({ row }) => <span className="font-medium tabular-nums">{formatCurrency(row.original.revenue, "EGP")}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
  ];
  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
