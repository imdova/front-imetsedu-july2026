"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type {
  LandingTestimonial, TestimonialInput,
  LandingSponsor, SponsorInput, SponsorType,
  LandingInsight, InsightInput,
  NewsletterSubscriber, ContactMessage,
} from "@/lib/db/landing-cms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { timeAgo } from "@/lib/utils/time-ago";

const emptyTestimonial: TestimonialInput = { quote: "", authorName: "", authorTitle: "", videoUrl: "", imageUrl: "", order: 1, isActive: true };
const emptySponsor: SponsorInput = { name: "", logoUrl: "", type: "partner", url: "", order: 1, isActive: true };
const emptyInsight: InsightInput = { title: "", slug: "", excerpt: "", coverImage: "", publishedAt: "", order: 1, isActive: true };

export function LandingManager({
  initialTestimonials, initialSponsors, initialInsights, initialSubscribers, initialMessages,
}: {
  initialTestimonials: LandingTestimonial[];
  initialSponsors: LandingSponsor[];
  initialInsights: LandingInsight[];
  initialSubscribers: NewsletterSubscriber[];
  initialMessages: ContactMessage[];
}) {
  const { confirm, Confirmation } = useConfirm();

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">Homepage content</h2>
        <p className="text-sm text-muted-foreground">Testimonials, sponsors, insights, and inbound subscribers & messages.</p>
      </div>
      <Tabs defaultValue="testimonials" className="space-y-4">
        <TabsList className="flex-wrap">
          <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors & Partners</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
          <TabsTrigger value="contact">Contact Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="testimonials"><TestimonialsTab initial={initialTestimonials} confirm={confirm} /></TabsContent>
        <TabsContent value="sponsors"><SponsorsTab initial={initialSponsors} confirm={confirm} /></TabsContent>
        <TabsContent value="insights"><InsightsTab initial={initialInsights} confirm={confirm} /></TabsContent>
        <TabsContent value="newsletter"><NewsletterTab initial={initialSubscribers} confirm={confirm} /></TabsContent>
        <TabsContent value="contact"><ContactTab initial={initialMessages} confirm={confirm} /></TabsContent>
      </Tabs>
      {Confirmation}
    </div>
  );
}

type Confirm = ReturnType<typeof useConfirm>["confirm"];

/* ── Testimonials ── */
function TestimonialsTab({ initial, confirm }: { initial: LandingTestimonial[]; confirm: Confirm }) {
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LandingTestimonial | null>(null);
  const [form, setForm] = React.useState<TestimonialInput>(emptyTestimonial);

  const openCreate = () => { setEditing(null); setForm(emptyTestimonial); setOpen(true); };
  const openEdit = (t: LandingTestimonial) => { setEditing(t); const { id: _i, ...rest } = t; setForm({ ...emptyTestimonial, ...rest }); setOpen(true); };
  const save = async () => {
    if (!form.quote.trim() || !form.authorName.trim()) return;
    const res = editing ? await dal.landing.updateTestimonial(editing.id, form) : await dal.landing.createTestimonial(form);
    if (res.ok && res.data) { setRows((p) => (editing ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [...p, res.data!])); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.ok ? "Not found" : res.error);
  };
  const remove = async (t: LandingTestimonial) => {
    if (!(await confirm({ title: "Delete testimonial", description: `From ${t.authorName}?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.landing.deleteTestimonial(t.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== t.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<LandingTestimonial>[] = [
    { accessorKey: "quote", header: "Quote", cell: ({ row }) => <span className="line-clamp-2 max-w-md text-sm">{row.original.quote}</span> },
    { accessorKey: "authorName", header: "Author", cell: ({ row }) => <div><p className="text-sm font-medium">{row.original.authorName}</p><p className="text-xs text-muted-foreground">{row.original.authorTitle}</p></div> },
    { accessorKey: "order", header: "Order", cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span> },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge variant={row.original.isActive ? "default" : "secondary"}>{row.original.isActive ? "Active" : "Hidden"}</Badge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActions onEdit={() => openEdit(row.original)} onDelete={() => remove(row.original)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add testimonial</Button></div>
      <DataTable columns={columns} data={rows} pageSize={6} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit testimonial" : "New testimonial"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Field label="Quote" required><Textarea rows={3} value={form.quote} onChange={(e) => setForm((f) => ({ ...f, quote: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Author name" required><Input value={form.authorName} onChange={(e) => setForm((f) => ({ ...f, authorName: e.target.value }))} /></Field>
              <Field label="Author title"><Input value={form.authorTitle} onChange={(e) => setForm((f) => ({ ...f, authorTitle: e.target.value }))} /></Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Image URL"><Input value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} /></Field>
              <Field label="Video URL"><Input value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} /></Field>
            </div>
            <OrderActive order={form.order} active={form.isActive} onOrder={(v) => setForm((f) => ({ ...f, order: v }))} onActive={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.quote.trim() || !form.authorName.trim()}>{editing ? "Save" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Sponsors & partners ── */
function SponsorsTab({ initial, confirm }: { initial: LandingSponsor[]; confirm: Confirm }) {
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LandingSponsor | null>(null);
  const [form, setForm] = React.useState<SponsorInput>(emptySponsor);

  const openCreate = () => { setEditing(null); setForm(emptySponsor); setOpen(true); };
  const openEdit = (s: LandingSponsor) => { setEditing(s); const { id: _i, ...rest } = s; setForm({ ...emptySponsor, ...rest }); setOpen(true); };
  const save = async () => {
    if (!form.name.trim()) return;
    const res = editing ? await dal.landing.updateSponsor(editing.id, form) : await dal.landing.createSponsor(form);
    if (res.ok && res.data) { setRows((p) => (editing ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [...p, res.data!])); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.ok ? "Not found" : res.error);
  };
  const remove = async (s: LandingSponsor) => {
    if (!(await confirm({ title: "Delete entry", description: `“${s.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.landing.deleteSponsor(s.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== s.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<LandingSponsor>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <Badge variant="outline" className="capitalize">{row.original.type}</Badge> },
    { accessorKey: "url", header: "URL", cell: ({ row }) => row.original.url ? <a href={row.original.url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">{row.original.url}</a> : <span className="text-muted-foreground">—</span> },
    { accessorKey: "order", header: "Order", cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span> },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge variant={row.original.isActive ? "default" : "secondary"}>{row.original.isActive ? "Active" : "Hidden"}</Badge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActions onEdit={() => openEdit(row.original)} onDelete={() => remove(row.original)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add sponsor / partner</Button></div>
      <DataTable columns={columns} data={rows} pageSize={6} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit entry" : "New sponsor / partner"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" required><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} /></Field>
              <Field label="Type">
                <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v as SponsorType }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="partner">Partner</SelectItem><SelectItem value="sponsor">Sponsor</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Logo URL"><Input value={form.logoUrl} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} /></Field>
            <Field label="Website URL"><Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} /></Field>
            <OrderActive order={form.order} active={form.isActive} onOrder={(v) => setForm((f) => ({ ...f, order: v }))} onActive={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.name.trim()}>{editing ? "Save" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Insights ── */
function InsightsTab({ initial, confirm }: { initial: LandingInsight[]; confirm: Confirm }) {
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<LandingInsight | null>(null);
  const [form, setForm] = React.useState<InsightInput>(emptyInsight);

  const openCreate = () => { setEditing(null); setForm(emptyInsight); setOpen(true); };
  const openEdit = (s: LandingInsight) => { setEditing(s); const { id: _i, ...rest } = s; setForm({ ...emptyInsight, ...rest }); setOpen(true); };
  const save = async () => {
    if (!form.title.trim()) return;
    const res = editing ? await dal.landing.updateInsight(editing.id, form) : await dal.landing.createInsight(form);
    if (res.ok && res.data) { setRows((p) => (editing ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [...p, res.data!])); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.ok ? "Not found" : res.error);
  };
  const remove = async (s: LandingInsight) => {
    if (!(await confirm({ title: "Delete insight", description: `“${s.title}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.landing.deleteInsight(s.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== s.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<LandingInsight>[] = [
    { accessorKey: "title", header: "Title", cell: ({ row }) => <div><p className="font-medium">{row.original.title}</p>{row.original.excerpt && <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">{row.original.excerpt}</p>}</div> },
    { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug || "—"}</span> },
    { accessorKey: "publishedAt", header: "Published", cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.publishedAt ? timeAgo(row.original.publishedAt) : "Draft"}</span> },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => <Badge variant={row.original.isActive ? "default" : "secondary"}>{row.original.isActive ? "Active" : "Hidden"}</Badge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActions onEdit={() => openEdit(row.original)} onDelete={() => remove(row.original)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add insight</Button></div>
      <DataTable columns={columns} data={rows} pageSize={6} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit insight" : "New insight"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Field label="Title" required><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Slug"><Input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} /></Field>
              <Field label="Published at"><Input type="date" value={form.publishedAt?.slice(0, 10) ?? ""} onChange={(e) => setForm((f) => ({ ...f, publishedAt: e.target.value || undefined }))} /></Field>
            </div>
            <Field label="Excerpt"><Textarea rows={2} value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} /></Field>
            <Field label="Cover image URL"><Input value={form.coverImage} onChange={(e) => setForm((f) => ({ ...f, coverImage: e.target.value }))} /></Field>
            <OrderActive order={form.order} active={form.isActive} onOrder={(v) => setForm((f) => ({ ...f, order: v }))} onActive={(v) => setForm((f) => ({ ...f, isActive: v }))} />
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.title.trim()}>{editing ? "Save" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Newsletter (read + delete) ── */
function NewsletterTab({ initial, confirm }: { initial: NewsletterSubscriber[]; confirm: Confirm }) {
  const [rows, setRows] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((s) => s.email.toLowerCase().includes(q) || s.tags.some((t) => t.toLowerCase().includes(q))) : rows;
  }, [rows, search]);

  const remove = async (s: NewsletterSubscriber) => {
    if (!(await confirm({ title: "Remove subscriber", description: s.email, confirmText: "Remove", variant: "destructive" }))) return;
    const res = await dal.landing.deleteSubscriber(s.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== s.id)); toast.success("Subscriber removed"); } else toast.error(res.error);
  };

  const columns: ColumnDef<NewsletterSubscriber>[] = [
    { accessorKey: "email", header: "Email", cell: ({ row }) => <a href={`mailto:${row.original.email}`} className="text-primary hover:underline">{row.original.email}</a> },
    { accessorKey: "source", header: "Source", cell: ({ row }) => <Badge variant="outline">{row.original.source}</Badge> },
    { accessorKey: "tags", header: "Tags", cell: ({ row }) => <div className="flex flex-wrap gap-1">{row.original.tags.map((t) => <Badge key={t} variant="secondary">{t}</Badge>)}</div> },
    { accessorKey: "createdAt", header: "Subscribed", cell: ({ row }) => <span className="text-sm text-muted-foreground">{timeAgo(row.original.createdAt)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <DataTable
      columns={columns} data={filtered} pageSize={8}
      toolbar={() => <Input placeholder="Search email or tag…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />}
      emptyState={<div className="text-sm text-muted-foreground">No subscribers.</div>}
    />
  );
}

/* ── Contact messages (read + delete) ── */
function ContactTab({ initial, confirm }: { initial: ContactMessage[]; confirm: Confirm }) {
  const [rows, setRows] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter((m) => [m.name, m.email, m.message].some((v) => v.toLowerCase().includes(q))) : rows;
  }, [rows, search]);

  const remove = async (m: ContactMessage) => {
    if (!(await confirm({ title: "Delete message", description: `From ${m.name}?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.landing.deleteContactMessage(m.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== m.id)); toast.success("Message deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<ContactMessage>[] = [
    { accessorKey: "name", header: "From", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    {
      id: "contact", header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 text-sm">
          <a href={`mailto:${row.original.email}`} className="text-primary hover:underline">{row.original.email}</a>
          {row.original.phone && <span className="inline-flex items-center gap-1 text-muted-foreground"><MessageCircle className="size-3" />{row.original.phone}</span>}
        </div>
      ),
    },
    { accessorKey: "message", header: "Message", cell: ({ row }) => <span className="line-clamp-2 max-w-md text-sm">{row.original.message}</span> },
    { accessorKey: "createdAt", header: "When", cell: ({ row }) => <span className="text-sm text-muted-foreground">{timeAgo(row.original.createdAt)}</span> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <DataTable
      columns={columns} data={filtered} pageSize={8}
      toolbar={() => <Input placeholder="Search name, email, message…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />}
      emptyState={<div className="text-sm text-muted-foreground">No messages.</div>}
    />
  );
}

/* ── Shared bits ── */
function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={onEdit}><Pencil className="size-4" /></Button>
      <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="size-4 text-destructive" /></Button>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}

function OrderActive({ order, active, onOrder, onActive }: { order: number; active: boolean; onOrder: (v: number) => void; onActive: (v: boolean) => void }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Field label="Order"><Input type="number" value={order} onChange={(e) => onOrder(Number(e.target.value))} /></Field>
      <label className="flex items-center justify-between self-end rounded-lg border border-border/70 px-3 py-2">
        <span className="text-sm font-medium">Active</span>
        <Switch checked={active} onCheckedChange={onActive} />
      </label>
    </div>
  );
}
