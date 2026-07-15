"use client";

import * as React from "react";
import {
  Link2, ExternalLink, Pencil, Trash2, Plus, Search, SearchX, Loader2, Copy, Check,
  Star, FileText, CreditCard, Share2, Camera, Play, Globe, MessageCircle, Send,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { ImportantLink } from "@/lib/dal/important-links";
import { usePermission } from "@/hooks/use-permission";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const emptyForm = { title: "", url: "", description: "", category: "" };

/** Map a link (title + url) to a brand-ish icon + colour. */
function brand(title: string, url: string): { Icon: LucideIcon; chip: string; accent: string } {
  const t = `${title} ${url}`.toLowerCase();
  if (t.includes("facebook") || t.includes("fb.com") || t.includes("fb.me"))
    return { Icon: Share2, chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300", accent: "from-blue-500 to-blue-400" };
  if (t.includes("instagram") || t.includes("instagr.am"))
    return { Icon: Camera, chip: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300", accent: "from-pink-500 to-fuchsia-400" };
  if (t.includes("youtube") || t.includes("youtu.be"))
    return { Icon: Play, chip: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300", accent: "from-red-500 to-red-400" };
  if (t.includes("whatsapp") || t.includes("wa.me"))
    return { Icon: MessageCircle, chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300", accent: "from-emerald-500 to-emerald-400" };
  if (t.includes("telegram") || t.includes("t.me"))
    return { Icon: Send, chip: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300", accent: "from-sky-500 to-sky-400" };
  if (t.includes("review") || t.includes("rating") || t.includes("testimonial"))
    return { Icon: Star, chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300", accent: "from-amber-500 to-amber-400" };
  if (t.includes("policy") || t.includes("terms") || t.includes("privacy") || t.includes("refund"))
    return { Icon: FileText, chip: "bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300", accent: "from-slate-500 to-slate-400" };
  if (t.includes("pay") || t.includes("checkout") || t.includes("invoice") || t.includes("fawry") || t.includes("stripe"))
    return { Icon: CreditCard, chip: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300", accent: "from-violet-500 to-violet-400" };
  return { Icon: Globe, chip: "bg-primary/10 text-primary", accent: "from-primary to-primary/50" };
}

/** Turn a possibly-relative href into an absolute, openable URL. */
function toHref(url: string): string {
  const u = url.trim();
  if (!u) return "#";
  if (/^https?:\/\//i.test(u) || u.startsWith("/")) return u;
  return `https://${u}`;
}

/** Short, readable version of a URL for display. */
function prettyUrl(url: string): string {
  return url.trim().replace(/^https?:\/\//i, "").replace(/\/$/, "");
}

export function ImportantLinksTab() {
  const canCreate = usePermission("crm.office.create");
  const canEdit = usePermission("crm.office.edit");
  const canDelete = usePermission("crm.office.delete");
  const canManage = canCreate || canEdit || canDelete;
  const { confirm, Confirmation } = useConfirm();

  const [links, setLinks] = React.useState<ImportantLink[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ImportantLink | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.importantLinks.fetchImportantLinks();
      if (cancelled) return;
      if (res.ok) setLinks(res.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q
    ? links.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.url.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q))
    : links;

  const copy = async (l: ImportantLink) => {
    try {
      await navigator.clipboard.writeText(toHref(l.url));
      setCopiedId(l.id);
      toast.success("Link copied");
      window.setTimeout(() => setCopiedId((c) => (c === l.id ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the link manually");
    }
  };

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (l: ImportantLink) => {
    setEditing(l);
    setForm({ title: l.title, url: l.url, description: l.description, category: l.category });
    setOpen(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    if (!form.url.trim()) { toast.error("URL is required"); return; }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      url: form.url.trim(),
      description: form.description.trim(),
      category: form.category.trim(),
    };
    const res = editing
      ? await dal.importantLinks.updateImportantLink(editing.id, payload)
      : await dal.importantLinks.createImportantLink(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setLinks((p) => (editing ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
    toast.success(editing ? "Link updated" : "Link added");
    setOpen(false);
  };

  const remove = async (l: ImportantLink) => {
    if (!(await confirm({ title: "Delete link", description: `“${l.title}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.importantLinks.deleteImportantLink(l.id);
    if (res.ok) { setLinks((p) => p.filter((x) => x.id !== l.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Important links <span className="ms-1 text-sm font-normal text-muted-foreground">· {links.length}</span></h3>
          <p className="text-sm text-muted-foreground">Quick-access links your team opens every day — reviews, policies, payment links, social pages.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="ps-9" />
          </div>
          {canCreate && <Button className="shrink-0 gap-1.5" onClick={openCreate}><Plus className="size-4" /> <span className="hidden sm:inline">Add link</span></Button>}
        </div>
      </div>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Link2 className="size-7" /></span>
          <p className="font-medium text-foreground">No links yet</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">Add your reviews page, policy pages, payment links and social pages so your team can reach them in one click.</p>
          {canCreate && <Button variant="outline" className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add link</Button>}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="size-6" /></span>
          <p className="text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((l) => {
            const b = brand(l.title, l.url);
            return (
              <article key={l.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
                <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", b.accent)} />
                <div className="flex flex-1 flex-col p-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", b.chip)}><b.Icon className="size-5" /></span>
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-foreground">{l.title}</h4>
                        {l.category && <span className="text-xs text-muted-foreground">{l.category}</span>}
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={() => openEdit(l)}><Pencil className="size-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => remove(l)}><Trash2 className="size-3.5 text-destructive" /></Button>
                      </div>
                    )}
                  </div>
                  {l.description.trim() && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>}
                  <a
                    href={toHref(l.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 truncate text-xs text-primary hover:underline"
                    title={l.url}
                  >
                    <Globe className="size-3 shrink-0" /> <span className="truncate">{prettyUrl(l.url)}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 border-t p-3">
                  <Button asChild size="sm" className="flex-1 gap-1.5">
                    <a href={toHref(l.url)} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /> Open</a>
                  </Button>
                  <Button variant={copiedId === l.id ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => copy(l)} title="Copy link">
                    {copiedId === l.id ? <Check className="size-4" /> : <Copy className="size-4" />}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / edit dialog (super-admin) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit link" : "New link"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Reviews page, Refund policy, Facebook page" />
            </div>
            <div className="space-y-1.5">
              <Label>URL <span className="text-destructive">*</span></Label>
              <Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="/reviews  or  https://facebook.com/imetsedu" />
              <p className="text-xs text-muted-foreground">Site path (e.g. <code>/reviews</code>) or full URL. Opens in a new tab.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="e.g. Social, Policy, Payment" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Optional note about when/how to use this link" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim() || !form.url.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
