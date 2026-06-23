"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, Pencil, Trash2, ExternalLink, LayoutTemplate, CheckCircle2, Eye, MousePointerClick, Percent,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  MarketingLandingPage, LandingPageInput, LandingStats, LandingStatus, LandingSort, LandingLanguage,
} from "@/lib/db/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils/time-ago";

const emptyForm: LandingPageInput = {
  name: "", path: "", status: "draft", language: "en", campaign: "", audience: "", description: "",
};
const LANG_TABS: { key: LandingLanguage; label: string }[] = [
  { key: "en", label: "English" },
  { key: "ar", label: "Arabic" },
];

function ctrClass(ctr: number) {
  if (ctr >= 5) return "text-success";
  if (ctr >= 2) return "text-warning";
  return "text-muted-foreground";
}

export function LandingPagesPanel({
  initialPages,
  initialStats,
}: {
  initialPages: MarketingLandingPage[];
  initialStats: LandingStats;
}) {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initialPages);
  const [stats, setStats] = React.useState(initialStats);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<LandingStatus | "all">("all");
  const [sort, setSort] = React.useState<LandingSort>("newest");
  const [lang, setLang] = React.useState<LandingLanguage>("en");
  const [loading, setLoading] = React.useState(false);

  const langOf = (p: MarketingLandingPage) => p.language ?? "en";
  const langCount = (l: LandingLanguage) => rows.filter((r) => langOf(r) === l).length;
  const visibleRows = React.useMemo(() => rows.filter((r) => langOf(r) === lang), [rows, lang]);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<MarketingLandingPage | null>(null);
  const [form, setForm] = React.useState<LandingPageInput>(emptyForm);

  const refresh = React.useCallback(async () => {
    setLoading(true);
    const [pagesRes, statsRes] = await Promise.all([
      dal.landing.fetchLandingPages({ search, status, sort }),
      dal.landing.fetchLandingStats(),
    ]);
    if (pagesRes.ok) setRows(pagesRes.data);
    if (statsRes.ok) setStats(statsRes.data);
    setLoading(false);
  }, [search, status, sort]);

  // Refetch whenever filters change (debounced for search).
  React.useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (p: MarketingLandingPage) => {
    setEditing(p);
    setForm({
      name: p.name, path: p.path, status: p.status, language: p.language ?? "en", campaign: p.campaign,
      audience: p.audience, description: p.description, thumbnailUrl: p.thumbnailUrl,
    });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim() || !form.path.trim()) return;
    const res = editing
      ? await dal.landing.updateLandingPage(editing.id, form)
      : await dal.landing.createLandingPage(form);
    if (res.ok && res.data) {
      toast.success(editing ? "Landing page updated" : "Landing page created");
      setOpen(false);
      refresh();
    } else {
      toast.error(res.ok ? "Not found" : res.error);
    }
  };

  const remove = async (p: MarketingLandingPage) => {
    const okConfirm = await confirm({
      title: "Delete landing page",
      description: `“${p.name}” and its stats will be removed permanently.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!okConfirm) return;
    const res = await dal.landing.deleteLandingPage(p.id);
    if (res.ok) { toast.success("Landing page deleted"); refresh(); }
    else toast.error(res.error);
  };

  const columns: ColumnDef<MarketingLandingPage>[] = [
    {
      accessorKey: "name",
      header: "Page",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <Link
            href={`/admin/marketing/landing/${row.original.id}`}
            className="font-medium text-foreground hover:text-primary hover:underline"
          >
            {row.original.name}
          </Link>
          <p className="font-mono text-xs text-muted-foreground">{row.original.path}</p>
          {row.original.audience && (
            <p className="text-xs text-muted-foreground">{row.original.audience}</p>
          )}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status === "published" ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => <span className="text-sm">{row.original.campaign || "—"}</span>,
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => <span className="tabular-nums">{row.original.views.toLocaleString()}</span>,
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => <span className="tabular-nums">{row.original.clicks.toLocaleString()}</span>,
    },
    {
      accessorKey: "ctr",
      header: "CTR",
      cell: ({ row }) => (
        <span className={cn("font-medium tabular-nums", ctrClass(row.original.ctr))}>
          {row.original.ctr}%
        </span>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{timeAgo(row.original.updatedAt)}</span>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <a href={row.original.path} target="_blank" rel="noreferrer">
            <Button variant="ghost" size="sm" title="View public page">
              <ExternalLink className="size-4" />
            </Button>
          </a>
          <Button variant="ghost" size="sm" onClick={() => openEdit(row.original)} title="Edit">
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => remove(row.original)} title="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Landing pages" value={stats.total} icon={LayoutTemplate} intent="primary" />
        <KpiCard label="Published" value={stats.published} icon={CheckCircle2} intent="success" />
        <KpiCard label="Total views" value={stats.views.toLocaleString()} icon={Eye} intent="info" />
        <KpiCard label="CTA clicks" value={stats.clicks.toLocaleString()} icon={MousePointerClick} intent="warning" />
        <KpiCard label="Avg CTR" value={`${stats.ctr}%`} icon={Percent} intent="primary" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            placeholder="Search name, path, campaign, audience…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:max-w-xs"
          />
          <Select value={status} onValueChange={(v) => setStatus(v as LandingStatus | "all")}>
            <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sort} onValueChange={(v) => setSort(v as LandingSort)}>
            <SelectTrigger className="sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="views">Most views</SelectItem>
              <SelectItem value="clicks">Most clicks</SelectItem>
              <SelectItem value="ctr">Highest CTR</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="gap-1.5" onClick={openCreate}>
          <Plus className="size-4" /> Add landing page
        </Button>
      </div>

      <div className="flex gap-1 border-b border-border/60">
        {LANG_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setLang(tab.key)}
            className={cn(
              "-mb-px border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              lang === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label} <span className="text-xs text-muted-foreground">({langCount(tab.key)})</span>
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={visibleRows} isLoading={loading} pageSize={8} />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit landing page" : "New landing page"}</DialogTitle>
            <DialogDescription>
              Register a campaign landing page so its views, clicks and CTR are tracked.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Name" required>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </Field>
              <Field label="Path" required>
                <Input value={form.path} onChange={(e) => setForm((f) => ({ ...f, path: e.target.value }))} placeholder="/lp/my-campaign" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as LandingStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Language">
                <Select value={form.language} onValueChange={(v) => setForm((f) => ({ ...f, language: v as LandingLanguage }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Campaign">
                <Input value={form.campaign} onChange={(e) => setForm((f) => ({ ...f, campaign: e.target.value }))} />
              </Field>
              <Field label="Audience">
                <Input value={form.audience} onChange={(e) => setForm((f) => ({ ...f, audience: e.target.value }))} />
              </Field>
            </div>
            <Field label="Description">
              <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} />
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={!form.name.trim() || !form.path.trim()}>
              {editing ? "Save changes" : "Create page"}
            </Button>
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
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
