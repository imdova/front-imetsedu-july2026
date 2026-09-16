"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ClipboardList,
  Eye,
  FileText,
  Film,
  Languages,
  Loader2,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConfirm } from "@/hooks/use-confirm";
import { FieldsEditor } from "@/features/orientation/components/structured-fields";
import { VideoFrame } from "@/features/orientation/components/lesson-videos";
import { JOURNEY_VERSION, LESSON_TYPES, MODULES, type LessonType, type ModuleId } from "@/features/orientation/lib/course-map";
import { lessonContentFields, settingsFields, taskConfigFields, type EditLang } from "@/features/orientation/lib/editor-specs";
import {
  COMPETITOR_ANALYSIS_LESSON,
  DEFAULT_ORIENTATION_LESSONS,
  LESSON_IDS,
  blankTask,
  competitorAnalysisTask,
  isModuleLesson,
  type LessonTask,
  newCustomLessonId,
  resolveOrientation,
  youTubeId,
  type OrientationLesson,
  type OrientationVideo,
  type ResolvedOrientation,
  type SalesOrientation as SalesOrientationContent,
} from "@/features/orientation/lib/sales-orientation";

const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : null;

/** A new admin-written lesson (or task), placed in the module the admin is working in. */
function newLesson(kind: "custom" | "task", moduleId: ModuleId, template?: "competitors" | "blank"): OrientationLesson {
  const id = newCustomLessonId();
  const base: OrientationLesson = {
    id,
    kind,
    slug: id,
    short: kind === "task" ? "مهمة جديدة" : "درس جديد",
    en: kind === "task" ? "New task" : "New lesson",
    heading: kind === "task" ? "مهمة جديدة" : "درس جديد",
    intro: "",
    body: "",
    videos: [],
    moduleId,
    type: kind === "task" ? "task" : "read",
    minutes: kind === "task" ? 30 : 5,
    isNew: false,
    titleAr: kind === "task" ? "مهمة جديدة" : "درس جديد",
    titleEn: kind === "task" ? "New task" : "New lesson",
    introEn: "",
    bodyEn: "",
    outcomeAr: "",
    outcomeEn: "",
    gateAr: "",
    gateEn: "",
    gateRequired: 0,
    takeawaysAr: [],
    takeawaysEn: [],
  };
  if (kind === "custom") return base;
  if (template === "competitors") {
    return {
      ...base,
      ...COMPETITOR_ANALYSIS_LESSON,
      titleAr: "مهمة: تحليل المنافسين",
      titleEn: "Field task: competitor analysis",
      task: competitorAnalysisTask(),
    };
  }
  return { ...base, task: blankTask() };
}

/**
 * Sales Orientation editor.
 *
 * Starts from the training as it is today — nothing is removed unless an admin
 * removes it. Lessons can be edited, reordered, removed and added: built-in
 * lessons keep their interactive exercise (removing one only takes it out of
 * the training; its content stays saved and it can be restored), and custom
 * lessons are text plus YouTube videos.
 *
 * Every text exists in Arabic and English: the language switch picks which copy
 * the fields edit. Journey settings (module, type, minutes) are shared.
 * Everything is saved together.
 */
export function OrientationEditor({
  initial,
  customised,
  updatedAt,
  courses,
}: {
  initial: ResolvedOrientation;
  /** A saved copy exists (otherwise the shipped training is showing). */
  customised: boolean;
  updatedAt: string | null;
  courses: { slug: string; title: string }[];
}) {
  const { confirm, Confirmation } = useConfirm();
  const [lessons, setLessons] = React.useState<OrientationLesson[]>(initial.lessons);
  const [content, setContent] = React.useState<SalesOrientationContent>(initial.content);
  const [contentEn, setContentEn] = React.useState<SalesOrientationContent>(initial.contentEn);
  const [lang, setLang] = React.useState<EditLang>("ar");
  const [activeId, setActiveId] = React.useState(initial.lessons[0]?.id ?? "");
  const [dirty, setDirty] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [isCustomised, setIsCustomised] = React.useState(customised);
  const [savedAt, setSavedAt] = React.useState(updatedAt);

  // Unsaved edits survive an accidental tab close only if the browser asks first.
  React.useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const lessonIndex = Math.max(0, lessons.findIndex((l) => l.id === activeId));
  const lesson = lessons[lessonIndex];
  const courseOptions = React.useMemo(() => courses.map((c) => ({ value: c.slug, label: c.title })), [courses]);
  const contentFields = React.useMemo(
    () => (lesson && isModuleLesson(lesson.id) ? lessonContentFields(lesson.id, courseOptions, lang) : []),
    [lesson, courseOptions, lang],
  );
  const removedBuiltIns = DEFAULT_ORIENTATION_LESSONS.filter((d) => !lessons.some((l) => l.id === d.id));
  const taskFields = React.useMemo(() => taskConfigFields(courseOptions), [courseOptions]);
  const editedContent = lang === "ar" ? content : contentEn;
  const ar = lang === "ar";

  const touch = () => setDirty(true);

  const updateLesson = (patch: Partial<OrientationLesson>) => {
    setLessons((all) => all.map((l) => (l.id === lesson.id ? { ...l, ...patch } : l)));
    touch();
  };

  const moveLesson = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= lessons.length) return;
    const next = [...lessons];
    [next[i], next[j]] = [next[j], next[i]];
    setLessons(next);
    touch();
  };

  const insertLesson = (created: OrientationLesson) => {
    // Right after the lesson being edited, so it lands where the admin is working.
    setLessons((all) => [...all.slice(0, lessonIndex + 1), created, ...all.slice(lessonIndex + 1)]);
    setActiveId(created.id);
    touch();
  };

  const restoreBuiltIn = (id: string) => {
    const def = DEFAULT_ORIENTATION_LESSONS.find((d) => d.id === id);
    if (!def) return;
    setLessons((all) => [...all, def]);
    setActiveId(id);
    touch();
    toast.success(`“${def.titleEn}” is back — its content was kept.`);
  };

  const removeLesson = async (target: OrientationLesson) => {
    if (lessons.length <= 1) {
      toast.error("The training needs at least one lesson.");
      return;
    }
    const ok = await confirm({
      title: `Remove “${target.titleEn}”?`,
      description:
        target.kind === "module"
          ? "It will be taken out of the training. Its content is kept, and you can bring it back from Add lesson → Restore."
          : "This lesson's text and videos will be deleted when you save.",
      confirmText: "Remove",
      variant: "destructive",
    });
    if (!ok) return;
    const i = lessons.findIndex((l) => l.id === target.id);
    const next = lessons.filter((l) => l.id !== target.id);
    setLessons(next);
    setActiveId(next[Math.min(i, next.length - 1)]?.id ?? "");
    touch();
  };

  const save = async () => {
    if (lessons.length === 0) {
      toast.error("The training needs at least one lesson.");
      return;
    }
    for (const l of lessons) {
      if (!l.short.trim() || !l.heading.trim() || !l.titleAr.trim() || !l.titleEn.trim()) {
        setActiveId(l.id);
        toast.error("Every lesson needs a title in both languages (and its original menu title and heading).");
        return;
      }
    }
    for (const l of lessons) {
      if (l.kind !== "task" || !l.task) continue;
      const problem =
        l.task.programs.length === 0
          ? "needs at least one programme"
          : l.task.programs.some((p) => !p.slug)
            ? "has a programme without a course"
            : l.task.fields.length === 0
              ? "needs at least one form field"
              : l.task.fields.some((f) => !f.label.trim())
                ? "has a form field without an Arabic label"
                : l.task.fields.some((f) => f.type === "select" && f.options.filter((o) => o.trim()).length === 0)
                  ? "has a dropdown field without choices"
                  : null;
      if (problem) {
        setActiveId(l.id);
        toast.error(`Task “${l.titleEn}” ${problem}.`);
        return;
      }
    }
    const badProgrammeVideo = content.programmes.find((p) => (p.videos ?? []).some((v) => !youTubeId(v?.url ?? "")));
    if (badProgrammeVideo) {
      setActiveId("programs");
      setLang("ar");
      toast.error(`A video for “${badProgrammeVideo.name}” isn't a valid YouTube link — fix it or delete it first.`);
      return;
    }
    const badVideo = lessons.find((l) => l.videos.some((v) => !youTubeId(v.url)));
    if (badVideo) {
      setActiveId(badVideo.id);
      toast.error("A video link isn't a valid YouTube link — fix it or delete that video first.");
      return;
    }
    for (const [copy, label] of [
      [content, "Arabic"],
      [contentEn, "English"],
    ] as const) {
      if (lessons.some((l) => l.id === "practice")) {
        const badScenario = copy.scenarios.findIndex((s) => s.options.filter((o) => o.correct).length !== 1);
        if (badScenario >= 0) {
          setActiveId("practice");
          toast.error(`Practice scenario ${badScenario + 1} (${label}) needs exactly one correct reply.`);
          return;
        }
      }
      if (lessons.some((l) => l.id === "quiz")) {
        const badQuestion = copy.quiz.questions.findIndex(
          (q) => q.options.length < 2 || !Number.isInteger(q.correct) || q.correct < 0 || q.correct >= q.options.length,
        );
        if (badQuestion >= 0) {
          setActiveId("quiz");
          toast.error(`Quiz question ${badQuestion + 1} (${label}) needs at least two options and a correct option that exists.`);
          return;
        }
      }
    }
    setSaving(true);
    const res = await dal.orientation.saveSalesOrientation({
      lessons,
      // `knownLessons` records which built-in lessons existed at this save, so a
      // lesson added to the app later still appears, while one removed here stays removed.
      content: {
        ...content,
        en: contentEn,
        knownLessons: [...LESSON_IDS],
        journeyVersion: JOURNEY_VERSION,
      } as unknown as Record<string, unknown>,
    });
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setDirty(false);
    setIsCustomised(true);
    setSavedAt(res.data.updatedAt ?? new Date().toISOString());
    toast.success("Training saved — the team sees it on their next visit.");
  };

  const reset = async () => {
    const ok = await confirm({
      title: "Undo all edits?",
      description:
        "The training goes back to how it was shipped: your edits, added lessons and videos are discarded. Staff progress is not affected. This can't be undone.",
      confirmText: "Undo all edits",
      variant: "destructive",
    });
    if (!ok) return;
    const res = await dal.orientation.resetSalesOrientation();
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    const def = resolveOrientation(null);
    setLessons(def.lessons);
    setContent(def.content);
    setContentEn(def.contentEn);
    setActiveId(def.lessons[0].id);
    setDirty(false);
    setIsCustomised(false);
    setSavedAt(null);
    toast.success("Back to the original training.");
  };

  const moduleTitle = (id: ModuleId) => {
    const i = MODULES.findIndex((m) => m.id === id);
    return i >= 0 ? `${i + 1} · ${MODULES[i].title.en}` : id;
  };

  return (
    <div className="space-y-5">
      {Confirmation}

      {/* Toolbar */}
      <div className="sticky top-16 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-background/90 px-4 py-3 shadow-sm backdrop-blur">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/admin/orientation">
            <ArrowLeft className="size-4 rtl:-scale-x-100" /> Sales Orientation
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="font-heading text-lg font-bold leading-tight">Edit Sales Orientation</h1>
          <p className="text-xs text-muted-foreground">
            {dirty
              ? "Unsaved changes"
              : isCustomised
                ? `Saved ${fmtDate(savedAt) ?? ""}`
                : "The current training, ready to edit — nothing changes for the team until you save"}
          </p>
        </div>
        <div className="ms-auto flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted p-1" role="group" aria-label="Editing language">
            <Languages className="ms-1.5 size-3.5 text-muted-foreground" />
            {(["ar", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                aria-pressed={lang === l}
                onClick={() => setLang(l)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold transition-colors",
                  lang === l ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l === "ar" ? "Arabic" : "English"}
              </button>
            ))}
          </div>
          {isCustomised && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={reset} disabled={saving}>
              <RotateCcw className="size-3.5" /> Undo all edits
            </Button>
          )}
          {lesson && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/admin/orientation#${lesson.slug}`} locale={lang} target="_blank">
                <Eye className="size-3.5" /> Preview
              </Link>
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[19rem_1fr]">
        {/* Lessons */}
        <nav className="rounded-2xl border border-border/70 bg-card p-2 lg:sticky lg:top-36">
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Lessons ({lessons.length})
          </p>
          <ol className="space-y-0.5">
            {lessons.map((l, i) => {
              const active = l.id === lesson?.id;
              const showModule = i === 0 || lessons[i - 1].moduleId !== l.moduleId;
              return (
                <li key={l.id} className="group">
                  {showModule && (
                    <p className="px-2 pb-0.5 pt-2 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/80">
                      Module {moduleTitle(l.moduleId)}
                    </p>
                  )}
                  <div className={cn("flex items-center gap-1 rounded-lg pe-1 transition-colors", active ? "bg-primary/10" : "hover:bg-muted")}>
                    <button
                      type="button"
                      onClick={() => setActiveId(l.id)}
                      className={cn("flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-start text-sm", active && "font-medium text-primary")}
                    >
                      <span
                        className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-md text-[10px] font-bold",
                          active ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {i + 1}
                      </span>
                      <span dir="auto" className="min-w-0 flex-1 truncate">
                        {ar ? l.titleAr : l.titleEn}
                      </span>
                      {l.kind === "custom" && <FileText className="size-3 shrink-0 text-muted-foreground" aria-label="Custom lesson" />}
                      {l.kind === "task" && <ClipboardList className="size-3 shrink-0 text-muted-foreground" aria-label="Task" />}
                      {l.videos.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Film className="size-3" />
                          {l.videos.length}
                        </span>
                      )}
                    </button>
                    <span className={cn("flex shrink-0 items-center", !active && "opacity-0 focus-within:opacity-100 group-hover:opacity-100")}>
                      <Button type="button" size="icon" variant="ghost" className="size-6" disabled={i === 0} onClick={() => moveLesson(i, -1)} title="Move up">
                        <ArrowUp className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6"
                        disabled={i === lessons.length - 1}
                        onClick={() => moveLesson(i, 1)}
                        title="Move down"
                      >
                        <ArrowDown className="size-3" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-6 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={lessons.length <= 1}
                        onClick={() => removeLesson(l)}
                        title="Remove lesson"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </span>
                  </div>
                </li>
              );
            })}
          </ol>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="mt-2 w-full gap-1.5">
                <Plus className="size-3.5" /> Add lesson
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <DropdownMenuItem onClick={() => insertLesson(newLesson("custom", lesson?.moduleId ?? "m1"))} className="gap-2">
                <FileText className="size-4" />
                <span>
                  <span className="block text-sm">New lesson</span>
                  <span className="block text-[11px] text-muted-foreground">Your own text + YouTube videos</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertLesson(newLesson("task", lesson?.moduleId ?? "m5", "competitors"))} className="gap-2">
                <ClipboardList className="size-4" />
                <span>
                  <span className="block text-sm">Task: competitor analysis</span>
                  <span className="block text-[11px] text-muted-foreground">CPHQ, CIC, Quality &amp; IC diplomas — ready fields</span>
                </span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => insertLesson(newLesson("task", lesson?.moduleId ?? "m5", "blank"))} className="gap-2">
                <ClipboardList className="size-4" />
                <span>
                  <span className="block text-sm">New task</span>
                  <span className="block text-[11px] text-muted-foreground">Your own form, filled per programme</span>
                </span>
              </DropdownMenuItem>
              {removedBuiltIns.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">Restore a removed lesson</DropdownMenuLabel>
                  {removedBuiltIns.map((d) => (
                    <DropdownMenuItem key={d.id} onClick={() => restoreBuiltIn(d.id)} className="gap-2">
                      <Undo2 className="size-4" />
                      <span className="truncate">{d.titleEn}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {lesson ? (
          <div className="min-w-0 space-y-5">
            {/* Journey settings — shared by both languages */}
            <Card title={`Lesson ${lessonIndex + 1} · journey`} hint={lesson.kind === "custom" ? "Custom lesson" : lesson.kind === "task" ? "Task" : "Built-in lesson"}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <SelectField
                  label="Module"
                  value={lesson.moduleId}
                  options={MODULES.map((m, i) => ({ value: m.id, label: `${i + 1} · ${m.title.en}` }))}
                  onChange={(v) => updateLesson({ moduleId: v as ModuleId })}
                />
                <SelectField
                  label="Type"
                  value={lesson.type}
                  options={LESSON_TYPES.map((x) => ({ value: x, label: x[0].toUpperCase() + x.slice(1) }))}
                  onChange={(v) => updateLesson({ type: v as LessonType })}
                />
                <NumberField label="Minutes" value={lesson.minutes} min={1} max={600} onChange={(v) => updateLesson({ minutes: v })} />
                <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
                  <span className="text-xs font-semibold">“New” badge</span>
                  <Switch checked={lesson.isNew} onCheckedChange={(v) => updateLesson({ isNew: v })} />
                </label>
              </div>
              {lesson.kind === "custom" && (
                <NumberField
                  label="Videos to watch before it completes"
                  hint="0 = reading to the end of the lesson completes it"
                  value={lesson.gateRequired}
                  min={0}
                  max={20}
                  onChange={(v) => updateLesson({ gateRequired: v })}
                />
              )}
              <p className="text-[11px] text-muted-foreground">
                Anchor: <code dir="ltr">#{lesson.slug}</code>
                {lesson.slug !== lesson.id && (
                  <>
                    {" "}
                    (also <code dir="ltr">#{lesson.id}</code>)
                  </>
                )}
              </p>
            </Card>

            {/* Lesson text — the language being edited */}
            <Card title={`Lesson text · ${ar ? "Arabic" : "English"}`} hint="Switch language at the top">
              <TextField
                label="Title"
                value={ar ? lesson.titleAr : lesson.titleEn}
                dir={ar ? "rtl" : "ltr"}
                onChange={(v) => updateLesson(ar ? { titleAr: v } : { titleEn: v })}
              />
              <AreaField
                label="By the end you can…"
                hint="Finishes the sentence, e.g. “quote the fee of any program”"
                rows={2}
                value={ar ? lesson.outcomeAr : lesson.outcomeEn}
                dir={ar ? "rtl" : "ltr"}
                onChange={(v) => updateLesson(ar ? { outcomeAr: v } : { outcomeEn: v })}
              />
              <TextField
                label="To finish (gate)"
                hint="e.g. “open all 4 rules”"
                value={ar ? lesson.gateAr : lesson.gateEn}
                dir={ar ? "rtl" : "ltr"}
                onChange={(v) => updateLesson(ar ? { gateAr: v } : { gateEn: v })}
              />
              <AreaField
                label="Introduction"
                rows={3}
                value={ar ? lesson.intro : lesson.introEn}
                dir={ar ? "rtl" : "ltr"}
                onChange={(v) => updateLesson(ar ? { intro: v } : { introEn: v })}
              />
              {(lesson.kind === "custom" || lesson.kind === "task") && (
                <AreaField
                  label={lesson.kind === "task" ? "Rules / instructions" : "Lesson text"}
                  hint="Blank line = new paragraph · start lines with “- ” for bullets"
                  rows={9}
                  value={ar ? lesson.body : lesson.bodyEn}
                  dir={ar ? "rtl" : "ltr"}
                  onChange={(v) => updateLesson(ar ? { body: v } : { bodyEn: v })}
                />
              )}
              {lesson.kind === "custom" && (
                <AreaField
                  label="“Remember” box"
                  hint="One point per line"
                  rows={3}
                  value={(ar ? lesson.takeawaysAr : lesson.takeawaysEn).join("\n")}
                  dir={ar ? "rtl" : "ltr"}
                  onChange={(v) => {
                    const lines = v.split("\n");
                    updateLesson(ar ? { takeawaysAr: lines } : { takeawaysEn: lines });
                  }}
                  onBlur={(v) => {
                    const lines = v.split("\n").map((s) => s.trim()).filter(Boolean);
                    updateLesson(ar ? { takeawaysAr: lines } : { takeawaysEn: lines });
                  }}
                />
              )}
              <details className="rounded-xl border border-border/70 p-3">
                <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">Original titles (kept from the first version of this lesson)</summary>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <TextField label="Menu title" value={lesson.short} onChange={(v) => updateLesson({ short: v })} />
                  <TextField label="English menu title" value={lesson.en} dir="ltr" onChange={(v) => updateLesson({ en: v })} />
                </div>
                <div className="mt-3">
                  <TextField label="Heading" value={lesson.heading} onChange={(v) => updateLesson({ heading: v })} />
                </div>
              </details>
            </Card>

            {/* Task form */}
            {lesson.kind === "task" && lesson.task && (
              <Card title="Task form" hint="Staff fill this once per programme; answers appear in Task submissions">
                <FieldsEditor
                  fields={taskFields}
                  value={lesson.task as unknown as Record<string, unknown>}
                  onChange={(next) => updateLesson({ task: next as unknown as LessonTask })}
                />
              </Card>
            )}

            {/* Videos */}
            <VideosCard key={lesson.id} videos={lesson.videos} onChange={(videos) => updateLesson({ videos })} />

            {/* Built-in lesson content */}
            {lesson.kind === "module" && (
              <Card
                title={`Lesson content · ${ar ? "Arabic" : "English"}`}
                hint={lesson.id === "drill" ? undefined : "Add, edit, delete and reorder items — keep both languages in the same order"}
              >
                {contentFields.length === 0 ? (
                  <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                    The rapid drill draws random objections from the <b>Objection method &amp; bank</b> lesson — edit them there.
                  </p>
                ) : (
                  <FieldsEditor
                    key={`${lesson.id}-${lang}`}
                    fields={contentFields}
                    value={editedContent as unknown as Record<string, unknown>}
                    onChange={(next) => {
                      if (ar) setContent(next as unknown as SalesOrientationContent);
                      else setContentEn(next as unknown as SalesOrientationContent);
                      touch();
                    }}
                  />
                )}
              </Card>
            )}

            {/* Training-wide settings */}
            <Card title="Training settings" hint="Shared by every lesson and both languages">
              <FieldsEditor
                fields={settingsFields}
                value={content as unknown as Record<string, unknown>}
                onChange={(next) => {
                  setContent(next as unknown as SalesOrientationContent);
                  touch();
                }}
              />
            </Card>
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">Add a lesson to get started.</p>
        )}
      </div>
    </div>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3 rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-heading text-sm font-bold">{title}</h2>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ label, hint }: { label: string; hint?: string }) {
  return (
    <span className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3">
      <span className="text-xs font-semibold">{label}</span>
      {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
    </span>
  );
}

function TextField({
  label,
  hint,
  value,
  onChange,
  dir = "auto",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />
      <Input dir={dir} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function AreaField({
  label,
  hint,
  value,
  onChange,
  onBlur,
  rows,
  dir = "auto",
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: (v: string) => void;
  rows: number;
  dir?: "ltr" | "rtl" | "auto";
}) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />
      <Textarea
        dir={dir}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
        className="leading-relaxed"
      />
    </label>
  );
}

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} hint={hint} />
      <Input
        type="number"
        dir="ltr"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Math.round(Number(e.target.value));
          onChange(Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : min);
        }}
        className="w-32"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <FieldLabel label={label} />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** A lesson's YouTube videos: paste a link, title it in both languages, reorder, preview, remove. */
function VideosCard({
  videos,
  onChange,
}: {
  videos: OrientationVideo[];
  onChange: (videos: OrientationVideo[]) => void;
}) {
  const [url, setUrl] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [preview, setPreview] = React.useState<string | null>(null);

  const add = () => {
    const clean = url.trim();
    if (!youTubeId(clean) || !/^https:\/\//i.test(clean)) {
      toast.error("Paste a YouTube link, e.g. https://youtu.be/… or https://www.youtube.com/watch?v=…");
      return;
    }
    onChange([...videos, { id: newId(), title: title.trim(), titleAr: "", provider: "youtube", url: clean, duration: "" }]);
    setUrl("");
    setTitle("");
  };

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= videos.length) return;
    const next = [...videos];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  const patch = (id: string, p: Partial<OrientationVideo>) => onChange(videos.map((x) => (x.id === id ? { ...x, ...p } : x)));

  return (
    <Card title={`YouTube videos (${videos.length})`} hint="Watched videos count towards video lessons, in this order">
      {videos.length > 0 && (
        <ul className="space-y-2">
          {videos.map((v, i) => (
            <li key={v.id} className="space-y-2 rounded-xl border border-border/70 p-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  dir="ltr"
                  value={v.title}
                  placeholder="Title (English)"
                  onChange={(e) => patch(v.id, { title: e.target.value })}
                  className="h-8 min-w-[10rem] flex-1"
                />
                <Input
                  dir="rtl"
                  value={v.titleAr ?? ""}
                  placeholder="العنوان بالعربي"
                  onChange={(e) => patch(v.id, { titleAr: e.target.value })}
                  className="h-8 min-w-[10rem] flex-1"
                />
                <Input
                  dir="ltr"
                  value={v.duration ?? ""}
                  placeholder="5:12"
                  onChange={(e) => patch(v.id, { duration: e.target.value })}
                  className="h-8 w-20"
                  title="Running time (optional)"
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  dir="ltr"
                  value={v.url}
                  onChange={(e) => patch(v.id, { url: e.target.value })}
                  className={cn("h-8 min-w-[14rem] flex-1 text-xs", !youTubeId(v.url) && "border-destructive")}
                  title="YouTube link"
                />
                <Button type="button" size="sm" variant="ghost" className="h-8 gap-1" onClick={() => setPreview(preview === v.id ? null : v.id)}>
                  <Eye className="size-3.5" /> {preview === v.id ? "Hide" : "Preview"}
                </Button>
                <Button type="button" size="icon" variant="ghost" className="size-8" disabled={i === 0} onClick={() => move(i, -1)} title="Move up">
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8"
                  disabled={i === videos.length - 1}
                  onClick={() => move(i, 1)}
                  title="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => onChange(videos.filter((x) => x.id !== v.id))}
                  title="Delete video"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
              {!youTubeId(v.url) && <p className="text-[11px] text-destructive">Not a valid YouTube link — it won&apos;t be saved.</p>}
              {preview === v.id && youTubeId(v.url) && (
                <div className="max-w-xl">
                  <VideoFrame video={{ id: v.id, url: v.url, title: v.title }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="space-y-2 rounded-xl bg-muted/40 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            dir="ltr"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="https://www.youtube.com/watch?v=…  or  https://youtu.be/…"
            className="sm:flex-[3]"
          />
          <Input dir="ltr" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)" className="sm:flex-[2]" />
          <Button type="button" className="gap-1.5" onClick={add} disabled={!url.trim()}>
            <Plus className="size-4" /> Add video
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Upload the recording to YouTube first — <b>Unlisted</b> keeps it off search while still playing here — then paste its link.
        </p>
      </div>
    </Card>
  );
}
