import { getTranslations } from "next-intl/server";
import {
  BadgeCheck,
  ShieldCheck,
  Building2,
  HeartPulse,
  UsersRound,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";

import { Link } from "@/i18n/navigation";

/** Career-path cards — larger tiles with outcome, program count, and Explore CTA. */
const PATHS: {
  icon: LucideIcon;
  titleKey: string;
  outcomeKey: string;
  descKey: string;
  count: number;
}[] = [
  {
    icon: BadgeCheck,
    titleKey: "pathQualityTitle",
    outcomeKey: "pathQualityOutcome",
    descKey: "pathQualityBody",
    count: 4,
  },
  {
    icon: ShieldCheck,
    titleKey: "pathInfectionTitle",
    outcomeKey: "pathInfectionOutcome",
    descKey: "pathInfectionBody",
    count: 3,
  },
  {
    icon: Building2,
    titleKey: "pathHospitalTitle",
    outcomeKey: "pathHospitalOutcome",
    descKey: "pathHospitalBody",
    count: 3,
  },
  {
    icon: HeartPulse,
    titleKey: "pathSafetyTitle",
    outcomeKey: "pathSafetyOutcome",
    descKey: "pathSafetyBody",
    count: 2,
  },
  {
    icon: UsersRound,
    titleKey: "pathLeadershipTitle",
    outcomeKey: "pathLeadershipOutcome",
    descKey: "pathLeadershipBody",
    count: 3,
  },
];

export async function GoalNavigatorSection() {
  const t = await getTranslations("Marketing");

  return (
    <section className="border-y border-blue-100 bg-gradient-to-b from-blue-50/80 to-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">
            {t("goalNavTitle")}
          </h2>
          <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">
            {t("goalNavSubtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PATHS.map((path) => (
            <Link
              key={path.titleKey}
              href="/courses"
              className="group flex min-h-[280px] flex-col rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-lg sm:p-8"
            >
              <span className="grid size-14 place-items-center rounded-2xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15 transition-colors group-hover:bg-[#0b3fa8] group-hover:text-white">
                <path.icon className="size-7" />
              </span>

              <h3 className="mt-6 font-heading text-xl font-bold tracking-tight text-[#0a2f7a] sm:text-2xl">
                {t(path.titleKey)}
              </h3>

              <p className="mt-2 text-base font-semibold leading-snug text-[#0b3fa8]">
                {t(path.outcomeKey)}
              </p>

              <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">
                {t(path.descKey)}
              </p>

              <div className="mt-6 flex items-center justify-between gap-3 border-t border-blue-50 pt-5">
                <span className="rounded-full bg-[#0b3fa8]/8 px-3 py-1 text-xs font-bold text-[#0b3fa8]">
                  {t("pathProgramsCount", { count: path.count })}
                </span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#0b3fa8]">
                  {t("pathExplore")}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
