"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  FaqItem,
  KnowledgeGroup,
} from "@/features/marketing/lib/course-content";

/**
 * Knowledge Center timeline. The content lives in native <details> elements
 * (crawlable + no-JS + desktop accordion). On mobile those are hidden and each
 * card instead opens a real bottom sheet — a progressive enhancement that never
 * removes the copy from the HTML (the <details> are `hidden lg:block`, so the
 * text is in the DOM on every viewport for search engines).
 *
 * Desktop <details> share a `name` so opening one closes the rest (native
 * "exclusive accordion") — this keeps the section short instead of an endless
 * page of stacked 500-word answers.
 *
 * Fully data-driven: the ordered topic `groups` (label + emoji per card) are
 * passed in per program, so any course frames its own Knowledge Center. Numbers
 * stay a single IMETS-blue for an academic look — only the emoji differs.
 */

type Card = {
  key: string;
  en: string;
  ar: string;
  emoji: string;
  items: FaqItem[];
};

function Answers({ items }: { items: FaqItem[] }) {
  return (
    // Cap the measure at ~720px — a comfortable reading line length even when
    // the card itself is wider (classic typography rule).
    <div className="max-w-[45rem] space-y-9">
      {items.map((it, j) => (
        <div key={j}>
          {/* Each Q&A is an H3 carrying its keywords, for SEO. */}
          <h3 className="font-heading text-[1.05rem] font-bold text-foreground">
            {it.q}
          </h3>
          <div className="mt-3 space-y-4 text-[0.95rem] leading-7 text-muted-foreground">
            {it.a.split("\n\n").map((para, k) => (
              <p key={k}>{para}</p>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function KnowledgeTimeline({
  locale,
  items,
  groups,
}: {
  locale: string;
  items: FaqItem[];
  /** Ordered topic groups (label + emoji per card), defined per program. */
  groups: KnowledgeGroup[];
}) {
  const ar = locale === "ar";
  const [sheet, setSheet] = React.useState<number | null>(null);

  const known = new Set<string>(groups.map((g) => g.key));
  const cards: Card[] = groups
    .map((g) => ({
      key: g.key,
      en: g.en,
      ar: g.ar,
      emoji: g.emoji,
      items: items.filter((it) => it.group === g.key),
    }))
    .filter((c) => c.items.length);
  const leftover = items.filter((it) => !it.group || !known.has(it.group));
  if (leftover.length) {
    cards.push({
      key: "more",
      en: "More",
      ar: "المزيد",
      emoji: "📖",
      items: leftover,
    });
  }

  const Face = ({
    card,
    index,
    forDetails,
  }: {
    card: Card;
    index: number;
    forDetails?: boolean;
  }) => {
    // Subtitle = the actual question titles inside this card (not "N topics").
    const preview = card.items.map((it) => it.q).join(ar ? " • " : " · ");
    return (
      <>
        <span className="relative z-10 grid size-10 shrink-0 place-items-center rounded-full bg-primary font-heading text-sm font-bold tabular-nums text-primary-foreground shadow-sm ring-4 ring-background">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/[0.07] text-lg leading-none ring-1 ring-primary/15 dark:bg-primary/10"
          aria-hidden
        >
          {card.emoji}
        </span>
        <span className="min-w-0 flex-1 text-start">
          <span className="block font-heading text-base font-semibold text-foreground sm:text-lg">
            {ar ? card.ar : card.en}
          </span>
          <span className="mt-1 block line-clamp-2 text-sm leading-snug text-muted-foreground">
            {preview}
          </span>
        </span>
        <ChevronRight
          className={cn(
            "mt-1 size-5 shrink-0 self-start text-muted-foreground",
            forDetails &&
              "transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90",
            !forDetails && "rtl:rotate-180",
          )}
        />
      </>
    );
  };

  const jumpTo = (key: string) => {
    const el = document.getElementById(`kc-card-${key}`);
    if (el instanceof HTMLDetailsElement) {
      el.open = true; // `name` auto-collapses the others
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      {/* Internal TOC — quick jump; opens the target card (desktop). */}
      <nav
        aria-label={ar ? "محتويات مركز المعرفة" : "Knowledge Center contents"}
        className="mt-6 hidden flex-wrap gap-2 lg:flex"
      >
        {cards.map((c, i) => (
          <button
            key={c.key}
            type="button"
            onClick={() => jumpTo(c.key)}
            className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <span className="font-heading font-bold tabular-nums text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            {ar ? c.ar : c.en}
          </button>
        ))}
      </nav>

      <ol className="relative mt-6 space-y-4">
        <span
          aria-hidden
          className="absolute inset-y-5 start-5 w-px bg-gradient-to-b from-primary/40 via-border to-border/40"
        />
        {cards.map((c, i) => (
          <li key={c.key} className="relative">
            {/* Desktop / crawlable: native exclusive accordion (in the DOM on
                all viewports). `name` closes the others when one opens. */}
            <details
              id={`kc-card-${c.key}`}
              name="cic-knowledge-center"
              className="group hidden scroll-mt-28 overflow-hidden rounded-2xl border border-border/60 bg-card/70 transition-colors open:border-primary/30 open:bg-card open:shadow-sm lg:block"
            >
              <summary className="flex cursor-pointer list-none items-center gap-4 p-4 sm:p-5">
                <Face card={c} index={i} forDetails />
              </summary>
              <div className="border-t border-border/60 px-4 pb-7 pt-6 sm:px-5 sm:ps-[4.75rem]">
                <Answers items={c.items} />
              </div>
            </details>

            {/* Mobile: a card button that opens the bottom sheet */}
            <button
              type="button"
              onClick={() => setSheet(i)}
              className="flex w-full items-center gap-4 rounded-2xl border border-border/60 bg-card/70 p-4 text-start shadow-sm transition-colors hover:border-primary/30 active:bg-card lg:hidden"
            >
              <Face card={c} index={i} />
            </button>
          </li>
        ))}
      </ol>

      {/* Mobile bottom sheet — presents the same content; the crawlable copy
          stays in the (hidden) <details> above, so no SEO is lost. */}
      <Sheet open={sheet !== null} onOpenChange={(open) => !open && setSheet(null)}>
        <SheetContent
          side="bottom"
          dir={ar ? "rtl" : "ltr"}
          className="max-h-[85vh] gap-0 overflow-y-auto rounded-t-3xl px-5 pb-8 lg:hidden"
        >
          {sheet !== null && (
            <>
              <SheetHeader className="px-0">
                <SheetTitle className="flex items-center gap-3 font-heading text-lg">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold tabular-nums text-primary-foreground">
                    {String(sheet + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden>{cards[sheet].emoji}</span>
                  {ar ? cards[sheet].ar : cards[sheet].en}
                </SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <Answers items={cards[sheet].items} />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
}
