"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Users, CheckCircle2, Mail, Search, Columns3, RefreshCw, Download, ShieldCheck,
  UserPlus, MoreHorizontal, Eye, Pencil, Send, Ban, Trash2, UserCog, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import type { UmUser, UmStats, UmUserStatus, UmRole, UmDepartment } from "@/lib/db/user-management";
import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const PAGE_SIZE = 10;

function StatusPill({ status, label }: { status: UmUserStatus; label: string }) {
  const styles: Record<UmUserStatus, string> = {
    active: "bg-success/10 text-success ring-success/20",
    pending: "bg-warning/10 text-warning ring-warning/20",
    suspended: "bg-destructive/10 text-destructive ring-destructive/20",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset", styles[status])}>
      <span className="size-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

function Kpi({ label, value, sub, subTone, icon, tone }: {
  label: string; value: number; sub: string; subTone?: "success"; icon: React.ReactNode; tone: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <span className={cn("grid size-9 place-items-center rounded-xl", tone)}>{icon}</span>
      </div>
      <p className="mt-3 text-3xl font-bold tabular-nums">{value}</p>
      <p className={cn("mt-1 flex items-center gap-1 text-xs", subTone === "success" ? "text-success" : "text-muted-foreground")}>{sub}</p>
    </div>
  );
}

export function UserDirectory({
  users, stats, roles = [], departments = [],
}: {
  users: UmUser[]; stats: UmStats; roles?: UmRole[]; departments?: UmDepartment[];
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [list, setList] = React.useState<UmUser[]>(users);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | UmUserStatus>("all");
  const [roleFilter, setRoleFilter] = React.useState("all");
  const [deptFilter, setDeptFilter] = React.useState("all");
  const [page, setPage] = React.useState(0);

  // Edit-profile + change-role dialogs
  const [editUser, setEditUser] = React.useState<UmUser | null>(null);
  const [editForm, setEditForm] = React.useState({ name: "", title: "", phone: "" });
  const [roleUser, setRoleUser] = React.useState<UmUser | null>(null);
  const [roleForm, setRoleForm] = React.useState({ staffRole: "", department: "" });
  const [busy, setBusy] = React.useState(false);

  const openEdit = (u: UmUser) => {
    setEditUser(u);
    setEditForm({ name: u.name, title: u.title === "—" ? "" : u.title, phone: u.phone ?? "" });
  };
  const saveEdit = async () => {
    if (!editUser || !editForm.name.trim()) return;
    setBusy(true);
    const res = await dal.userManagement.updateUmUser(editUser.id, {
      name: editForm.name.trim(),
      professionalTitle: editForm.title.trim(),
      number: editForm.phone.trim(),
    });
    setBusy(false);
    if (res.ok) {
      const id = editUser.id;
      setList((p) => p.map((x) => (x.id === id
        ? { ...x, name: editForm.name.trim(), title: editForm.title.trim() || x.title, phone: editForm.phone.trim(), initials: res.data.initials }
        : x)));
      setEditUser(null);
      toast.success(t("umActionEditSaved"));
    } else toast.error(res.error);
  };

  const openRole = (u: UmUser) => {
    setRoleUser(u);
    setRoleForm({
      staffRole: roles.find((r) => r.name === u.role)?.id ?? "",
      department: departments.find((d) => d.name === u.department)?.id ?? "",
    });
  };
  const saveRole = async () => {
    if (!roleUser || !roleForm.staffRole) return;
    setBusy(true);
    const res = await dal.userManagement.updateUmUser(roleUser.id, {
      staffRole: roleForm.staffRole,
      ...(roleForm.department ? { department: roleForm.department } : {}),
    });
    setBusy(false);
    if (res.ok) {
      const id = roleUser.id;
      const roleName = roles.find((r) => r.id === roleForm.staffRole)?.name ?? res.data.role;
      const deptName = departments.find((d) => d.id === roleForm.department)?.name ?? res.data.department;
      setList((p) => p.map((x) => (x.id === id ? { ...x, role: roleName, department: deptName } : x)));
      setRoleUser(null);
      toast.success(t("umActionRoleChanged"));
    } else toast.error(res.error);
  };

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((u) => {
      if (status !== "all" && u.status !== status) return false;
      if (roleFilter !== "all" && u.role !== roleFilter) return false;
      if (deptFilter !== "all" && u.department !== deptFilter) return false;
      if (!q) return true;
      return [u.name, u.email, u.title, u.role, u.department].some((f) => f.toLowerCase().includes(q));
    });
  }, [list, search, status, roleFilter, deptFilter]);

  const view = (u: UmUser) => router.push(`/admin/users/${u.id}`);

  const resend = async (u: UmUser) => {
    if (!u.invitationId) { toast.error(t("umNoInvitationId")); return; }
    const res = await dal.userManagement.resendUmInvite(u.invitationId);
    if (res.ok) toast.success(t("umActionResend"));
    else toast.error(res.error);
  };

  const setStatusOf = (id: string, next: UmUserStatus) =>
    setList((p) => p.map((x) => (x.id === id ? { ...x, status: next } : x)));

  const toggleSuspend = async (u: UmUser) => {
    const suspend = u.status !== "suspended";
    const prev = list;
    setStatusOf(u.id, suspend ? "suspended" : "active");
    const res = suspend
      ? await dal.userManagement.deactivateUmUser(u.id)
      : await dal.userManagement.activateUmUser(u.id);
    if (res.ok) toast.success(suspend ? t("umActionSuspend") : t("umActionActivate"));
    else { setList(prev); toast.error(res.error); }
  };

  /** Reassign a staff member's role directly from the Role column. */
  const changeRole = async (u: UmUser, roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    if (!role || role.name === u.role) return;
    const prev = list;
    setList((p) => p.map((x) => (x.id === u.id ? { ...x, role: role.name } : x)));
    const res = await dal.userManagement.updateUmUser(u.id, { staffRole: roleId });
    if (res.ok) toast.success(t("umActionRoleChanged"));
    else { setList(prev); toast.error(res.error); }
  };

  /** Set a staff member's status directly from the Status column. */
  const changeStatus = async (u: UmUser, next: "active" | "suspended") => {
    if (next === u.status) return;
    const prev = list;
    setStatusOf(u.id, next);
    const res = next === "suspended"
      ? await dal.userManagement.deactivateUmUser(u.id)
      : await dal.userManagement.activateUmUser(u.id);
    if (res.ok) toast.success(next === "suspended" ? t("umActionSuspend") : t("umActionActivate"));
    else { setList(prev); toast.error(res.error); }
  };

  const remove = async (u: UmUser) => {
    if (!window.confirm(t("umDeleteConfirm", { name: u.name }))) return;
    const prev = list;
    setList((p) => p.filter((x) => x.id !== u.id));
    const res = u.status === "pending" && u.invitationId
      ? await dal.userManagement.deleteUmInvite(u.invitationId)
      : await dal.userManagement.deleteUmUser(u.id);
    if (res.ok) toast.success(t("umActionDelete"));
    else { setList(prev); toast.error(res.error); }
  };

  const exportCsv = () => {
    const header = ["Name", "Email", "Title", "Role", "Department", "Status"];
    const escape = (v: string) => `"${(v ?? "").replace(/"/g, '""')}"`;
    const lines = [header, ...filtered.map((u) => [u.name, u.email, u.title, u.role, u.department, u.status])]
      .map((row) => row.map((c) => escape(String(c))).join(","));
    const blob = new Blob(["﻿" + lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "users.csv";
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success(t("umExport"));
  };

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = filtered.slice(current * PAGE_SIZE, current * PAGE_SIZE + PAGE_SIZE);

  const statusLabel = (s: "all" | UmUserStatus) =>
    s === "all" ? t("umStAll") : s === "active" ? t("umStActive") : s === "pending" ? t("umStPending") : t("umStSuspended");

  const counts = React.useMemo(() => ({
    all: list.length,
    active: list.filter((u) => u.status === "active").length,
    pending: list.filter((u) => u.status === "pending").length,
    suspended: list.filter((u) => u.status === "suspended").length,
  }), [list]);

  const FILTER_TABS = ["all", "active", "pending", "suspended"] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("umTitle")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("umSubtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => router.push("/admin/users/roles")}>
            <ShieldCheck className="size-4" />{t("umRolesPerms")}
          </Button>
          <Button className="gap-2" onClick={() => router.push("/admin/users/invite")}>
            <UserPlus className="size-4" />{t("umInvite")}
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Kpi label={t("umKpiTotal")} value={stats.total} sub={t("umKpiAccepted", { n: stats.accepted })} subTone="success"
          tone="bg-primary/10 text-primary" icon={<Users className="size-4" />} />
        <Kpi label={t("umKpiActive")} value={stats.activeStaff} sub={t("umKpiActiveSub")}
          tone="bg-success/10 text-success" icon={<CheckCircle2 className="size-4" />} />
        <Kpi label={t("umKpiPending")} value={stats.pendingInvites} sub={t("umKpiPendingSub")}
          tone="bg-warning/10 text-warning" icon={<Mail className="size-4" />} />
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm">
        {FILTER_TABS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { setStatus(s); setPage(0); }}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              status === s ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {statusLabel(s)}
            <span className={cn(
              "rounded-full px-1.5 text-xs tabular-nums",
              status === s ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground",
            )}>{counts[s]}</span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder={t("umSearch")} className="ps-9" />
          </div>
          <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t("umColRole")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("umAllRoles")}</SelectItem>
              {roles.map((r) => <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={deptFilter} onValueChange={(v) => { setDeptFilter(v); setPage(0); }}>
            <SelectTrigger className="w-full sm:w-44"><SelectValue placeholder={t("umColDepartment")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("umAllDepartments")}</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2"><Columns3 className="size-4" />{t("umColumns")}</Button>
            <Button variant="outline" size="icon" aria-label={t("umRefresh")} onClick={() => { setSearch(""); setStatus("all"); setRoleFilter("all"); setDeptFilter("all"); setPage(0); toast.success(t("umRefresh")); }}>
              <RefreshCw className="size-4" />
            </Button>
            <Button variant="outline" size="icon" aria-label={t("umExport")} onClick={exportCsv}>
              <Download className="size-4" />
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-start text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-start">{t("umColUser")}</th>
                <th className="px-4 py-3 text-start">{t("umColEmail")}</th>
                <th className="px-4 py-3 text-start">{t("umColTitle")}</th>
                <th className="px-4 py-3 text-start">{t("umColRole")}</th>
                <th className="px-4 py-3 text-start">{t("umColDepartment")}</th>
                <th className="px-4 py-3 text-start">{t("umColCreated")}</th>
                <th className="px-4 py-3 text-start">{t("umColStatus")}</th>
                <th className="px-4 py-3 text-end">{t("umColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-sm text-muted-foreground">{t("umNoUsers")}</td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{u.initials}</AvatarFallback></Avatar>
                        <span className="font-medium">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.title}</td>
                    <td className="px-4 py-3">
                      {u.status === "pending" || roles.length === 0 ? (
                        u.role
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className="inline-flex items-center gap-1 rounded-md text-start hover:opacity-80">
                              {u.role}
                              <ChevronDown className="size-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="max-h-72 overflow-y-auto">
                            {roles.map((r) => (
                              <DropdownMenuItem key={r.id} onClick={() => changeRole(u, r.id)} disabled={r.name === u.role}>
                                <ShieldCheck className="size-4" />{r.name}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.department}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{u.acceptedAt ?? "—"}</td>
                    <td className="px-4 py-3">
                      {u.status === "pending" ? (
                        <StatusPill status={u.status} label={statusLabel(u.status)} />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button type="button" className="inline-flex items-center gap-1 rounded-md hover:opacity-80">
                              <StatusPill status={u.status} label={statusLabel(u.status)} />
                              <ChevronDown className="size-3.5 text-muted-foreground" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem onClick={() => changeStatus(u, "active")} disabled={u.status === "active"}>
                              <CheckCircle2 className="size-4 text-success" />{t("umStActive")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => changeStatus(u, "suspended")} disabled={u.status === "suspended"}>
                              <Ban className="size-4 text-destructive" />{t("umStSuspended")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => view(u)}><Eye className="size-4" />{t("umActionView")}</DropdownMenuItem>
                          {u.status !== "pending" && (
                            <>
                              <DropdownMenuItem onClick={() => openEdit(u)}><Pencil className="size-4" />{t("umActionEdit")}</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openRole(u)}><UserCog className="size-4" />{t("umChangeRole")}</DropdownMenuItem>
                            </>
                          )}
                          {u.status === "pending" && (
                            <DropdownMenuItem onClick={() => resend(u)}><Send className="size-4" />{t("umActionResend")}</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {u.status === "suspended" ? (
                            <DropdownMenuItem onClick={() => toggleSuspend(u)}><CheckCircle2 className="size-4" />{t("umActionActivate")}</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => toggleSuspend(u)}><Ban className="size-4" />{t("umActionSuspend")}</DropdownMenuItem>
                          )}
                          <DropdownMenuItem variant="destructive" onClick={() => remove(u)}><Trash2 className="size-4" />{t("umActionDelete")}</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer / pagination */}
        <div className="flex items-center justify-between gap-3 border-t border-border/70 p-4">
          <p className="text-sm text-muted-foreground">
            {filtered.length === 0 ? t("umNoResults") : t("umResults", { shown: rows.length, total: filtered.length })}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled={current === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>{t("umPrevious")}</Button>
            <span className="grid size-8 place-items-center rounded-md bg-primary text-sm font-medium text-primary-foreground">{current + 1}</span>
            <Button variant="outline" size="sm" disabled={current >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}>{t("umNext")}</Button>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <Dialog open={!!editUser} onOpenChange={(o) => { if (!o) setEditUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("umEditUser")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("umFieldName")}</Label>
              <Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>{t("umColTitle")}</Label>
              <Input value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Sales Manager" />
            </div>
            <div className="space-y-1.5">
              <Label>{t("umFieldPhone")}</Label>
              <Input value={editForm.phone} onChange={(e) => setEditForm((f) => ({ ...f, phone: e.target.value }))} dir="ltr" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditUser(null)}>{t("umCancel")}</Button>
            <Button onClick={saveEdit} disabled={!editForm.name.trim() || busy}>{t("umSaveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change role */}
      <Dialog open={!!roleUser} onOpenChange={(o) => { if (!o) setRoleUser(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("umChangeRole")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("umColRole")}</Label>
              {roles.length === 0 ? (
                <Input disabled value={t("umNoRoles")} className="text-muted-foreground" />
              ) : (
                <Select value={roleForm.staffRole || undefined} onValueChange={(v) => setRoleForm((f) => ({ ...f, staffRole: v }))}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("umSelectRole")} /></SelectTrigger>
                  <SelectContent>{roles.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("umColDepartment")}</Label>
              <Select value={roleForm.department || undefined} onValueChange={(v) => setRoleForm((f) => ({ ...f, department: v }))}>
                <SelectTrigger className="w-full"><SelectValue placeholder={t("umSelectDepartment")} /></SelectTrigger>
                <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRoleUser(null)}>{t("umCancel")}</Button>
            <Button onClick={saveRole} disabled={!roleForm.staffRole || busy}>{t("umSaveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
