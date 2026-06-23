"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, MoreHorizontal, FileText, CheckCircle2, PencilLine, Eye, Newspaper,
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

const STATUS_BADGE: Record<BlogStatus, "default" | "secondary" | "outline"> = {
  PUBLISHED: "default", DRAFT: "secondary", ARCHIVED: "outline",
};
const fmtDate = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—");

function ScoreBadge({ score, label, detail }: { score: number; label: string; detail: React.ReactNode }) {
  const c = scoreColor(score);
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="w-20 cursor-default space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className={cn("font-medium tabular-nums", c.text)}>{score}</span>
            <span className="text-muted-foreground">{label}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className={cn("h-full rounded-full", c.bar)} style={{ width: `${score}%` }} />
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{detail}</TooltipContent>
    </Tooltip>
  );
}

export function AdminBlogList({ initial }: { initial: BlogPost[] }) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState(initial);
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<BlogStatus | "all">("all");
  const [category, setCategory] = React.useState("all");

  const categories = React.useMemo(() => [...new Set(rows.map((r) => r.category).filter(Boolean) as string[])], [rows]);
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "all" && r.status !== status) return false;
      if (category !== "all" && r.category !== category) return false;
      if (q && ![r.title, r.excerpt, r.authorName, ...(r.tags ?? [])].some((v) => v?.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [rows, search, status, category]);

  const kpis = React.useMemo(() => ({
    total: rows.length,
    published: rows.filter((r) => r.status === "PUBLISHED").length,
    drafts: rows.filter((r) => r.status === "DRAFT").length,
    views: rows.reduce((s, r) => s + r.views, 0),
  }), [rows]);

  const replace = (p: BlogPost) => setRows((r) => r.map((x) => (x.id === p.id ? p : x)));

  const lifecycle = async (p: BlogPost, action: string) => {
    const res = await dal.blog.articleLifecycle(p.id, action);
    if (res.ok) { replace(res.data); toast.success(`Article ${action}ed`); } else toast.error(res.error);
  };
  const feature = async (p: BlogPost) => {
    const res = await dal.blog.toggleFeatured(p.id);
    if (res.ok) { replace(res.data); toast.success(res.data.featured ? "Featured" : "Unfeatured"); } else toast.error(res.error);
  };
  const duplicate = async (p: BlogPost) => {
    const res = await dal.blog.createArticle({
      title: `${p.title} (copy)`, excerpt: p.excerpt, content: p.content, coverImageUrl: p.coverImageUrl,
      category: p.category, tags: p.tags, seoTitle: p.seoTitle, seoDescription: p.seoDescription,
      sections: p.sections, status: "DRAFT", authorId: p.authorId, authorName: p.authorName,
    });
    if (res.ok) { setRows((r) => [res.data, ...r]); toast.success("Article duplicated"); } else toast.error(res.error);
  };
  const remove = async (p: BlogPost) => {
    if (!(await confirm({ title: "Delete article", description: `“${p.title}” will be permanently removed.`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.blog.deleteArticle(p.id);
    if (res.ok) { setRows((r) => r.filter((x) => x.id !== p.id)); toast.success("Article deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<BlogPost>[] = [
    {
      accessorKey: "title", header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-10 shrink-0 overflow-hidden rounded-md bg-muted">
            {row.original.coverImageUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={row.original.coverImageUrl} alt="" className="size-full object-cover" />
              : <div className="grid size-full place-items-center text-muted-foreground/40"><Newspaper className="size-4" /></div>}
          </div>
          <div className="min-w-0">
            <p className="line-clamp-1 font-medium">{row.original.title}</p>
            <p className="font-mono text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    { accessorKey: "authorName", header: "Author", cell: ({ row }) => <span className="text-sm">{row.original.authorName || "—"}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => row.original.category ? <Badge variant="secondary">{row.original.category}</Badge> : <span className="text-muted-foreground">—</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={STATUS_BADGE[row.original.status]}>{row.original.status}</Badge> },
    { accessorKey: "views", header: "Views", cell: ({ row }) => <span className="tabular-nums">{row.original.views.toLocaleString()}</span> },
    {
      id: "read", header: "Read",
      cell: ({ row }) => { const r = readability(row.original); return <ScoreBadge score={r.score} label={r.label} detail={`Readability: ${r.label} (${r.words} words)`} />; },
    },
    {
      id: "seo", header: "SEO",
      cell: ({ row }) => {
        const s = seoScore(row.original);
        return <ScoreBadge score={s.score} label={s.label} detail={
          <ul className="space-y-0.5 text-xs">{s.checks.map((c) => <li key={c.label} className={c.pass ? "text-emerald-500" : "text-muted-foreground"}>{c.pass ? "✓" : "✗"} {c.label}</li>)}</ul>
        } />;
      },
    },
    { accessorKey: "publishedAt", header: "Published", cell: ({ row }) => <span className="text-sm text-muted-foreground">{fmtDate(row.original.publishedAt)}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => {
        const p = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push(`/admin/blog/${p.id}/edit`)}><PencilLine className="size-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem asChild><a href={`/blog/${p.slug}`} target="_blank" rel="noreferrer"><Eye className="size-4" /> View public</a></DropdownMenuItem>
                {p.status !== "PUBLISHED"
                  ? <DropdownMenuItem onClick={() => lifecycle(p, "publish")}>Publish</DropdownMenuItem>
                  : <DropdownMenuItem onClick={() => lifecycle(p, "unpublish")}>Unpublish</DropdownMenuItem>}
                {p.status !== "ARCHIVED" && <DropdownMenuItem onClick={() => lifecycle(p, "archive")}>Archive</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => feature(p)}>{p.featured ? "Unfeature" : "Feature"}</DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicate(p)}>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => remove(p)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total articles" value={kpis.total} icon={Newspaper} intent="primary" />
        <KpiCard label="Published" value={kpis.published} icon={CheckCircle2} intent="success" />
        <KpiCard label="Drafts" value={kpis.drafts} icon={FileText} intent="warning" />
        <KpiCard label="Total views" value={kpis.views.toLocaleString()} icon={Eye} intent="info" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        toolbar={() => (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
              <Input placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
              <Select value={status} onValueChange={(v) => setStatus(v as BlogStatus | "all")}>
                <SelectTrigger className="sm:w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="PUBLISHED">Published</SelectItem>
                  <SelectItem value="DRAFT">Draft</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
              {categories.length > 0 && (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="sm:w-40"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <Button className="gap-1.5" onClick={() => router.push("/admin/blog/new")}><Plus className="size-4" /> New article</Button>
          </div>
        )}
        emptyState={<div className="text-sm text-muted-foreground">No articles match your filters.</div>}
      />
      {Confirmation}
    </div>
  );
}
