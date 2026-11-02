import { useTranslations } from "next-intl";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Check,
  Cpu,
  Layers,
  Radio,
  ShieldCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { CategoryCarousel } from "@/features/marketing/components/category-carousel";
import { CohortCountdown } from "@/features/marketing/components/cohort-countdown";
import type { NextCohort } from "@/features/marketing/lib/next-cohort";

export interface ExploreCategory {
  id: string;
  slug: string;
  /** Already in the visitor's language. */
  name: string;
  nameEn: string;
  /** Published courses in it; 0 hides the count rather than printing "0 courses". */
  count: number;
}

/**
 * One consistent line icon per category, chosen from its name.
 *
 * Categories carry an admin-set `icon`, but today that is one uploaded SVG and
 * two emoji — three styles on one card row. The cards are a brand surface, so
 * they use a single icon family; a name that matches nothing gets the generic one.
 */
const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/quality|accredit/i, BadgeCheck],
  [/infection|safety|risk/i, ShieldCheck],
  [/manag|leader|admin|hospital/i, Building2],
  [/digital|informatic|\bai\b|data/i, Cpu],
  [/\bhr\b|people|human/i, UsersRound],
];
const categoryIcon = (...names: string[]): LucideIcon => {
  const hay = names.join(" ");
  return CATEGORY_ICONS.find(([re]) => re.test(hay))?.[1] ?? Layers;
};

/** Brand blue first, then the supporting accents the design uses to tell cards apart. */
const CARD_ACCENTS = ["#0b3fa8", "#0e7490", "#6d28d9", "#c2410c", "#15803d"] as const;

/**
 * "Explore courses" + "Next live cohort" — the band under the home hero.
 *
 * Pure presentation: the data section fetches the categories and the next
 * cohort and hands them in, which also lets this be rendered with a made-up
 * cohort to check the countdown state without touching real data.
 */
export function ExploreCohortsView({
  categories,
  cohort,
}: {
  categories: ExploreCategory[];
  cohort: NextCohort | null;
}) {
  const t = useTranslations("Marketing");

  // The last word of the headline carries the accent colour, as in the design.
  const words = t("exploreTitle").split(" ");
  const accent = words.length > 1 ? words.pop() : null;

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 md:py-16 lg:px-8">
      {/* Explorer */}
      {/* minmax(0,1fr) even below lg: an implicit `auto` column would grow to the
          full width of every card and drag the heading off the screen. */}
      <div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-center lg:gap-10">
        <div>
          <p className="text-[13px] font-bold uppercase tracking-[0.24em] text-[#0b3fa8]">{t("exploreCategoryLabel")}</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-extrabold leading-tight text-[#0a1f4d]">
            {accent ? (
              <>
                {words.join(" ")} <span className="text-[#0b3fa8]">{accent}</span>
              </>
            ) : (
              t("exploreTitle")
            )}
          </h2>
          <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-[#0b3fa8] to-[#f4c430]" aria-hidden="true" />
          <p className="mt-4 max-w-[34ch] text-sm leading-relaxed text-slate-600">{t("exploreSubtitle")}</p>
          <Link
            href="/courses"
            className="group mt-5 inline-flex items-center gap-2 rounded-full border border-[#0b3fa8] bg-white px-5 py-2.5 text-[15px] font-semibold text-[#0b3fa8] transition-colors hover:bg-[#eaf0fd]"
          >
            {t("viewAllCourses")}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
          </Link>
        </div>

        {categories.length > 0 && (
          <CategoryCarousel label={t("exploreCategoryLabel")} prevLabel={t("carouselPrev")} nextLabel={t("carouselNext")}>
            {categories.map((c, i) => {
              const Icon = categoryIcon(c.nameEn, c.slug);
              return (
                <li key={c.id} className="w-[200px] shrink-0 snap-start">
                  <Link
                    href={`/category/${c.slug}`}
                    style={{ "--card-accent": CARD_ACCENTS[i % CARD_ACCENTS.length] } as CSSProperties}
                    className="block h-full overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/[0.04] transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-950/10"
                  >
                    <div className="relative h-28 bg-gradient-to-br from-[var(--card-accent)] to-[#051a4a]">
                      <Icon className="absolute bottom-2 end-3 size-16 text-white/15" strokeWidth={1.5} aria-hidden="true" />
                    </div>
                    <div className="relative px-4 pb-4 pt-7">
                      <span className="absolute -top-5 start-4 grid size-10 place-items-center rounded-[10px] bg-white text-[var(--card-accent)] shadow-lg shadow-blue-950/10">
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <p className="font-heading text-[15px] font-bold leading-tight text-[#0a1f4d]">{c.name}</p>
                      {c.count > 0 && <p className="mt-1 text-xs text-slate-500">{t("categoryCourses", { count: c.count })}</p>}
                    </div>
                    <div className="h-1.5 bg-[var(--card-accent)]" />
                  </Link>
                </li>
              );
            })}
          </CategoryCarousel>
        )}
      </div>

      {/* Next cohort */}
      <div className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-[#eaf0fd] to-[#d6e0fb] p-6 md:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 end-0 h-28 w-48 bg-[#0b3fa8]/10 [clip-path:polygon(100%_0,100%_100%,0_100%)] rtl:[clip-path:polygon(0_0,0_100%,100%_100%)]"
        />
        <div className="relative grid gap-6 lg:grid-cols-[1fr_auto_auto] lg:items-center lg:gap-10">
          <div className="flex items-center gap-4 lg:border-e lg:border-[#d6e0fb] lg:pe-10">
            {/* Calendar mark */}
            <div className="relative size-16 shrink-0" aria-hidden="true">
              <div className="absolute inset-0 rounded-xl bg-[#0b3fa8] shadow-lg shadow-blue-950/15" />
              <div className="absolute inset-x-1.5 bottom-1.5 top-[9px] overflow-hidden rounded-md bg-white">
                <div className="h-3 bg-[#0b3fa8]/80" />
                <div className="grid grid-cols-4 gap-[3px] p-[5px]">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span key={i} className="h-1.5 rounded-[2px] bg-[#d6e0fb]" />
                  ))}
                </div>
              </div>
              <span className="absolute -bottom-1.5 -end-1.5 grid size-6 place-items-center rounded-full bg-[#f4c430] text-[#051a4a] shadow">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            </div>
            <div>
              <h3 className="font-heading text-[22px] font-bold leading-tight text-[#0a1f4d]">{t("cohortsTitle")}</h3>
              <p className="mt-1 max-w-[28ch] text-sm leading-relaxed text-slate-600">{t("cohortsDesc")}</p>
            </div>
          </div>

          {cohort ? (
            <>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  <Radio className="size-4 text-[#0b3fa8]" aria-hidden="true" />
                  {t("cohortStartsIn")}
                </p>
                <div className="mt-2">
                  <CohortCountdown
                    target={cohort.startDate}
                    labels={{
                      days: t("cohortDays"),
                      hours: t("cohortHours"),
                      minutes: t("cohortMinutes"),
                      seconds: t("cohortSeconds"),
                      started: t("cohortStarted"),
                    }}
                  />
                </div>
                <p className="mt-2 max-w-[18rem] truncate text-xs text-slate-500" title={cohort.title}>
                  {cohort.title}
                </p>
              </div>

              <div className="flex flex-col items-start gap-3">
                <Link
                  href={`/courses/${cohort.slug}`}
                  className={cn(
                    "group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-base font-semibold transition-colors",
                    "bg-[#f4c430] text-[#051a4a] hover:bg-[#e0b020]",
                  )}
                >
                  {t("cohortReserve")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </Link>
                {cohort.seats > 0 && (
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Users className="size-4 text-[#0b3fa8]" aria-hidden="true" />
                    {t("cohortSeats", { count: cohort.seats })}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                  <CalendarCheck className="size-4 text-[#0b3fa8]" aria-hidden="true" />
                  {t("cohortStartsIn")}
                </p>
                <p className="mt-2 max-w-xs text-base font-bold leading-snug text-[#0a1f4d]">{t("cohortSoonTitle")}</p>
              </div>
              <div className="flex flex-col items-start gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[#0b3fa8] px-6 py-3.5 text-base font-semibold text-white transition-colors hover:bg-[#0a2f7a]"
                >
                  {t("cohortAsk")}
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
