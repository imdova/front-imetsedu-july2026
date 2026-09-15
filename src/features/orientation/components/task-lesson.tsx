"use client";

import * as React from "react";
import { Check, CheckCircle2, Clock, Loader2, MessageSquareText, Plus, Save, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { OrientationTaskAttachment, OrientationTaskSubmissionDto } from "@/lib/dal/orientation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LessonTask, TaskField } from "@/features/orientation/lib/sales-orientation";
import { TaskAttachments } from "./task-attachments";

type Entry = Record<string, string>;

const nf = new Intl.NumberFormat("ar-EG");

const STATUS_LABEL = {
  draft: { text: "مسودة", className: "bg-muted text-muted-foreground", icon: Clock },
  submitted: { text: "اتبعتت", className: "bg-primary/10 text-primary", icon: Send },
  reviewed: { text: "اتراجعت", className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400", icon: CheckCircle2 },
} as const;

/**
 * A task lesson — the learner fills the task's form once per programme (e.g.
 * one competitor analysis for each course), attaches files or voice notes,
 * saves drafts, and submits.
 *
 * The lesson completes when every programme has been submitted. What was
 * submitted stays editable; submitting again sends it back for review.
 * Attachments save the moment they're added, so a recorded voice note is sent
 * without any extra step.
 */
export function TaskLesson({
  lessonId,
  body,
  task,
  onComplete,
}: {
  lessonId: string;
  body: string;
  task: LessonTask;
  onComplete: () => void;
}) {
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
      else toast.error(`ما قدرناش نحمّل إجاباتك: ${res.error}`);
      setSubs(map);
      setEntries(
        Object.fromEntries(
          task.programs.map((p) => [p.slug, map[p.slug]?.entries?.length ? map[p.slug].entries : [{}]]),
        ),
      );
      setAttachments(Object.fromEntries(task.programs.map((p) => [p.slug, map[p.slug]?.attachments ?? []])));
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
    // The task definition only changes when an admin saves; reload per lesson.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lessonId]);

  const programKeys = task.programs.map((p) => p.slug).join("|");
  React.useEffect(() => {
    const keys = programKeys.split("|").filter(Boolean);
    if (keys.length > 0 && keys.every((k) => subs[k] && subs[k].status !== "draft")) onComplete();
  }, [subs, programKeys, onComplete]);

  const current = task.programs.find((p) => p.slug === program) ?? task.programs[0];
  if (!current) return null;
  const rows = entries[current.slug] ?? [{}];
  const files = attachments[current.slug] ?? [];
  const sub = subs[current.slug];
  const submittedCount = task.programs.filter((p) => subs[p.slug] && subs[p.slug].status !== "draft").length;

  const setRows = (next: Entry[]) => setEntries((all) => ({ ...all, [current.slug]: next }));
  const setValue = (i: number, key: string, value: string) =>
    setRows(rows.map((row, j) => (j === i ? { ...row, [key]: value } : row)));

  const save = async (submit: boolean) => {
    if (submit) {
      const filled = rows.filter((r) => Object.values(r).some((v) => v.trim()));
      if (filled.length < task.minEntries) {
        toast.error(`لازم تضيف ${nf.format(task.minEntries)} ${task.entryLabel} على الأقل قبل الإرسال.`);
        return;
      }
      for (const [i, row] of filled.entries()) {
        const missing = task.fields.find((f) => f.required && !(row[f.key] ?? "").trim());
        if (missing) {
          toast.error(`${task.entryLabel} ${nf.format(i + 1)}: «${missing.label}» مطلوب.`);
          return;
        }
      }
    }
    setSaving(submit ? "submit" : "draft");
    const res = await dal.orientation.saveMyTaskSubmission(lessonId, current.slug, {
      entries: rows,
      attachments: files,
      submit,
    });
    setSaving(null);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSubs((all) => ({ ...all, [current.slug]: res.data }));
    toast.success(submit ? `اتبعت تحليل ${current.name}` : "اتحفظت كمسودة");
  };

  /** Attachments persist immediately; the answer's status is left as it is. */
  const saveAttachments = async (next: OrientationTaskAttachment[]): Promise<boolean> => {
    const slug = current.slug;
    const previous = attachments[slug] ?? [];
    setAttachments((all) => ({ ...all, [slug]: next }));
    setSaving("attachments");
    const res = await dal.orientation.saveMyTaskSubmission(lessonId, slug, {
      entries: entries[slug] ?? [{}],
      attachments: next,
      submit: false,
    });
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
      {body.trim() && <Instructions body={body} />}

      {loading ? (
        <div className="grid place-items-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1 rounded-xl bg-muted p-1" role="tablist">
              {task.programs.map((p) => {
                const s = subs[p.slug];
                const sent = s && s.status !== "draft";
                return (
                  <button
                    key={p.slug}
                    type="button"
                    role="tab"
                    aria-selected={p.slug === current.slug}
                    onClick={() => setProgram(p.slug)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      p.slug === current.slug ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {sent && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                    {p.name}
                  </button>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground">
              اتبعت {nf.format(submittedCount)} من {nf.format(task.programs.length)}
            </span>
          </div>

          {sub && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <StatusBadge status={sub.status} />
              {sub.submittedAt && (
                <span className="text-muted-foreground">
                  آخر إرسال: {new Date(sub.submittedAt).toLocaleDateString("ar-EG", { day: "numeric", month: "long" })}
                </span>
              )}
            </div>
          )}

          {sub?.adminNote && (
            <p className="flex items-start gap-2 rounded-xl bg-amber-500/[0.08] p-3 text-sm leading-relaxed ring-1 ring-amber-500/20">
              <MessageSquareText className="mt-0.5 size-4 shrink-0 text-amber-700" />
              <span>
                <b className="font-semibold">ملاحظة المراجعة: </b>
                {sub.adminNote}
              </span>
            </p>
          )}

          <div className="space-y-3">
            {rows.map((row, i) => (
              <article key={i} className="rounded-2xl border border-border/70 bg-card p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-bold">
                    {task.entryLabel} {nf.format(i + 1)}
                    {row[task.fields[0]?.key] && <span className="ms-2 font-normal text-muted-foreground">— {row[task.fields[0].key]}</span>}
                  </h4>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={rows.length <= 1}
                    onClick={() => setRows(rows.filter((_, j) => j !== i))}
                    title="امسح"
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
            أضف {task.entryLabel}
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
            {(!sub || sub.status === "draft") && (
              <Button type="button" variant="ghost" className="gap-1.5" onClick={() => save(false)} disabled={!!saving}>
                {saving === "draft" ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                احفظ مسودة
              </Button>
            )}
            <Button type="button" className="gap-1.5" onClick={() => save(true)} disabled={!!saving}>
              {saving === "submit" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : sub && sub.status !== "draft" ? (
                <Check className="size-4" />
              ) : (
                <Send className="size-4" />
              )}
              {sub && sub.status !== "draft" ? "حدّث الإرسال" : `ابعت تحليل ${current.name}`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: OrientationTaskSubmissionDto["status"] }) {
  const s = STATUS_LABEL[status];
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 font-semibold", s.className)}>
      <s.icon className="size-3.5" />
      {s.text}
    </span>
  );
}

function FieldInput({ field, value, onChange }: { field: TaskField; value: string; onChange: (v: string) => void }) {
  const wide = field.type === "textarea";
  return (
    <label className={cn("block", wide && "sm:col-span-2")}>
      <span className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2">
        <span className="text-xs font-semibold">
          {field.label}
          {field.required && <span className="text-destructive"> *</span>}
        </span>
        {field.hint && <span className="text-[11px] text-muted-foreground">{field.hint}</span>}
      </span>
      {field.type === "textarea" ? (
        <Textarea dir="auto" rows={3} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "yesno" ? (
        <span className="flex gap-2">
          {["أيوه", "لأ"].map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={value === option}
              onClick={() => onChange(value === option ? "" : option)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition-colors",
                value === option ? "bg-primary text-primary-foreground ring-primary" : "bg-background ring-border hover:ring-primary/40",
              )}
            >
              {option}
            </button>
          ))}
        </span>
      ) : field.type === "select" ? (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">اختار…</option>
          {field.options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      ) : (
        <Input
          type={field.type === "number" ? "number" : field.type === "url" ? "url" : "text"}
          dir={field.type === "url" || field.type === "number" ? "ltr" : "auto"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === "url" ? "https://" : undefined}
        />
      )}
    </label>
  );
}

function Instructions({ body }: { body: string }) {
  const blocks = body
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean);
  return (
    <div className="space-y-3 rounded-2xl bg-muted/40 p-4">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());
        return lines.every((l) => /^[-•]\s+/.test(l)) ? (
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
    </div>
  );
}
