"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { SeoPublicPage } from "@/lib/dal/seo";
import type { SeoPageInput } from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

const empty: SeoPageInput = {
  path: "", title: "", description: "", titleAr: "", descriptionAr: "",
  ogImage: "", focusKeyword: "", canonical: "", noindex: false,
};

const TYPE_LABEL: Record<SeoPublicPage["type"], string> = {
  static: "Static", course: "Course", blog: "Blog", landing: "Landing",
};
const TYPE_FILTERS: ("all" | SeoPublicPage["type"])[] = ["all", "static", "course", "blog", "landing"];

export const seoPageDetailHref = (path: string) => `/admin/marketing/seo/page-detail?path=${encodeURIComponent(path)}`;

/** SEO score → colored badge (green ≥80, amber ≥50, red below). */
export function SeoScoreBadge({ score }: { score: number }) {
  return (
    <Badge
      className={cn(
        "tabular-nums",
        score >= 80 ? "bg-success/12 text-success hover:bg-success/15"
          : score >= 50 ? "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300"
            : "bg-destructive/10 text-destructive hover:bg-destructive/15",
      )}
    >
      {score}/100
    </Badge>
  );
}

export function SeoPagesPanel({ publicPages: initialPublic }: { publicPages: SeoPublicPage[] }) {
  const { confirm, Confirmation } = useConfirm();
  const [pages, setPages] = React.useState(initialPublic);
  const [typeFilter, setTypeFilter] = React.useState<(typeof TYPE_FILTERS)[number]>("all");
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState<SeoPageInput>(empty);

  const refresh = async () => {
    const res = await dal.seo.fetchPublicPages();
    if (res.ok) setPages(res.data);
  };

  const saveOverride = async () => {
    if (!form.path.trim()) return;
    const res = await dal.seo.createPage(form);
    if (res.ok) { toast.success("Override created"); setOpen(false); setForm(empty); void refresh(); }
    else toast.error(res.error);
  };

  const removeOverride = async (p: SeoPublicPage) => {
    if (!p.hasOverride) { toast.info("This page has no meta override to delete."); return; }
    const okConfirm = await confirm({
      title: "Delete meta override",
      description: `The custom meta for ${p.path} will be removed — the page falls back to its default metadata. The page itself is not deleted.`,
      confirmText: "Delete override", variant: "destructive",
    });
    if (!okConfirm) return;
    const res = await dal.seo.deletePage(p.overrideId);
    if (res.ok) { toast.success("Override deleted"); void refresh(); }
    else toast.error(res.error);
  };

  const q = search.trim().toLowerCase();
  const visible = pages.filter((p) =>
    (typeFilter === "all" || p.type === typeFilter) &&
    (!q || p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)));

  const columns: ColumnDef<SeoPublicPage>[] = [
    {
      accessorKey: "title", header: "Title",
      cell: ({ row }) => (
        <div className="min-w-0">
          <Link href={seoPageDetailHref(row.original.path)} className="line-clamp-1 max-w-xs text-sm font-medium hover:text-primary hover:underline">
            {row.original.title || row.original.path}
          </Link>
          <div className="mt-0.5 flex items-center gap-1.5">
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">{TYPE_LABEL[row.original.type]}</Badge>
            {row.original.hasOverride && <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">custom meta</Badge>}
            {!row.original.indexable && <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">noindex</Badge>}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "createdAt", header: "Created at",
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.createdAt ? new Date(row.original.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"}
        </span>
      ),
    },
    {
      accessorKey: "path", header: "Slug",
      cell: ({ row }) => <span className="line-clamp-1 max-w-[220px] font-mono text-xs">{row.original.path}</span>,
    },
    {
      accessorKey: "views", header: "Views",
      cell: ({ row }) => (
        <span className="text-sm tabular-nums">{row.original.views === null ? <span className="text-muted-foreground">—</span> : row.original.views.toLocaleString()}</span>
      ),
    },
    {
      accessorKey: "score", header: "SEO Score",
      cell: ({ row }) => <SeoScoreBadge score={row.original.score} />,
    },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <a href={row.original.path} target="_blank" rel="noreferrer" title="View live page">
            <Button variant="ghost" size="sm"><ExternalLink className="size-4" /></Button>
          </a>
          <Link href={seoPageDetailHref(row.original.path)} title="Edit SEO">
            <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>
          </Link>
          <Button variant="ghost" size="sm" title={row.original.hasOverride ? "Delete meta override" : "No override to delete"} onClick={() => removeOverride(row.original)}>
            <Trash2 className={cn("size-4", row.original.hasOverride ? "text-destructive" : "text-muted-foreground/40")} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {TYPE_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                typeFilter === t ? "border-primary bg-primary/10 text-primary" : "border-border/70 text-muted-foreground hover:bg-muted",
              )}
            >
              {t === "all" ? `All (${pages.length})` : `${TYPE_LABEL[t]} (${pages.filter((p) => p.type === t).length})`}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title or slug…" className="h-9 w-56" />
          <Button className="gap-1.5" onClick={() => { setForm(empty); setOpen(true); }}><Plus className="size-4" /> Add override</Button>
        </div>
      </div>

      <DataTable columns={columns} data={visible} pageSize={10} />

      {/* Manual override for an arbitrary path (e.g. /category/*) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New page override</DialogTitle>
            <DialogDescription>Per-path meta for any path. Empty fields fall back to the global defaults.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Path" required><Input value={form.path} onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))} placeholder="/courses" /></Field>
            <Field label="Title"><Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} /></Field>
            <Field label="Description"><Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></Field>
            <Field label="Title (Arabic)"><Input dir="rtl" value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} /></Field>
            <Field label="Description (Arabic)"><Textarea dir="rtl" rows={2} value={form.descriptionAr} onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="OG image URL"><Input value={form.ogImage} onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))} /></Field>
              <Field label="Focus keyword"><Input value={form.focusKeyword} onChange={(e) => setForm((f) => ({ ...f, focusKeyword: e.target.value }))} /></Field>
            </div>
            <Field label="Canonical URL"><Input value={form.canonical} onChange={(e) => setForm((f) => ({ ...f, canonical: e.target.value }))} /></Field>
            <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span className="text-sm font-medium">No-index this page</span>
              <Switch checked={form.noindex} onCheckedChange={(v) => setForm((f) => ({ ...f, noindex: v }))} />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={saveOverride} disabled={!form.path.trim()}>Create override</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
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
