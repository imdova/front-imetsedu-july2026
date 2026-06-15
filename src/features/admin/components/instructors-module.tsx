"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Star } from "lucide-react";
import { toast } from "sonner";

import type { Instructor } from "@/lib/db/admin";
import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";

export function InstructorsModule({ initialData }: { initialData: Instructor[] }) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState(initialData);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name: "", titleEn: "", titleAr: "", email: "" });

  const submit = async () => {
    const res = await dal.admin.createInstructor(form);
    if (res.ok) {
      setRows((p) => [res.data, ...p]);
      toast.success(t("instructorCreated", { name: res.data.name }));
      setOpen(false); setForm({ name: "", titleEn: "", titleAr: "", email: "" });
    }
  };

  const columns: ColumnDef<Instructor>[] = [
    { accessorKey: "name", header: t("colName"), cell: ({ row }) => (
      <Link href={`/admin/instructors/${row.original.id}`} className="flex items-center gap-3">
        <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{row.original.initials}</AvatarFallback></Avatar>
        <div><p className="font-medium hover:text-primary">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.titleEn}</p></div>
      </Link>) },
    { accessorKey: "email", header: t("colEmail"), cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.email}</span> },
    { accessorKey: "experience", header: t("colExperience"), cell: ({ row }) => <span className="text-sm">{t("yearsShort", { n: row.original.experience })}</span> },
    { accessorKey: "rating", header: t("colRating"), cell: ({ row }) => row.original.rating > 0 ? (
      <span className="inline-flex items-center gap-1 tabular-nums"><Star className="size-3.5 fill-warning text-warning" />{row.original.rating}</span>) : <span className="text-muted-foreground">—</span> },
    { accessorKey: "courses", header: t("colCourses"), cell: ({ row }) => <span className="tabular-nums">{row.original.courses}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-1.5"><Plus className="size-4" />{t("newInstructor")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("newInstructor")}</DialogTitle><DialogDescription>{t("newInstructorDesc")}</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <Field label={t("colName")} value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
              <Field label={t("colEmail")} value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <Field label={t("instructorNameEn")} value={form.titleEn} onChange={(v) => setForm({ ...form, titleEn: v })} />
              <Field label={t("instructorNameAr")} value={form.titleAr} onChange={(v) => setForm({ ...form, titleAr: v })} dir="rtl" />
            </div>
            <DialogFooter><Button onClick={submit} disabled={!form.name || !form.email}>{t("create")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <DataTable columns={columns} data={rows} pageSize={8} />
    </div>
  );
}

function Field({ label, value, onChange, type, dir }: { label: string; value: string; onChange: (v: string) => void; type?: string; dir?: "rtl" }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} type={type} dir={dir} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
