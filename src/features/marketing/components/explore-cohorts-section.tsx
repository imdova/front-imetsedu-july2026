import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarCheck,
  Cpu,
  Layers,
  ShieldCheck,
  Users,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { CohortCountdown } from "@/features/marketing/components/cohort-countdown";
import { nextCohort } from "@/features/marketing/lib/next-cohort";

/**
 * One consistent line icon per category, chosen from its name.
 *
 * Categories carry an admin-set `icon`, but today that is one uploaded SVG and
 * two emoji — three styles in one row. The section is a brand surface, so the
 * tiles use a single icon family in brand blue; a name that matches nothing
 * gets the generic one rather than a missing icon.
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

/**
 * "Explore courses" + "Next live cohorts" — the band under the home hero.
 *
 * Everything on it is live data: the category tiles are the catalogue's real
 * categories (each links to its own page), and the countdown runs to the
 * earliest open intake entered on a published course. With no upcoming intake
 * the countdown is replaced by a "dates announced soon" line — a date is never
 * made up to keep the clock ticking.
 */
export async function ExploreCohortsSection({ locale }: { locale: string }) {
  const t = await getTranslations("Marketing");
  const [catRes, courseRes] = await Promise.all([
    dal.courseTaxonomy.fetchPublicCategories(),
    dal.courses.fetchPublishedCourses(),
  ]);
  const ar = locale === "ar";
  const categories = (catRes.ok ? catRes.data : []).filter((c) => c.slug);
  const cohort = nextCohort(courseRes.ok ? courseRes.data : [], locale);

  return (
    <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl border border-blue-100 bg-white shadow-xl shadow-blue-950/5">
        {/* Explore */}
        <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-center lg:gap-8">
          <div>
            <h2 className="text-balance font-heading text-2xl font-extrabold leading-tight tracking-tight text-[#0a2f7a] sm:text-[1.75rem]">
              {t("exploreTitle")}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{t("exploreSubtitle")}</p>
            <Link
              href="/courses"
              className="group mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-[#0b3fa8] hover:underline"
            >
              {t("viewAllCourses")}
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>

          {categories.length > 0 && (
            <ul
              aria-label={t("exploreCategoryLabel")}
              className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]"
            >
              {categories.map((c) => {
                const Icon = categoryIcon(c.nameEn, c.slug);
                return (
                  <li key={c.id} className="min-w-[9rem] flex-1 snap-start">
                    <Link
                      href={`/category/${c.slug}`}
                      className="group flex h-full flex-col items-center justify-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/70 px-3 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0b3fa8]/40 hover:bg-white hover:shadow-md"
                    >
                      <Icon className="size-9 text-[#0b3fa8] transition-transform group-hover:scale-110" strokeWidth={1.75} aria-hidden="true" />
                      <span className="text-balance text-sm font-semibold leading-snug text-[#0a2f7a]">
                        {ar ? c.nameAr : c.nameEn}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Next live cohorts */}
        <div className="flex flex-col gap-5 border-t border-blue-100 bg-gradient-to-r from-blue-50 via-sky-50 to-blue-50 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-6">
          <div className="flex items-center gap-4 lg:flex-1">
            <span className="grid size-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-[#1e6ef0] to-[#0a2f7a] text-white shadow-lg shadow-blue-900/25">
              <CalendarCheck className="size-8" strokeWidth={1.75} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h3 className="font-heading text-xl font-extrabold tracking-tight text-[#0a2f7a]">{t("cohortsTitle")}</h3>
              <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-600">{t("cohortsDesc")}</p>
            </div>
          </div>

          <div aria-hidden="true" className="hidden h-16 w-px bg-blue-200 lg:block" />

          {cohort ? (
            <>
              <div className="min-w-0">
                <p className="mb-2 text-xs font-bold text-slate-700">{t("cohortStartsIn")}</p>
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
                <p className="mt-2 max-w-[18rem] truncate text-xs text-slate-500" title={cohort.title}>{cohort.title}</p>
              </div>

              <div className="flex flex-col items-start gap-2 lg:items-center">
                <Link
                  href={`/courses/${cohort.slug}`}
                  className={cn(
                    "group inline-flex h-11 min-w-[12rem] items-center justify-center gap-2 rounded-full px-7 text-base font-bold transition-all duration-200",
                    "bg-[#f4c430] text-[#051a4a] shadow-md shadow-blue-950/15 hover:-translate-y-0.5 hover:bg-[#e0b020] hover:shadow-lg",
                  )}
                >
                  {t("cohortReserve")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </Link>
                {cohort.seats > 0 && (
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                    <Users className="size-3.5 text-[#0b3fa8]" aria-hidden="true" />
                    {t("cohortSeats", { count: cohort.seats })}
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="max-w-xs text-sm font-semibold leading-snug text-[#0a2f7a]">{t("cohortSoonTitle")}</p>
              <Link
                href="/contact"
                className="inline-flex h-11 min-w-[12rem] items-center justify-center rounded-full bg-[#0a2f7a] px-7 text-base font-bold text-white shadow-md shadow-blue-950/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#0b3fa8] hover:shadow-lg"
              >
                {t("cohortAsk")}
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
