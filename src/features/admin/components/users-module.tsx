"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import type { AdminUser, Invitation } from "@/lib/db/admin";
import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { AdminStatusBadge } from "./admin-status-badge";
import { AdminField } from "./admin-field";

export function UsersModule({
  users, initialInvitations, roleOptions,
}: {
  users: AdminUser[];
  initialInvitations: Invitation[];
  roleOptions: string[];
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = React.useState<"users" | "invitations">("users");
  const [invites, setInvites] = React.useState(initialInvitations);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", role: roleOptions[0] ?? "" });

  const submit = async () => {
    const res = await dal.admin.inviteUser(form);
    if (res.ok) {
      setInvites((p) => [res.data, ...p]);
      toast.success(t("userInvited", { email: res.data.email }));
      setOpen(false); setForm({ email: "", role: roleOptions[0] ?? "" });
    }
  };

  const userCols: ColumnDef<AdminUser>[] = [
    { accessorKey: "name", header: t("colName"), cell: ({ row }) => (
      <Link href={`/admin/users/${row.original.id}`} className="flex items-center gap-3">
        <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{row.original.initials}</AvatarFallback></Avatar>
        <div><p className="font-medium hover:text-primary">{row.original.name}</p><p className="text-xs text-muted-foreground">{row.original.email}</p></div>
      </Link>) },
    { accessorKey: "role", header: t("colRole"), cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge> },
    { accessorKey: "department", header: t("colDepartment"), cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.department}</span> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
    { accessorKey: "lastActive", header: t("colLastActive"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.lastActive}</span> },
  ];

  const inviteCols: ColumnDef<Invitation>[] = [
    { accessorKey: "email", header: t("colEmail"), cell: ({ row }) => <span className="font-medium">{row.original.email}</span> },
    { accessorKey: "role", header: t("colRole"), cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge> },
    { accessorKey: "status", header: t("colStatus"), cell: ({ row }) => <AdminStatusBadge value={row.original.status} /> },
    { accessorKey: "sentAt", header: t("colSent"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.sentAt}</span> },
    { id: "actions", cell: ({ row }) => row.original.status === "pending" ? (
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => toast.success(t("resend"))}>{t("resend")}</Button>
        <Button variant="ghost" size="sm" onClick={() => toast.success(t("cancel"))}>{t("cancel")}</Button>
      </div>) : null },
  ];

  const pendingCount = invites.filter((i) => i.status === "pending").length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b">
        <div className="flex gap-6">
          {([["users", t("tabAllUsers"), null], ["invitations", t("tabInvitations"), pendingCount]] as const).map(([key, label, count]) => (
            <button key={key} type="button" onClick={() => setTab(key)}
              className={cn("relative -mb-px flex items-center gap-2 border-b-2 px-1 pb-3 text-sm font-medium transition-colors",
                tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
              {label}
              {count !== null && <span className="rounded-full bg-warning/15 px-1.5 py-0.5 text-[0.7rem] font-semibold text-warning">{count}</span>}
            </button>
          ))}
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button size="sm" className="mb-2 gap-1.5"><Plus className="size-4" />{t("inviteUser")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("inviteUser")}</DialogTitle><DialogDescription>{t("inviteUserDesc")}</DialogDescription></DialogHeader>
            <div className="space-y-4">
              <AdminField label={t("colEmail")} value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
              <div className="space-y-1.5">
                <Label>{t("colRole")}</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{roleOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter><Button onClick={submit} disabled={!form.email}>{t("send")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tab === "users"
        ? <DataTable columns={userCols} data={users} pageSize={8} />
        : <DataTable columns={inviteCols} data={invites} pageSize={8} />}
    </div>
  );
}
