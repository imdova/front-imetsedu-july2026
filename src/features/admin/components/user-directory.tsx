"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Users, CheckCircle2, Mail, Search, Columns3, RefreshCw, Download, ShieldCheck,
  UserPlus, MoreHorizontal, Eye, Pencil, Send, Ban, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { UmUser, UmStats, UmUserStatus } from "@/lib/db/user-management";
import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

export function UserDirectory({ users, stats }: { users: UmUser[]; stats: UmStats }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [list, setList] = React.useState<UmUser[]>(users);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<"all" | UmUserStatus>("all");
  const [page, setPage] = React.useState(0);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return list.filter((u) => {
      if (status !== "all" && u.status !== status) return false;
      if (!q) return true;
      return [u.name, u.email, u.title, u.role, u.department].some((f) => f.toLowerCase().includes(q));
    });
  }, [list, search, status]);

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

      {/* Table card */}
      <div className="rounded-2xl border border-border/70 bg-card shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-border/70 p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }}
              placeholder={t("umSearch")} className="ps-9" />
          </div>
          <div className="flex items-center gap-2">
            <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(0); }}>
              <SelectTrigger className="w-[170px]">
                <span className="text-muted-foreground">{t("umStatusFilter", { value: statusLabel(status) })}</span>
              </SelectTrigger>
              <SelectContent>
                {(["all", "active", "pending", "suspended"] as const).map((s) => (
                  <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2"><Columns3 className="size-4" />{t("umColumns")}</Button>
            <Button variant="outline" size="icon" aria-label={t("umRefresh")} onClick={() => { setSearch(""); setStatus("all"); setPage(0); toast.success(t("umRefresh")); }}>
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
                <th className="px-4 py-3 text-start">{t("umColExpires")}</th>
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
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3 text-muted-foreground">{u.department}</td>
                    <td className="px-4 py-3 tabular-nums text-muted-foreground">{u.expiresAt ?? t("umNever")}</td>
                    <td className="px-4 py-3"><StatusPill status={u.status} label={statusLabel(u.status)} /></td>
                    <td className="px-4 py-3 text-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => view(u)}><Eye className="size-4" />{t("umActionView")}</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => view(u)}><Pencil className="size-4" />{t("umActionEdit")}</DropdownMenuItem>
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
    </div>
  );
}
