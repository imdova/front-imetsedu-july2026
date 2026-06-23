"use client";

import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/blog";
import { ArticleCard } from "./article-card";

type Sort = "newest" | "viewed" | "reading";

export function BlogExplorerLive({ posts, categories }: { posts: BlogPost[]; categories: string[] }) {
  const [q, setQ] = React.useState("");
  const [category, setCategory] = React.useState<string | null>(null);
  const [tag, setTag] = React.useState<string | null>(null);
  const [sort, setSort] = React.useState<Sort>("newest");

  const tags = React.useMemo(
    () => [...new Set(posts.flatMap((p) => p.tags))].slice(0, 24),
    [posts],
  );

  const filtered = React.useMemo(() => {
    const query = q.trim().toLowerCase();
    let rows = posts.filter((p) => {
      if (category && p.category !== category) return false;
      if (tag && !p.tags.includes(tag)) return false;
      if (query && ![p.title, p.excerpt, p.authorName, ...(p.tags ?? [])].some((v) => v?.toLowerCase().includes(query))) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      if (sort === "viewed") return b.views - a.views;
      if (sort === "reading") return a.readingMinutes - b.readingMinutes;
      return +new Date(b.publishedAt ?? 0) - +new Date(a.publishedAt ?? 0);
    });
    return rows;
  }, [posts, q, category, tag, sort]);

  const activeCount = (category ? 1 : 0) + (tag ? 1 : 0) + (q ? 1 : 0);
  const reset = () => { setQ(""); setCategory(null); setTag(null); };

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      {/* Sidebar filters */}
      <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
        <div className="relative">
          <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search articles…" value={q} onChange={(e) => setQ(e.target.value)} className="ps-9" />
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Sort</p>
          <div className="flex flex-wrap gap-1.5">
            {([["newest", "Newest"], ["viewed", "Most viewed"], ["reading", "Quick reads"]] as [Sort, string][]).map(([v, label]) => (
              <button key={v} onClick={() => setSort(v)}
                className={cn("rounded-full border px-3 py-1 text-xs", sort === v ? "border-primary bg-primary/10 text-primary" : "border-border/60 hover:bg-muted")}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {categories.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Categories</p>
            <div className="flex flex-col gap-1">
              <button onClick={() => setCategory(null)} className={cn("rounded-md px-2 py-1 text-start text-sm", !category ? "bg-primary/10 text-primary" : "hover:bg-muted")}>All</button>
              {categories.map((c) => (
                <button key={c} onClick={() => setCategory(c)} className={cn("rounded-md px-2 py-1 text-start text-sm", category === c ? "bg-primary/10 text-primary" : "hover:bg-muted")}>{c}</button>
              ))}
            </div>
          </div>
        )}

        {tags.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Tags</p>
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <button key={t} onClick={() => setTag(tag === t ? null : t)}>
                  <Badge variant={tag === t ? "default" : "outline"}>{t}</Badge>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeCount > 0 && (
          <button onClick={reset} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <X className="size-3.5" /> Reset filters ({activeCount})
          </button>
        )}
      </aside>

      {/* Grid */}
      <div>
        {filtered.length === 0 ? (
          <div className="grid h-64 place-items-center rounded-2xl border border-dashed border-border/60 text-sm text-muted-foreground">
            No articles match your filters.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => <ArticleCard key={p.id} post={p} featured={p.featured} />)}
          </div>
        )}
      </div>
    </div>
  );
}
