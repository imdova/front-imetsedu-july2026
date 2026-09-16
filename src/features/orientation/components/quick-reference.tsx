"use client";

import * as React from "react";
import { Search } from "lucide-react";

import { cn } from "@/lib/utils";
import type { SalesOrientation } from "@/features/orientation/lib/sales-orientation";
import { useOrientationT, type OrientationKey } from "@/features/orientation/lib/i18n";
import { track } from "@/features/orientation/lib/track";
import { CopyButton } from "./lesson-parts";

const TABS: { id: string; label: OrientationKey }[] = [
  { id: "objections", label: "ref.objections" },
  { id: "phrases", label: "ref.phrases" },
  { id: "closings", label: "ref.closings" },
  { id: "checklist", label: "ref.checklist" },
];

interface RefItem {
  id: string;
  heading: string;
  answer: string;
  tag?: string;
  copy?: string;
  tone?: "never";
}

/**
 * Quick reference — the course turned into a shift companion. The same data
 * the lessons use (no second copy), one search box over the active tab, and a
 * Copy button on every answer.
 */
export function QuickReference({ content }: { content: SalesOrientation }) {
  const { t } = useOrientationT();
  const [tab, setTab] = React.useState("objections");
  const [query, setQuery] = React.useState("");

  const items: RefItem[] = React.useMemo(() => {
    switch (tab) {
      case "objections":
        return content.objections.map((o, i) => ({ id: `o${i}`, heading: `«${o.objection}»`, answer: o.right, tag: o.category, copy: o.right }));
      case "phrases":
        return content.phraseBank.map((p, i) => ({ id: `p${i}`, heading: `«${p.risky}»`, answer: p.safe, copy: p.safe, tone: "never" as const }));
      case "closings":
        return content.closings.map((c, i) => ({ id: `c${i}`, heading: c.situation, answer: `«${c.text}»`, copy: c.text }));
      default:
        return content.checklist.map((c, i) => ({ id: `k${i}`, heading: c.question, answer: c.hint }));
    }
  }, [tab, content]);

  const q = query.trim().toLowerCase();
  const visible = q ? items.filter((x) => `${x.heading} ${x.answer} ${x.tag ?? ""}`.toLowerCase().includes(q)) : items;

  // Searches are reported once typing settles, not per keystroke.
  React.useEffect(() => {
    if (!q) return;
    const id = setTimeout(() => track("orientation_reference_search", { tab, q_length: q.length }), 800);
    return () => clearTimeout(id);
  }, [q, tab]);

  return (
    <section className="rounded-[18px] border border-border/70 bg-card shadow-sm">
      <div className="flex flex-wrap items-center gap-3 border-b border-border/70 px-4 py-3 sm:px-5">
        <div className="flex gap-1 overflow-x-auto" role="tablist">
          {TABS.map((x) => (
            <button
              key={x.id}
              type="button"
              role="tab"
              aria-selected={tab === x.id}
              onClick={() => setTab(x.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
                tab === x.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t(x.label)}
            </button>
          ))}
        </div>
        <label className="relative ms-auto w-full min-w-0 sm:w-80">
          <span className="sr-only">{t("ref.search")}</span>
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("ref.search")}
            className="h-10 w-full rounded-xl border border-border/70 bg-background pe-3 ps-9 text-sm outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </label>
      </div>

      <div className="space-y-2.5 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">{t("ref.intro")}</p>
        {visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">{t("ref.empty")}</p>
        ) : (
          visible.map((x) => (
            <div key={x.id} className="grid grid-cols-[1fr_auto] items-start gap-x-3 gap-y-1 rounded-xl border border-border/70 p-3.5">
              <p className={cn("text-sm font-semibold leading-snug", x.tone === "never" && "text-destructive")}>
                {x.heading}
                {x.tag && <span className="ms-1.5 text-xs font-normal text-muted-foreground">· {x.tag}</span>}
              </p>
              {x.copy && (
                <CopyButton
                  text={x.copy}
                  className="row-span-2"
                  onCopied={() => track("orientation_reference_copy", { tab, itemId: x.id })}
                />
              )}
              <p className="col-start-1 text-[13.5px] leading-relaxed text-muted-foreground">{x.answer}</p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
