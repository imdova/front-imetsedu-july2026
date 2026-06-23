import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface MarketingHeroProps {
  stats: { value: string; label: string }[];
}

/** Full-bleed hero with a Zoom-style radial blue gradient and centered CTAs. */
export async function MarketingHero({ stats }: MarketingHeroProps) {
  const t = await getTranslations("Marketing");

  return (
    <>
      <section className="relative flex min-h-[min(92svh,880px)] flex-col justify-center overflow-hidden marketing-gradient-bg">
        <div className="relative mx-auto w-full max-w-5xl px-4 pb-20 pt-28 text-center sm:px-6 sm:pt-32 lg:px-8 lg:pb-24">
          <h1 className="font-heading text-[2.5rem] font-semibold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]">
            {t("heroTitle")}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/80 sm:text-xl">
            {t("heroSubtitle")}
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <Link
              href="/courses"
              className={cn(
                "inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full px-8 text-base font-medium transition-colors",
                "bg-[#0d1b2e] text-white shadow-lg shadow-black/20 hover:bg-[#152536]",
              )}
            >
              {t("browseCourses")}
            </Link>
            <Link
              href="/register"
              className={cn(
                "inline-flex h-12 min-w-[11rem] items-center justify-center rounded-full px-8 text-base font-medium transition-colors",
                "bg-white text-[#0a1424] hover:bg-white/90",
              )}
            >
              {t("getStarted")}
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/70 bg-background">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-8 px-4 py-12 sm:grid-cols-4 sm:px-6 lg:px-8">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-heading text-3xl font-bold text-primary tabular-nums">
                {s.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
