"use client";

import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  GraduationCap,
  ListChecks,
  MessageSquare,
  PartyPopper,
  PlayCircle,
  RotateCcw,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type {
  OrientationLesson,
  PathStep,
  ProgrammeNumbers,
  SalesOrientation as SalesOrientationContent,
  Thread,
} from "@/features/orientation/lib/sales-orientation";
import { useOrientationProgress } from "@/features/orientation/hooks/use-orientation-progress";
import { useLessonHash } from "@/features/orientation/hooks/use-lesson-hash";
import type { OrientationProgressDto } from "@/lib/dal/orientation";
import {
  ChecklistModule,
  ClosingModule,
  PhraseBankModule,
  PracticeModule,
  RulesModule,
} from "./orientation-modules";
import { ObjectionsModule } from "./objections-module";
import { DrillModule } from "./drill-module";
import { ProgramsModule } from "./programs-module";
import { ProgramDetailsModule } from "./program-details-module";
import { TaskLesson } from "./task-lesson";
import { LessonVideos } from "./lesson-videos";
import { isModuleLesson, type LessonId } from "@/features/orientation/lib/sales-orientation";

/**
 * Sales orientation, as a course rather than a document.
 *
 * One lesson on screen at a time, a curriculum rail that shows where you are
 * and what is left, and an explicit next step at the bottom of every lesson.
 * The earlier single-scroll version put all seven modules on one page, which
 * read as something to skim rather than something to work through — a new joiner
 * could not tell how much was left, and finishing a module produced no moment.
 *
 * Content and lesson metadata arrive as props — an admin-edited copy when one
 * is saved, otherwise the bundled default (see `resolveOrientation`).
 *
 * Everything is RTL regardless of the console language: the content is Egyptian
 * Arabic dialogue, and mirroring it would put the speaker bubbles on the wrong
 * side.
 */

/* ── lesson 1: the contrast ──────────────────────────────────────────────── */

function ThreadView({ thread, tone }: { thread: Thread; tone: "bad" | "good" }) {
  /*
   * Messages land one after another. The lesson is that the bad thread *feels*
   * like an interrogation — five questions arriving in a row does that, the
   * same five in a static block does not.
   */
  const [shown, setShown] = React.useState(0);

  React.useEffect(() => {
    const timers = thread.messages.map((_, i) =>
      setTimeout(() => setShown(i + 1), 260 * i),
    );
    return () => timers.forEach(clearTimeout);
  }, [thread]);

  return (
    <div>
      <div className="space-y-2">
        {thread.messages.map((m, i) => {
          const visible = i < shown;
          const isClient = m.from === "client";
          return (
            <div
              key={i}
              className={cn(
                "flex transition-all duration-300",
                isClient ? "justify-start" : "justify-end",
                visible ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2",
                  isClient
                    ? "bg-muted text-foreground/90"
                    : tone === "bad"
                      ? "bg-destructive/10 ring-1 ring-destructive/25"
                      : "bg-emerald-500/10 ring-1 ring-emerald-500/25",
                )}
              >
                <span className="mb-0.5 block text-[11px] font-semibold text-muted-foreground">
                  {m.who}
                </span>
                <span className="text-sm leading-relaxed">{m.text}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={cn(
          "mt-4 flex items-start gap-2.5 rounded-2xl p-3.5 text-sm leading-relaxed transition-opacity duration-500",
          shown >= thread.messages.length ? "opacity-100" : "opacity-0",
          thread.verdict.tone === "good"
            ? "bg-emerald-500/[0.08] ring-1 ring-emerald-500/20"
            : "bg-destructive/[0.06] ring-1 ring-destructive/20",
        )}
      >
        <span
          className={cn(
            "mt-1.5 size-2 shrink-0 rounded-full",
            thread.verdict.tone === "good" ? "bg-emerald-500" : "bg-destructive",
          )}
        />
        <span>
          <b className="font-bold">{thread.verdict.lead}</b> {thread.verdict.rest}
        </span>
      </div>
    </div>
  );
}

function ContrastLesson({
  threads,
  onComplete,
}: {
  threads: SalesOrientationContent["threads"];
  onComplete: () => void;
}) {
  const [tab, setTab] = React.useState<"bad" | "good">("bad");
  const [seen, setSeen] = React.useState<Set<string>>(new Set(["bad"]));

  React.useEffect(() => {
    // Completing means having compared both — one tab is half the lesson.
    if (seen.size >= 2) onComplete();
  }, [seen, onComplete]);

  return (
    <div>
      <p className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <MessageSquare className="size-3.5" />
        محادثة واردة على واتساب — استفسار عن دبلومة الجودة الصحية
      </p>

      <div className="mb-4 inline-flex rounded-xl bg-muted p-1" role="tablist">
        {(
          [
            ["bad", "أسلوب الاستجواب"],
            ["good", "أسلوب الاستشارة"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            onClick={() => {
              setTab(key);
              setSeen((p) => new Set(p).add(key));
            }}
            className={cn(
              "rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              tab === key
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Remounts on tab change so the reveal replays from the top. */}
      <ThreadView key={tab} thread={threads[tab]} tone={tab} />

      {seen.size < 2 && (
        <p className="mt-4 rounded-xl bg-primary/[0.06] p-3 text-center text-sm text-primary">
          شوف الأسلوبين الاتنين عشان تكمّل الدرس.
        </p>
      )}
    </div>
  );
}

/* ── lesson 2: the path ──────────────────────────────────────────────────── */

function PathLesson({ steps, onComplete }: { steps: PathStep[]; onComplete: () => void }) {
  const [active, setActive] = React.useState(0);
  const [seen, setSeen] = React.useState<Set<number>>(new Set([0]));

  React.useEffect(() => {
    if (seen.size >= steps.length) onComplete();
  }, [seen, steps.length, onComplete]);

  return (
    <div>
      <ol className="grid gap-2 sm:grid-cols-5">
        {steps.map((s, i) => {
          const isActive = active === i;
          return (
            <li key={`${i}-${s.title}`}>
              <button
                type="button"
                onClick={() => {
                  setActive(i);
                  setSeen((p) => new Set(p).add(i));
                }}
                className={cn(
                  "w-full rounded-2xl border p-3 text-start transition-all",
                  isActive
                    ? "border-primary/50 bg-primary/[0.06] shadow-sm"
                    : seen.has(i)
                      ? "border-emerald-500/30 bg-emerald-500/[0.04]"
                      : "border-border/70 hover:border-primary/30",
                )}
              >
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                  الخطوة {s.n}
                  {seen.has(i) && !isActive && <Check className="size-3 text-emerald-600" />}
                </span>
                <span className="mt-1 block text-sm font-bold leading-snug">{s.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
      <p className="mt-3 rounded-xl bg-muted/60 p-4 text-sm leading-relaxed">
        {steps[active]?.body}
      </p>
      {seen.size < steps.length && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          افتح الخطوات كلها عشان تكمّل الدرس ({seen.size} من {steps.length})
        </p>
      )}
    </div>
  );
}

/* ── admin-added lessons ─────────────────────────────────────────────────── */

/**
 * A lesson an admin wrote: its text (videos render above it, like any lesson)
 * and an explicit "done" — there is no exercise to finish it by.
 */
function CustomLesson({ body, done, onComplete }: { body: string; done: boolean; onComplete: () => void }) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());
        const bullets = lines.every((l) => /^[-•]\s+/.test(l));
        return bullets ? (
          <ul key={i} className="space-y-1.5 ps-5 text-sm leading-relaxed [list-style:disc]">
            {lines.map((l, j) => (
              <li key={j}>{l.replace(/^[-•]\s+/, "")}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line text-sm leading-relaxed">
            {block}
          </p>
        );
      })}

      <div className="flex justify-center pt-2">
        {done ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-sm font-semibold text-emerald-600">
            <Check className="size-4" />
            خلصت الدرس ده
          </span>
        ) : (
          <Button className="gap-1.5" onClick={onComplete}>
            <Check className="size-4" />
            علّم الدرس كمكتمل
          </Button>
        )}
      </div>
    </div>
  );
}

/* ── course shell ────────────────────────────────────────────────────────── */

/**
 * The curriculum menu reads in English: a title an admin already wrote in
 * English is kept as written; an Arabic title shows its English label instead
 * (falling back to the Arabic when no English label exists yet).
 */
const menuLabel = (l: OrientationLesson) => (/[؀-ۿ]/.test(l.short) ? l.en.trim() || l.short : l.short);

const formatDay = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" }) : null;

export function SalesOrientation({
  lessons,
  content,
  programmes,
  initialProgress,
}: {
  /** Lesson titles, intros and videos — an admin-edited copy or the bundled default. */
  lessons: OrientationLesson[];
  content: SalesOrientationContent;
  /** Resolved from the live course records by the page — see programs-module. */
  programmes: ProgrammeNumbers[];
  /** The viewer's saved progress, loaded by the page. Null if it couldn't be read. */
  initialProgress: OrientationProgressDto | null;
}) {
  const lessonIds = React.useMemo(() => lessons.map((l) => l.id), [lessons]);
  const progress = useOrientationProgress({ total: lessons.length, lessonIds, initial: initialProgress });
  const { hash, go, pin } = useLessonHash();
  const { complete, done, visit } = progress;

  /*
   * No fragment ⇒ resume on the lesson the learner was last on (if it isn't
   * finished), otherwise the first unfinished one. Progress is loaded on the
   * server, so the first render already lands on the right lesson.
   */
  const firstUnfinished = Math.max(
    0,
    lessons.findIndex((l) => !done.has(l.id)),
  );
  const resumeIndex = lessons.findIndex((l) => l.id === progress.lastLessonId && !done.has(l.id));
  const continueIndex = progress.allDone ? 0 : resumeIndex >= 0 ? resumeIndex : firstUnfinished;
  const hashIndex = lessons.findIndex((l) => l.id === hash);
  const index = hashIndex >= 0 ? hashIndex : continueIndex;
  const lesson = lessons[index];
  const isDone = done.has(lesson.id);

  // "Where I am" is saved (debounced) so Continue resumes here on any device.
  React.useEffect(() => {
    visit(lesson.id);
  }, [lesson.id, visit]);

  const startedOn = formatDay(progress.startedAt);
  const completedOn = formatDay(progress.completedAt);

  const completeCurrent = React.useCallback(() => {
    complete(lesson.id);
    // Freeze the view here; see `pin` for why finishing a lesson would
    // otherwise advance it under the learner.
    pin(lesson.id);
  }, [complete, lesson.id, pin]);

  const goTo = (i: number) => {
    go(lessons[i].id);
    // A new lesson always starts at its own top, not wherever the last one ended.
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const moduleBodies: Record<LessonId, React.ReactNode> = {
    contrast: <ContrastLesson threads={content.threads} onComplete={completeCurrent} />,
    path: <PathLesson steps={content.steps} onComplete={completeCurrent} />,
    rules: <RulesModule rules={content.rules} onComplete={completeCurrent} />,
    practice: <PracticeModule scenarios={content.scenarios} onComplete={completeCurrent} />,
    objections: (
      <ObjectionsModule
        method={content.objectionMethod}
        objections={content.objections}
        onComplete={completeCurrent}
      />
    ),
    drill: <DrillModule objections={content.objections} onComplete={completeCurrent} />,
    programs: <ProgramsModule programmes={programmes} onComplete={completeCurrent} />,
    phrases: <PhraseBankModule phrases={content.phraseBank} onComplete={completeCurrent} />,
    closing: <ClosingModule closings={content.closings} onComplete={completeCurrent} />,
    checklist: <ChecklistModule items={content.checklist} onComplete={completeCurrent} />,
    "program-details": (
      <ProgramDetailsModule details={content.programDetails} programmes={programmes} onComplete={completeCurrent} />
    ),
  };
  const body =
    lesson.kind === "task" && lesson.task ? (
      <TaskLesson key={lesson.id} lessonId={lesson.id} body={lesson.body} task={lesson.task} onComplete={completeCurrent} />
    ) : lesson.kind === "custom" ? (
      <CustomLesson key={lesson.id} body={lesson.body} done={isDone} onComplete={completeCurrent} />
    ) : isModuleLesson(lesson.id) ? (
      moduleBodies[lesson.id]
    ) : null;

  return (
    <div dir="rtl" className="space-y-6">
      {/* Progress — the same shape as a course's: lessons done, percent, a bar, and a way back in. */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-4 sm:flex-row sm:items-center sm:p-5">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-2xl",
            progress.allDone ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary",
          )}
        >
          {progress.allDone ? <PartyPopper className="size-6" /> : <GraduationCap className="size-6" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-heading text-base font-bold">تقدّمك في التدريب</h2>
            <span
              className={cn(
                "text-sm font-bold tabular-nums",
                progress.allDone ? "text-emerald-600" : "text-primary",
              )}
            >
              {progress.percent}%
            </span>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {progress.allDone
              ? `خلصت التدريب${completedOn ? ` في ${completedOn}` : ""} · ${progress.total} من ${progress.total} دروس`
              : progress.count === 0
                ? `لسه ما بدأتش — ${progress.total} دروس في انتظارك`
                : `${progress.count} من ${progress.total} دروس${startedOn ? ` · بدأت في ${startedOn}` : ""}`}
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                progress.allDone ? "bg-emerald-500" : "bg-primary",
              )}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
        </div>
        {(progress.allDone || index !== continueIndex) && (
          <Button
            variant={progress.allDone ? "outline" : "default"}
            className="gap-1.5 sm:self-center"
            onClick={() => goTo(continueIndex)}
          >
            <PlayCircle className="size-4" />
            {progress.allDone ? "راجع الدروس" : progress.count === 0 ? "ابدأ التدريب" : "كمّل من حيث توقفت"}
          </Button>
        )}
      </section>

    {/*
      The grid is LTR so the curriculum sits on the left of the lesson; the
      curriculum itself reads in English, the lesson stays Arabic (RTL).
    */}
    <div dir="ltr" className="grid gap-6 lg:grid-cols-[17rem_1fr] lg:gap-8">
      {/* Curriculum */}
      <aside dir="ltr" className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border/70 bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-sm font-semibold">
              <ListChecks className="size-4 text-primary" />
              Training content
            </span>
            <span className="text-sm font-bold text-primary">
              {progress.count}/{progress.total}
            </span>
          </div>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>

          <ol className="mt-4 space-y-0.5">
            {lessons.map((l, i) => {
              const finished = done.has(l.id);
              const current = i === index;
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    aria-current={current ? "step" : undefined}
                    onClick={() => goTo(i)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm transition-colors",
                      current ? "bg-primary/10 font-medium text-primary" : "hover:bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold",
                        finished
                          ? "bg-emerald-500 text-white"
                          : current
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {finished ? <Check className="size-3" /> : i + 1}
                    </span>
                    <span dir="auto" title={menuLabel(l)} className="min-w-0 flex-1 truncate">
                      {menuLabel(l)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          {progress.count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full gap-1.5 text-muted-foreground"
              onClick={progress.reset}
            >
              <RotateCcw className="size-3.5" />
              Reset progress
            </Button>
          )}
        </div>
      </aside>

      {/* Lesson */}
      <div dir="rtl" className="min-w-0">
        <article className="rounded-2xl border border-border/70 bg-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              الدرس {index + 1} من {lessons.length}
            </span>
            {isDone && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 font-semibold text-emerald-600">
                <Check className="size-3" />
                مكتمل
              </span>
            )}
            {lesson.en && <span className="ms-auto text-muted-foreground">{lesson.en}</span>}
          </div>

          <h2 className="mt-3 font-heading text-xl font-bold leading-snug tracking-tight sm:text-2xl">
            {lesson.heading}
          </h2>
          {lesson.intro && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{lesson.intro}</p>
          )}

          <LessonVideos key={lesson.id} videos={lesson.videos} />

          <div className="mt-6">{body}</div>
        </article>

        {/* Lesson navigation */}
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="outline"
            className="gap-1.5"
            disabled={index === 0}
            onClick={() => goTo(index - 1)}
          >
            {/* RTL: "previous" points right. */}
            <ArrowRight className="size-4" />
            السابق
          </Button>

          {index < lessons.length - 1 ? (
            <Button className="ms-auto gap-1.5" onClick={() => goTo(index + 1)}>
              الدرس التالي
              <ArrowLeft className="size-4" />
            </Button>
          ) : (
            progress.allDone && (
              <span className="ms-auto text-sm font-medium text-emerald-600">
                خلصت كل الدروس
              </span>
            )
          )}
        </div>

        {progress.allDone && index === lessons.length - 1 && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.07] p-6 text-center">
            <PartyPopper className="mx-auto size-8 text-emerald-600" />
            <h2 className="mt-3 font-heading text-xl font-bold">خلصت التدريب</h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
              دلوقتي عندك المسار، والقواعد الأربع، والصياغات الآمنة. ارجع لأي درس
              أي وقت قبل ما تبعت رد طويل.
            </p>
          </div>
        )}

        <p className="mt-6 rounded-xl bg-muted/50 p-3.5 text-center text-xs leading-relaxed text-muted-foreground">
          دليل داخلي لفريق مبيعات IMETS. لأي حالة مش واضحة، ارجع لمشرف الفريق قبل
          ما توعد العميل بأي حاجة.
        </p>
      </div>
    </div>
    </div>
  );
}
