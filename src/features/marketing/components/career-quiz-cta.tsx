"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Compass, ArrowRight, RotateCcw, Sparkles } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CourseRow } from "@/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuizAnswer = "quality" | "infection" | "safety" | "leadership";

const QUESTIONS: {
  id: string;
  promptKey: string;
  options: { value: QuizAnswer; labelKey: string }[];
}[] = [
  {
    id: "interest",
    promptKey: "careerQuizQ1",
    options: [
      { value: "quality", labelKey: "careerQuizA1Quality" },
      { value: "infection", labelKey: "careerQuizA1Infection" },
      { value: "safety", labelKey: "careerQuizA1Safety" },
      { value: "leadership", labelKey: "careerQuizA1Leadership" },
    ],
  },
  {
    id: "goal",
    promptKey: "careerQuizQ2",
    options: [
      { value: "quality", labelKey: "careerQuizA2Cert" },
      { value: "infection", labelKey: "careerQuizA2Ipc" },
      { value: "safety", labelKey: "careerQuizA2Safety" },
      { value: "leadership", labelKey: "careerQuizA2Lead" },
    ],
  },
  {
    id: "level",
    promptKey: "careerQuizQ3",
    options: [
      { value: "quality", labelKey: "careerQuizA3Beginner" },
      { value: "infection", labelKey: "careerQuizA3Clinical" },
      { value: "safety", labelKey: "careerQuizA3Risk" },
      { value: "leadership", labelKey: "careerQuizA3Manager" },
    ],
  },
];

const RESULT_MATCH: Record<QuizAnswer, { titleKey: string; bodyKey: string; keywords: string[] }> = {
  quality: {
    titleKey: "careerQuizResultQuality",
    bodyKey: "careerQuizResultQualityBody",
    keywords: ["cphq", "healthcare quality", "quality diploma", "quality management"],
  },
  infection: {
    titleKey: "careerQuizResultInfection",
    bodyKey: "careerQuizResultInfectionBody",
    keywords: ["infection", "cic", "ipc"],
  },
  safety: {
    titleKey: "careerQuizResultSafety",
    bodyKey: "careerQuizResultSafetyBody",
    keywords: ["patient safety", "cpps", "safety"],
  },
  leadership: {
    titleKey: "careerQuizResultLeadership",
    bodyKey: "careerQuizResultLeadershipBody",
    keywords: ["leadership", "hospital management", "management"],
  },
};

function pickCourse(courses: CourseRow[], keywords: string[]): CourseRow | undefined {
  const scored = courses
    .map((c) => {
      const hay = `${c.titleEn} ${c.slug} ${c.category}`.toLowerCase();
      let score = 0;
      for (const k of keywords) if (hay.includes(k.toLowerCase())) score += k.length;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored[0]?.c ?? courses[0];
}

function majority(answers: QuizAnswer[]): QuizAnswer {
  const counts: Record<QuizAnswer, number> = {
    quality: 0,
    infection: 0,
    safety: 0,
    leadership: 0,
  };
  for (const a of answers) counts[a] += 1;
  return (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as QuizAnswer) ?? "quality";
}

export function CareerQuizCta({ courses }: { courses: CourseRow[] }) {
  const t = useTranslations("Marketing");
  const [started, setStarted] = React.useState(false);
  const [step, setStep] = React.useState(0);
  const [answers, setAnswers] = React.useState<QuizAnswer[]>([]);

  const done = started && answers.length >= QUESTIONS.length;
  const resultKey = done ? majority(answers) : null;
  const result = resultKey ? RESULT_MATCH[resultKey] : null;
  const recommended = result ? pickCourse(courses, result.keywords) : undefined;

  const reset = () => {
    setStarted(false);
    setStep(0);
    setAnswers([]);
  };

  const choose = (value: QuizAnswer) => {
    const next = [...answers.slice(0, step), value];
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
  };

  const q = QUESTIONS[step];

  return (
    <section
      id="career-quiz"
      className="overflow-hidden rounded-3xl border border-[#0b3fa8]/20 bg-gradient-to-br from-[#0a2f7a] via-[#0b3fa8] to-[#1a5fd4] px-5 py-10 text-white shadow-lg sm:px-8 sm:py-12"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 ring-1 ring-white/20">
          <Compass className="size-3.5" />
          {t("careerQuizEyebrow")}
        </span>
        <h2 className="mt-4 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {t("careerQuizTitle")}
        </h2>
        <p className="mt-2 text-pretty text-white/80">{t("careerQuizSubtitle")}</p>
      </div>

      <div className="mx-auto mt-8 max-w-xl">
        {!started && (
          <div className="flex flex-col items-center gap-4">
            <Button
              size="lg"
              className="gap-2 rounded-xl bg-[#f4c430] px-8 font-bold text-[#051a4a] hover:bg-[#ffd24d]"
              onClick={() => setStarted(true)}
            >
              {t("careerQuizCta")}
              <ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
            <p className="text-sm text-white/65">{t("careerQuizMeta")}</p>
          </div>
        )}

        {started && !done && q && (
          <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/20 backdrop-blur-sm sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-white/70">
              <span>{t("careerQuizProgress", { current: step + 1, total: QUESTIONS.length })}</span>
              <div className="flex gap-1">
                {QUESTIONS.map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1.5 w-6 rounded-full",
                      i <= step ? "bg-[#f4c430]" : "bg-white/25",
                    )}
                  />
                ))}
              </div>
            </div>
            <p className="font-heading text-lg font-bold sm:text-xl">{t(q.promptKey)}</p>
            <div className="mt-4 grid gap-2">
              {q.options.map((opt) => (
                <button
                  key={opt.labelKey}
                  type="button"
                  onClick={() => choose(opt.value)}
                  className="rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-start text-sm font-medium transition hover:border-[#f4c430]/60 hover:bg-white/20"
                >
                  {t(opt.labelKey)}
                </button>
              ))}
            </div>
          </div>
        )}

        {done && result && (
          <div className="rounded-2xl bg-white p-5 text-[#0a2f7a] shadow-xl sm:p-6">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0b3fa8]/10 text-[#0b3fa8]">
                <Sparkles className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#0b3fa8]">
                  {t("careerQuizRecommended")}
                </p>
                <h3 className="mt-1 font-heading text-xl font-bold">{t(result.titleKey)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(result.bodyKey)}</p>
              </div>
            </div>

            {recommended && (
              <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {t("careerQuizProgramLabel")}
                </p>
                <p className="mt-1 font-heading text-base font-bold text-[#0a2f7a]">
                  {recommended.titleEn}
                </p>
                <Button asChild className="mt-3 w-full gap-2 rounded-xl sm:w-auto">
                  <Link href={`/courses/${recommended.slug}`}>
                    {t("careerQuizViewProgram")}
                    <ArrowRight className="size-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            )}

            <button
              type="button"
              onClick={reset}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3.5" />
              {t("careerQuizRetake")}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
