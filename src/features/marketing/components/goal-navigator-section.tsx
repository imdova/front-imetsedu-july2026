import { getTranslations } from "next-intl/server";
import { ArrowDown, BadgeCheck, Building2, ShieldAlert, type LucideIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";

/** Career-goal ladders — show the professional destination, not just the course. */
const PATHS: {
  icon: LucideIcon;
  titleKey: string;
  steps: [string, string, string];
  roleKey: string;
}[] = [
  {
    icon: BadgeCheck,
    titleKey: "careerQualityTitle",
    steps: ["careerQualityStep1", "careerQualityStep2", "careerQualityStep3"],
    roleKey: "careerQualityRole",
  },
  {
    icon: ShieldAlert,
    titleKey: "careerInfectionTitle",
    steps: ["careerInfectionStep1", "careerInfectionStep2", "careerInfectionStep3"],
    roleKey: "careerInfectionRole",
  },
  {
    icon: Building2,
    titleKey: "careerHospitalTitle",
    steps: ["careerHospitalStep1", "careerHospitalStep2", "careerHospitalStep3"],
    roleKey: "careerHospitalRole",
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

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {PATHS.map((path) => (
            <Link
              key={path.titleKey}
              href="/courses"
              className="group flex min-h-[420px] flex-col rounded-3xl border border-blue-100 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-lg sm:p-8"
            >
              <span className="grid size-16 place-items-center rounded-2xl bg-[#0b3fa8]/10 text-[#0b3fa8] ring-1 ring-[#0b3fa8]/15 transition-colors group-hover:bg-[#0b3fa8] group-hover:text-white">
                <path.icon className="size-8" />
              </span>

              <h3 className="mt-6 font-heading text-xl font-bold tracking-tight text-[#0a2f7a] sm:text-2xl">
                {t(path.titleKey)}
              </h3>

              <div className="mt-6 flex-1 space-y-3">
                {path.steps.map((stepKey, index) => (
                  <div key={stepKey} className="flex flex-col items-center text-center">
                    <div className="w-full rounded-2xl border border-blue-100 bg-blue-50/60 px-4 py-3">
                      <p className="text-sm font-bold text-[#0a2f7a] sm:text-base">{t(stepKey)}</p>
                    </div>
                    {index < path.steps.length - 1 ? (
                      <ArrowDown className="my-2 size-5 text-[#0b3fa8]/45" />
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="mt-6 border-t border-blue-50 pt-5 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0b3fa8]">
                  {t("careerDestinationLabel")}
                </p>
                <p className="mt-2 font-heading text-lg font-extrabold text-[#0a2f7a] sm:text-xl">
                  {t(path.roleKey)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
