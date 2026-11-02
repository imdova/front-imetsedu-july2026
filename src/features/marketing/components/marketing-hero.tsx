import { getTranslations } from "next-intl/server";
import { Sparkles, Star, ArrowRight, Check, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { SmartImage } from "@/components/shared/smart-image";

interface MarketingHeroProps {
  stats: { value: string; label: string; icon?: LucideIcon; rating?: boolean }[];
}

/** How many faces the overlapping stack shows. */
const FACE_COUNT = 5;

/**
 * Faces for the stack beside the learner-count line — real graduates.
 *
 * These were five Unsplash stock portraits of strangers. The same five files
 * were also being used as the invented "faculty" on this page and as invented
 * students giving testimonials on the CPHQ landing pages, so one person's face
 * appeared in three different fabricated identities across the site.
 *
 * The graduation cohorts hold real, already-published photographs of actual
 * IMETS graduates — the same images shown on /graduates/<cohort> — so the stack
 * draws from those, one per cohort first so it is not five faces from a single
 * class. No cohorts with photos, no stack.
 */
async function learnerFaces(): Promise<string[]> {
  const res = await dal.graduates.fetchPublishedCohorts().catch(() => null);
  if (!res || !res.ok) return [];
  const byCohort = res.data.map((c) => c.previewPhotos.filter(Boolean));
  const out: string[] = [];
  for (let round = 0; out.length < FACE_COUNT; round++) {
    const before = out.length;
    for (const photos of byCohort) {
      if (photos[round]) out.push(photos[round]);
      if (out.length >= FACE_COUNT) break;
    }
    if (out.length === before) break; // nothing left to take
  }
  return out;
}

/**
 * Full-width campus hero: the school's building photograph as the background,
 * with the badge, headline, CTAs and social proof laid over its left side, then
 * a stats band underneath.
 *
 * The photo's signage sits top-right, so the copy is pinned to the PHYSICAL left
 * in both languages (`mr-auto`, not `me-auto`) — in Arabic the text is still
 * right-aligned inside its box, but the box never moves over the sign — and the
 * navy scrim is a physical left→right fade for the same reason. The height is a
 * `min-h`, not a fixed one, so a longer translation or a narrow window grows the
 * hero instead of clipping it.
 */
export async function MarketingHero({ stats }: MarketingHeroProps) {
  const t = await getTranslations("Marketing");
  const faces = await learnerFaces();
  const satisfaction = stats.find((s) => s.rating) ?? stats.find((s) => s.value.includes(".")) ?? stats[1];
  const valueBadges = [t("heroBadge1"), t("heroBadge2"), t("heroBadge3")] as const;

  return (
    <>
      <section className="relative isolate flex min-h-[26.5rem] items-center overflow-hidden bg-[#051a4a]">
        {/* The hero image is the largest thing in the first screen: load it first.
            object-position keeps the signage in view when a wide, short hero crops
            the 2:1 photo to a band. */}
        <SmartImage
          src="/campus/imets-building.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[78%_36%] lg:object-[50%_36%]"
        />
        {/* Scrim: even on small screens (copy fills the width), a left→right fade
            on desktop so the right side — and the signage — stays clear. */}
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[#051a4a]/70 lg:bg-transparent lg:bg-gradient-to-r lg:from-[#051a4a]/90 lg:via-[#051a4a]/70 lg:via-55% lg:to-[#051a4a]/5"
          aria-hidden="true"
        />
        {/* Keeps the (absolutely positioned) header legible over bright sky. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-28 bg-gradient-to-b from-[#051a4a]/60 to-transparent"
          aria-hidden="true"
        />

        <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 pt-[4.25rem] sm:px-6 lg:px-8">
          <div className="mr-auto max-w-3xl text-center lg:text-start">
            {satisfaction && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-bold text-[#051a4a] shadow">
                <Sparkles className="size-3.5" />
                <strong className="font-bold">{satisfaction.value}</strong> {satisfaction.label}
              </span>
            )}

            <h1 className="mt-3 text-balance font-heading text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-white drop-shadow-sm sm:text-4xl lg:text-[2.25rem]">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-3 max-w-2xl text-pretty text-base leading-relaxed text-white/90 sm:text-lg lg:mx-0">
              {t("heroSubtitle")}
            </p>

            {/* Real graduate photographs, unnamed here and aria-hidden: the
                stack is a visual device for the line beside it, and the names
                belong on the cohort page where the consent was given. */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {faces.length > 0 && (
                <div className="flex items-center -space-x-2 rtl:space-x-reverse" aria-hidden="true">
                  {faces.map((src, i) => (
                    <SmartImage
                      key={src}
                      src={src}
                      alt=""
                      // Redundant with the aria-hidden container above, and kept
                      // anyway: per-image accessibility scanners read the tag,
                      // not its ancestors, and this is what one of them flagged.
                      aria-hidden="true"
                      width={28}
                      height={28}
                      sizes="28px"
                      className="size-7 rounded-full border-2 border-[#0a2f7a] object-cover shadow-sm"
                      style={{ zIndex: faces.length - i }}
                    />
                  ))}
                </div>
              )}
              <p className="text-xs font-semibold leading-snug text-white/90 sm:text-sm">{t("heroTrustedByLine")}</p>
            </div>

            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Link
                href="/courses"
                className={cn(
                  "group inline-flex h-11 min-w-[12rem] items-center justify-center gap-2 rounded-full px-8 text-base font-bold transition-all duration-200",
                  "bg-[#f4c430] text-[#051a4a] shadow-lg shadow-black/25 hover:-translate-y-0.5 hover:bg-[#e0b020] hover:shadow-xl",
                )}
              >
                {t("browseCourses")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </Link>
              <Link
                href="/success-stories"
                className={cn(
                  "inline-flex h-11 min-w-[12rem] items-center justify-center rounded-full px-8 text-base font-semibold text-white ring-2 ring-inset ring-white/50 backdrop-blur transition-all duration-200",
                  "bg-white/10 hover:bg-white/20 hover:ring-white/70",
                )}
              >
                {t("watchStudentStories")}
              </Link>
            </div>

            <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 lg:justify-start">
              {valueBadges.map((label) => (
                <li key={label} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white/90">
                  <Check className="size-4 shrink-0 text-[#f4c430]" strokeWidth={2.75} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <h2 className="mb-6 text-center font-heading text-lg font-bold tracking-tight text-[#0a2f7a] sm:text-xl">
          {t("numbersTitle")}
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-2xl border border-blue-100 bg-white px-4 py-6 text-center shadow-md transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-lg"
            >
              {s.rating ? (
                <>
                  <span className="flex gap-0.5 text-[#f4c430]" aria-hidden="true">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="size-4 fill-current" />
                    ))}
                  </span>
                  <p className="font-heading text-3xl font-extrabold tracking-tight text-[#0a2f7a] tabular-nums sm:text-4xl">
                    {s.value}
                  </p>
                </>
              ) : (
                <p className="font-heading text-3xl font-extrabold tracking-tight text-[#0a2f7a] tabular-nums sm:text-4xl">
                  {s.value}
                </p>
              )}
              <p className="mt-1 text-sm font-semibold leading-snug text-slate-600">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
