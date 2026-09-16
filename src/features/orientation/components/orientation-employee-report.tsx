import {
  AlertTriangle,
  ArrowLeft,
  Award,
  CheckCircle2,
  CircleDashed,
  ClipboardList,
  Clock,
  Flag,
  Lock,
  Star,
  Trophy,
  Zap,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { OrientationEmployeeReport } from "@/lib/dal/orientation";
import { levelFor } from "@/features/orientation/lib/gamification";
import { formatMinutes, orientationT } from "@/features/orientation/lib/i18n";
import {
  gateRequirementFor,
  localizeLesson,
  type LessonView,
  type ResolvedOrientation,
} from "@/features/orientation/lib/sales-orientation";
import { OrientationReportActions, type CsvSection } from "./orientation-report-actions";
import { OrientationSignOffButton } from "./orientation-signoff-button";

const t = orientationT("en");
const DAY = 86_400_000;
/** The suggested pace: the whole orientation in three days. */
const PACE_DAYS = 3;

const fmtDate = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtDateTime = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";
const days = (from: string | null | undefined, to: number) =>
  from ? Math.max(0, Math.floor((to - new Date(from).getTime()) / DAY)) : null;
const pct = (a: number, b: number) => (b > 0 ? Math.round((a / b) * 100) : 0);

type LessonStatus = "completed" | "in_progress" | "not_started" | "locked";

const STATUS_STYLE: Record<LessonStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: { label: "Completed", className: "text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
  in_progress: { label: "In progress", className: "text-primary", icon: Clock },
  not_started: { label: "Not started", className: "text-muted-foreground", icon: CircleDashed },
  locked: { label: "Locked", className: "text-muted-foreground", icon: Lock },
};

/**
 * One employee's Sales Orientation report: a summary an admin can act on
 * (status, pace, scores, flags for coaching), then the evidence — every
 * module and lesson with its gate steps and completion date, every module
 * check and knowledge-check attempt, and the field task per programme.
 */
export function OrientationEmployeeReportView({
  report,
  resolved,
  programmeCount,
  now,
}: {
  report: OrientationEmployeeReport;
  resolved: ResolvedOrientation;
  programmeCount: number;
  /** When the report was generated (ms) — day counts are measured to it. */
  now: number;
}) {
  const { user, progress: p, tasks } = report;
  const c = resolved.contentEn;
  const views = resolved.lessons.map((l) => localizeLesson(l, "en"));
  const done = new Set(p.completed);

  /* lessons */
  const moduleRank = (id: string) => resolved.modules.findIndex((m) => m.id === id);
  const lessonRows = views.map((v, i) => {
    const required = gateRequirementFor(v, c, programmeCount);
    const steps = Math.min(p.gates?.[v.id]?.length ?? 0, required);
    const blocked =
      v.lockedUntilEarlier &&
      !done.has(v.id) &&
      views.some((x) => x.id !== v.id && moduleRank(x.moduleId) < moduleRank(v.moduleId) && !done.has(x.id));
    const status: LessonStatus = done.has(v.id) ? "completed" : blocked ? "locked" : steps > 0 ? "in_progress" : "not_started";
    return { v, n: i + 1, required, steps, status, completedAt: p.completedLog?.[v.id] ?? null };
  });
  const completedCount = lessonRows.filter((r) => r.status === "completed").length;
  const total = views.length;
  const percent = pct(completedCount, total);
  const minutesLeft = lessonRows.filter((r) => r.status !== "completed").reduce((s, r) => s + r.v.minutes, 0);

  /* modules */
  const moduleRows = resolved.modules
    .map((m, i) => {
      const rows = lessonRows.filter((r) => r.v.moduleId === m.id);
      const check = rows.find((r) => r.v.kind === "check");
      const record = p.moduleChecks?.[m.id];
      const runs = p.checkRuns.filter((r) => r.moduleId === m.id);
      return {
        m,
        n: i + 1,
        rows,
        done: rows.filter((r) => r.status === "completed").length,
        minutes: rows.reduce((s, r) => s + r.v.minutes, 0),
        hasCheck: !!check,
        passPercent: c.moduleChecks[m.id]?.passPercent ?? 70,
        record,
        runs,
        avgPercent: runs.length ? Math.round(runs.reduce((s, r) => s + pct(r.score, r.total), 0) / runs.length) : null,
      };
    })
    .filter((x) => x.rows.length > 0);
  const lessonTitle = new Map(views.map((v) => [v.id, v.title]));

  /* scores */
  const xp = Object.values(p.moduleChecks ?? {}).reduce((s, r) => s + (r?.xp ?? 0), 0);
  const level = levelFor(xp);
  const checkModules = moduleRows.filter((x) => x.hasCheck);
  const stars = checkModules.reduce((s, x) => s + (x.record?.stars ?? 0), 0);
  const quiz = c.quiz;

  /* time */
  const startedDays = days(p.startedAt, now);
  const trainingDays = p.startedAt ? days(p.startedAt, p.completedAt ? new Date(p.completedAt).getTime() : now) : null;
  const idleDays = days(p.updatedAt, now);
  const overall: LessonStatus | "signed_off" = p.signedOffAt
    ? "signed_off"
    : completedCount >= total && total > 0
      ? "completed"
      : completedCount > 0 || Object.keys(p.gates ?? {}).length > 0
        ? "in_progress"
        : "not_started";

  /* field task */
  const taskLessons = views.filter((v) => v.kind === "task" && v.task);
  const taskRows = taskLessons.flatMap((v) =>
    (v.task?.programs ?? []).map((prog) => {
      const sub = tasks.find((s) => s.lessonId === v.id && s.programSlug === prog.slug);
      return { lesson: v, prog, sub };
    }),
  );
  const taskSummary =
    taskRows.length === 0
      ? "—"
      : taskRows.every((r) => r.sub?.status === "reviewed")
        ? "Approved"
        : taskRows.some((r) => r.sub && r.sub.status !== "draft")
          ? `${taskRows.filter((r) => r.sub && r.sub.status !== "draft").length}/${taskRows.length} sent`
          : taskRows.some((r) => r.sub)
            ? "Draft only"
            : "Not started";

  /* flags for coaching */
  const flags: { tone: "bad" | "warn" | "good"; text: string }[] = [];
  if (!p.exists) flags.push({ tone: "warn", text: "Hasn't opened the orientation yet." });
  if (p.exists && overall !== "completed" && overall !== "signed_off" && startedDays !== null && startedDays > PACE_DAYS) {
    flags.push({ tone: "warn", text: `Behind the suggested pace: ${startedDays} days since starting, ${percent}% complete (target: all in ${PACE_DAYS} days).` });
  }
  if (p.exists && overall === "in_progress" && idleDays !== null && idleDays >= 2) {
    flags.push({ tone: "warn", text: `No activity for ${idleDays} days (last: ${fmtDate(p.updatedAt)}).` });
  }
  for (const x of checkModules) {
    const r = x.record;
    if (r && !r.passedAt && r.attempts > 0) {
      flags.push({ tone: "bad", text: `Needs coaching on Module ${x.n} · ${x.m.title.en}: not passed after ${r.attempts} attempt${r.attempts === 1 ? "" : "s"} (best ${r.best}/${r.total}).` });
    } else if (r?.passedAt && pct(r.best, r.total) < 80) {
      flags.push({ tone: "warn", text: `Weak area: Module ${x.n} · ${x.m.title.en} — passed with ${pct(r.best, r.total)}% (best ${r.best}/${r.total}).` });
    } else if (!r && x.done >= x.rows.length - 1 && x.rows.length > 1) {
      flags.push({ tone: "warn", text: `Module ${x.n} lessons done but its check hasn't been played.` });
    }
  }
  if ((p.quizAttempts ?? 0) >= 2 && !p.quizPassedAt) {
    flags.push({ tone: "bad", text: `Knowledge check not passed after ${p.quizAttempts} attempts (best ${p.quizScore ?? 0}/${p.quizTotal ?? quiz.questions.length}).` });
  }
  const notesToAct = tasks.filter((s) => s.adminNote);
  if (p.quizPassedAt && taskRows.length && taskRows.some((r) => !r.sub || r.sub.status === "draft")) {
    flags.push({ tone: "warn", text: "Knowledge check passed, but the field task isn't fully sent yet." });
  }
  if (overall === "completed") flags.push({ tone: "good", text: "Every lesson complete — ready for sign-off review." });
  if (overall === "signed_off") flags.push({ tone: "good", text: `Signed off on ${fmtDate(p.signedOffAt)}${p.signedOffBy ? ` by ${p.signedOffBy}` : ""}.` });
  checkModules
    .filter((x) => x.record?.stars === 3)
    .forEach((x) => flags.push({ tone: "good", text: `Strong: 3 stars on Module ${x.n} · ${x.m.title.en}.` }));

  /* CSV */
  const sections: CsvSection[] = [
    {
      title: "Summary",
      header: ["Field", "Value"],
      rows: [
        ["Name", user.name],
        ["Email", user.email],
        ["Role", user.role],
        ["Status", overall.replace("_", " ")],
        ["Lessons completed", `${completedCount}/${total} (${percent}%)`],
        ["Started", fmtDateTime(p.startedAt)],
        ["Completed", fmtDateTime(p.completedAt)],
        ["Days in training", trainingDays ?? "—"],
        ["Last activity", fmtDateTime(p.updatedAt)],
        ["XP", xp],
        ["Level", level.current.en],
        ["Stars", `${stars}/${checkModules.length * 3}`],
        ["Knowledge check best", p.quizScore !== null && p.quizScore !== undefined ? `${p.quizScore}/${p.quizTotal}` : "—"],
        ["Knowledge check passed", fmtDateTime(p.quizPassedAt)],
        ["Field task", taskSummary],
        ["Signed off", p.signedOffAt ? `${fmtDateTime(p.signedOffAt)}${p.signedOffBy ? ` by ${p.signedOffBy}` : ""}` : "—"],
      ],
    },
    {
      title: "Flags",
      header: ["Type", "Detail"],
      rows: flags.map((f) => [f.tone === "good" ? "Strength" : f.tone === "bad" ? "Needs coaching" : "Watch", f.text]),
    },
    {
      title: "Modules",
      header: ["#", "Module", "Lessons done", "Minutes", "Check best", "Check %", "Stars", "XP", "Attempts", "Passed"],
      rows: moduleRows.map((x) => [
        x.n,
        x.m.title.en,
        `${x.done}/${x.rows.length}`,
        x.minutes,
        x.record ? `${x.record.best}/${x.record.total}` : "—",
        x.record ? pct(x.record.best, x.record.total) : "—",
        x.record?.stars ?? "—",
        x.record?.xp ?? "—",
        x.record?.attempts ?? 0,
        fmtDateTime(x.record?.passedAt),
      ]),
    },
    {
      title: "Lessons",
      header: ["#", "Module", "Lesson", "Type", "Status", "Steps", "Completed at"],
      rows: lessonRows.map((r) => [
        r.n,
        resolved.modules.find((m) => m.id === r.v.moduleId)?.title.en ?? "",
        r.v.title,
        r.v.type,
        STATUS_STYLE[r.status].label,
        `${r.status === "completed" ? r.required : r.steps}/${r.required}`,
        fmtDateTime(r.completedAt),
      ]),
    },
    {
      title: "Module check attempts",
      header: ["When", "Module", "Score", "%", "XP", "Stars", "Passed"],
      rows: p.checkRuns.map((r) => [
        fmtDateTime(r.at),
        resolved.modules.find((m) => m.id === r.moduleId)?.title.en ?? r.moduleId,
        `${r.score}/${r.total}`,
        pct(r.score, r.total),
        r.xp,
        r.stars,
        r.passed ? "Yes" : "No",
      ]),
    },
    {
      title: "Knowledge check attempts",
      header: ["When", "Score", "Passed"],
      rows: p.quizRuns.map((r) => [fmtDateTime(r.at), `${r.score}/${r.total}`, r.passed ? "Yes" : "No"]),
    },
    {
      title: "Field task",
      header: ["Task", "Program", "Status", "Entries", "Attachments", "Sent", "Reviewed", "Review note"],
      rows: taskRows.map((r) => [
        r.lesson.title,
        r.prog.name,
        r.sub ? r.sub.status : "not started",
        r.sub?.entries ?? 0,
        r.sub?.attachments ?? 0,
        fmtDateTime(r.sub?.submittedAt),
        fmtDateTime(r.sub?.reviewedAt),
        r.sub?.adminNote ?? "",
      ]),
    },
  ];
  const fileName = `orientation-report-${(user.name || user.email || user.userId).replace(/[^\w؀-ۿ-]+/g, "-")}.csv`;

  const overallBadge = {
    signed_off: { label: "Signed off", className: "bg-[#D89B32]/15 text-[#9A6B17]" },
    completed: { label: "Completed — awaiting sign-off", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" },
    in_progress: { label: "In progress", className: "bg-primary/10 text-primary" },
    not_started: { label: "Not started", className: "bg-muted text-muted-foreground" },
    locked: { label: "", className: "" },
  }[overall];

  return (
    <div className="space-y-5 print:space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <Button asChild variant="ghost" size="sm" className="-ms-2 mb-1 gap-1.5 text-muted-foreground print:hidden">
            <Link href="/admin/orientation/progress">
              <ArrowLeft className="size-4 rtl:-scale-x-100" /> Team progress
            </Link>
          </Button>
          <div className="flex items-center gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-sm font-bold text-white">
              {getInitials(user.name || user.email || "?")}
            </span>
            <div className="min-w-0">
              <h1 className="font-heading text-2xl font-bold tracking-tight">{user.name || user.email || "—"}</h1>
              <p className="text-sm text-muted-foreground">
                {user.role}
                {user.email ? ` · ${user.email}` : ""}
                {user.phone ? ` · ${user.phone}` : ""}
                {!user.isActive ? " · inactive account" : ""}
                {!user.assigned ? " · role doesn't include Sales Orientation" : ""}
              </p>
            </div>
            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", overallBadge.className)}>{overallBadge.label}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Sales Orientation report · generated {fmtDateTime(new Date(now).toISOString())}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrientationReportActions fileName={fileName} sections={sections} />
          <div className="print:hidden">
            <OrientationSignOffButton userId={user.userId} name={user.name} signedOff={!!p.signedOffAt} canSignOff={p.exists} />
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Progress" value={`${percent}%`} hint={`${completedCount} of ${total} lessons · ${minutesLeft ? `${formatMinutes(minutesLeft, t)} left` : "all done"}`}>
          <Bar value={percent} tone={percent === 100 ? "good" : "primary"} />
        </Kpi>
        <Kpi
          label="Time in training"
          value={trainingDays === null ? "—" : `${trainingDays} day${trainingDays === 1 ? "" : "s"}`}
          hint={
            p.startedAt
              ? `Started ${fmtDate(p.startedAt)} · pace target ${PACE_DAYS} days${p.completedAt ? ` · finished ${fmtDate(p.completedAt)}` : ""}`
              : "Not started"
          }
          tone={trainingDays !== null && trainingDays > PACE_DAYS && overall === "in_progress" ? "warn" : undefined}
        />
        <Kpi label="Last activity" value={idleDays === null ? "—" : idleDays === 0 ? "Today" : `${idleDays}d ago`} hint={fmtDateTime(p.updatedAt)} />
        <Kpi label="XP & level" value={xp.toLocaleString("en-US")} hint={`${level.current.en}${level.next ? ` · ${(level.next.min - xp).toLocaleString("en-US")} XP to ${level.next.en}` : ""}`} icon={<Zap className="size-4 text-amber-500" />} />
        <Kpi
          label="Module-check stars"
          value={checkModules.length ? `${stars}/${checkModules.length * 3}` : "—"}
          hint={`${checkModules.filter((x) => x.record?.passedAt).length} of ${checkModules.length} checks passed`}
          icon={<Star className="size-4 fill-[#D89B32] text-[#D89B32]" />}
        />
        <Kpi
          label="Knowledge check"
          value={p.quizScore !== null && p.quizScore !== undefined ? `${p.quizScore}/${p.quizTotal}` : "—"}
          hint={
            p.quizPassedAt
              ? `Passed ${fmtDate(p.quizPassedAt)} · ${p.quizAttempts} attempt${p.quizAttempts === 1 ? "" : "s"}`
              : p.quizAttempts
                ? `Not passed yet · ${p.quizAttempts} attempt${p.quizAttempts === 1 ? "" : "s"} · pass ${quiz.passMark}/${quiz.questions.length}`
                : `Not taken · pass ${quiz.passMark}/${quiz.questions.length}`
          }
          icon={<Trophy className="size-4 text-primary" />}
          tone={p.quizPassedAt ? "good" : undefined}
        />
      </div>

      {/* Flags */}
      <Section title="Coaching notes" icon={<Flag className="size-4" />} hint="Worked out from the activity below">
        {flags.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing to flag yet.</p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {flags.map((f, i) => (
              <li
                key={i}
                className={cn(
                  "flex items-start gap-2 rounded-xl p-3 text-sm leading-relaxed",
                  f.tone === "bad" ? "bg-destructive/[0.07]" : f.tone === "warn" ? "bg-amber-500/[0.1]" : "bg-emerald-500/[0.08]",
                )}
              >
                {f.tone === "good" ? (
                  <Award className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertTriangle className={cn("mt-0.5 size-4 shrink-0", f.tone === "bad" ? "text-destructive" : "text-amber-600")} />
                )}
                {f.text}
              </li>
            ))}
          </ul>
        )}
        {notesToAct.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            {notesToAct.length} field-task answer{notesToAct.length === 1 ? " has" : "s have"} a review note — see Field task below.
          </p>
        )}
      </Section>

      {/* Modules */}
      <Section title="Modules" icon={<Trophy className="size-4" />}>
        <Table
          head={["Module", "Lessons", "Check best", "Stars", "XP", "Attempts (avg %)", "Passed"]}
          rows={moduleRows.map((x) => [
            <span key="m" className="font-semibold">
              {x.n} · {x.m.title.en}
              <span className="block text-xs font-normal text-muted-foreground">{formatMinutes(x.minutes, t)}</span>
            </span>,
            <span key="l" className="block min-w-28">
              <span className="text-xs tabular-nums">
                {x.done}/{x.rows.length}
              </span>
              <Bar value={pct(x.done, x.rows.length)} tone={x.done === x.rows.length ? "good" : "primary"} />
            </span>,
            x.hasCheck ? (x.record ? `${x.record.best}/${x.record.total} (${pct(x.record.best, x.record.total)}%)` : "Not played") : "No check",
            x.hasCheck ? <StarsText key="s" value={x.record?.stars ?? 0} /> : "—",
            x.record ? x.record.xp.toLocaleString("en-US") : "—",
            x.hasCheck ? `${x.record?.attempts ?? 0}${x.avgPercent !== null ? ` (${x.avgPercent}%)` : ""}` : "—",
            x.hasCheck ? (x.record?.passedAt ? fmtDate(x.record.passedAt) : x.record ? <span key="p" className="text-destructive">Not yet (pass {x.passPercent}%)</span> : "—") : "—",
          ])}
        />
      </Section>

      {/* Lessons */}
      <Section title="Lessons" icon={<CheckCircle2 className="size-4" />} hint="Completion dates are recorded from 16 Sep 2026">
        <Table
          head={["#", "Lesson", "Module", "Type", "Status", "Steps", "Completed"]}
          rows={lessonRows.map((r) => {
            const s = STATUS_STYLE[r.status];
            return [
              <span key="n" className="tabular-nums text-muted-foreground">
                {r.n}
              </span>,
              <span key="t" className="font-medium">
                {r.v.title}
              </span>,
              moduleName(resolved, r.v, t),
              <span key="ty" className="capitalize">
                {r.v.type}
              </span>,
              <span key="s" className={cn("inline-flex items-center gap-1 font-medium", s.className)}>
                <s.icon className="size-3.5" /> {s.label}
              </span>,
              <span key="st" className="tabular-nums">
                {r.status === "completed" ? r.required : r.steps}/{r.required}
              </span>,
              fmtDateTime(r.completedAt),
            ];
          })}
        />
      </Section>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Check history */}
        <Section title="Module check attempts" icon={<Zap className="size-4" />}>
          {p.checkRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attempts yet.</p>
          ) : (
            <Table
              head={["When", "Module", "Score", "XP", "Stars", "Result"]}
              rows={[...p.checkRuns].reverse().map((r) => [
                fmtDateTime(r.at),
                resolved.modules.find((m) => m.id === r.moduleId)?.title.en ?? r.moduleId,
                `${r.score}/${r.total} (${pct(r.score, r.total)}%)`,
                r.xp.toLocaleString("en-US"),
                <StarsText key="s" value={r.stars} />,
                r.passed ? <span key="r" className="font-medium text-emerald-700 dark:text-emerald-400">Passed</span> : <span key="r" className="text-destructive">Not passed</span>,
              ])}
            />
          )}
        </Section>

        {/* Quiz history */}
        <Section title="Knowledge check attempts" icon={<Trophy className="size-4" />}>
          {p.quizRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {p.quizAttempts ? `${p.quizAttempts} attempt(s) before attempt history was recorded; best ${p.quizScore}/${p.quizTotal}.` : "No attempts yet."}
            </p>
          ) : (
            <Table
              head={["When", "Score", "Result"]}
              rows={[...p.quizRuns].reverse().map((r) => [
                fmtDateTime(r.at),
                `${r.score}/${r.total}`,
                r.passed ? <span key="r" className="font-medium text-emerald-700 dark:text-emerald-400">Passed</span> : <span key="r" className="text-destructive">Not passed</span>,
              ])}
            />
          )}
        </Section>
      </div>

      {/* Field task */}
      <Section
        title="Field task"
        icon={<ClipboardList className="size-4" />}
        action={
          <Button asChild variant="outline" size="sm" className="print:hidden">
            <Link href="/admin/orientation/tasks">Open task submissions</Link>
          </Button>
        }
      >
        {taskRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">The training has no field task.</p>
        ) : (
          <Table
            head={["Program", "Status", "Entries", "Attachments", "Sent", "Reviewed", "Review note"]}
            rows={taskRows.map((r) => [
              <span key="p" className="font-medium">
                {r.prog.name}
                {taskLessons.length > 1 && <span className="block text-xs font-normal text-muted-foreground">{lessonTitle.get(r.lesson.id)}</span>}
              </span>,
              <TaskStatus key="s" status={r.sub?.status} />,
              r.sub?.entries ?? 0,
              r.sub?.attachments ?? 0,
              fmtDateTime(r.sub?.submittedAt),
              fmtDateTime(r.sub?.reviewedAt),
              <span key="n" dir="auto" className="block max-w-72 text-xs">
                {r.sub?.adminNote || "—"}
              </span>,
            ])}
          />
        )}
      </Section>
    </div>
  );
}

function moduleName(resolved: ResolvedOrientation, v: LessonView, tr: typeof t) {
  const i = resolved.modules.findIndex((m) => m.id === v.moduleId);
  return i >= 0 ? `${i + 1} · ${resolved.modules[i].title.en}` : tr("common.all");
}

function TaskStatus({ status }: { status?: string }) {
  if (!status) return <span className="text-muted-foreground">Not started</span>;
  if (status === "reviewed") return <span className="font-medium text-emerald-700 dark:text-emerald-400">Approved</span>;
  if (status === "submitted") return <span className="font-medium text-amber-700 dark:text-amber-400">Waiting review</span>;
  return <span className="text-muted-foreground">Draft</span>;
}

function StarsText({ value }: { value: number }) {
  return (
    <span className="whitespace-nowrap text-[#D89B32]" aria-label={`${value} of 3 stars`}>
      {"★".repeat(value)}
      <span className="text-muted-foreground/40">{"★".repeat(3 - value)}</span>
    </span>
  );
}

function Bar({ value, tone }: { value: number; tone: "good" | "primary" }) {
  return (
    <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-muted">
      <span className={cn("block h-full rounded-full", tone === "good" ? "bg-emerald-500" : "bg-primary")} style={{ width: `${value}%` }} />
    </span>
  );
}

function Kpi({
  label,
  value,
  hint,
  icon,
  tone,
  children,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  tone?: "good" | "warn";
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border bg-card p-4 print:break-inside-avoid",
        tone === "good" ? "border-emerald-500/40" : tone === "warn" ? "border-amber-500/50" : "border-border/70",
      )}
    >
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{value}</p>
      {children}
      {hint && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  icon,
  hint,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  hint?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-4 sm:p-5 print:break-inside-avoid">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 font-heading text-base font-bold">
          <span className="text-primary">{icon}</span>
          {title}
        </h2>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
        {action && <span className="ms-auto">{action}</span>}
      </div>
      {children}
    </section>
  );
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="border-b border-border/60 text-[11px] uppercase tracking-wide text-muted-foreground">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-3 py-2 text-start font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/50">
          {rows.map((r, i) => (
            <tr key={i} className="align-top">
              {r.map((cellValue, j) => (
                <td key={j} className="px-3 py-2">
                  {cellValue}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
