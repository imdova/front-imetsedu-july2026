"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { Category } from "@/lib/db/admin";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";
import { AdminField } from "./admin-field";

export function CategoriesModule({ initialData }: { initialData: Category[] }) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState(initialData);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", nameAr: "" });

  const submit = async () => {
    const res = await dal.admin.createCategory(form);
    if (res.ok) {
      setRows((p) => [res.data, ...p]);
      toast.success(t("categoryCreated", { name: res.data.name }));
      setOpen(false); setForm({ name: "", nameAr: "" });
    }
  };

  const columns: ColumnDef<Category>[] = [
    { accessorKey: "name", header: t("colName"), cell: ({ row }) => (
      <div><p className="font-medium">{row.original.name}</p>
        <p className="text-xs text-muted-foreground" dir="rtl">{row.original.nameAr}</p></div>) },
    { accessorKey: "slug", header: t("colSlug"), cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span> },
    { accessorKey: "subcategories", header: t("colSub"), cell: ({ row }) => <Badge variant="secondary">{row.original.subcategories}</Badge> },
    { accessorKey: "courseCount", header: t("colCount"), cell: ({ row }) => <span className="tabular-nums">{row.original.courseCount}</span> },
    { accessorKey: "active", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.active ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" />{t("newCategory")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("newCategory")}</DialogTitle><DialogDescription>{t("newCategoryDesc")}</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <AdminField label={t("categoryNameEn")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <AdminField label={t("categoryNameAr")} value={form.nameAr} onChange={(v) => setForm({ ...form, nameAr: v })} dir="rtl" />
            </div>
            <DialogFooter><Button onClick={submit} disabled={!form.name}>{t("create")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={rows} pageSize={8} />
    </div>
  );
}
