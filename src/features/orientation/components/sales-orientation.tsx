"use client";

import * as React from "react";
import { ArrowLeft, ArrowRight, Award, Check, Flag, Lock, MessageCircle, PartyPopper } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useConfirm } from "@/hooks/use-confirm";
import type { OrientationProgressDto } from "@/lib/dal/orientation";
import type { OrientationModule } from "@/features/orientation/lib/course-map";
import { formatMinutes, pick, useOrientationT, type OrientationKey } from "@/features/orientation/lib/i18n";
import {
  findLessonIndex,
  gateRequirementFor,
  localizeLesson,
  type LessonView,
  type OrientationLesson,
  type ProgrammeNumbers,
  type SalesOrientation as SalesOrientationContent,
} from "@/features/orientation/lib/sales-orientation";
import { track } from "@/features/orientation/lib/track";
import { useOrientationProgress } from "@/features/orientation/hooks/use-orientation-progress";
import { useLessonHash } from "@/features/orientation/hooks/use-lesson-hash";
import { ContrastLesson, PathLesson } from "./conversation-modules";
import { ChecklistModule, ClosingModule, PhraseBankModule, PracticeModule, RulesModule } from "./orientation-modules";
import { ObjectionsModule } from "./objections-module";
import { DrillModule } from "./drill-module";
import { ProgramsModule } from "./programs-module";
import { ProgramDetailsModule } from "./program-details-module";
import { TaskLesson } from "./task-lesson";
import { VideoLesson } from "./video-lesson";
import { WeekLesson } from "./week-lesson";
import { QuizLesson } from "./quiz-lesson";
import { ModuleCheckLesson } from "./module-check";
import { JourneyHeader } from "./journey-header";
import { CourseOutline, type OutlineModule } from "./course-outline";
import { QuickReference } from "./quick-reference";
import { Lead, TypeIcon } from "./lesson-parts";

/**
 * Sales Orientation — a self-paced first week, then a shift companion.
 *
 * One language at a time (the console's EN/ع switch; the layout mirrors with
 * `<html dir>`). Five modules lead to a team-lead sign-off: the journey header
 * shows where the rep is and what's left, the outline groups lessons by module,
 * and every lesson states its outcome and its gate up front and completes by
 * itself when the gate is met. "Quick reference" turns the same content into
 * a searchable, copyable reference.
 */

/* ── Learn / Quick reference, remembered per browser ─────────────────────── */

type Mode = "learn" | "reference";
const MODE_KEY = "imets_orientation_mode";
const modeListeners = new Set<() => void>();

function readMode(): Mode {
  try {
    return localStorage.getItem(MODE_KEY) === "reference" ? "reference" : "learn";
  } catch {
    return "learn";
  }
}

function writeMode(mode: Mode) {
  try {
    localStorage.setItem(MODE_KEY, mode);
  } catch {
    // Storage blocked — the switch still works for this visit.
  }
  modeListeners.forEach((l) => l());
}

function subscribeMode(listener: () => void) {
  modeListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    modeListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

export function SalesOrientation({
  lessons,
  modules,
  content,
  contentEn,
  programmes,
  initialProgress,
  userName,
  toolAccess,
  actions,
}: {
  /** An admin-edited copy or the bundled default, in journey order. */
  lessons: OrientationLesson[];
  modules: OrientationModule[];
  content: SalesOrientationContent;
  contentEn: SalesOrientationContent;
  /** Resolved from the live course records by the page — see programs-module. */
  programmes: ProgrammeNumbers[];
  /** The viewer's saved progress, loaded by the page. Null if it couldn't be read. */
  initialProgress: OrientationProgressDto | null;
  /** First name for the greeting; empty greets without one. */
  userName: string;
  /** Console pages the first-week lesson may link to, for this viewer. */
  toolAccess: Record<string, boolean>;
  /** Admin buttons for the page header. */
  actions?: React.ReactNode;
}) {
  const { t, locale } = useOrientationT();
  const { confirm, Confirmation } = useConfirm();
  const c = locale === "ar" ? content : contentEn;

  const views = React.useMemo(() => lessons.map((l) => localizeLesson(l, locale)), [lessons, locale]);
  const localProgrammes = React.useMemo(
    () =>
      programmes.map((p) => {
        const ref = c.programmes.find((x) => x.slug === p.slug);
        return ref ? { ...p, name: ref.name, subtitle: ref.subtitle } : p;
      }),
    [programmes, c],
  );
  const lessonIds = React.useMemo(() => lessons.map((l) => l.id), [lessons]);
  const required = React.useMemo(
    () => Object.fromEntries(views.map((v) => [v.id, gateRequirementFor(v, c, localProgrammes.length)])) as Record<string, number>,
    [views, c, localProgrammes],
  );

  const progress = useOrientationProgress({
    lessonIds,
    initial: initialProgress,
    t,
    onLessonComplete: (id) => {
      const v = views.find((x) => x.id === id);
      if (v) toast.success(t("lesson.completeToast", { lesson: v.title }));
    },
  });
  const { done, mark: markGate, visit } = progress;

  const mode = React.useSyncExternalStore(subscribeMode, readMode, () => "learn" as Mode);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const { hash, go, pin } = useLessonHash();

  /* where the learner is */
  const moduleRank = (id: string) => modules.findIndex((m) => m.id === id);
  /** Lessons in earlier modules still to finish before a locked lesson opens. */
  const blockers = (v: LessonView) =>
    v.lockedUntilEarlier && !done.has(v.id)
      ? views.filter((x) => x.id !== v.id && moduleRank(x.moduleId) < moduleRank(v.moduleId) && !done.has(x.id))
      : [];
  const isLocked = (v: LessonView) => blockers(v).length > 0;

  const firstUnfinished = views.findIndex((v) => !done.has(v.id));
  const resumeIndex = views.findIndex((v) => v.id === progress.lastLessonId && !done.has(v.id));
  const continueIndex = progress.allDone ? 0 : resumeIndex >= 0 ? resumeIndex : Math.max(0, firstUnfinished);
  const hashIndex = findLessonIndex(views, hash);
  const index = hashIndex >= 0 ? hashIndex : continueIndex;
  const lesson = views[index];

  React.useEffect(() => {
    if (!lesson) return;
    visit(lesson.id);
    track("orientation_lesson_started", { lessonId: lesson.id });
  }, [lesson, visit]);

  const lessonId = lesson?.id ?? "";
  const lessonSlug = lesson?.slug ?? "";
  const need = required[lessonId] ?? 1;
  const markCurrent = React.useCallback(
    (key: string) => {
      // Freeze the view on this lesson: with no fragment, the lesson shown is derived from
      // progress, so completing it would otherwise slide the learner onto the next one.
      pin(lessonSlug);
      markGate(lessonId, key, need);
    },
    [pin, lessonSlug, markGate, lessonId, need],
  );
  const seen = React.useMemo(() => new Set(progress.gates[lessonId] ?? []), [progress.gates, lessonId]);

  if (!lesson) return null;

  const goTo = (i: number) => {
    const target = views[i];
    if (!target) return;
    go(target.slug);
    writeMode("learn");
    setSheetOpen(false);
    requestAnimationFrame(() => {
      const el = document.getElementById("orientation-lesson");
      if (el && el.getBoundingClientRect().top < 72) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  /* journey */
  const leftMinutes = views.filter((v) => !done.has(v.id)).reduce((sum, v) => sum + v.minutes, 0);
  const name = userName.trim();
  const started = progress.count > 0 || Object.keys(progress.gates).length > 0;
  const greeting = started
    ? name
      ? t("journey.helloBack", { name })
      : t("journey.helloBackNoName")
    : name
      ? t("journey.hello", { name })
      : t("journey.helloNoName");
  const summary = progress.allDone
    ? t("journey.summaryDone", { done: progress.count, total: progress.total })
    : t("journey.summary", { done: progress.count, total: progress.total, time: formatMinutes(leftMinutes, t) });
  const continueTarget = done.has(lesson.id) ? Math.max(0, firstUnfinished) : index;
  const continueLabel = progress.allDone
    ? null
    : !started
      ? t("journey.start")
      : t("journey.continue", { lesson: views[continueTarget]?.title ?? "" });

  const moduleGroups: OutlineModule[] = modules.map((m, mi) => ({
    id: m.id,
    n: mi + 1,
    title: pick(m.title, locale),
    lessons: views
      .map((v, i) => ({ view: v, index: i, done: done.has(v.id), current: i === index, locked: isLocked(v) }))
      .filter((x) => x.view.moduleId === m.id),
  })).filter((m) => m.lessons.length > 0);

  const journeyModules = moduleGroups.map((m) => ({
    id: m.id,
    n: m.n,
    title: m.title,
    done: m.lessons.filter((l) => l.done).length,
    total: m.lessons.length,
    current: m.id === lesson.moduleId,
    onClick: () => goTo((m.lessons.find((l) => !l.done) ?? m.lessons[0]).index),
  }));

  const resetProgress = async () => {
    const ok = await confirm({
      title: t("outline.resetTitle"),
      description: t("outline.resetBody"),
      confirmText: t("outline.resetConfirm"),
      variant: "destructive",
    });
    if (ok) await progress.reset();
  };

  const outline = (
    <CourseOutline
      modules={moduleGroups}
      activeModuleId={lesson.moduleId}
      onSelect={goTo}
      onReset={started ? resetProgress : undefined}
    />
  );

  /* the lesson */
  const moduleIndex = moduleRank(lesson.moduleId);
  const moduleMeta = modules[moduleIndex];
  const isDone = done.has(lesson.id);
  const locked = isLocked(lesson);
  const count = Math.min(seen.size, need);
  const gateLabel =
    lesson.gate ||
    (lesson.kind === "custom"
      ? lesson.videos.length && lesson.gateRequired
        ? need === 1
          ? t("lesson.watchVideo")
          : t("lesson.watchVideos", { n: need })
        : t("lesson.readToEnd")
      : "");
  const next = views[index + 1];
  const gate = { seen, mark: markCurrent };

  let body: React.ReactNode = null;
  if (locked) {
    const remaining = blockers(lesson);
    body = (
      <div className="grid justify-items-start gap-3 rounded-2xl border border-dashed border-border p-5">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold">
          <Lock className="size-3.5" />
          {moduleIndex <= 1 ? t("lesson.lockedOne") : t("lesson.locked", { n: moduleIndex })}
        </span>
        <p className="text-sm">{t("lesson.finishFirst")}</p>
        <div className="flex flex-wrap gap-2">
          {remaining.map((v) => (
            <Button key={v.id} variant="outline" size="sm" onClick={() => goTo(views.indexOf(v))}>
              {v.title}
            </Button>
          ))}
        </div>
      </div>
    );
  } else if (lesson.kind === "check") {
    const check = c.moduleChecks[lesson.moduleId];
    const moduleId = lesson.moduleId;
    body = check ? (
      <ModuleCheckLesson
        key={lesson.id}
        moduleNumber={moduleIndex + 1}
        check={check}
        best={progress.moduleChecks[moduleId]}
        onFinish={async (run) => {
          const res = await progress.recordModuleCheck(moduleId, { ...run, passPercent: check.passPercent });
          if (res.passed) markCurrent("pass");
          return res;
        }}
      />
    ) : null;
  } else if (lesson.kind === "task" && lesson.task) {
    body = <TaskLesson key={lesson.id} lessonId={lesson.id} body={lesson.body} task={lesson.task} {...gate} />;
  } else if (lesson.kind === "custom") {
    body = <VideoLesson key={lesson.id} lesson={lesson} {...gate} />;
  } else {
    switch (lesson.slug) {
      case "week":
        body = <WeekLesson week={c.week} access={toolAccess} {...gate} />;
        break;
      case "programs":
        body = <ProgramsModule programmes={localProgrammes} {...gate} />;
        break;
      case "details":
        body = <ProgramDetailsModule details={c.programDetails} programmes={localProgrammes} {...gate} />;
        break;
      case "path":
        body = <PathLesson steps={c.steps} {...gate} />;
        break;
      case "rules":
        body = <RulesModule rules={c.rules} {...gate} />;
        break;
      case "contrast":
        body = <ContrastLesson threads={c.threads} {...gate} />;
        break;
      case "phrases":
        body = <PhraseBankModule phrases={c.phraseBank} {...gate} />;
        break;
      case "closing":
        body = <ClosingModule closings={c.closings} {...gate} />;
        break;
      case "practice":
        body = <PracticeModule scenarios={c.scenarios} {...gate} />;
        break;
      case "objections":
        body = <ObjectionsModule method={c.objectionMethod} objections={c.objections} {...gate} />;
        break;
      case "drill":
        body = <DrillModule objections={c.objections} {...gate} />;
        break;
      case "send":
        body = <ChecklistModule items={c.checklist} {...gate} />;
        break;
      case "quiz":
        body = (
          <QuizLesson
            quiz={c.quiz}
            best={{ score: progress.quiz.score, total: progress.quiz.total }}
            passedBefore={!!progress.quiz.passedAt}
            onSubmit={async (score, outOf, passMark) => {
              const res = await progress.recordQuiz(score, outOf, passMark);
              if (res.passed) markCurrent("pass");
              return res;
            }}
          />
        );
        break;
    }
  }

  const viewSignOff = () => {
    document.getElementById("orientation-journey")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const signedOffOn = progress.signedOffAt
    ? new Date(progress.signedOffAt).toLocaleDateString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="space-y-5">
      {Confirmation}

      {/* Page header */}
      <div className="flex flex-wrap items-end gap-4">
        <div className="min-w-0 flex-1 basis-72">
          <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-[28px]">{t("page.title")}</h1>
          <p className="mt-1 max-w-[62ch] text-sm text-muted-foreground">{t("page.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-full border border-border/70 bg-muted p-1" role="group" aria-label={t("mode.label")}>
            {(["learn", "reference"] as const).map((m) => (
              <button
                key={m}
                type="button"
                aria-pressed={mode === m}
                onClick={() => writeMode(m)}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                  mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {t(m === "learn" ? "mode.learn" : "mode.reference")}
              </button>
            ))}
          </div>
          {actions}
        </div>
      </div>

      <JourneyHeader
        percent={progress.percent}
        greeting={greeting}
        summary={summary}
        continueLabel={continueLabel}
        onContinue={() => goTo(continueTarget)}
        modules={journeyModules}
        allDone={progress.allDone}
        signedOff={!!progress.signedOffAt}
        teamLeadLink={c.teamLeadLink}
        paceText={c.pace.trim() || t("journey.paceText")}
        xp={Object.values(progress.moduleChecks).reduce((sum, r) => sum + (r?.xp ?? 0), 0)}
        starsEarned={views
          .filter((v) => v.kind === "check")
          .reduce((sum, v) => sum + (progress.moduleChecks[v.moduleId]?.stars ?? 0), 0)}
        starsTotal={views.filter((v) => v.kind === "check").length * 3}
        onOpenOutline={() => setSheetOpen(true)}
      />

      {progress.allDone && (
        <div
          className={cn(
            "flex items-start gap-3 rounded-2xl p-4",
            signedOffOn ? "bg-[#D89B32]/10 ring-1 ring-[#D89B32]/40" : "bg-emerald-500/[0.08] ring-1 ring-emerald-500/25",
          )}
        >
          {signedOffOn ? <Award className="size-6 shrink-0 text-[#D89B32]" /> : <PartyPopper className="size-6 shrink-0 text-emerald-600" />}
          <div>
            <p className="font-heading font-bold">{t("final.title")}</p>
            <p className="text-sm text-muted-foreground">{signedOffOn ? t("final.signed", { date: signedOffOn }) : t("final.waiting")}</p>
          </div>
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[80vh] gap-0 overflow-y-auto rounded-t-2xl p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <SheetHeader className="p-2">
            <SheetTitle>{t("outline.button")}</SheetTitle>
          </SheetHeader>
          {outline}
        </SheetContent>
      </Sheet>

      {mode === "reference" ? (
        <QuickReference content={c} />
      ) : (
        <div className="grid items-start gap-5 min-[1080px]:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="hidden rounded-[18px] border border-border/70 bg-card p-2.5 shadow-sm min-[1080px]:sticky min-[1080px]:top-20 min-[1080px]:block min-[1080px]:max-h-[calc(100vh-6rem)] min-[1080px]:overflow-y-auto">
            {outline}
          </aside>

          <div className="min-w-0">
            <article
              id="orientation-lesson"
              aria-labelledby="orientation-lesson-title"
              className="scroll-mt-20 overflow-hidden rounded-[18px] border border-border/70 bg-card shadow-sm"
            >
              <header className="grid gap-3 border-b border-border/70 p-4 sm:p-6">
                <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted-foreground">
                  {moduleMeta && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {t("lesson.module", { n: moduleIndex + 1, module: pick(moduleMeta.title, locale) })}
                    </span>
                  )}
                  <span>{t("lesson.position", { i: index + 1, total: views.length })}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-muted/60 px-2.5 py-0.5 text-xs font-semibold text-foreground/80">
                    <TypeIcon type={lesson.type} />
                    {t(`type.${lesson.type}` as OrientationKey)}
                  </span>
                  <span>{t("lesson.minutes", { m: lesson.minutes })}</span>
                  {lesson.isNew && (
                    <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                      {t("badge.new")}
                    </span>
                  )}
                </div>

                <h2 id="orientation-lesson-title" className="font-heading text-xl font-extrabold leading-snug sm:text-2xl">
                  {lesson.title}
                </h2>

                {lesson.outcome && (
                  <p className="max-w-[70ch] text-sm leading-relaxed text-foreground/80">
                    <b className="font-semibold text-foreground">{t("lesson.byEnd")}</b> {lesson.outcome}
                  </p>
                )}

                <div
                  role="status"
                  className={cn(
                    "flex flex-wrap items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13.5px]",
                    isDone ? "bg-emerald-500/[0.1]" : "bg-amber-500/[0.1]",
                  )}
                >
                  {isDone ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Flag className="size-4 text-amber-700 dark:text-amber-400" />
                  )}
                  <span className="min-w-0 flex-1">
                    {isDone ? (
                      <b className="font-semibold">{t("lesson.complete")}</b>
                    ) : (
                      <>
                        {t("lesson.toFinish", { gate: gateLabel })}
                        {need > 1 && (
                          <>
                            {" · "}
                            <b className="tabular-nums">
                              {count}/{need}
                            </b>
                          </>
                        )}
                      </>
                    )}
                  </span>
                  {need > 1 && (
                    <span className="hidden gap-1 min-[761px]:flex" aria-hidden="true">
                      {Array.from({ length: need }, (_, j) => (
                        <i
                          key={j}
                          className={cn(
                            "h-1.5 w-4 rounded-full",
                            isDone ? "bg-emerald-500" : j < count ? "bg-amber-600" : "bg-amber-600/25",
                          )}
                        />
                      ))}
                    </span>
                  )}
                </div>
              </header>

              <div className="grid gap-5 p-4 sm:p-6">
                {lesson.intro && !locked && <Lead>{lesson.intro}</Lead>}
                {body}
              </div>

              <footer className="flex flex-wrap items-center gap-3 border-t border-border/70 bg-muted/40 px-4 py-3.5 sm:px-6">
                <Button variant="outline" className="gap-1.5" disabled={index === 0} onClick={() => goTo(index - 1)}>
                  <ArrowLeft className="size-4 rtl:-scale-x-100" />
                  {t("nav.prev")}
                </Button>
                <div className="ms-auto flex items-center gap-3">
                  {next ? (
                    <>
                      <span className="hidden max-w-56 text-end text-xs leading-tight text-muted-foreground min-[761px]:block">
                        {t("nav.upNext")}
                        <b className="block truncate text-[13px] font-semibold text-foreground">{next.title}</b>
                      </span>
                      <Button variant={isDone ? "default" : "outline"} className="gap-1.5" onClick={() => goTo(index + 1)}>
                        {t("nav.next")}
                        <ArrowRight className="size-4 rtl:-scale-x-100" />
                      </Button>
                    </>
                  ) : (
                    <Button variant={isDone ? "default" : "outline"} className="gap-1.5" onClick={viewSignOff}>
                      <Award className="size-4" />
                      {t("nav.finish")}
                    </Button>
                  )}
                </div>
              </footer>
            </article>

            <p className="mt-3.5 flex items-center justify-center gap-2 text-center text-[12.5px] text-muted-foreground">
              <MessageCircle className="size-4 shrink-0" />
              {t("footer.help")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
