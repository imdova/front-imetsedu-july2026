import { getTranslations } from "next-intl/server";
import {
  Users,
  Globe2,
  Award,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";

const STATS: { value: string; labelKey: string; icon: LucideIcon }[] = [
  { value: "18,000+", labelKey: "catalogTrustPros", icon: Users },
  { value: "15+", labelKey: "catalogTrustCountries", icon: Globe2 },
  { value: "92%", labelKey: "catalogTrustPass", icon: Award },
  { value: "38+", labelKey: "catalogTrustExperts", icon: GraduationCap },
];

function NetworkPattern() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full opacity-[0.18]"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <defs>
        <pattern id="catalog-hero-net" width="56" height="56" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.4" fill="white" />
          <path d="M3 3h50M3 3v50" stroke="white" strokeWidth="0.45" opacity="0.4" />
        </pattern>
        <radialGradient id="catalog-hero-glow-a" cx="18%" cy="25%" r="55%">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="catalog-hero-glow-b" cx="88%" cy="75%" r="48%">
          <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#catalog-hero-net)" />
      <rect width="100%" height="100%" fill="url(#catalog-hero-glow-a)" />
      <rect width="100%" height="100%" fill="url(#catalog-hero-glow-b)" />
    </svg>
  );
}

export async function CatalogHeroBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  const t = await getTranslations("Marketing");

  return (
    <section
      aria-labelledby="catalog-hero-heading"
      className="relative mb-10 overflow-hidden rounded-[1.75rem] border border-white/15 bg-gradient-to-br from-[#041536] via-[#0a2f7a] to-[#0b3fa8] text-white shadow-[0_24px_60px_-20px_rgba(5,26,74,0.55)]"
    >
      <NetworkPattern />
      <div
        className="pointer-events-none absolute -start-20 -top-10 size-72 rounded-full bg-[#1a5fd4]/35 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -end-16 bottom-0 size-80 rounded-full bg-[#38bdf8]/20 blur-3xl"
        aria-hidden
      />

      <div className="relative z-[1] grid items-center gap-8 px-5 py-9 sm:px-8 sm:py-11 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-10 lg:py-12">
        <div className="min-w-0 text-center lg:text-start">
          <p className="inline-flex items-center gap-2 rounded-full border border-[#f4c430]/35 bg-[#f4c430]/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f4c430]">
            <span className="size-1.5 rounded-full bg-[#f4c430]" aria-hidden />
            {t("catalogHeroBrand")}
          </p>

          <h1
            id="catalog-hero-heading"
            className="mt-4 text-balance font-heading text-[1.85rem] font-extrabold leading-[1.15] tracking-[-0.02em] text-white sm:text-4xl lg:text-[2.5rem]"
          >
            {title}
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-pretty text-[15px] leading-relaxed text-white/80 sm:text-lg lg:mx-0">
            {subtitle}
          </p>
        </div>

        <div className="min-w-0">
          <p className="mb-3 text-center text-[11px] font-semibold uppercase tracking-[0.16em] text-white/55 lg:text-start">
            {t("catalogTrustLabel")}
          </p>
          <ul className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => (
              <li
                key={stat.labelKey}
                className="flex items-center gap-3 rounded-xl border border-white/20 bg-white/[0.08] px-3.5 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[2px] transition hover:border-white/35 hover:bg-white/[0.12]"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-full border border-white/35 text-white">
                  <stat.icon className="size-4" strokeWidth={1.75} />
                </span>
                <div className="min-w-0">
                  <p className="font-heading text-xl font-extrabold tabular-nums tracking-tight text-[#f4c430] sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-[11px] font-medium leading-snug text-white/75">
                    {t(stat.labelKey)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
