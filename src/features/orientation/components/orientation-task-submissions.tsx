"use client";

import * as React from "react";
import { ArrowLeft, CheckCircle2, ClipboardList, Download, Inbox, Loader2, RotateCcw, Save } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { OrientationTaskSubmissionDto } from "@/lib/dal/orientation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { LessonTask } from "@/features/orientation/lib/sales-orientation";

export interface TaskSummary {
  id: string;
  title: string;
  task: LessonTask;
}

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
const fmt = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en", { day: "numeric", month: "short", year: "numeric" }) : "—";

/**
 * Task answers from the team — for a competitor analysis, every competitor
 * each person recorded, per programme. Admins review each submission and can
 * leave a note the learner sees on the task.
 */
export function OrientationTaskSubmissions({ tasks }: { tasks: TaskSummary[] }) {
  const [taskId, setTaskId] = React.useState(tasks[0]?.id ?? "");
  const current = tasks.find((t) => t.id === taskId) ?? tasks[0];
  const [program, setProgram] = React.useState(current?.task.programs[0]?.slug ?? "");
  const [rows, setRows] = React.useState<OrientationTaskSubmissionDto[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!current) return;
    let alive = true;
    void (async () => {
      setLoading(true);
      const res = await dal.orientation.fetchTaskSubmissions({ lessonId: current.id });
      if (!alive) return;
      if (res.ok) setRows(res.data);
      else toast.error(res.error);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [current]);

  if (!current) {
    return (
      <div className="space-y-4">
        <BackLink />
        <div className="grid place-items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <ClipboardList className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">No tasks in the training yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add one from the editor: <b>Add lesson → Task: competitor analysis</b>.
          </p>
          <Button asChild size="sm" className="mt-4">
            <Link href="/admin/crm/office/orientation/edit">Open the editor</Link>
          </Button>
        </div>
      </div>
    );
  }

  const fields = current.task.fields;
  const visible = rows.filter((r) => r.programSlug === program);
  const countFor = (slug: string) => rows.filter((r) => r.programSlug === slug).length;
  const programName = current.task.programs.find((p) => p.slug === program)?.name ?? program;

  const exportCsv = () => {
    const header = ["Submitted by", "Email", "Status", "Submitted", ...fields.map((f) => f.label)];
    const lines = visible.flatMap((s) =>
      s.entries.map((e) =>
        [s.user?.name, s.user?.email, s.status, s.submittedAt?.slice(0, 10), ...fields.map((f) => e[f.key])].map(csvCell).join(","),
      ),
    );
    if (!lines.length) {
      toast.error("Nothing to export for this programme yet.");
      return;
    }
    const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.title}-${programName}.csv`.replace(/[^\p{L}\p{N}.-]+/gu, "-");
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateRow = (id: string, patch: Partial<OrientationTaskSubmissionDto>) =>
    setRows((all) => all.map((r) => (r._id === id ? { ...r, ...patch } : r)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <BackLink />
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <ClipboardList className="size-6 text-primary" /> Task submissions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">What the team submitted for each Sales Orientation task, by programme.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {tasks.length > 1 && (
            <select
              value={current.id}
              onChange={(e) => {
                const next = tasks.find((t) => t.id === e.target.value);
                setTaskId(e.target.value);
                setProgram(next?.task.programs[0]?.slug ?? "");
              }}
              className="h-9 rounded-md border border-input bg-card px-3 text-sm"
              dir="auto"
            >
              {tasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          )}
          <Button variant="outline" className="gap-1.5" onClick={exportCsv}>
            <Download className="size-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {current.task.programs.map((p) => (
          <button
            key={p.slug}
            type="button"
            onClick={() => setProgram(p.slug)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold ring-1 transition-colors",
              p.slug === program ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
            )}
            dir="auto"
          >
            {p.name}
            <span className={cn("tabular-nums", p.slug === program ? "text-primary-foreground/80" : "text-muted-foreground/70")}>
              {countFor(p.slug)}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-border/70 bg-card py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-16 text-center">
          <Inbox className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">No submissions for {programName} yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Drafts stay private until the person submits.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((s) => (
            <SubmissionCard key={s._id} submission={s} task={current.task} onChange={(patch) => updateRow(s._id, patch)} />
          ))}
        </div>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Button asChild variant="ghost" size="sm" className="-ms-2 mb-1 gap-1.5 text-muted-foreground">
      <Link href="/admin/crm/office?tab=orientation">
        <ArrowLeft className="size-4" /> Sales Orientation
      </Link>
    </Button>
  );
}

function SubmissionCard({
  submission: s,
  task,
  onChange,
}: {
  submission: OrientationTaskSubmissionDto;
  task: LessonTask;
  onChange: (patch: Partial<OrientationTaskSubmissionDto>) => void;
}) {
  const [note, setNote] = React.useState(s.adminNote ?? "");
  const [busy, setBusy] = React.useState(false);
  const reviewed = s.status === "reviewed";

  const review = async (input: { status?: "submitted" | "reviewed"; adminNote?: string }, done: string) => {
    setBusy(true);
    const res = await dal.orientation.reviewTaskSubmission(s._id, input);
    setBusy(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    onChange({ status: res.data.status, adminNote: res.data.adminNote, reviewedAt: res.data.reviewedAt });
    toast.success(done);
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card">
      <header className="flex flex-wrap items-center gap-3 border-b border-border/60 bg-muted/30 px-4 py-3">
        <div className="min-w-0">
          <p className="font-semibold">{s.user?.name || "—"}</p>
          <p className="text-xs text-muted-foreground">
            {s.user?.email} · submitted {fmt(s.submittedAt)} · {s.entries.length} {s.entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-2.5 py-1 text-[11px] font-semibold",
            reviewed ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-primary/10 text-primary",
          )}
        >
          {reviewed ? `Reviewed ${fmt(s.reviewedAt)}` : "Awaiting review"}
        </span>
        <div className="ms-auto">
          {reviewed ? (
            <Button size="sm" variant="ghost" className="gap-1.5" disabled={busy} onClick={() => review({ status: "submitted" }, "Reopened")}>
              <RotateCcw className="size-3.5" /> Reopen
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5" disabled={busy} onClick={() => review({ status: "reviewed" }, "Marked reviewed")}>
              <CheckCircle2 className="size-3.5" /> Mark reviewed
            </Button>
          )}
        </div>
      </header>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm" dir="auto">
          <thead className="text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr className="border-b border-border/60">
              <th className="px-3 py-2 text-start font-semibold">#</th>
              {task.fields.map((f) => (
                <th key={f.key} className="px-3 py-2 text-start font-semibold normal-case">
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {s.entries.map((e, i) => (
              <tr key={i} className="align-top">
                <td className="px-3 py-2 text-xs text-muted-foreground">{i + 1}</td>
                {task.fields.map((f) => {
                  const value = e[f.key] ?? "";
                  return (
                    <td key={f.key} className="max-w-[260px] whitespace-pre-line px-3 py-2 text-xs leading-relaxed">
                      {f.type === "url" && /^https?:\/\//i.test(value) ? (
                        <a href={value} target="_blank" rel="noopener noreferrer" className="break-all text-primary underline-offset-2 hover:underline">
                          {value}
                        </a>
                      ) : (
                        value || <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-2 border-t border-border/60 px-4 py-3 sm:flex-row sm:items-end">
        <label className="block min-w-0 flex-1">
          <span className="mb-1 block text-xs font-semibold">Review note (the person sees it on the task)</span>
          <Textarea dir="auto" rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. أضف مصدر السعر للمنافس التاني" />
        </label>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={busy || note === (s.adminNote ?? "")}
          onClick={() => review({ adminNote: note }, "Note saved")}
        >
          <Save className="size-3.5" /> Save note
        </Button>
      </footer>
    </section>
  );
}
