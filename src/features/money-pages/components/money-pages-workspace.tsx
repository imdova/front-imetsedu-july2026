"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  BookOpen,
  Check,
  CircleDashed,
  ExternalLink,
  Link2,
  Map,
  Target,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  GATE,
  MONEY_PAGE_AUDIT,
  PLANNED_PAGES,
  type ArticleMapping,
  type GateResult,
} from "@/features/money-pages/lib/money-pages";

/**
 * The money-page programme in one place.
 *
 * The three source spreadsheets are a snapshot; this is the working surface.
 * The distinction that matters throughout: numbers computed from the deployed
 * content are marked live, and numbers from the crawl are marked with the date
 * they were taken. They are never blended, because a page whose word count is
 * measured now and whose inbound-link count is three days old would otherwise
 * present as one coherent reading of reality.
 */

type Tab = "roadmap" | "gate" | "health" | "actions" | "articles";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "gate", label: "Content gate", icon: Target },
  { id: "health", label: "Page health", icon: Link2 },
  { id: "actions", label: "This week", icon: Check },
  { id: "articles", label: "Article map", icon: BookOpen },
];

const WAVE_NOTE: Record<number, string> = {
  1: "Repeats a validated page in two more markets. Least new research.",
  2: "Tests whether the template carries to a different product.",
  3: "Only pays off once waves 1 and 2 rank. Thinner demand, same content cost.",
  4: "Largest untapped demand. Last only because it needs the English pages to model.",
  5: "A different funnel stage — decision, not purchase — and a different template.",
};

const ACTION_STYLE: Record<ArticleMapping["action"], string> = {
  ADD: "bg-destructive/10 text-destructive ring-destructive/25",
  CHANGE: "bg-amber-500/10 text-amber-700 ring-amber-500/25",
  INTERIM: "bg-muted text-muted-foreground ring-border",
  KEEP: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/25",
};

function Stat({
  label,
  value,
  tone,
  note,
}: {
  label: string;
  value: string | number;
  tone?: "good" | "bad";
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "mt-1 font-heading text-2xl font-bold tabular-nums",
          tone === "good" && "text-emerald-600",
          tone === "bad" && "text-destructive",
        )}
      >
        {value}
      </p>
      {note && <p className="mt-0.5 text-xs text-muted-foreground">{note}</p>}
    </div>
  );
}

export function MoneyPagesWorkspace({
  gate,
  built,
}: {
  gate: GateResult[];
  /** Paths that resolve today, computed from the route registry. */
  built: string[];
}) {
  const [tab, setTab] = React.useState<Tab>("roadmap");
  const [wave, setWave] = React.useState<number | null>(null);
  const [action, setAction] = React.useState<ArticleMapping["action"] | null>(null);

  const builtSet = React.useMemo(() => new Set(built), [built]);
  const audit = MONEY_PAGE_AUDIT;

  const liveCount = PLANNED_PAGES.filter((p) => builtSet.has(p.path)).length;
  const failing = gate.filter((g) => !g.passes).length;
  const orphaned = audit.pages.filter((p) => p.linksIn === 0).length;
  const noOutbound = audit.pages.filter((p) => p.linksOut === 0).length;

  const visiblePlanned = wave ? PLANNED_PAGES.filter((p) => p.wave === wave) : PLANNED_PAGES;
  const visibleArticles = action
    ? audit.articles.filter((a) => a.action === action)
    : audit.articles;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Built" value={`${liveCount} / ${PLANNED_PAGES.length}`} note="live routes" />
        <Stat
          label="Failing the gate"
          value={failing}
          tone={failing === 0 ? "good" : "bad"}
          note={`< ${GATE.minWords} words, < ${GATE.minArticleLinks} article links, or no course link`}
        />
        <Stat
          label="Orphaned pages"
          value={orphaned}
          tone={orphaned === 0 ? "good" : "bad"}
          note={`zero editorial links in · audited ${audit.auditedOn}`}
        />
        <Stat
          label="No links out"
          value={noOutbound}
          tone={noOutbound === 0 ? "good" : "bad"}
          note={`link to no articles · audited ${audit.auditedOn}`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border/70 bg-card p-1.5">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors",
              tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <t.icon className="size-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── roadmap ─────────────────────────────────────────────────────── */}
      {tab === "roadmap" && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWave(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                wave === null ? "border-primary bg-primary text-primary-foreground" : "border-border/70 hover:border-primary/40",
              )}
            >
              All waves
            </button>
            {[1, 2, 3, 4, 5].map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => setWave(wave === w ? null : w)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  wave === w ? "border-primary bg-primary text-primary-foreground" : "border-border/70 hover:border-primary/40",
                )}
              >
                Wave {w}
              </button>
            ))}
          </div>

          {wave && (
            <p className="rounded-xl bg-muted/60 p-3 text-sm text-muted-foreground">{WAVE_NOTE[wave]}</p>
          )}

          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="px-4 py-2.5 text-start font-semibold">Page</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Owns this query</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Local hook to research</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Wave</th>
                </tr>
              </thead>
              <tbody>
                {visiblePlanned.map((p) => {
                  const isBuilt = builtSet.has(p.path);
                  return (
                    <tr key={p.path} className="border-t border-border/60">
                      <td className="px-4 py-2.5">
                        <span className="flex items-center gap-2">
                          {isBuilt ? (
                            <Check className="size-4 shrink-0 text-emerald-600" />
                          ) : (
                            <CircleDashed className="size-4 shrink-0 text-muted-foreground/60" />
                          )}
                          {isBuilt ? (
                            <a
                              href={p.path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                            >
                              {p.path}
                              <ExternalLink className="size-3" />
                            </a>
                          ) : (
                            <span className="font-mono text-xs text-muted-foreground">{p.path}</span>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">{p.owns}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{p.hook}</td>
                      <td className="px-4 py-2.5">
                        <Badge variant="secondary">Wave {p.wave}</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── content gate ────────────────────────────────────────────────── */}
      {tab === "gate" && (
        <div className="space-y-3">
          <p className="rounded-xl border border-primary/25 bg-primary/[0.04] p-3.5 text-sm leading-relaxed">
            Measured from the deployed content on every render — the same rules{" "}
            <code className="rounded bg-muted px-1 py-0.5 text-xs">npm run check:geo</code> enforces
            on <code className="rounded bg-muted px-1 py-0.5 text-xs">prebuild</code>, so a page
            that fails here cannot reach production.
          </p>

          <div className="grid gap-3 md:grid-cols-2">
            {gate.map((g) => (
              <div
                key={`${g.path}-${g.locale}`}
                className={cn(
                  "rounded-2xl border p-4",
                  g.passes ? "border-emerald-500/30 bg-emerald-500/[0.04]" : "border-destructive/30 bg-destructive/[0.05]",
                )}
              >
                <div className="flex items-center gap-2">
                  {g.passes ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="size-4 text-destructive" />
                  )}
                  <span className="font-semibold">{g.market}</span>
                  <Badge variant="outline" className="ms-auto uppercase">{g.locale}</Badge>
                </div>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{g.path}</p>
                <dl className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-card p-2">
                    <dt className="text-[11px] text-muted-foreground">Words</dt>
                    <dd className={cn("font-bold tabular-nums", g.words < GATE.minWords && "text-destructive")}>
                      {g.words}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-card p-2">
                    <dt className="text-[11px] text-muted-foreground">FAQs</dt>
                    <dd className={cn("font-bold tabular-nums", g.faqs < GATE.minFaqs && "text-destructive")}>
                      {g.faqs}
                    </dd>
                  </div>
                  <div className="rounded-xl bg-card p-2">
                    <dt className="text-[11px] text-muted-foreground">Article links</dt>
                    <dd
                      className={cn(
                        "font-bold tabular-nums",
                        g.articleLinks.length < GATE.minArticleLinks && "text-destructive",
                      )}
                    >
                      {g.articleLinks.length}
                    </dd>
                  </div>
                </dl>
                <p className="mt-2 flex items-center gap-1.5 text-xs">
                  {g.linksToCourse ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <X className="size-3.5 text-destructive" />
                  )}
                  links to its course page in prose
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── page health ─────────────────────────────────────────────────── */}
      {tab === "health" && (
        <div className="space-y-3">
          <p className="rounded-xl bg-amber-500/[0.07] p-3.5 text-sm leading-relaxed ring-1 ring-amber-500/20">
            From the crawl on <b>{audit.auditedOn}</b>, not recomputed. Editorial link counts need a
            fresh crawl to update — treat these as of that date, not as of now.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="px-4 py-2.5 text-start font-semibold">Page</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Primary keyword</th>
                  <th className="px-4 py-2.5 text-end font-semibold">In</th>
                  <th className="px-4 py-2.5 text-end font-semibold">Out</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Verdict</th>
                </tr>
              </thead>
              <tbody>
                {audit.pages.map((p) => (
                  <tr key={p.url} className="border-t border-border/60">
                    <td className="px-4 py-2.5 font-mono text-xs">{p.url}</td>
                    <td className="px-4 py-2.5">{p.keyword}</td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-end font-bold tabular-nums",
                        p.linksIn === 0 && "text-destructive",
                      )}
                    >
                      {p.linksIn}
                    </td>
                    <td
                      className={cn(
                        "px-4 py-2.5 text-end font-bold tabular-nums",
                        p.linksOut === 0 && "text-destructive",
                      )}
                    >
                      {p.linksOut}
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{p.verdict}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── this week ───────────────────────────────────────────────────── */}
      {tab === "actions" && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Twelve fixes in priority order, all editorial link edits except the last. From the{" "}
            {audit.auditedOn} audit.
          </p>
          {audit.tasks.map((t) => (
            <div key={t.n} className="flex gap-3 rounded-2xl border border-border/70 bg-card p-4">
              <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                {t.n}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium leading-snug">{t.task}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.why}</p>
              </div>
              <Badge variant="outline" className="h-fit shrink-0">{t.effort}</Badge>
            </div>
          ))}
        </div>
      )}

      {/* ── article map ─────────────────────────────────────────────────── */}
      {tab === "articles" && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setAction(null)}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                action === null ? "border-primary bg-primary text-primary-foreground" : "border-border/70 hover:border-primary/40",
              )}
            >
              All ({audit.articles.length})
            </button>
            {(["ADD", "CHANGE", "INTERIM", "KEEP"] as const).map((a) => {
              const n = audit.articles.filter((x) => x.action === a).length;
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAction(action === a ? null : a)}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    action === a ? "border-primary bg-primary text-primary-foreground" : "border-border/70 hover:border-primary/40",
                  )}
                >
                  {a} ({n})
                </button>
              );
            })}
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border/70">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/60">
                  <th className="px-4 py-2.5 text-start font-semibold">Article</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Cluster</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Links to now</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Should link to</th>
                  <th className="px-4 py-2.5 text-start font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {visibleArticles.map((a) => (
                  <tr key={a.slug} className="border-t border-border/60">
                    <td className="px-4 py-2.5">
                      <a
                        href={`/blog/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                      >
                        {a.slug}
                        <ArrowUpRight className="size-3" />
                      </a>
                    </td>
                    <td className="px-4 py-2.5 text-muted-foreground">{a.cluster}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {a.linksToNow || "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs">{a.shouldLinkTo || "—"}</td>
                    <td className="px-4 py-2.5">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1",
                          ACTION_STYLE[a.action],
                        )}
                      >
                        {a.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
