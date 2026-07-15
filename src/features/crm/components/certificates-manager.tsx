"use client";

import * as React from "react";
import Image from "next/image";
import {
  Award, Truck, Loader2, Search, SearchX, Users, ExternalLink, CheckCircle2,
  Plus, Trash2, Package, MapPin, AlertTriangle, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { GroupRow } from "@/lib/db/groups";
import type { GroupRosterStudent } from "@/lib/dal/groups";
import type { Shipment, ShipmentStatus } from "@/lib/dal/shipments";
import { usePermission } from "@/hooks/use-permission";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { FileUpload } from "@/components/shared/file-upload";

export function CertificatesManager() {
  return (
    <Tabs defaultValue="certificates" className="space-y-6">
      <TabsList className="h-auto flex-wrap gap-1 rounded-2xl bg-muted/60 p-1.5">
        <TabsTrigger value="certificates" className="gap-1.5 rounded-xl px-3.5 py-2 data-[state=active]:shadow-sm">
          <Award className="size-4" /> Certificates
        </TabsTrigger>
        <TabsTrigger value="shipment" className="gap-1.5 rounded-xl px-3.5 py-2 data-[state=active]:shadow-sm">
          <Truck className="size-4" /> Shipment
        </TabsTrigger>
      </TabsList>
      <TabsContent value="certificates"><CertificatesTab /></TabsContent>
      <TabsContent value="shipment"><ShipmentTab /></TabsContent>
    </Tabs>
  );
}

/* ─────────────────────────── Certificates tab ─────────────────────────── */

function CertificatesTab() {
  const canUpload = usePermission("lms.certificates.upload");

  const [groups, setGroups] = React.useState<GroupRow[]>([]);
  const [groupId, setGroupId] = React.useState("");
  const [roster, setRoster] = React.useState<GroupRosterStudent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [loadingRoster, setLoadingRoster] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const [target, setTarget] = React.useState<GroupRosterStudent | null>(null);
  const [link, setLink] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.groups.fetchGroups();
      if (cancelled) return;
      if (res.ok) setGroups(res.data);
      else toast.error(res.error);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const loadRoster = React.useCallback(async (id: string) => {
    if (!id) { setRoster([]); return; }
    setLoadingRoster(true);
    const res = await dal.groups.fetchGroupStudents(id);
    setLoadingRoster(false);
    if (res.ok) setRoster(res.data);
    else { setRoster([]); toast.error(res.error); }
  }, []);

  const onSelectGroup = (id: string) => { setGroupId(id); void loadRoster(id); };

  const groupOptions = React.useMemo(
    () => groups.map((g) => ({ value: g.id, label: g.title || "Group" })),
    [groups],
  );
  const selectedGroup = groups.find((g) => g.id === groupId);

  const q = query.trim().toLowerCase();
  const visible = q
    ? roster.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q))
    : roster;

  const issued = roster.filter((s) => s.certificate).length;

  const openUpload = (s: GroupRosterStudent) => { setTarget(s); setLink(s.certificate?.link || ""); };

  const save = async () => {
    if (!target?.leadId) { toast.error("This student isn't linked to a CRM lead"); return; }
    if (!link) { toast.error("Upload a certificate file first"); return; }
    setSaving(true);
    const res = await dal.crm.assignCertificate(target.leadId, { groupId, certificateLink: link });
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    toast.success(`Certificate saved for ${target.name}`);
    setTarget(null);
    setLink("");
    void loadRoster(groupId); // refresh so the issued state + code show up
  };

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Group picker */}
      <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-sm sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label>Group</Label>
          <SearchableSelect value={groupId} onChange={onSelectGroup} options={groupOptions} placeholder="Select a group…" />
        </div>
        {groupId && (
          <div className="flex items-center gap-4 sm:pb-1.5">
            <Stat icon={Users} label="Students" value={String(roster.length)} />
            <Stat icon={Award} label="Issued" value={`${issued}/${roster.length}`} />
          </div>
        )}
        {roster.length > 0 && (
          <div className="relative sm:w-56 sm:pb-0">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search students…" className="ps-9" />
          </div>
        )}
      </div>

      {!groupId ? (
        <Empty icon={GraduationCap} title="Pick a group" desc="Choose a group to see its enrolled students and upload their certificates." />
      ) : loadingRoster ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>
      ) : roster.length === 0 ? (
        <Empty icon={Users} title="No enrolled students" desc={`“${selectedGroup?.title ?? "This group"}” has no students yet.`} />
      ) : visible.length === 0 ? (
        <Empty icon={SearchX} title={`Nothing matches “${query}”`} desc="Try a different name or email." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-blue-600 [&_th]:text-white">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">Student</th>
                <th className="px-4 py-3 text-start font-semibold">Certificate</th>
                <th className="px-4 py-3 text-end font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s.userId} className="border-t border-border/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      {s.image ? (
                        <span className="relative size-8 shrink-0 overflow-hidden rounded-full bg-muted">
                          <Image src={s.image} alt="" fill sizes="32px" className="object-cover" />
                        </span>
                      ) : (
                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                          {s.name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium">{s.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {s.certificate ? (
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <CheckCircle2 className="size-4 text-success" />
                        <span className="font-mono text-muted-foreground">{s.certificate.code || "issued"}</span>
                        {s.certificate.link && (
                          <a href={s.certificate.link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-0.5 text-primary hover:underline">
                            view <ExternalLink className="size-3" />
                          </a>
                        )}
                      </span>
                    ) : !s.leadId ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400" title="No CRM lead matched this student — a certificate can't be issued.">
                        <AlertTriangle className="size-3.5" /> No CRM lead
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not issued</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-end">
                    {canUpload && (
                      <Button size="sm" variant={s.certificate ? "outline" : "default"} disabled={!s.leadId} onClick={() => openUpload(s)}>
                        {s.certificate ? "Replace" : "Upload"}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Upload dialog */}
      <Dialog open={!!target} onOpenChange={(o) => { if (!o) { setTarget(null); setLink(""); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{target?.certificate ? "Replace certificate" : "Upload certificate"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-xl bg-muted/40 p-3 text-sm">
              <p className="font-medium">{target?.name}</p>
              <p className="text-xs text-muted-foreground">{target?.email}</p>
              <p className="mt-1 text-xs text-muted-foreground">{selectedGroup?.title}</p>
            </div>
            <div className="space-y-1.5">
              <Label>Certificate file <span className="text-destructive">*</span></Label>
              <FileUpload value={link} onChange={setLink} accept="application/pdf,image/*,.pdf" hint="PDF or image" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setTarget(null); setLink(""); }} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !link} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />} Save certificate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────────── Shipment tab ───────────────────────────── */

const STATUSES: { value: ShipmentStatus; label: string; tone: string }[] = [
  { value: "requested", label: "Requested", tone: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { value: "shipped", label: "Shipped", tone: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { value: "delivered", label: "Delivered", tone: "bg-success/10 text-success" },
  { value: "cancelled", label: "Cancelled", tone: "bg-muted text-muted-foreground" },
];
const statusMeta = (s: ShipmentStatus) => STATUSES.find((x) => x.value === s) ?? STATUSES[0];

const EMPTY_SHIPMENT = { recipient: "", address: "", note: "" };

function ShipmentTab() {
  const canCreate = usePermission("crm.shipment.create");
  const canEdit = usePermission("crm.shipment.edit");
  const canDelete = usePermission("crm.shipment.delete");
  const { confirm, Confirmation } = useConfirm();

  const [rows, setRows] = React.useState<Shipment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState(EMPTY_SHIPMENT);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.shipments.fetchShipments();
      if (cancelled) return;
      if (res.ok) setRows(res.data);
      else toast.error(res.error);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const create = async () => {
    if (!form.recipient.trim() || !form.address.trim()) { toast.error("Recipient and address are required"); return; }
    setSaving(true);
    const res = await dal.shipments.createShipment({
      recipient: form.recipient.trim(),
      address: form.address.trim(),
      note: form.note.trim(),
    });
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setRows((p) => [res.data, ...p]);
    setForm(EMPTY_SHIPMENT);
    setOpen(false);
    toast.success("Shipment request added");
  };

  const setStatus = async (s: Shipment, status: ShipmentStatus) => {
    const res = await dal.shipments.updateShipment(s.id, { status });
    if (!res.ok) { toast.error(res.error); return; }
    setRows((p) => p.map((x) => (x.id === s.id ? res.data : x)));
    toast.success(status === "delivered" ? "Marked as delivered" : `Status: ${statusMeta(status).label}`);
  };

  const remove = async (s: Shipment) => {
    if (!(await confirm({ title: "Delete shipment", description: `“${s.recipient}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.shipments.deleteShipment(s.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== s.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  const q = query.trim().toLowerCase();
  const visible = q ? rows.filter((r) => r.recipient.toLowerCase().includes(q) || r.address.toLowerCase().includes(q)) : rows;
  const pending = rows.filter((r) => r.status !== "delivered" && r.status !== "cancelled").length;

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            Shipments <span className="ms-1 text-sm font-normal text-muted-foreground">· {rows.length}</span>
          </h3>
          <p className="text-sm text-muted-foreground">{pending} awaiting delivery</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="ps-9" />
          </div>
          {canCreate && <Button className="shrink-0 gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> New request</Button>}
        </div>
      </div>

      {rows.length === 0 ? (
        <Empty icon={Package} title="No shipments yet" desc={canCreate ? "Add a request, then follow it through to delivered." : "No shipment requests have been raised."} />
      ) : visible.length === 0 ? (
        <Empty icon={SearchX} title={`Nothing matches “${query}”`} desc="Try a different recipient or address." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((s) => {
            const m = statusMeta(s.status);
            return (
              <article key={s.id} className="group flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", m.tone)}>
                    {s.status === "delivered" ? <CheckCircle2 className="size-3.5" /> : <Truck className="size-3.5" />} {m.label}
                  </span>
                  {canDelete && (
                    <Button variant="ghost" size="icon" className="size-7 opacity-0 transition-opacity group-hover:opacity-100" title="Delete" onClick={() => remove(s)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  )}
                </div>
                <p className="mt-2 font-semibold leading-snug">{s.recipient}</p>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="mt-0.5 size-3.5 shrink-0" /> <span className="whitespace-pre-wrap">{s.address}</span>
                </p>
                {s.note && <p className="mt-2 rounded-lg bg-muted/40 p-2 text-xs text-muted-foreground">{s.note}</p>}
                {s.status === "delivered" && s.deliveredAt && (
                  <p className="mt-2 text-[11px] text-success">Delivered {new Date(s.deliveredAt).toLocaleDateString()}</p>
                )}
                {canEdit && (
                  <div className="mt-3 border-t pt-3">
                    <Select value={s.status} onValueChange={(v) => setStatus(s, v as ShipmentStatus)}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((x) => <SelectItem key={x.value} value={x.value}>{x.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>New shipment request</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Recipient <span className="text-destructive">*</span></Label>
              <Input value={form.recipient} onChange={(e) => setForm((f) => ({ ...f, recipient: e.target.value }))} placeholder="Student / recipient name" />
            </div>
            <div className="space-y-1.5">
              <Label>Address <span className="text-destructive">*</span></Label>
              <Textarea rows={3} value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Full delivery address" />
            </div>
            <div className="space-y-1.5">
              <Label>Note</Label>
              <Input value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} placeholder="Optional — what's being shipped, phone, etc." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={create} disabled={saving || !form.recipient.trim() || !form.address.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />} Add request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

/* ──────────────────────────────── shared ─────────────────────────────── */

function Stat({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
      <div className="leading-tight">
        <p className="text-sm font-semibold tabular-nums">{value}</p>
        <p className="text-[11px] text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon className="size-7" /></span>
      <p className="font-medium text-foreground">{title}</p>
      <p className="mx-auto max-w-md text-sm text-muted-foreground">{desc}</p>
    </div>
  );
}
