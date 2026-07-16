"use client";

import * as React from "react";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";

import type { FreeProgram } from "@/lib/dal/free-courses";
import { FreeCourseGateForm } from "./free-course-gate-form";
import { FreeLecturePlayer } from "./free-lecture-player";

/** One global unlock — "complete the form once, then take me to free lectures". */
export const FREE_ACCESS_KEY = "imets_free_access";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

export function FreeCourseGate({
  locale,
  program,
}: {
  locale: string;
  program: FreeProgram;
}) {
  // null on the server AND the first client render, so the markup matches and
  // there's no hydration mismatch; the real value is read in the effect.
  // (Same pattern as discount-countdown.tsx.)
  const [unlocked, setUnlocked] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Reading localStorage on mount is the point: the server can't know the
    // gate state, so it must be resolved after hydration. Same pattern as
    // discount-countdown.tsx. One setState, once — not a cascading render.
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUnlocked(!!window.localStorage.getItem(FREE_ACCESS_KEY));
    } catch {
      setUnlocked(false);
    }
  }, []);

  const playable = program.lectures.filter((l) => l.videoUrl);

  if (unlocked === null) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-border/70 bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!unlocked) {
    return (
      <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm sm:p-8">
        <div className="mx-auto max-w-md text-center">
          <span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Lock className="size-7" />
          </span>
          <h2 className="font-heading text-xl font-bold">
            {tr(locale, "Watch these lectures free", "شاهد هذه المحاضرات مجانًا")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr(
              locale,
              "Tell us where to send your access — it takes 20 seconds and costs nothing.",
              "أخبرنا أين نرسل رابط الوصول — لا يستغرق سوى ٢٠ ثانية، ومجانًا تمامًا.",
            )}
          </p>
        </div>
        <div className="mx-auto mt-6 max-w-md">
          <FreeCourseGateForm
            locale={locale}
            programTitle={locale === "ar" ? program.titleAr : program.titleEn}
            slug={program.slug}
            onUnlocked={() => setUnlocked(true)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
        <CheckCircle2 className="size-3.5" />
        {tr(locale, "Access unlocked — enjoy!", "تم فتح الوصول — استمتع!")}
      </p>
      {playable.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
          {tr(
            locale,
            "Lectures for this program are being uploaded — check back shortly.",
            "يجري رفع محاضرات هذا البرنامج — تابعنا قريبًا.",
          )}
        </div>
      ) : (
        <FreeLecturePlayer locale={locale} lectures={playable} />
      )}
    </div>
  );
}
