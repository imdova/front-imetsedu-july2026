"use client";

import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Building2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import type { Role, Department } from "@/lib/db/admin";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/shared/data-table/data-table";

export function RolesModule({ roles, departments }: { roles: Role[]; departments: Department[] }) {
  const t = useTranslations("Admin");
  const columns: ColumnDef<Role>[] = [
    { accessorKey: "title", header: t("colTitle"), cell: ({ row }) => (
      <span className="inline-flex items-center gap-2 font-medium"><ShieldCheck className="size-4 text-primary" />{row.original.title}</span>) },
    { accessorKey: "department", header: t("colDepartment"), cell: ({ row }) => <Badge variant="secondary">{row.original.department}</Badge> },
    { accessorKey: "description", header: "—", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.description}</span> },
    { accessorKey: "members", header: t("colMembers"), cell: ({ row }) => <span className="tabular-nums">{row.original.members}</span> },
    { accessorKey: "permissions", header: t("colPermissions"), cell: ({ row }) => <Badge variant="secondary" className="tabular-nums">{row.original.permissions}</Badge> },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {departments.map((d) => (
          <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
            <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-5" /></span>
            <div><p className="font-medium">{d.name}</p><p className="text-xs text-muted-foreground">{d.members} {t("colMembers").toLowerCase()}</p></div>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button className="gap-1.5" onClick={() => toast.info(t("newRole"))}><Plus className="size-4" />{t("newRole")}</Button>
      </div>
      <DataTable columns={columns} data={roles} pageSize={8} />
    </div>
  );
}
