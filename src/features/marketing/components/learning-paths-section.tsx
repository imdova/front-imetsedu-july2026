"use client";

import { useTranslations } from "next-intl";
import { ArrowDown, ArrowRight, Route, ShieldCheck, BadgeCheck } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CourseRow } from "@/types";
import { cn } from "@/lib/utils";

type PathStep = {
  labelKey: string;
  /** Keywords used to resolve a matching course from the live catalog. */
  match: string[];
};

type LearningPath = {
  id: string;
  titleKey: string;
  subtitleKey: string;
  icon: "quality" | "infection";
  accent: string;
  steps: PathStep[];
};

const PATHS: LearningPath[] = [
  {
    id: "quality",
    titleKey: "pathQualityTitle",
    subtitleKey: "pathQualitySubtitle",
    icon: "quality",
    accent: "from-[#0b3fa8]/10 to-sky-50 border-[#0b3fa8]/25",
    steps: [
      { labelKey: "pathStepHqStart", match: ["healthcare quality", "quality management", "quality diploma"] },
      { labelKey: "pathStepHqDiploma", match: ["healthcare quality diploma", "quality management diploma", "quality diploma"] },
      { labelKey: "pathStepCphq", match: ["cphq"] },
      { labelKey: "pathStepPatientSafety", match: ["patient safety", "cpps"] },
      { labelKey: "pathStepLeadership", match: ["leadership", "healthcare leadership"] },
    ],
  },
  {
    id: "infection",
    titleKey: "pathInfectionTitle",
    subtitleKey: "pathInfectionSubtitle",
    icon: "infection",
    accent: "from-emerald-50 to-teal-50 border-emerald-200/80",
    steps: [
      { labelKey: "pathStepIcStart", match: ["infection control", "infection prevention"] },
      { labelKey: "pathStepIcDiploma", match: ["infection control diploma", "infection diploma"] },
      { labelKey: "pathStepCic", match: ["cic"] },
      { labelKey: "pathStepAdvanced", match: ["advanced", "infection", "ipc"] },
    ],
  },
];

function resolveCourse(courses: CourseRow[], match: string[]): CourseRow | undefined {
  const scored = courses
    .map((c) => {
      const hay = `${c.titleEn} ${c.slug} ${c.category}`.toLowerCase();
      let score = 0;
      for (const m of match) {
        if (hay.includes(m.toLowerCase())) score += m.length;
      }
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.c;
}

export function LearningPathsSection({ courses }: { courses: CourseRow[] }) {
  const t = useTranslations("Marketing");

  return (
    <section className="space-y-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-[#0b3fa8]">
          {t("pathsEyebrow")}
        </p>
        <h2 className="mt-1 font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">
          {t("pathsTitle")}
        </h2>
        <p className="mt-2 text-muted-foreground">{t("pathsSubtitle")}</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {PATHS.map((path) => {
          const Icon = path.icon === "quality" ? BadgeCheck : ShieldCheck;
          return (
            <article
              key={path.id}
              className={cn(
                "flex flex-col rounded-2xl border bg-gradient-to-br p-5 shadow-sm sm:p-6",
                path.accent,
              )}
            >
              <div className="mb-5 flex items-start gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white text-[#0b3fa8] shadow-sm ring-1 ring-black/5">
                  <Icon className="size-5" />
                </span>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#0a2f7a]">{t(path.titleKey)}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t(path.subtitleKey)}</p>
                </div>
              </div>

              <ol className="flex flex-1 flex-col gap-0">
                {path.steps.map((step, i) => {
                  const course = resolveCourse(courses, step.match);
                  const isLast = i === path.steps.length - 1;
                  const label = t(step.labelKey);

                  return (
                    <li key={step.labelKey} className="flex flex-col items-stretch">
                      {course ? (
                        <Link
                          href={`/courses/${course.slug}`}
                          className="group flex items-center gap-3 rounded-xl border border-white/80 bg-white/90 px-3.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b3fa8]/35 hover:shadow-md"
                        >
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0b3fa8] text-xs font-bold text-white">
                            {i + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-heading text-sm font-bold text-[#0a2f7a] group-hover:text-[#0b3fa8]">
                              {label}
                            </span>
                            <span className="block truncate text-xs text-muted-foreground">{course.titleEn}</span>
                          </span>
                          <ArrowRight className="size-4 shrink-0 text-[#0b3fa8]/50 transition group-hover:translate-x-0.5 rtl:rotate-180" />
                        </Link>
                      ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#0b3fa8]/25 bg-white/70 px-3.5 py-3">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[#0b3fa8]/15 text-xs font-bold text-[#0b3fa8]">
                            {i + 1}
                          </span>
                          <span className="font-heading text-sm font-bold text-[#0a2f7a]">{label}</span>
                        </div>
                      )}

                      {!isLast && (
                        <div className="flex justify-center py-1.5 text-[#0b3fa8]/55" aria-hidden>
                          <ArrowDown className="size-4" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>

              <p className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Route className="size-3.5" />
                {t("pathsFollowHint", { n: path.steps.length })}
              </p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
