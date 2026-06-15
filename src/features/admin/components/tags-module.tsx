"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { Tag } from "@/lib/db/admin";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";
import { AdminField } from "./admin-field";

export function TagsModule({ initialData }: { initialData: Tag[] }) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState(initialData);
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");

  const submit = async () => {
    const res = await dal.admin.createTag({ name });
    if (res.ok) {
      setRows((p) => [res.data, ...p]);
      toast.success(t("tagCreated", { name: res.data.name }));
      setOpen(false); setName("");
    }
  };

  const columns: ColumnDef<Tag>[] = [
    { accessorKey: "name", header: t("colName"), cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "slug", header: t("colSlug"), cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span> },
    { accessorKey: "courseCount", header: t("colCount"), cell: ({ row }) => <span className="tabular-nums">{row.original.courseCount}</span> },
    { accessorKey: "active", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.active ? "active" : "inactive"} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" />{t("newTag")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("newTag")}</DialogTitle><DialogDescription>{t("newTagDesc")}</DialogDescription></DialogHeader>
            <AdminField label={t("tagName")} value={name} onChange={setName} />
            <DialogFooter><Button onClick={submit} disabled={!name}>{t("create")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={rows} pageSize={8} />
    </div>
  );
}
