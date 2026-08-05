"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, MoreHorizontal, FileText, CheckCircle2, PencilLine, Eye, Newspaper,
  LayoutGrid, Rows3, ChevronLeft, ChevronRight, Star,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { BlogPost, BlogStatus } from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { readability, seoScore, scoreColor } from "@/features/blog-admin/article-scores";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—";

const STATUS_STYLE: Record<BlogStatus, string> = {
  PUBLISHED: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
  DRAFT: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
  ARCHIVED: "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-500/10 dark:text-slate-400",
};

function StatusPill({ status }: { status: BlogStatus }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ring-1 ring-inset",
      STATUS_STYLE[status],
    )}>
      {status}
    </span>
  );
}

function initials(name?: string) {
  return (name ?? "").split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase() || "—";
}

function AuthorTag({ name }: { name?: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
        {initials(name)}
      </div>
      <span className="truncate text-sm text-foreground/80">{name || "—"}</span>
    </div>
  );
}

/** A compact score chip (Read / SEO) with a tooltip. */
function ScoreChip({ label, score, detail }: { label: string; score: number; detail: React.ReactNode }) {
  const c = scoreColor(score);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={cn("inline-flex cursor-default items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-semibold tabular-nums", c.text)}>
          {label} {score}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{detail}</TooltipContent>
    </Tooltip>
  );
}

/** The wide score bar used in the table's performance cell. */
function ScoreBar({ score, label }: { score: number; label: string }) {
  const c = scoreColor(score);
  return (
    <div className="w-24 space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-semibold tabular-nums", c.text)}>{score}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function seoDetail(p: BlogPost) {
  const s = seoScore(p);
  return (
    <ul className="space-y-0.5 text-xs">
      {s.checks.map((c) => (
        <li key={c.label} className={c.pass ? "text-emerald-500" : "text-muted-foreground"}>
          {c.pass ? "✓" : "✗"} {c.label}
        </li>
      ))}
    </ul>
  );
}

interface ActionHandlers {
  onEdit: (p: BlogPost) => void;
  onLifecycle: (p: BlogPost, action: string) => void;
  onFeature: (p: BlogPost) => void;
  onDuplicate: (p: BlogPost) => void;
  onRemove: (p: BlogPost) => void;
}

function ArticleActions({ p, h, trigger }: { p: BlogPost; h: ActionHandlers; trigger: React.ReactNode }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => h.onEdit(p)}><PencilLine className="size-4" /> Edit</DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"><Eye className="size-4" /> View public</a>
        </DropdownMenuItem>
        {p.status !== "PUBLISHED"
          ? <DropdownMenuItem onClick={() => h.onLifecycle(p, "publish")}>Publish</DropdownMenuItem>
          : <DropdownMenuItem onClick={() => h.onLifecycle(p, "unpublish")}>Unpublish</DropdownMenuItem>}
        {p.status !== "ARCHIVED" && <DropdownMenuItem onClick={() => h.onLifecycle(p, "archive")}>Archive</DropdownMenuItem>}
        <DropdownMenuItem onClick={() => h.onFeature(p)}>{p.featured ? "Unfeature" : "Feature"}</DropdownMenuItem>
        <DropdownMenuItem onClick={() => h.onDuplicate(p)}>Duplicate</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => h.onRemove(p)}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Grid-view article card. */
function ArticleCard({ p, h }: { p: BlogPost; h: ActionHandlers }) {
  const read = readability(p);
  const seo = seoScore(p);
  return (
    <div className="group flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg">
      <button
        onClick={() => h.onEdit(p)}
        className="relative block aspect-[16/9] w-full overflow-hidden bg-muted text-left"
      >
        {p.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.coverImageUrl} alt="" className="size-full object-cover transition duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/30"><Newspaper className="size-8" /></div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2">
          <StatusPill status={p.status} />
          {p.featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/90 px-2 py-0.5 text-[10px] font-bold text-amber-950 shadow-sm">
              <Star className="size-3 fill-current" /> Featured
            </span>
          )}
        </div>
      </button>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-2">
            {p.category
              ? <Badge variant="secondary" className="font-normal">{p.category}</Badge>
              : <span className="text-xs text-muted-foreground">Uncategorized</span>}
          </div>
          <button onClick={() => h.onEdit(p)} className="block text-left">
            <h3 className="line-clamp-2 font-semibold leading-snug hover:text-primary">{p.title}</h3>
          </button>
          <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">/{p.slug}</p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-2">
          <AuthorTag name={p.authorName} />
          <span className="whitespace-nowrap text-xs text-muted-foreground">{fmtDate(p.publishedAt)}</span>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border/60 pt-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Eye className="size-3.5" /> <span className="tabular-nums">{p.views.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <ScoreChip label="Read" score={read.score} detail={`Readability: ${read.label} (${read.words} words)`} />
            <ScoreChip label="SEO" score={seo.score} detail={seoDetail(p)} />
            <ArticleActions p={p} h={h} trigger={
              <Button variant="ghost" size="icon" className="size-7"><MoreHorizontal className="size-4" /></Button>
            } />
          </div>
        </div>
      </div>
    </div>
  );
}

const GRID_PAGE = 9;

export function AdminBlogList({ initial }: { initial: BlogPost[] }) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<BlogStatus | "all">("all");
  const [category, setCategory] = React.useState("all");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [gridPage, setGridPage] = React.useState(0);

  const categories = React.useMemo(
    () => [...new Set(rows.map((r) => r.category).filter(Boolean) as string[])],
    [rows],
  );
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (category !== "all" && r.category !== category) return false;
      if (q && ![r.title, r.excerpt, r.authorName, ...(r.tags ?? [])].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, status, category]);

  React.useEffect(() => setGridPage(0), [search, status, category, view]);

  const counts = React.useMemo(() => ({
    all: rows.length,
    published: rows.filter((r) => r.status === "PUBLISHED").length,
    drafts: rows.filter((r) => r.status === "DRAFT").length,
    archived: rows.filter((r) => r.status === "ARCHIVED").length,
  }), [rows]);
  const kpis = React.useMemo(() => ({
    total: rows.length,
    published: counts.published,
    drafts: counts.drafts,
    views: rows.reduce((s, r) => s + r.views, 0),
  }), [rows, counts]);

  const STATUS_TABS: { key: BlogStatus | "all"; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "PUBLISHED", label: "Published", count: counts.published },
    { key: "DRAFT", label: "Drafts", count: counts.drafts },
    { key: "ARCHIVED", label: "Archived", count: counts.archived },
  ];

  const replace = (p: BlogPost) => setRows((r) => r.map((x) => (x.id === p.id ? p : x)));

  const h: ActionHandlers = {
    onEdit: (p) => router.push(`/admin/blog/${p.id}/edit`),
    onLifecycle: async (p, action) => {
      const res = await dal.blog.articleLifecycle(p.id, action);
      if (res.ok) { replace(res.data); toast.success(`Article ${action}ed`); } else toast.error(res.error);
    },
    onFeature: async (p) => {
      const res = await dal.blog.toggleFeatured(p.id);
      if (res.ok) { replace(res.data); toast.success(res.data.featured ? "Featured" : "Unfeatured"); } else toast.error(res.error);
    },
    onDuplicate: async (p) => {
      const res = await dal.blog.createArticle({
        title: `${p.title} (copy)`, excerpt: p.excerpt, content: p.content, coverImageUrl: p.coverImageUrl,
        category: p.category, tags: p.tags, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
        sections: p.sections, status: "DRAFT", authorId: p.authorId, authorName: p.authorName,
      });
      if (res.ok) { setRows((r) => [res.data, ...r]); toast.success("Article duplicated"); } else toast.error(res.error);
    },
    onRemove: async (p) => {
      if (!(await confirm({ title: "Delete article", description: `“${p.title}” will be permanently removed.`, confirmText: "Delete", variant: "destructive" }))) return;
      const res = await dal.blog.deleteArticle(p.id);
      if (res.ok) { setRows((r) => r.filter((x) => x.id !== p.id)); toast.success("Article deleted"); } else toast.error(res.error);
    },
  };

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "title", header: "Article",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex items-center gap-3">
            <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border/60">
              {p.coverImageUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={p.coverImageUrl} alt="" className="size-full object-cover" />
                : <div className="grid size-full place-items-center text-muted-foreground/40"><Newspaper className="size-4" /></div>}
            </div>
            <div className="min-w-0">
              <p className="line-clamp-1 font-medium">{p.title}</p>
              <div className="mt-0.5 flex items-center gap-2">
                <span className="truncate font-mono text-xs text-muted-foreground">/{p.slug}</span>
                {p.category && <Badge variant="secondary" className="font-normal">{p.category}</Badge>}
              </div>
            </div>
          </div>
        );
      },
    },
    { accessorKey: "authorName", header: "Author", cell: ({ row }) => <AuthorTag name={row.original.authorName} /> },
    {
      accessorKey: "status", header: "Status",
      cell: ({ row }) => (
        <div className="space-y-1">
          <StatusPill status={row.original.status} />
          <p className="text-xs text-muted-foreground">{fmtDate(row.original.publishedAt)}</p>
        </div>
      ),
    },
    {
      id: "performance", header: "Performance",
      cell: ({ row }) => {
        const p = row.original;
        const r = readability(p);
        const s = seoScore(p);
        return (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Eye className="size-3.5" /> <span className="tabular-nums">{p.views.toLocaleString()}</span> views
            </div>
            <div className="flex items-center gap-3">
              <Tooltip><TooltipTrigger asChild><div><ScoreBar score={r.score} label="Read" /></div></TooltipTrigger>
                <TooltipContent>{`Readability: ${r.label} (${r.words} words)`}</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><div><ScoreBar score={s.score} label="SEO" /></div></TooltipTrigger>
                <TooltipContent className="max-w-xs">{seoDetail(p)}</TooltipContent></Tooltip>
            </div>
          </div>
        );
      },
    },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <ArticleActions p={row.original} h={h} trigger={
            <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
          } />
        </div>
      ),
    },
  ];

  const gridTotalPages = Math.max(1, Math.ceil(filtered.length / GRID_PAGE));
  const pagedGrid = filtered.slice(gridPage * GRID_PAGE, (gridPage + 1) * GRID_PAGE);

  const FilterBar = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
        <Input placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        {categories.length > 0 && (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="sm:w-48"><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex items-center gap-2">
        <div className="inline-flex rounded-lg border border-border/70 bg-card p-0.5">
          {([["grid", LayoutGrid], ["table", Rows3]] as const).map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              title={v === "grid" ? "Grid view" : "Table view"}
              className={cn(
                "rounded-md p-1.5 transition-colors",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <Button className="gap-1.5" onClick={() => router.push("/admin/blog/new")}><Plus className="size-4" /> New article</Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total articles" value={kpis.total} icon={Newspaper} intent="primary" />
        <KpiCard label="Published" value={kpis.published} icon={CheckCircle2} intent="success" />
        <KpiCard label="Drafts" value={kpis.drafts} icon={FileText} intent="warning" />
        <KpiCard label="Total views" value={kpis.views.toLocaleString()} icon={Eye} intent="info" />
      </div>

      <div className="flex flex-wrap gap-1 border-b border-border/60">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={cn(
              "-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              status === tab.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label} <span className="text-xs text-muted-foreground">({tab.count})</span>
          </button>
        ))}
      </div>

      {FilterBar}

      {view === "table" ? (
        <DataTable
          columns={columns}
          data={filtered}
          pageSize={10}
          emptyState={<div className="py-10 text-center text-sm text-muted-foreground">No articles match your filters.</div>}
        />
      ) : filtered.length === 0 ? (
        <div className="grid place-items-center rounded-xl border border-dashed py-16 text-center">
          <Newspaper className="mb-2 size-8 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">No articles match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {pagedGrid.map((p) => <ArticleCard key={p.id} p={p} h={h} />)}
          </div>
          {gridTotalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                {gridPage * GRID_PAGE + 1}–{Math.min((gridPage + 1) * GRID_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="size-8" disabled={gridPage === 0} onClick={() => setGridPage((p) => p - 1)}>
                  <ChevronLeft className="size-4" />
                </Button>
                <span className="tabular-nums">Page {gridPage + 1} of {gridTotalPages}</span>
                <Button variant="outline" size="icon" className="size-8" disabled={gridPage >= gridTotalPages - 1} onClick={() => setGridPage((p) => p + 1)}>
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      {Confirmation}
    </div>
  );
}
