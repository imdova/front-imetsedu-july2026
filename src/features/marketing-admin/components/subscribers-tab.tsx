"use client";

import * as React from "react";
import {
  Users, Search, Download, Trash2, FolderPlus, Pencil, Tag,
  MoreHorizontal, Mail, X, UserPlus, Loader2, Link2 as LinkIcon,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { Subscriber, SubscriberGroup } from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { timeAgo } from "@/lib/utils/time-ago";
import { cn } from "@/lib/utils";

export function SubscribersTab() {
  const { confirm, Confirmation } = useConfirm();
  const [subscribers, setSubscribers] = React.useState<Subscriber[]>([]);
  const [groups, setGroups] = React.useState<SubscriberGroup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [activeGroup, setActiveGroup] = React.useState("all");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());

  const load = React.useCallback(async () => {
    setLoading(true);
    const [subsRes, groupsRes] = await Promise.all([
      dal.emailMarketing.fetchSubscribers(),
      dal.emailMarketing.fetchSubscriberGroups(),
    ]);
    if (subsRes.ok) setSubscribers(subsRes.data);
    if (groupsRes.ok) setGroups(groupsRes.data);
    setLoading(false);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- initial client-side fetch
  React.useEffect(() => { load(); }, [load]);

  const refreshGroups = async () => {
    const res = await dal.emailMarketing.fetchSubscriberGroups();
    if (res.ok) setGroups(res.data);
  };

  /* ── Filtering ── */
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return subscribers.filter((s) => {
      if (activeGroup !== "all" && !s.tags.includes(activeGroup)) return false;
      if (!q) return true;
      return s.email.toLowerCase().includes(q) || s.name.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q));
    });
  }, [subscribers, search, activeGroup]);

  const allChecked = filtered.length > 0 && filtered.every((s) => selected.has(s.id));
  const someChecked = filtered.some((s) => selected.has(s.id));
  const toggleAll = () =>
    setSelected(allChecked ? new Set() : new Set(filtered.map((s) => s.id)));
  const toggleOne = (id: string) =>
    setSelected((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const clearSelection = () => setSelected(new Set());
  const selectedIds = [...selected];

  /* ── Dialog state ── */
  const [addOpen, setAddOpen] = React.useState(false);
  const [addForm, setAddForm] = React.useState({ email: "", name: "", phone: "", group: "none" });
  const [groupDlg, setGroupDlg] = React.useState<{ mode: "new" | "edit"; original?: string; value: string } | null>(null);
  const [linksDlg, setLinksDlg] = React.useState<{ group: string; paths: string[]; input: string } | null>(null);
  const [assignGroup, setAssignGroup] = React.useState("");

  /* ── Subscriber ops ── */
  const addSubscriber = async () => {
    if (!addForm.email.trim()) { toast.error("Email is required"); return; }
    const res = await dal.emailMarketing.addSubscriber({
      email: addForm.email.trim(),
      name: addForm.name.trim() || undefined,
      phone: addForm.phone.trim() || undefined,
      tags: addForm.group !== "none" ? [addForm.group] : undefined,
    });
    if (res.ok) { toast.success("Subscriber added"); setAddOpen(false); setAddForm({ email: "", name: "", phone: "", group: "none" }); load(); }
    else toast.error(res.error);
  };
  const removeSubscriber = async (s: Subscriber) => {
    const okc = await confirm({ title: "Delete subscriber", description: `${s.email} will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okc) return;
    const res = await dal.emailMarketing.deleteSubscriber(s.id);
    if (res.ok) { setSubscribers((p) => p.filter((x) => x.id !== s.id)); refreshGroups(); toast.success("Subscriber deleted"); }
    else toast.error(res.error);
  };
  const bulkDelete = async () => {
    const okc = await confirm({ title: `Delete ${selectedIds.length} subscribers`, description: "This cannot be undone.", confirmText: "Delete", variant: "destructive" });
    if (!okc) return;
    const res = await dal.emailMarketing.bulkDeleteSubscribers(selectedIds);
    if (res.ok) { clearSelection(); load(); toast.success(`${res.data} deleted`); }
    else toast.error(res.error);
  };
  const bulkAssign = async () => {
    if (!assignGroup) return;
    const res = await dal.emailMarketing.assignSubscribersGroup(selectedIds, assignGroup);
    if (res.ok) { toast.success(`Added ${res.data} to “${assignGroup}”`); setAssignGroup(""); clearSelection(); load(); }
    else toast.error(res.error);
  };

  /* ── Group ops ── */
  const saveGroup = async () => {
    if (!groupDlg) return;
    const name = groupDlg.value.trim();
    if (!name) { toast.error("Group name is required"); return; }
    const res = groupDlg.mode === "new"
      ? await dal.emailMarketing.createSubscriberGroup(name)
      : await dal.emailMarketing.renameSubscriberGroup(groupDlg.original!, name);
    if (res.ok) {
      toast.success(groupDlg.mode === "new" ? "Group created" : "Group renamed");
      if (groupDlg.mode === "edit" && activeGroup === groupDlg.original) setActiveGroup(name);
      setGroupDlg(null); load();
    } else toast.error(res.error);
  };
  const addPath = () => {
    if (!linksDlg) return;
    const p = linksDlg.input.trim();
    if (!p || linksDlg.paths.includes(p)) { setLinksDlg({ ...linksDlg, input: "" }); return; }
    setLinksDlg({ ...linksDlg, paths: [...linksDlg.paths, p], input: "" });
  };
  const saveLinks = async () => {
    if (!linksDlg) return;
    const res = await dal.emailMarketing.setSubscriberGroupPaths(linksDlg.group, linksDlg.paths);
    if (res.ok) { toast.success("Linked forms updated"); setLinksDlg(null); refreshGroups(); }
    else toast.error(res.error);
  };
  const deleteGroup = async (g: SubscriberGroup) => {
    const okc = await confirm({ title: `Delete group “${g.name}”`, description: "The group is removed and untagged from its subscribers. Subscribers are not deleted.", confirmText: "Delete", variant: "destructive" });
    if (!okc) return;
    const res = await dal.emailMarketing.deleteSubscriberGroup(g.name);
    if (res.ok) { if (activeGroup === g.name) setActiveGroup("all"); load(); toast.success("Group deleted"); }
    else toast.error(res.error);
  };

  /* ── Export CSV (current view) ── */
  const exportCsv = () => {
    const rows = [["Email", "Name", "Phone", "Groups", "Source", "Subscribed"], ...filtered.map((s) => [s.email, s.name, s.phone, s.tags.join("; "), s.source, new Date(s.createdAt).toISOString()])];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url; a.download = `subscribers-${activeGroup}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const totalCount = subscribers.length;

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* ── Groups sidebar ── */}
      <aside className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Groups</p>
          <button onClick={() => setGroupDlg({ mode: "new", value: "" })} title="New group" className="grid size-6 place-items-center rounded-md text-primary hover:bg-primary/10">
            <FolderPlus className="size-4" />
          </button>
        </div>
        <div className="space-y-1">
          <GroupRow label="All subscribers" count={totalCount} active={activeGroup === "all"} onClick={() => setActiveGroup("all")} icon={Users} />
          {groups.map((g) => (
            <GroupRow
              key={g.name} label={g.name} count={g.count} active={activeGroup === g.name}
              linkedCount={g.paths.length}
              onClick={() => setActiveGroup(g.name)} icon={Tag}
              onEdit={() => setGroupDlg({ mode: "edit", original: g.name, value: g.name })}
              onLinks={() => setLinksDlg({ group: g.name, paths: [...g.paths], input: "" })}
              onDelete={() => deleteGroup(g)}
            />
          ))}
          {groups.length === 0 && !loading && (
            <p className="px-2 py-3 text-xs text-muted-foreground">No groups yet. Create one to segment your list.</p>
          )}
        </div>
      </aside>

      {/* ── Subscribers table ── */}
      <div className="min-w-0 space-y-3">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search email, name or group…" className="pl-8" />
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv} disabled={!filtered.length}>
            <Download className="size-4" /> Export
          </Button>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <UserPlus className="size-4" /> Add subscriber
          </Button>
        </div>

        {/* Bulk bar */}
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.04] px-3 py-2">
            <span className="text-sm font-medium">{selected.size} selected</span>
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Select value={assignGroup} onValueChange={setAssignGroup}>
                <SelectTrigger className="h-8 w-44"><SelectValue placeholder="Add to group…" /></SelectTrigger>
                <SelectContent>
                  {groups.length === 0 && <SelectItem value="__none" disabled>No groups — create one</SelectItem>}
                  {groups.map((g) => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={bulkAssign} disabled={!assignGroup}>
                <Tag className="size-4" /> Assign
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5 text-destructive hover:text-destructive" onClick={bulkDelete}>
                <Trash2 className="size-4" /> Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={clearSelection}><X className="size-4" /></Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border/70">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-primary [&_th]:text-white">
                <tr>
                  <th className="w-10 px-3 py-2.5"><Checkbox checked={allChecked ? true : someChecked ? "indeterminate" : false} onCheckedChange={toggleAll} aria-label="Select all" /></th>
                  <th className="px-3 py-2.5 text-left font-medium">Name</th>
                  <th className="px-3 py-2.5 text-left font-medium">Email</th>
                  <th className="px-3 py-2.5 text-left font-medium">Phone</th>
                  <th className="px-3 py-2.5 text-left font-medium">Groups</th>
                  <th className="px-3 py-2.5 text-left font-medium">Source</th>
                  <th className="px-3 py-2.5 text-left font-medium">Subscribed</th>
                  <th className="w-10 px-3 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr><td colSpan={8} className="py-12 text-center text-muted-foreground"><Loader2 className="mx-auto size-5 animate-spin" /></td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-12 text-center">
                    <Mail className="mx-auto size-8 text-muted-foreground/40" />
                    <p className="mt-2 text-sm font-medium text-muted-foreground">No subscribers{activeGroup !== "all" ? " in this group" : ""}</p>
                  </td></tr>
                ) : filtered.map((s) => (
                  <tr key={s.id} className={cn("transition-colors hover:bg-muted/40", selected.has(s.id) && "bg-primary/[0.04]")}>
                    <td className="px-3 py-2.5"><Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggleOne(s.id)} aria-label="Select row" /></td>
                    <td className="px-3 py-2.5"><span className="font-medium">{s.name || <span className="text-muted-foreground">—</span>}</span></td>
                    <td className="px-3 py-2.5"><span className="text-muted-foreground">{s.email}</span></td>
                    <td className="px-3 py-2.5"><span className="tabular-nums text-muted-foreground">{s.phone || "—"}</span></td>
                    <td className="px-3 py-2.5">
                      <div className="flex flex-wrap gap-1">
                        {s.tags.length ? s.tags.map((t) => <Badge key={t} variant="secondary" className="font-normal">{t}</Badge>) : <span className="text-xs text-muted-foreground">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5"><span className="text-xs capitalize text-muted-foreground">{s.source || "—"}</span></td>
                    <td className="px-3 py-2.5"><span className="text-xs text-muted-foreground">{timeAgo(s.createdAt)}</span></td>
                    <td className="px-3 py-2.5">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {groups.filter((g) => !s.tags.includes(g.name)).map((g) => (
                            <DropdownMenuItem key={g.name} onClick={async () => { const r = await dal.emailMarketing.assignSubscribersGroup([s.id], g.name); if (r.ok) { toast.success(`Added to “${g.name}”`); load(); } }}>
                              <Tag className="mr-2 size-3.5" /> Add to “{g.name}”
                            </DropdownMenuItem>
                          ))}
                          {s.tags.map((t) => (
                            <DropdownMenuItem key={t} onClick={async () => { const r = await dal.emailMarketing.unassignSubscribersGroup([s.id], t); if (r.ok) { toast.success(`Removed from “${t}”`); load(); } }}>
                              <X className="mr-2 size-3.5" /> Remove from “{t}”
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem variant="destructive" onClick={() => removeSubscriber(s)}>Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {!loading && <p className="px-1 text-xs text-muted-foreground">Showing {filtered.length} of {totalCount} subscribers.</p>}
      </div>

      {/* Add subscriber dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add subscriber</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Fld label="Email" required><Input type="email" value={addForm.email} onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))} placeholder="name@example.com" /></Fld>
            <div className="grid grid-cols-2 gap-3">
              <Fld label="Name"><Input value={addForm.name} onChange={(e) => setAddForm((f) => ({ ...f, name: e.target.value }))} placeholder="Optional" /></Fld>
              <Fld label="Phone"><Input value={addForm.phone} onChange={(e) => setAddForm((f) => ({ ...f, phone: e.target.value }))} placeholder="Optional" /></Fld>
            </div>
            <Fld label="Group">
              <Select value={addForm.group} onValueChange={(v) => setAddForm((f) => ({ ...f, group: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No group</SelectItem>
                  {groups.map((g) => <SelectItem key={g.name} value={g.name}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Fld>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addSubscriber} disabled={!addForm.email.trim()}>Add subscriber</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Group create/rename dialog */}
      <Dialog open={!!groupDlg} onOpenChange={(o) => !o && setGroupDlg(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{groupDlg?.mode === "new" ? "New group" : "Rename group"}</DialogTitle>
            {groupDlg?.mode === "edit" && <DialogDescription>Renaming updates the tag on every subscriber in it.</DialogDescription>}
          </DialogHeader>
          <Fld label="Group name" required>
            <Input autoFocus value={groupDlg?.value ?? ""} onChange={(e) => setGroupDlg((g) => g && { ...g, value: e.target.value })}
              onKeyDown={(e) => { if (e.key === "Enter") saveGroup(); }} placeholder="e.g. CPHQ 2026" />
          </Fld>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGroupDlg(null)}>Cancel</Button>
            <Button onClick={saveGroup} disabled={!groupDlg?.value.trim()}>{groupDlg?.mode === "new" ? "Create" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Linked forms (paths) dialog */}
      <Dialog open={!!linksDlg} onOpenChange={(o) => !o && setLinksDlg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Linked forms — {linksDlg?.group}</DialogTitle>
            <DialogDescription>Registrations from these page paths (landing pages or course details) auto-join this group.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={linksDlg?.input ?? ""}
                onChange={(e) => setLinksDlg((l) => l && { ...l, input: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addPath(); } }}
                placeholder="/courses/cphq-certification  or  /lp/partnership"
              />
              <Button variant="outline" onClick={addPath} disabled={!linksDlg?.input.trim()}>Add</Button>
            </div>
            {linksDlg && linksDlg.paths.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/60 p-4 text-center text-xs text-muted-foreground">No forms linked yet. Add a page path above.</p>
            ) : (
              <ul className="space-y-1.5">
                {linksDlg?.paths.map((p) => (
                  <li key={p} className="flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-2.5 py-1.5">
                    <LinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                    <code className="min-w-0 flex-1 truncate text-xs">{p}</code>
                    <button onClick={() => setLinksDlg((l) => l && { ...l, paths: l.paths.filter((x) => x !== p) })} className="text-muted-foreground hover:text-destructive" title="Remove"><X className="size-3.5" /></button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinksDlg(null)}>Cancel</Button>
            <Button onClick={saveLinks}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}

function GroupRow({
  label, count, active, linkedCount, onClick, icon: Icon, onEdit, onLinks, onDelete,
}: {
  label: string; count: number; active: boolean; linkedCount?: number; onClick: () => void; icon: React.ElementType;
  onEdit?: () => void; onLinks?: () => void; onDelete?: () => void;
}) {
  return (
    <div className={cn(
      "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",
      active ? "bg-primary/10 text-primary" : "hover:bg-muted/60",
    )}>
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <Icon className={cn("size-4 shrink-0", active ? "text-primary" : "text-muted-foreground")} />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{label}</span>
          {!!linkedCount && <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><LinkIcon className="size-2.5" /> {linkedCount} linked form{linkedCount > 1 ? "s" : ""}</span>}
        </span>
        <Badge variant="secondary" className="ml-auto shrink-0 font-normal tabular-nums">{count}</Badge>
      </button>
      {(onEdit || onLinks || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="grid size-6 shrink-0 place-items-center rounded text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-background" title="Group actions">
              <MoreHorizontal className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onLinks && <DropdownMenuItem onClick={onLinks}><LinkIcon className="mr-2 size-3.5" /> Linked forms</DropdownMenuItem>}
            {onEdit && <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 size-3.5" /> Rename</DropdownMenuItem>}
            {onDelete && <><DropdownMenuSeparator /><DropdownMenuItem variant="destructive" onClick={onDelete}><Trash2 className="mr-2 size-3.5" /> Delete</DropdownMenuItem></>}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function Fld({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
