import { ArrowRight, Check, Minus, Scale } from "lucide-react";

import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { richText } from "@/features/marketing/lib/geo-rich-text";
import {
  comparisonContent,
  type ComparisonPage,
} from "@/features/marketing/lib/comparison-pages";

/**
 * Renders one comparison page.
 *
 * Deliberately has no single "Apply now" button. A reader on this page has not
 * chosen yet, and a primary call to action for one of the options would answer
 * the question for them — which is both dishonest and, on a decision-stage page,
 * counterproductive. Each option carries its own link to its own course page,
 * they are rendered identically, and the only shared call to action asks whether
 * they want help choosing.
 */
export function ComparisonLanding({
  page,
  locale,
}: {
  page: ComparisonPage;
  locale: string;
}) {
  const c = comparisonContent(page, locale);
  const ar = locale === "ar";

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <header>
        <Badge variant="secondary" className="mb-3 inline-flex items-center gap-1.5">
          <Scale className="size-3.5" />
          {ar ? "مقارنة" : "Comparison"}
        </Badge>
        <h1 className="font-heading text-3xl font-bold leading-tight tracking-tight text-balance sm:text-[2.6rem]">
          {c.h1}
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{richText(c.intro)}</p>
      </header>

      {/* The options, side by side and visually identical. */}
      <div
        className={cn(
          "mt-10 grid gap-5",
          c.options.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3",
        )}
      >
        {c.options.map((o) => (
          <article
            key={o.key}
            className="flex h-full flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm"
          >
            <h2 className="font-heading text-xl font-bold tracking-tight">{o.name}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{o.summary}</p>

            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                {ar ? "مناسب لـ" : "Right for"}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {o.bestFor.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                    <Check className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span>{richText(b)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rendered with the same weight as the strengths above, not tucked
                into small print — the reader is here to rule something out. */}
            <div className="mt-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {ar ? "غير مناسب لـ" : "Not right for"}
              </p>
              <ul className="mt-1.5 space-y-1.5">
                {o.notFor.map((b, i) => (
                  <li key={i} className="flex gap-2 text-sm leading-relaxed text-foreground/90">
                    <Minus className="mt-0.5 size-4 shrink-0 text-amber-600" />
                    <span>{richText(b)}</span>
                  </li>
                ))}
              </ul>
            </div>

            {o.courseSlug && (
              <Link
                href={`/courses/${o.courseSlug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-all hover:gap-2.5"
              >
                {ar ? "تفاصيل البرنامج" : "Programme details"}
                <ArrowRight className="size-4 rtl:rotate-180" />
              </Link>
            )}
          </article>
        ))}
      </div>

      {/* At a glance. Scrolls inside its own box on a phone. */}
      <div className="mt-10 overflow-x-auto rounded-2xl border border-border/70">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">{c.h1}</caption>
          <thead>
            <tr className="bg-muted/60">
              <th scope="col" className="px-4 py-2.5 text-start font-semibold">
                {ar ? "المعيار" : "At a glance"}
              </th>
              {c.options.map((o) => (
                <th key={o.key} scope="col" className="px-4 py-2.5 text-start font-semibold">
                  {o.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {c.matrix.map((row) => (
              <tr key={row.label} className="border-t border-border/60">
                <th scope="row" className="px-4 py-2.5 text-start font-medium text-foreground">
                  {row.label}
                </th>
                {row.values.map((v, i) => (
                  <td key={i} className="px-4 py-2.5 text-muted-foreground">
                    {richText(v)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-10 space-y-10">
        {c.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="font-heading text-2xl font-bold tracking-tight">{section.heading}</h2>
            <div className="mt-3 space-y-4">
              {section.paragraphs.map((p, i) => (
                <p key={i} className="leading-relaxed text-foreground/90">
                  {richText(p)}
                </p>
              ))}
              {section.bullets && (
                <ul className="space-y-2">
                  {section.bullets.map((b, i) => (
                    <li key={i} className="flex gap-2.5 leading-relaxed text-foreground/90">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-primary/60" />
                      <span>{richText(b)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}

        {/* The part people scroll to. It has to actually answer. */}
        <section className="rounded-3xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight">{c.verdict.heading}</h2>
          <div className="mt-3 space-y-4">
            {c.verdict.paragraphs.map((p, i) => (
              <p key={i} className="leading-relaxed text-foreground/90">
                {richText(p)}
              </p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {ar ? "أسئلة شائعة" : "Common questions"}
          </h2>
          <dl className="mt-4 space-y-4">
            {c.faqs.map((f) => (
              <div key={f.q} className="rounded-2xl border border-border/70 bg-card p-5">
                <dt className="font-semibold">{f.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {richText(f.a)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-3xl bg-gradient-to-br from-primary/[0.09] via-primary/[0.03] to-transparent p-6 ring-1 ring-primary/10 sm:p-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight">{c.ctaHeading}</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground">{richText(c.ctaBody)}</p>
          <div className="mt-5 flex flex-wrap items-center gap-4">
            {/* Every option gets the same treatment here too. */}
            {c.options
              .filter((o) => o.courseSlug)
              .map((o) => (
                <Link
                  key={o.key}
                  href={`/courses/${o.courseSlug}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-all hover:gap-2.5"
                >
                  {o.name}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Link>
              ))}
          </div>
        </section>
      </div>
    </div>
  );
}
