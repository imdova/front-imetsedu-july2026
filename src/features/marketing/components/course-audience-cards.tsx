import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";
import type { AudiencePersona } from "@/features/marketing/lib/course-content";

/**
 * "Who This Program Is For" as persona cards that open to explain why the
 * program fits that specific reader.
 *
 * Native <details>/<summary> rather than React state: this renders inside a
 * server component, so the disclosure works with zero client JS and keeps the
 * `why` copy in the server HTML where crawlers can read it.
 */
export function CourseAudienceCards({
  locale,
  title,
  personas,
  className,
}: {
  locale: string;
  title: string;
  personas: AudiencePersona[];
  className?: string;
}) {
  if (!personas.length) return null;
  const ar = locale === "ar";

  return (
    <section id="audience" className={cn("scroll-mt-32", className)}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <h2 className="max-w-md font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h2>
        <p className="max-w-sm text-sm text-muted-foreground lg:text-end">
          {ar
            ? "اضغط على أي بطاقة لتعرف لماذا يناسبك البرنامج."
            : "Tap any card to see why the program fits you."}
        </p>
      </div>

      <div dir={ar ? "rtl" : "ltr"} className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {personas.map((p) => (
          <details
            key={p.label}
            className="group rounded-2xl border border-border/60 bg-card p-4 transition-colors open:border-primary/30 open:bg-primary/[0.03] hover:border-primary/30"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 [&::-webkit-details-marker]:hidden">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-2xl ring-1 ring-primary/10" aria-hidden>
                {p.emoji}
              </span>
              <span className="min-w-0 flex-1 font-heading text-[0.95rem] font-bold leading-snug text-foreground">
                {p.label}
              </span>
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-3 border-t border-border/60 pt-3 text-sm leading-relaxed text-muted-foreground">
              {p.why}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
