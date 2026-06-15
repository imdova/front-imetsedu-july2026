"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";

import { useRouter } from "@/i18n/navigation";
import type { AdminStudent } from "@/lib/db/admin";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

export function StudentsTable({ initialData }: { initialData: AdminStudent[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();

  const columns: ColumnDef<AdminStudent>[] = [
    {
      accessorKey: "name",
      header: t("colName"),
      cell: ({ row }) => (
        <button
          type="button"
          onClick={() => router.push(`/admin/students/${row.original.id}`)}
          className="flex items-center gap-3 text-start"
        >
          <Avatar className="size-8">
            <AvatarFallback className="text-xs">{getInitials(row.original.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium hover:text-primary">{row.original.name}</p>
            <p className="truncate text-xs text-muted-foreground">{row.original.email}</p>
          </div>
        </button>
      ),
    },
    { accessorKey: "phone", header: t("colPhone"), cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.phone}</span> },
    { accessorKey: "enrolled", header: t("colEnrolled"), cell: ({ row }) => <span className="tabular-nums">{row.original.enrolled}</span> },
    { accessorKey: "totalSpent", header: t("colSpent"), cell: ({ row }) => <span className="tabular-nums">{formatCurrency(row.original.totalSpent, "EGP")}</span> },
    { accessorKey: "joinedAt", header: t("colJoined"), cell: ({ row }) => <span className="text-muted-foreground tabular-nums">{row.original.joinedAt}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
  ];

  return <DataTable columns={columns} data={initialData} pageSize={8} />;
}
