import { getTranslations } from "next-intl/server";
import { Sparkles, Star, ArrowRight, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";

interface MarketingHeroProps {
  stats: { value: string; label: string; icon?: LucideIcon }[];
  /** YouTube id for the hero intro video (click-to-play, no forced sound). */
  videoId?: string;
}

/**
 * Modern two-column hero: badge + headline + CTAs + social proof on one side,
 * a framed click-to-play intro video on the other. Sits on the Zoom-style
 * radial blue gradient; a stats band follows underneath.
 */
export async function MarketingHero({ stats, videoId = "R9-6cBqzczo" }: MarketingHeroProps) {
  const t = await getTranslations("Marketing");

  return (
    <>
      <section className="relative overflow-hidden marketing-gradient-bg">
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 pb-20 pt-28 sm:px-6 sm:pt-32 lg:grid-cols-2 lg:gap-12 lg:pb-24 lg:px-8">
          {/* Copy */}
          <div className="text-center lg:text-start">
            {stats[3] && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white ring-1 ring-white/20 backdrop-blur">
                <Sparkles className="size-3.5 text-amber-300" />
                <strong className="font-bold">{stats[3].value}</strong> {stats[3].label}
              </span>
            )}

            <h1 className="mt-5 text-balance font-heading text-3xl font-extrabold leading-[1.12] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.5rem]">
              {t("heroTitle")}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-white/75 sm:text-xl lg:mx-0">
              {t("heroSubtitle")}
            </p>

            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start">
              <Link
                href="/courses"
                className={cn(
                  "group inline-flex h-12 min-w-[12rem] items-center justify-center gap-2 rounded-full px-8 text-base font-semibold transition-all duration-200",
                  "bg-white text-[#0a1424] shadow-lg shadow-black/25 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/30",
                )}
              >
                {t("browseCourses")}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
              </Link>
              <Link
                href="/register"
                className={cn(
                  "inline-flex h-12 min-w-[12rem] items-center justify-center rounded-full px-8 text-base font-semibold text-white ring-1 ring-inset ring-white/30 backdrop-blur transition-all duration-200",
                  "bg-white/10 hover:bg-white/15 hover:ring-white/50",
                )}
              >
                {t("getStarted")}
              </Link>
            </div>

            {stats[0] && (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/80 lg:justify-start">
                <span className="flex text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="size-4 fill-current" />)}
                </span>
                <span><strong className="text-white">{stats[0].value}</strong> {stats[0].label}</span>
              </div>
            )}
          </div>

          {/* Intro video */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-white/5 blur-2xl" aria-hidden="true" />
            <div className="relative overflow-hidden rounded-2xl ring-1 ring-white/15 shadow-2xl shadow-black/40">
              <YouTubePlayer videoId={videoId} autoPlay={false} />
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-12 w-full max-w-5xl px-4 pb-16 sm:-mt-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="group flex flex-col items-center gap-2 rounded-2xl border border-border/60 bg-card p-5 text-center shadow-md transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg sm:p-6"
            >
              {s.icon && (
                <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15 transition-transform group-hover:scale-110">
                  <s.icon className="size-5" />
                </span>
              )}
              <p className="font-heading text-3xl font-extrabold tracking-tight tabular-nums sm:text-4xl">
                {s.value}
              </p>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
