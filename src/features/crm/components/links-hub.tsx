"use client";

import * as React from "react";
import {
  Link2,
  MessageCircle,
  GraduationCap,
  Megaphone,
  Search,
  SearchX,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImportantLinksTab } from "@/features/crm/components/important-links-tab";
import { WhatsAppTab } from "@/features/crm/components/whatsapp-tab";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com").replace(
  /\/+$/,
  "",
);

const SECTIONS: { key: string; label: string; icon: LucideIcon }[] = [
  { key: "links", label: "Important links", icon: Link2 },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "courses", label: "Courses", icon: GraduationCap },
  { key: "landing", label: "Landing pages", icon: Megaphone },
];

/**
 * "Important links" is now a small hub with a left secondary sidebar:
 *   - Important links (the editable link list)
 *   - WhatsApp (the wa.me contacts)
 *   - Courses (auto-generated links to every course page)
 *   - Landing pages (auto-generated links to every registered landing page)
 * Course/landing links are read-only — they derive from live data, so there's
 * nothing to add or maintain by hand.
 */
export function LinksHub() {
  const [active, setActive] = React.useState("links");

  return (
    <div className="flex flex-col gap-5 lg:flex-row">
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-card p-1.5 lg:w-52 lg:shrink-0 lg:flex-col lg:overflow-visible">
        {SECTIONS.map((s) => {
          const on = active === s.key;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setActive(s.key)}
              aria-current={on}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-medium transition-colors lg:w-full",
                on
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <s.icon className="size-4 shrink-0" />
              {s.label}
            </button>
          );
        })}
      </nav>

      <div className="min-w-0 flex-1">
        {active === "links" && <ImportantLinksTab />}
        {active === "whatsapp" && <WhatsAppTab />}
        {active === "courses" && <CourseLinksView />}
        {active === "landing" && <LandingLinksView />}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared read-only link list (courses / landing pages)               */
/* ------------------------------------------------------------------ */

type AutoLink = { id: string; name: string; sub: string; url: string; badge?: string };

function AutoLinkList({
  title,
  subtitle,
  emptyText,
  loading,
  items,
  icon: Icon,
  accent,
}: {
  title: string;
  subtitle: string;
  emptyText: string;
  loading: boolean;
  items: AutoLink[];
  icon: LucideIcon;
  accent: string;
}) {
  const [query, setQuery] = React.useState("");
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter(
        (l) => l.name.toLowerCase().includes(q) || l.url.toLowerCase().includes(q),
      )
    : items;

  const copy = async (l: AutoLink) => {
    try {
      await navigator.clipboard.writeText(l.url);
      setCopiedId(l.id);
      toast.success("Link copied");
      window.setTimeout(() => setCopiedId((c) => (c === l.id ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the link manually");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            {title}{" "}
            <span className="ms-1 text-sm font-normal text-muted-foreground">
              · {items.length}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="relative flex-1 sm:w-52 sm:flex-none">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="ps-9"
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Icon className="size-7" />
          </span>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">{emptyText}</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
            <SearchX className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((l) => (
            <article
              key={l.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", accent)} />
              <div className="flex flex-1 flex-col p-4 pt-5">
                <div className="inline-flex min-w-0 items-center gap-2.5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h4 className="truncate font-semibold text-foreground">{l.name}</h4>
                    {l.badge && (
                      <span className="text-xs text-muted-foreground">{l.badge}</span>
                    )}
                  </div>
                </div>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 truncate text-xs text-primary hover:underline"
                  dir="ltr"
                  title={l.url}
                >
                  <ExternalLink className="size-3 shrink-0" />
                  <span className="truncate">{l.sub}</span>
                </a>
              </div>
              <div className="flex items-center gap-2 border-t p-3">
                <Button asChild size="sm" className="flex-1 gap-1.5">
                  <a href={l.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-4" /> Open
                  </a>
                </Button>
                <Button
                  variant={copiedId === l.id ? "default" : "outline"}
                  size="sm"
                  className="gap-1.5"
                  onClick={() => copy(l)}
                  title="Copy link"
                >
                  {copiedId === l.id ? (
                    <Check className="size-4" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Courses — one link per course page                                  */
/* ------------------------------------------------------------------ */
function CourseLinksView() {
  const [items, setItems] = React.useState<AutoLink[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.courses.fetchCourses({ status: "published" });
      if (cancelled) return;
      if (res.ok) {
        setItems(
          res.data
            .filter((c) => c.slug)
            .map((c) => ({
              id: c.id || c.slug,
              name: c.titleEn || c.titleAr || c.slug,
              badge: c.category,
              sub: `/courses/${c.slug}`,
              url: `${SITE}/courses/${c.slug}`,
            })),
        );
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AutoLinkList
      title="Course links"
      subtitle="A ready-to-share link for every published course page."
      emptyText="No published courses yet."
      loading={loading}
      items={items}
      icon={GraduationCap}
      accent="from-primary to-primary/50"
    />
  );
}

/* ------------------------------------------------------------------ */
/* Landing pages — one link per registered landing page                */
/* ------------------------------------------------------------------ */
function LandingLinksView() {
  const [items, setItems] = React.useState<AutoLink[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.landing.fetchLandingPages();
      if (cancelled) return;
      if (res.ok) {
        setItems(
          res.data
            .filter((p) => p.path)
            .map((p) => ({
              id: p.id,
              name: p.name || p.path,
              badge: [p.campaign, p.language?.toUpperCase()].filter(Boolean).join(" · "),
              sub: p.path,
              url: `${SITE}${p.path.startsWith("/") ? "" : "/"}${p.path}`,
            })),
        );
      } else {
        toast.error(res.error);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AutoLinkList
      title="Landing page links"
      subtitle="A ready-to-share link for every registered campaign landing page."
      emptyText="No landing pages registered yet."
      loading={loading}
      items={items}
      icon={Megaphone}
      accent="from-amber-500 to-amber-400"
    />
  );
}
