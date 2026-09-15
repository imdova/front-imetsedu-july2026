import { ArrowLeft, CheckCircle2, CircleDashed, Clock, Info, Users } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { OrientationProgressStatus, OrientationTeamProgress } from "@/lib/dal/orientation";
import type { OrientationLesson } from "@/features/orientation/lib/sales-orientation";

const STATUS: Record<OrientationProgressStatus, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  completed: {
    label: "Completed",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In progress",
    className: "bg-primary/10 text-primary",
    icon: Clock,
  },
  not_started: {
    label: "Not started",
    className: "bg-muted text-muted-foreground",
    icon: CircleDashed,
  },
};

const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * Sales Orientation progress across the team — the admin view of what each
 * learner sees on their own progress card.
 */
export function OrientationTeamProgress({
  data,
  lessons,
}: {
  data: OrientationTeamProgress;
  lessons: OrientationLesson[];
}) {
  const lessonTitle = new Map(lessons.map((l) => [l.id, l.en || l.short]));
  const total = lessons.length;
  const { summary } = data;

  const tiles = [
    { label: "On the training", value: summary.assigned, hint: "Staff whose role includes Sales Orientation" },
    { label: "Completed", value: summary.completed, hint: "Finished every lesson" },
    { label: "In progress", value: summary.inProgress, hint: "Started, not finished" },
    { label: "Not started", value: summary.notStarted, hint: "Haven't completed a lesson yet" },
    { label: "Average progress", value: `${summary.averagePercent}%`, hint: "Across staff on the training" },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Button asChild variant="ghost" size="sm" className="-ms-2 mb-1 gap-1.5 text-muted-foreground">
            <Link href="/admin/crm/office?tab=orientation">
              <ArrowLeft className="size-4" /> Sales Orientation
            </Link>
          </Button>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <Users className="size-6 text-primary" /> Team progress
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            How far each person has got through Sales Orientation ({total} lessons).
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-border/70 bg-card p-4">
            <p className="text-xs text-muted-foreground">{t.label}</p>
            <p className="mt-1 font-heading text-2xl font-bold tabular-nums">{t.value}</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">{t.hint}</p>
          </div>
        ))}
      </div>

      {summary.assigned === 0 && (
        <p className="flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-900 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:ring-amber-900">
          <Info className="mt-0.5 size-4 shrink-0" />
          <span>
            No staff role includes Sales Orientation yet. Turn on the <b>training.orientation.view</b> permission for a role in{" "}
            <Link href="/admin/users/roles" className="font-semibold underline">
              Users → Roles
            </Link>{" "}
            and its staff will appear here.
          </span>
        </p>
      )}

      {data.rows.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-[860px] text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">Person</th>
                <th className="w-[26%] px-4 py-3 text-start font-semibold">Progress</th>
                <th className="px-4 py-3 text-start font-semibold">Status</th>
                <th className="px-4 py-3 text-start font-semibold">Last lesson</th>
                <th className="px-4 py-3 text-start font-semibold">Started</th>
                <th className="px-4 py-3 text-start font-semibold">Last activity</th>
                <th className="px-4 py-3 text-start font-semibold">Completed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data.rows.map((r) => {
                const s = STATUS[r.status];
                const denominator = r.total || total;
                const percent = r.total ? r.percent : 0;
                return (
                  <tr key={r.userId} className="align-middle hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
                          {getInitials(r.name || r.email || "?")}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{r.name || "—"}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {r.role}
                            {r.email ? ` · ${r.email}` : ""}
                          </p>
                          {!r.assigned && (
                            <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                              Not assigned by role
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {r.completedCount} of {denominator} lessons
                        </span>
                        <span className="font-semibold tabular-nums text-foreground">{percent}%</span>
                      </div>
                      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn("h-full rounded-full", r.status === "completed" ? "bg-emerald-500" : "bg-primary")}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", s.className)}>
                        <s.icon className="size-3.5" /> {s.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">{r.lastLessonId ? lessonTitle.get(r.lastLessonId as never) ?? r.lastLessonId : "—"}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(r.startedAt)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(r.updatedAt)}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{fmt(r.completedAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
