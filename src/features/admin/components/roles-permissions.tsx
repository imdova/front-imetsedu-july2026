"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  ShieldCheck, Plus, Search, Save, Copy, Trash2, Building2, ArrowRight, Pencil, GitCommitVertical,
  UserPlus, GitBranch, UsersRound, BarChart3, PlayCircle, Award, GraduationCap, ReceiptText, Undo2, Wallet,
  Link2, Coins, ScrollText, Briefcase, Truck,
} from "lucide-react";
import { toast } from "sonner";

import type { UmRole, UmDepartment, UmCategory, UmRisk, UmUser, UmUserStatus } from "@/lib/db/user-management";
import { TOTAL_PERMISSIONS } from "@/lib/db/user-management";
import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  UserPlus, GitBranch, UsersRound, BarChart3, PlayCircle, Award, GraduationCap, ReceiptText, Undo2, Wallet,
  Link2, Coins, ScrollText, Briefcase, Truck,
};

const RISK_TONE: Record<UmRisk, string> = {
  low: "bg-success/10 text-success ring-success/20",
  medium: "bg-amber-500/10 text-amber-600 ring-amber-500/20",
  elevated: "bg-warning/10 text-warning ring-warning/20",
  high: "bg-destructive/10 text-destructive ring-destructive/20",
};
const RISK_DOT: Record<UmRisk, string> = {
  low: "bg-success", medium: "bg-amber-500", elevated: "bg-warning", high: "bg-destructive",
};

export function RolesPermissions({
  roles: initialRoles, departments: initialDepts, registry, users = [],
}: {
  roles: UmRole[]; departments: UmDepartment[]; registry: UmCategory[]; users?: UmUser[];
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = React.useState<"roles" | "departments">("roles");

  return (
    <div className="space-y-5">
      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm">
        {(["departments", "roles"] as const).map((k) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={cn("flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors sm:flex-none sm:px-6",
              tab === k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
            {k === "departments" ? t("umTabDepartments") : t("umTabRoles")}
          </button>
        ))}
      </div>

      {tab === "roles"
        ? <RolesPanel initialRoles={initialRoles} registry={registry} departments={initialDepts} users={users} />
        : <DepartmentsPanel initialDepts={initialDepts} />}
    </div>
  );
}

/* ────────────────────────────── Roles panel ──────────────────────────────── */
function RolesPanel({ initialRoles, registry, departments, users }: { initialRoles: UmRole[]; registry: UmCategory[]; departments: UmDepartment[]; users: UmUser[] }) {
  const t = useTranslations("Admin");
  const [roles, setRoles] = React.useState(initialRoles);
  const [search, setSearch] = React.useState("");
  const [selectedId, setSelectedId] = React.useState(initialRoles[0]?.id ?? "");
  const [granted, setGranted] = React.useState<Set<string>>(new Set(initialRoles[0]?.granted ?? []));
  const [newRoleOpen, setNewRoleOpen] = React.useState(false);
  const [newRoleName, setNewRoleName] = React.useState("");
  const [newRoleDept, setNewRoleDept] = React.useState(departments[0]?.id ?? "");
  const [busy, setBusy] = React.useState(false);

  // Edit-role (metadata) dialog
  const [editOpen, setEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState("");
  const [editDept, setEditDept] = React.useState("");
  const [editDesc, setEditDesc] = React.useState("");

  // Staff list (kept in state so it can be re-fetched after a role rename).
  const [userList, setUserList] = React.useState(users);
  // Sub-tab inside the role detail view.
  const [roleTab, setRoleTab] = React.useState<"permissions" | "users">("permissions");

  const selected = roles.find((r) => r.id === selectedId) ?? null;
  // Live user counts per role, derived from the staff list (the role's own
  // `users` field is not populated by the backend). Matched by role name — the
  // same key the "Users with this role" table uses, so they always agree.
  const userCountByRole = React.useMemo(() => {
    const m = new Map<string, number>();
    for (const u of userList) m.set(u.role, (m.get(u.role) ?? 0) + 1);
    return m;
  }, [userList]);
  const countFor = (name: string) => userCountByRole.get(name) ?? 0;
  // Users assigned to the selected role (matched by role name).
  const roleUsers = React.useMemo(
    () => (selected ? userList.filter((u) => u.role === selected.name) : []),
    [userList, selected],
  );

  const openEdit = () => {
    if (!selected) return;
    setEditName(selected.name);
    setEditDept(selected.departmentId ?? "");
    setEditDesc(selected.description ?? "");
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!selected || !editName.trim()) return;
    setBusy(true);
    const res = await dal.userManagement.saveUmRole({
      id: selected.id,
      granted: [...granted],
      name: editName.trim(),
      ...(editDept ? { department: editDept } : {}),
      description: editDesc.trim(),
    });
    setBusy(false);
    if (res.ok) {
      setRoles((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
      setEditOpen(false);
      toast.success(t("umRoleUpdated"));
      // A rename changes the title carried on each staff record — refresh so the
      // "Users with this role" table reconciles without a page reload.
      dal.userManagement.fetchUmUsers().then((u) => { if (u.ok) setUserList(u.data); });
    } else {
      toast.error(res.error);
    }
  };

  const selectRole = (id: string) => {
    const r = roles.find((x) => x.id === id);
    setSelectedId(id);
    setGranted(new Set(r?.granted ?? []));
  };

  const toggle = (id: string) => setGranted((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const toggleModule = (ids: string[], on: boolean) => setGranted((prev) => {
    const next = new Set(prev);
    ids.forEach((id) => (on ? next.add(id) : next.delete(id)));
    return next;
  });

  const allIds = React.useMemo(() => registry.flatMap((c) => c.modules.flatMap((m) => m.permissions.map((p) => p.id))), [registry]);
  const toggleAll = (on: boolean) => setGranted(on ? new Set(allIds) : new Set());

  const dirty = selected ? (granted.size !== selected.granted.length || selected.granted.some((g) => !granted.has(g))) : false;

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    const res = await dal.userManagement.saveUmRole({ id: selected.id, granted: [...granted] });
    setBusy(false);
    if (res.ok) {
      setRoles((prev) => prev.map((r) => (r.id === res.data.id ? res.data : r)));
      toast.success(t("umRoleSaved"));
    } else {
      toast.error(res.error);
    }
  };

  const createRole = async () => {
    if (!newRoleName.trim()) return;
    if (!newRoleDept) { toast.error(t("umRoleDeptRequired")); return; }
    setBusy(true);
    const res = await dal.userManagement.createUmRole({ name: newRoleName.trim(), department: newRoleDept });
    setBusy(false);
    if (res.ok) {
      setRoles((prev) => [res.data, ...prev]);
      setNewRoleOpen(false); setNewRoleName("");
      setSelectedId(res.data.id); setGranted(new Set(res.data.granted));
      toast.success(t("umRoleCreated"));
    } else {
      toast.error(res.error);
    }
  };

  const duplicate = async () => {
    if (!selected) return;
    if (!selected.departmentId) { toast.error(t("umRoleDeptRequired")); return; }
    setBusy(true);
    const res = await dal.userManagement.createUmRole({
      name: `${selected.name} (copy)`,
      department: selected.departmentId,
      granted: [...granted],
    });
    setBusy(false);
    if (res.ok) {
      setRoles((prev) => [res.data, ...prev]);
      setSelectedId(res.data.id); setGranted(new Set(res.data.granted));
      toast.success(t("umRoleDuplicated"));
    } else {
      toast.error(res.error);
    }
  };

  const remove = async () => {
    if (!selected) return;
    if (!window.confirm(t("umRoleDeleteConfirm", { name: selected.name }))) return;
    const prev = roles;
    const rest = roles.filter((r) => r.id !== selected.id);
    setRoles(rest);
    setSelectedId(rest[0]?.id ?? "");
    setGranted(new Set(rest[0]?.granted ?? []));
    const res = await dal.userManagement.deleteUmRole(selected.id);
    if (res.ok) toast.success(t("umDelete"));
    else { setRoles(prev); toast.error(res.error); }
  };

  const filteredRoles = roles.filter((r) => r.name.toLowerCase().includes(search.trim().toLowerCase()));
  const riskLabel = (risk: UmRisk) =>
    risk === "low" ? t("umRiskLow") : risk === "medium" ? t("umRiskMedium") : risk === "elevated" ? t("umRiskElevated") : t("umRiskHigh");

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      {/* Sidebar */}
      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("umRolesLabel")}</span>
          <Badge className="tabular-nums">{roles.length}</Badge>
        </div>
        <Dialog open={newRoleOpen} onOpenChange={setNewRoleOpen}>
          <DialogTrigger asChild><Button className="w-full gap-2"><Plus className="size-4" />{t("umCreateRole")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("umCreateRole")}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>{t("umNewRoleName")}</Label>
                <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} autoFocus />
              </div>
              <div className="space-y-1.5">
                <Label>{t("umDepartment")}</Label>
                {departments.length === 0 ? (
                  <Input disabled value={t("umNoDepartments")} className="text-muted-foreground" />
                ) : (
                  <Select value={newRoleDept} onValueChange={setNewRoleDept}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={t("umSelectDepartment")} /></SelectTrigger>
                    <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>
            </div>
            <DialogFooter><Button onClick={createRole} disabled={!newRoleName.trim() || !newRoleDept || busy}>{t("umCreateRole")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("umSearchRoles")} className="ps-9" />
        </div>
        <div className="space-y-2">
          {filteredRoles.map((r) => (
            <button key={r.id} type="button" onClick={() => selectRole(r.id)}
              className={cn("flex w-full items-center gap-3 rounded-xl border p-3 text-start transition-colors",
                r.id === selectedId ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border/70 bg-card hover:bg-muted/50")}>
              <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", r.id === selectedId ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>
                <ShieldCheck className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{r.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  {t("umRoleUsers", { n: countFor(r.name) })}
                  <span className={cn("size-1.5 rounded-full", RISK_DOT[r.risk])} />{riskLabel(r.risk)}
                </p>
              </div>
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary"><GitCommitVertical className="size-4" />{t("umModuleRegistry")}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t("umRegistryNote", { version: t("umRegistryVersion") })}</p>
        </div>
      </aside>

      {/* Main */}
      {selected ? (
        <section className="space-y-5">
          {/* Role header */}
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><ShieldCheck className="size-5" /></span>
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {t("umRoleHeaderSub", { role: selected.custom ? t("umCustomRole") : t("umBuiltinRole"), users: countFor(selected.name) })}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset", RISK_TONE[selected.risk])}>
                  {t("umRiskLabel", { level: riskLabel(selected.risk), score: granted.size })}
                </span>
                <Button size="sm" className="gap-1.5" disabled={!dirty || busy} onClick={save}><Save className="size-4" />{t("umSaveChanges")}</Button>
                <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={openEdit}><Pencil className="size-4" />{t("umEdit")}</Button>
                <Button size="sm" variant="outline" className="gap-1.5" disabled={busy} onClick={duplicate}><Copy className="size-4" />{t("umDuplicate")}</Button>
                <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" disabled={busy} onClick={remove}><Trash2 className="size-4" />{t("umDelete")}</Button>
              </div>
            </div>
          </div>

          {/* Sub-tabs: Permissions / Users */}
          <div className="flex gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm">
            {(["permissions", "users"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setRoleTab(k)}
                className={cn("inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                  roleTab === k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                {k === "permissions" ? <ShieldCheck className="size-4" /> : <UsersRound className="size-4" />}
                {k === "permissions" ? t("umTabPermissions") : t("umTabUsers")}
                {k === "users" && (
                  <span className={cn("rounded-full px-1.5 text-xs tabular-nums", roleTab === k ? "bg-white/20" : "bg-muted text-muted-foreground")}>
                    {roleUsers.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Assigned users */}
          {roleTab === "users" && (
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <UsersRound className="size-4" />{t("umAssignedUsers")}
              </p>
              <Badge className="tabular-nums">{roleUsers.length}</Badge>
            </div>
            {roleUsers.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("umAssignedUsersEmpty")}</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-xl border border-border/60">
                <table className="w-full min-w-[34rem] text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                      <th className="px-4 py-2.5 text-start font-medium">{t("umColUser")}</th>
                      <th className="px-4 py-2.5 text-start font-medium">{t("umColEmail")}</th>
                      <th className="px-4 py-2.5 text-start font-medium">{t("umColDepartment")}</th>
                      <th className="px-4 py-2.5 text-start font-medium">{t("umColStatus")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roleUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/40 last:border-0 hover:bg-muted/40">
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-2.5">
                            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{u.initials}</span>
                            <span className="font-medium">{u.name}</span>
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-2.5 text-muted-foreground">{u.department}</td>
                        <td className="px-4 py-2.5"><UserStatusBadge status={u.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* Permissions */}
          {roleTab === "permissions" && (
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"><ShieldCheck className="size-4" />{t("umRolePermissions")}</p>
                <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("umRolePermsHint")}</p>
              </div>
              <button type="button" onClick={() => toggleAll(granted.size < TOTAL_PERMISSIONS)}
                className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-1.5 text-sm font-medium hover:bg-muted">
                <Checkbox checked={granted.size === TOTAL_PERMISSIONS} className="pointer-events-none" />
                {t("umSelectAllPerms")} <span className="tabular-nums text-muted-foreground">({granted.size}/{TOTAL_PERMISSIONS})</span>
              </button>
            </div>

            <div className="mt-5 space-y-6">
              {registry.map((cat) => (
                <CategoryBlock key={cat.key} cat={cat} granted={granted} toggle={toggle} toggleModule={toggleModule} />
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
              <p className="text-xs text-muted-foreground">
                {t("umLastUpdated", { who: selected.updatedBy, when: selected.updatedAt.replace("T", " ") })}
              </p>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={!dirty} onClick={() => selectRole(selected.id)}>{t("umDiscard")}</Button>
                <Button size="sm" className="gap-1.5" disabled={!dirty} onClick={save}><Save className="size-4" />{t("umSaveChanges")}</Button>
              </div>
            </div>
          </div>
          )}
        </section>
      ) : (
        <section className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card p-16 text-center">
          <ShieldCheck className="size-10 text-muted-foreground/40" />
          <p className="mt-3 font-medium">{t("umNoRoleSelected")}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t("umNoRoleSelectedHint")}</p>
        </section>
      )}

      {/* Edit role (name / department / description) */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("umEditRole")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>{t("umNewRoleName")}</Label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus />
            </div>
            <div className="space-y-1.5">
              <Label>{t("umDepartment")}</Label>
              {departments.length === 0 ? (
                <Input disabled value={t("umNoDepartments")} className="text-muted-foreground" />
              ) : (
                <Select value={editDept || undefined} onValueChange={setEditDept}>
                  <SelectTrigger className="w-full"><SelectValue placeholder={t("umSelectDepartment")} /></SelectTrigger>
                  <SelectContent>{departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>{t("umRoleDescription")}</Label>
              <Textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditOpen(false)}>{t("umCancel")}</Button>
            <Button onClick={saveEdit} disabled={!editName.trim() || busy}>{t("umSaveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserStatusBadge({ status }: { status: UmUserStatus }) {
  const tone =
    status === "active" ? "bg-success/10 text-success"
    : status === "pending" ? "bg-amber-500/10 text-amber-600"
    : "bg-destructive/10 text-destructive";
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize", tone)}>
      {status}
    </span>
  );
}

function CategoryBlock({ cat, granted, toggle, toggleModule }: {
  cat: UmCategory; granted: Set<string>;
  toggle: (id: string) => void; toggleModule: (ids: string[], on: boolean) => void;
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const ar = locale === "ar";
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
        <span className="text-sm font-semibold">{ar ? cat.ar : cat.en}</span>
        <span className="text-xs text-muted-foreground">{t("umModulesCount", { n: cat.modules.length })}</span>
      </div>
      <div className="space-y-3">
        {cat.modules.map((m) => {
          const ids = m.permissions.map((p) => p.id);
          const allOn = ids.every((id) => granted.has(id));
          const Icon = ICONS[m.icon] ?? ShieldCheck;
          return (
            <div key={m.key} className="overflow-hidden rounded-xl border border-border/70">
              <div className="flex items-start gap-3 border-s-[3px] p-4" style={{ borderInlineStartColor: m.accent }}>
                <span className="grid size-9 shrink-0 place-items-center rounded-lg" style={{ backgroundColor: `${m.accent}1a`, color: m.accent }}>
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{ar ? m.ar : m.en}</p>
                      <p className="text-xs text-muted-foreground">{ar ? m.descAr : m.descEn}</p>
                    </div>
                    <button type="button" onClick={() => toggleModule(ids, !allOn)}
                      className="inline-flex shrink-0 items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
                      <Checkbox checked={allOn} className="pointer-events-none size-3.5" />{t("umSelectAll")}
                    </button>
                  </div>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {m.permissions.map((perm) => {
                      const on = granted.has(perm.id);
                      const note = ar ? perm.noteAr : perm.noteEn;
                      return (
                        <button key={perm.id} type="button" onClick={() => toggle(perm.id)}
                          className={cn("flex items-start gap-2.5 rounded-lg border p-2.5 text-start transition-colors",
                            on ? "border-primary/40 bg-primary/5" : "border-border/60 bg-background hover:bg-muted/40")}>
                          <Checkbox checked={on} className="pointer-events-none mt-0.5" />
                          <span className="min-w-0">
                            <span className="block text-sm leading-tight">{ar ? perm.ar : perm.en}</span>
                            {note && <span className="block text-[0.7rem] leading-tight text-muted-foreground">{note}</span>}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────── Departments panel ───────────────────────────── */
function DepartmentsPanel({ initialDepts }: { initialDepts: UmDepartment[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [depts, setDepts] = React.useState(initialDepts);
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  const create = async () => {
    if (!name.trim()) return;
    setBusy(true);
    const res = await dal.userManagement.createUmDepartment({ name: name.trim() });
    setBusy(false);
    if (res.ok) {
      setDepts((prev) => [res.data, ...prev]);
      setOpen(false); setName("");
      toast.success(t("umDeptCreated"));
    } else {
      toast.error(res.error);
    }
  };

  const saveRename = async () => {
    if (!editId || !editName.trim()) return;
    const id = editId;
    const prev = depts;
    setDepts((p) => p.map((d) => (d.id === id ? { ...d, name: editName.trim() } : d)));
    setEditId(null);
    const res = await dal.userManagement.renameUmDepartment(id, editName.trim());
    if (res.ok) toast.success(t("umDeptRenamed"));
    else { setDepts(prev); toast.error(res.error); }
  };

  const remove = async (d: UmDepartment) => {
    if (!window.confirm(t("umDeptDeleteConfirm", { name: d.name }))) return;
    const prev = depts;
    setDepts((p) => p.filter((x) => x.id !== d.id));
    const res = await dal.userManagement.deleteUmDepartment(d.id);
    if (res.ok) toast.success(t("umDeptDeleted"));
    else { setDepts(prev); toast.error(res.error); }
  };

  const filtered = depts.filter((d) => d.name.toLowerCase().includes(search.trim().toLowerCase()));

  return (
    <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("umDepartmentsLabel")}</span>
          <Badge className="tabular-nums">{depts.length}</Badge>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="w-full gap-2"><Plus className="size-4" />{t("umCreateDepartment")}</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{t("umCreateDepartment")}</DialogTitle></DialogHeader>
            <div className="space-y-1.5">
              <Label>{t("umNewDeptName")}</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </div>
            <DialogFooter><Button onClick={create} disabled={!name.trim()}>{t("umCreateDepartment")}</Button></DialogFooter>
          </DialogContent>
        </Dialog>
        <div className="relative">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("umSearchRoles")} className="ps-9" />
        </div>
        <div className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-4" /></span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className="text-xs text-muted-foreground">{t("umDeptStaffRoles", { staff: d.staff, roles: d.roles })}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary"><Building2 className="size-4" />{t("umDeptDirectory")}</p>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{t("umDeptDirectoryNote")}</p>
        </div>
      </aside>

      <section className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight">{t("umDepartmentsTitle")}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{t("umDepartmentsSubtitle")}</p>
          </div>
          <button type="button" onClick={() => router.push("/admin/users")}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            {t("umBackToDirectory")}<ArrowRight className="size-4 rtl:rotate-180" />
          </button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/70 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-start">{t("umColDept")}</th>
                <th className="px-4 py-3 text-start">{t("umColStaff")}</th>
                <th className="px-4 py-3 text-start">{t("umColRolesCount")}</th>
                <th className="px-4 py-3 text-start">{t("umColCreated")}</th>
                <th className="px-4 py-3 text-end">{t("umColActions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr key={d.id} className="border-b border-border/50 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-2.5 font-medium">
                      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Building2 className="size-4" /></span>
                      {d.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{d.staff}</td>
                  <td className="px-4 py-3 tabular-nums text-muted-foreground">{d.roles}</td>
                  <td className="px-4 py-3 text-muted-foreground">{d.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="icon" className="size-8" onClick={() => { setEditId(d.id); setEditName(d.name); }}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => remove(d)}><Trash2 className="size-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog open={editId !== null} onOpenChange={(o) => { if (!o) setEditId(null); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("umRenameDept")}</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label>{t("umNewDeptName")}</Label>
            <Input value={editName} onChange={(e) => setEditName(e.target.value)} autoFocus
              onKeyDown={(e) => { if (e.key === "Enter") saveRename(); }} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditId(null)}>{t("umCancel")}</Button>
            <Button onClick={saveRename} disabled={!editName.trim()}>{t("umSaveChanges")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
