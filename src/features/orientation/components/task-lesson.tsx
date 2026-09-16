"use client";

import * as React from "react";
import { CheckCircle2, Clock, Flag, Loader2, MessageSquareText, Plus, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { OrientationTaskAttachment, OrientationTaskSubmissionDto } from "@/lib/dal/orientation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LocalTask, LocalTaskField } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { track } from "@/features/orientation/lib/track";
import { RichText, type GateProps } from "./lesson-parts";
import { TaskAttachments } from "./task-attachments";

type Entry = Record<string, string>;

/** Yes/No answers are stored in Arabic (the values existing answers already use), whatever the display language. */
const YES = "أيوه";
const NO = "لأ";

/**
 * A task lesson — the field task. The learner fills the task's form once per
 * programme (e.g. one competitor analysis for each course), attaches files or
 * voice notes, saves drafts, and sends each programme to the team lead.
 *
 * Every programme sent is a gate step; the lesson completes when all are sent.
 * What was sent stays editable; sending again goes back for review.
 * Attachments save the moment they're added.
 */
export function TaskLesson({
  lessonId,
  body,
  task,
  mark,
}: {
  lessonId: string;
  body: string;
  task: LocalTask;
} & GateProps) {
  const { t, locale } = useOrientationT();
  const [loading, setLoading] = React.useState(true);
  const [subs, setSubs] = React.useState<Record<string, OrientationTaskSubmissionDto>>({});
  const [entries, setEntries] = React.useState<Record<string, Entry[]>>({});
  const [attachments, setAttachments] = React.useState<Record<string, OrientationTaskAttachment[]>>({});
  const [program, setProgram] = React.useState(task.programs[0]?.slug ?? "");
  const [saving, setSaving] = React.useState<"draft" | "submit" | "attachments" | null>(null);

  React.useEffect(() => {
    let alive = true;
    void (async () => {
      const res = await dal.orientation.fetchMyTaskSubmissions(lessonId);
      if (!alive) return;
      const map: Record<string, OrientationTaskSubmissionDto> = {};
      if (res.ok) for (const s of res.data) map[s.programSlug] = s;
      else toast.error(t("task.loadFailed", { error: res.error }));
      setSubs(map);
      setEntries(Object.fromEntries(task.programs.map((p) => [p.slug, map[p.slug]?.entries?.length ? map[p.slug].entries : [{}]])));
      setAttachments(Object.fromEntries(task.programs.map((p) => [p.slug, map[p.slug]?.attachments ?? []])));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // The task definition only changes when an admin saves; reload per lesson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  // Programmes already sent count towards the gate (answers sent before gates existed included).
  React.useEffect(() => {
    for (const p of task.programs) if (subs[p.slug] && subs[p.slug].status !== "draft") mark(p.slug);
  }, [subs, task.programs, mark]);

  const current = task.programs.find((p) => p.slug === program) ?? task.programs[0];
  if (!current) return null;
  const rows = entries[current.slug] ?? [{}];
  const files = attachments[current.slug] ?? [];
  const sub = subs[current.slug];
  const sent = !!sub && sub.status !== "draft";
  const sentCount = task.programs.filter((p) => subs[p.slug] && subs[p.slug].status !== "draft").length;
  const dateFmt = (iso: string) =>
    new Date(iso).toLocaleDateString(locale === "ar" ? "ar-EG-u-nu-latn" : "en-GB", { day: "numeric", month: "long" });

  const setRows = (next: Entry[]) => setEntries((all) => ({ ...all, [current.slug]: next }));
  const setValue = (i: number, key: string, value: string) => setRows(rows.map((row, j) => (j === i ? { ...row, [key]: value } : row)));

  const save = async (submit: boolean) => {
    if (submit) {
      const filled = rows.filter((r) => Object.values(r).some((v) => v.trim()));
      if (filled.length < task.minEntries) {
        toast.error(t("task.minEntries", { n: num(task.minEntries), entry: task.entryLabel }));
        return;
      }
      for (const [i, row] of filled.entries()) {
        const missing = task.fields.find((f) => f.required && !(row[f.key] ?? "").trim());
        if (missing) {
          toast.error(t("task.required", { entry: task.entryLabel, i: num(i + 1), field: missing.label }));
          return;
        }
      }
    }
    setSaving(submit ? "submit" : "draft");
    const res = await dal.orientation.saveMyTaskSubmission(lessonId, current.slug, { entries: rows, attachments: files, submit });
    setSaving(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSubs((all) => ({ ...all, [current.slug]: res.data }));
    if (submit) {
      toast.success(t("task.sentToast", { program: current.name }));
      track("orientation_task_sent", { program: current.slug });
    } else {
      toast.success(t("task.draftToast"));
    }
  };

  /** Attachments persist immediately; the answer's status is left as it is. */
  const saveAttachments = async (next: OrientationTaskAttachment[]): Promise<boolean> => {
    const slug = current.slug;
    const previous = attachments[slug] ?? [];
    setAttachments((all) => ({ ...all, [slug]: next }));
    setSaving("attachments");
    const res = await dal.orientation.saveMyTaskSubmission(lessonId, slug, { entries: entries[slug] ?? [{}], attachments: next, submit: false });
    setSaving(null);
    if (!res.ok) {
      setAttachments((all) => ({ ...all, [slug]: previous }));
      toast.error(res.error);
      return false;
    }
    setSubs((all) => ({ ...all, [slug]: res.data }));
    return true;
  };

  return (
    <div className="space-y-5">
      {body.trim() && (
        <div className="space-y-2 rounded-2xl bg-muted/50 p-4">
          <p className="flex items-center gap-1.5 text-sm font-bold">
            <Flag className="size-4" />
            {t("task.rules")}
          </p>
          <RichText body={body} />
        </div>
      )}

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-bold text-muted-foreground">{t("task.program")}</p>
              <span className="text-xs text-muted-foreground tabular-nums">{t("task.sentCount", { x: num(sentCount), y: num(task.programs.length) })}</span>
            </div>
            <div className="flex gap-1 overflow-x-auto border-b border-border/70" role="tablist">
              {task.programs.map((p) => {
                const s = subs[p.slug];
                const isSent = s && s.status !== "draft";
                return (
                  <button
                    key={p.slug}
                    type="button"
                    role="tab"
                    aria-selected={p.slug === current.slug}
                    onClick={() => setProgram(p.slug)}
                    className={cn(
                      "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors",
                      p.slug === current.slug ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {isSent && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                    {p.name}
                  </button>
                );
              })}
            </div>
          </div>

          {sub && (
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl p-3 text-sm",
                sub.status === "reviewed" ? "bg-emerald-500/[0.09]" : sent ? "bg-emerald-500/[0.07]" : "bg-muted/60",
              )}
              role="status"
            >
              <span className="inline-flex items-center gap-1.5 font-semibold">
                {sub.status === "draft" ? <Clock className="size-4" /> : <CheckCircle2 className="size-4 text-emerald-600" />}
                {sub.status === "reviewed" ? t("task.reviewedStatus") : sent ? t("task.sentStatus") : t("task.draftStatus")}
              </span>
              {sub.submittedAt && <span className="text-xs text-muted-foreground">{t("task.lastSent", { date: dateFmt(sub.submittedAt) })}</span>}
            </div>
          )}

          {sub?.adminNote && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-500/[0.09] p-3 text-sm leading-relaxed ring-1 ring-amber-500/20">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <span>
                <b className="font-semibold">{t("task.reviewNote")} </b>
                <span dir="auto">{sub.adminNote}</span>
              </span>
            </p>
          )}

          <div className="space-y-3">
            {rows.map((row, i) => (
              <article key={i} className="rounded-2xl border border-border/70 p-4">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="min-w-0 truncate text-sm font-bold">
                    {task.entryLabel} {num(i + 1)}
                    {row[task.fields[0]?.key] && (
                      <span className="ms-2 font-normal text-muted-foreground" dir="auto">
                        — {row[task.fields[0].key]}
                      </span>
                    )}
                  </h4>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={rows.length <= 1}
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                    title={t("task.remove")}
                    aria-label={t("task.remove")}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {task.fields.map((f) => (
                    <FieldInput key={f.key} field={f} value={row[f.key] ?? ""} onChange={(v) => setValue(i, f.key, v)} />
                  ))}
                </div>
              </article>
            ))}
          </div>

          <Button type="button" variant="outline" className="gap-1.5" onClick={() => setRows([...rows, {}])} disabled={rows.length >= 50}>
            <Plus className="size-4" />
            {t("task.add", { entry: task.entryLabel })}
          </Button>

          <TaskAttachments
            key={current.slug}
            items={files}
            allowFiles={task.allowFiles}
            allowVoice={task.allowVoice}
            disabled={saving === "draft" || saving === "submit"}
            onChange={saveAttachments}
          />

          <div className="flex flex-wrap items-center justify-end gap-2">
            {!sent && (
              <Button type="button" variant="ghost" className="gap-1.5" onClick={() => save(false)} disabled={!!saving}>
                {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {t("task.saveDraft")}
              </Button>
            )}
            <Button type="button" className="gap-1.5" onClick={() => save(true)} disabled={!!saving}>
              {saving === "submit" ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:-scale-x-100" />}
              {sent ? t("task.update") : t("task.send")}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function FieldInput({ field, value, onChange }: { field: LocalTaskField; value: string; onChange: (v: string) => void }) {
  const { t } = useOrientationT();
  const wide = field.type === "textarea";
  const id = React.useId();
  return (
    <div className={cn("block", wide && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-xs font-semibold">
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </span>
        {field.hint && <span className="text-[11px] text-muted-foreground">{field.hint}</span>}
      </label>
      {field.type === "textarea" ? (
        <Textarea id={id} dir="auto" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "yesno" ? (
        <span className="flex gap-2" role="group" aria-labelledby={id}>
          {[
            { stored: YES, label: t("task.yes") },
            { stored: NO, label: t("task.no") },
          ].map((option) => (
            <button
              key={option.stored}
              id={option.stored === YES ? id : undefined}
              type="button"
              aria-pressed={value === option.stored}
              onClick={() => onChange(value === option.stored ? "" : option.stored)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition-colors",
                value === option.stored ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border hover:ring-primary/40",
              )}
            >
              {option.label}
            </button>
          ))}
        </span>
      ) : field.type === "select" ? (
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("task.choose")}</option>
          {field.options.map((o, i) => (
            <option key={o} value={o}>
              {field.optionLabels[i] ?? o}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={id}
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          dir={field.type === "url" || field.type === "number" ? "ltr" : "auto"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === "url" ? "https://" : undefined}
        />
      )}
    </div>
  );
}
