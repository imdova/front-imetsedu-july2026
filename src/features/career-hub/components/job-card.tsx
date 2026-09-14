import { ArrowRight, Banknote, Building2, CalendarClock, MapPin } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CareerJobDto } from "@/lib/dal/career-hub";
import { cn } from "@/lib/utils";
import {
  countryOf,
  employmentOf,
  formatDate,
  formatSalary,
  pick,
  trackOf,
} from "@/features/career-hub/lib/career-taxonomy";

/**
 * One listing in a list. Renders only what the listing actually carries — no
 * placeholder salary, no invented "applicants" count, no urgency badge.
 */
export function JobCard({
  job,
  locale,
  className,
  children,
}: {
  job: CareerJobDto;
  locale: string;
  className?: string;
  /** Extra content under the meta row — the student hub puts match reasons here. */
  children?: React.ReactNode;
}) {
  const ar = locale === "ar";
  const country = countryOf(job.country);
  const salary = formatSalary(job, locale);
  const where = [job.city, pick(country, locale)].filter(Boolean).join(ar ? "، " : ", ");

  return (
    <article
      className={cn(
        "group relative flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="grid size-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary/10 to-sky-500/10 text-2xl ring-1 ring-primary/10"
        >
          {country?.flag ?? <Building2 className="size-5 text-primary" />}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-heading text-base font-bold leading-snug">
            <Link href={`/careers/${job.slug}`} className="after:absolute after:inset-0 hover:text-primary">
              {job.title}
            </Link>
          </h3>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{job.employer}</p>
          <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
            {where && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" />
                {where}
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium text-foreground/80">
              {pick(employmentOf(job.employmentType), locale, job.employmentType)}
            </span>
            {salary && (
              <span className="inline-flex items-center gap-1 font-medium text-emerald-700 dark:text-emerald-400">
                <Banknote className="size-3.5" />
                <span dir="ltr">{salary}</span>
              </span>
            )}
          </div>
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
      </div>

      {job.tracks.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {job.tracks.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full bg-primary/[0.07] px-2.5 py-1 text-[11px] font-semibold text-primary">
              {pick(trackOf(t), locale, t)}
            </span>
          ))}
        </div>
      )}

      {children && <div className="relative">{children}</div>}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 pt-3 text-[11px] text-muted-foreground">
        <span>
          {ar ? "نُشر " : "Posted "}
          {formatDate(job.postedAt, locale)}
        </span>
        {job.expiresAt && (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="size-3.5" />
            {ar ? "آخر موعد " : "Apply by "}
            {formatDate(job.expiresAt, locale)}
          </span>
        )}
      </div>
    </article>
  );
}
