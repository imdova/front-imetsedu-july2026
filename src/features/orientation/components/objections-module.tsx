"use client";

import * as React from "react";
import { Check, ChevronDown, Lightbulb, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Objection, SalesOrientation } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { CopyButton, type GateProps } from "./lesson-parts";

/**
 * The objection bank — the method first, then real objections to IMETS
 * programmes, each with what sits behind it, the weak reply, the model reply
 * and the policy facts a rep can state without checking with anyone.
 *
 * The gate is one objection opened from every category: price, trust, time,
 * hesitation and eligibility each need a different kind of answer, and reading
 * three price objections teaches none of that.
 */

/** Categories in order of first appearance. Gate keys use the position, so they hold in both languages. */
export const objectionCategories = (objections: Objection[]) => [...new Set(objections.map((o) => o.category))];

export function ObjectionsModule({
  method,
  objections,
  seen,
  mark,
}: {
  method: SalesOrientation["objectionMethod"];
  objections: Objection[];
} & GateProps) {
  const { t } = useOrientationT();
  const categories = React.useMemo(() => objectionCategories(objections), [objections]);
  const [filter, setFilter] = React.useState<string | null>(null);
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState<number | null>(null);

  const catKey = (category: string) => `cat:${categories.indexOf(category)}`;

  const visible = objections
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => (filter ? o.category === filter : true))
    .filter(({ o }) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return [o.objection, o.behind, o.right, o.category].some((x) => x.toLowerCase().includes(q));
    });

  return (
    <div className="space-y-5">
      <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{method.intro}</p>

      <ol className="grid grid-cols-2 gap-2 lg:grid-cols-4">
        {method.steps.map((s, i) => (
          <li key={`${i}-${s.title}`} className="rounded-xl bg-muted/60 p-3">
            <span className="font-heading text-xs font-extrabold text-primary">{s.n}</span>
            <span className="mt-0.5 block text-sm font-bold">{s.title}</span>
            <span className="mt-1 block text-[13px] leading-relaxed text-muted-foreground">{s.body}</span>
          </li>
        ))}
      </ol>

      <p className="flex items-start gap-2.5 rounded-xl bg-primary/[0.07] p-3.5 text-sm leading-relaxed">
        <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" />
        <span>{method.isolate}</span>
      </p>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            aria-pressed={filter === null}
            onClick={() => setFilter(null)}
            className={cn(
              "rounded-xl border px-3 py-1.5 text-sm transition-colors",
              filter === null ? "border-primary bg-primary/[0.07] font-semibold text-primary" : "border-border/70 hover:border-primary/40",
            )}
          >
            {t("common.all")} ({num(objections.length)})
          </button>
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={filter === c}
              onClick={() => setFilter(filter === c ? null : c)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm transition-colors",
                filter === c ? "border-primary bg-primary/[0.07] font-semibold text-primary" : "border-border/70 hover:border-primary/40",
              )}
            >
              {seen.has(catKey(c)) && <Check className="size-3.5 text-emerald-600" aria-hidden="true" />}
              {c}
            </button>
          ))}
        </div>

        <label className="relative block">
          <span className="sr-only">{t("objections.search")}</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("objections.search")}
            className="h-10 w-full rounded-xl border border-border/70 bg-card pe-3 ps-9 text-sm outline-none transition-colors focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </label>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl bg-muted/60 p-4 text-center text-sm text-muted-foreground">{t("objections.none")}</p>
      ) : (
        <div className="space-y-2">
          {visible.map(({ o, i }) => {
            const isOpen = open === i;
            const panelId = `objection-${i}`;
            return (
              <div key={i} className={cn("overflow-hidden rounded-xl border bg-card", isOpen ? "border-primary/40" : "border-border/70")}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => {
                    setOpen(isOpen ? null : i);
                    if (!isOpen) mark(catKey(o.category));
                  }}
                  className="flex w-full flex-wrap items-center gap-2 p-3.5 text-start transition-colors hover:bg-muted/40 sm:flex-nowrap"
                >
                  <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">«{o.objection}»</span>
                  <span className="rounded-full border border-border/70 bg-muted/60 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    {o.category}
                  </span>
                  <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform", isOpen && "rotate-180")} />
                </button>

                {isOpen && (
                  <div id={panelId} className="space-y-3 border-t border-border/60 p-3.5">
                    <Row label={t("objections.behind")}>{o.behind}</Row>
                    <Row label={t("objections.weak")}>
                      <span className="text-muted-foreground line-through decoration-destructive/60">«{o.wrong}»</span>
                    </Row>
                    <Row label={t("objections.model")}>
                      <span className="block rounded-xl bg-emerald-500/[0.09] p-3">{o.right}</span>
                      <CopyButton text={o.right} className="mt-2" />
                    </Row>
                    {o.facts.length > 0 && (
                      <Row label={t("objections.facts")}>
                        <ul className="space-y-1.5">
                          {o.facts.map((f, fi) => (
                            <li key={fi} className="flex gap-2">
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </Row>
                    )}
                    {o.next && (
                      <Row label={t("objections.next")}>
                        <span className="block rounded-xl bg-primary/[0.07] p-3">{o.next}</span>
                        <CopyButton text={o.next} className="mt-2" />
                      </Row>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 text-sm leading-relaxed sm:grid-cols-[9rem_1fr] sm:gap-3">
      <span className="text-[13px] text-muted-foreground">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
