"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, Pencil, Trash2, Copy, ExternalLink, LayoutTemplate, CheckCircle2, Eye, UserPlus, Percent, MousePointerClick, MessageCircle,
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
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/lib/utils/time-ago";

const emptyForm: LandingPageInput = {
  name: "", path: "", status: "draft", language: "en", campaign: "", audience: "", description: "", whatsappNumber: "",
};
const LANG_TABS: { key: LandingLanguage; label: string }[] = [
  { key: "en", label: "English" },
  { key: "ar", label: "Arabic" },
  { key: "mix", label: "Mix" },
];

function ctrPill(ctr: number) {
  if (ctr >= 5) return "bg-success/12 text-success ring-success/20";
  if (ctr >= 2) return "bg-warning/12 text-warning ring-warning/20";
  return "bg-muted text-muted-foreground ring-border/60";
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
  const totalRegistrations = React.useMemo(
    () => rows.reduce((s, r) => s + (r.registrations ?? 0), 0),
    [rows],
  );

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
      audience: p.audience, description: p.description, thumbnailUrl: p.thumbnailUrl, whatsappNumber: p.whatsappNumber ?? "",
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

  const toInput = (p: MarketingLandingPage): LandingPageInput => ({
    name: p.name, path: p.path, status: p.status, language: p.language ?? "en",
    campaign: p.campaign, audience: p.audience, description: p.description, thumbnailUrl: p.thumbnailUrl,
    whatsappNumber: p.whatsappNumber ?? "",
  });

  const saveWhatsapp = async (p: MarketingLandingPage, whatsappNumber: string) => {
    setRows((prev) => prev.map((r) => (r.id === p.id ? { ...r, whatsappNumber } : r))); // optimistic
    const res = await dal.landing.updateLandingPage(p.id, { ...toInput(p), whatsappNumber });
    if (res.ok) toast.success("WhatsApp number saved");
    else { toast.error(res.error); refresh(); }
  };

  const toggleStatus = async (p: MarketingLandingPage) => {
    const status: LandingStatus = p.status === "published" ? "draft" : "published";
    setRows((prev) => prev.map((r) => (r.id === p.id ? { ...r, status } : r))); // optimistic
    const res = await dal.landing.updateLandingPage(p.id, { ...toInput(p), status });
    if (!res.ok) { toast.error(res.error); refresh(); }
  };

  const duplicate = async (p: MarketingLandingPage) => {
    const res = await dal.landing.createLandingPage({
      ...toInput(p),
      name: `${p.name} (copy)`,
      path: `${p.path}-copy`,
      status: "draft",
    });
    if (res.ok) { toast.success("Landing page duplicated"); refresh(); }
    else toast.error(res.error);
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
        <div className="flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/15">
            <LayoutTemplate className="size-4" />
          </span>
          <div className="min-w-0 space-y-1">
            <Link
              href={`/admin/marketing/landing/${row.original.id}`}
              className="font-medium text-foreground hover:text-primary hover:underline"
            >
              {row.original.name}
            </Link>
            <p className="truncate">
              <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">{row.original.path}</span>
            </p>
            {row.original.audience && (
              <p className="truncate text-xs text-muted-foreground">{row.original.audience}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.status === "published"}
            onCheckedChange={() => toggleStatus(row.original)}
            aria-label={row.original.status === "published" ? "Set to draft" : "Publish"}
          />
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span className={cn("size-1.5 rounded-full", row.original.status === "published" ? "bg-success" : "bg-muted-foreground/40")} />
            {row.original.status === "published" ? "Published" : "Draft"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "campaign",
      header: "Campaign",
      cell: ({ row }) => row.original.campaign
        ? <span className="inline-flex rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-foreground/80">{row.original.campaign}</span>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "whatsappNumber",
      header: () => (
        <span className="inline-flex items-center gap-1.5"><MessageCircle className="size-3.5 text-emerald-600" /> WhatsApp Number</span>
      ),
      cell: ({ row }) => (
        <WhatsAppCell
          value={row.original.whatsappNumber ?? ""}
          onSave={(v) => saveWhatsapp(row.original, v)}
        />
      ),
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Eye className="size-3.5 text-muted-foreground" />{row.original.views.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "clicks",
      header: "Clicks",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <MousePointerClick className="size-3.5 text-muted-foreground" />{row.original.clicks.toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "registrations",
      header: "Registrations",
      cell: ({ row }) => (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold tabular-nums text-primary ring-1 ring-primary/15">
          <UserPlus className="size-3.5" />{(row.original.registrations ?? 0).toLocaleString()}
        </span>
      ),
    },
    {
      accessorKey: "ctr",
      header: "CTR",
      cell: ({ row }) => (
        <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ring-1", ctrPill(row.original.ctr))}>
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
          <Button variant="ghost" size="sm" onClick={() => duplicate(row.original)} title="Duplicate">
            <Copy className="size-4" />
          </Button>
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
        <KpiCard label="Landing pages" value={stats.total} icon={LayoutTemplate} intent="primary" helperText={`${stats.published} live · ${stats.drafts} drafts`} className="transition-shadow hover:shadow-md" />
        <KpiCard label="Published" value={stats.published} icon={CheckCircle2} intent="success" helperText="visible to visitors" className="transition-shadow hover:shadow-md" />
        <KpiCard label="Total views" value={stats.views.toLocaleString()} icon={Eye} intent="info" helperText="all-time page views" className="transition-shadow hover:shadow-md" />
        <KpiCard label="Registrations" value={totalRegistrations.toLocaleString()} icon={UserPlus} intent="warning" helperText="leads captured" className="transition-shadow hover:shadow-md" />
        <KpiCard label="Avg CTR" value={`${stats.ctr}%`} icon={Percent} intent="primary" helperText="clicks ÷ views" className="transition-shadow hover:shadow-md" />
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

      <div className="inline-flex items-center gap-1 rounded-xl bg-muted/60 p-1">
        {LANG_TABS.map((tab) => {
          const active = lang === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setLang(tab.key)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all",
                active ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab.label}
              <span className={cn(
                "rounded-full px-1.5 text-xs tabular-nums",
                active ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground",
              )}>
                {langCount(tab.key)}
              </span>
            </button>
          );
        })}
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
                    <SelectItem value="mix">Mix</SelectItem>
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
            <Field label="WhatsApp Number">
              <Input
                value={form.whatsappNumber ?? ""}
                onChange={(e) => setForm((f) => ({ ...f, whatsappNumber: e.target.value }))}
                placeholder="201115782721 (with country code, no +)"
                dir="ltr"
                inputMode="tel"
              />
            </Field>
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

/** WhatsApp number cell — shows the number with an edit (pencil) icon;
 * click to edit, commits on blur or Enter, Escape cancels. */
function WhatsAppCell({ value, onSave }: { value: string; onSave: (v: string) => void }) {
  const [editing, setEditing] = React.useState(false);
  const [v, setV] = React.useState(value);
  React.useEffect(() => { setV(value); }, [value]);

  const commit = () => {
    setEditing(false);
    const next = v.trim();
    if (next !== (value ?? "").trim()) onSave(next);
  };

  if (editing) {
    return (
      <Input
        autoFocus
        value={v}
        onChange={(e) => setV(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
          if (e.key === "Escape") { setV(value); setEditing(false); }
        }}
        placeholder="e.g. 201115782721"
        dir="ltr"
        inputMode="tel"
        className="h-8 w-40 text-sm tabular-nums"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={() => setEditing(true)}
      title="Edit WhatsApp number"
      className="group inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 text-sm transition-colors hover:bg-muted"
    >
      <span dir="ltr" className={cn("tabular-nums", value ? "text-foreground" : "text-muted-foreground")}>
        {value || "Not set"}
      </span>
      <Pencil className="size-3.5 shrink-0 text-muted-foreground opacity-50 transition-opacity group-hover:opacity-100" />
    </button>
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
