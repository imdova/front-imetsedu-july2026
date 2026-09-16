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
import {
  JOURNEY_VERSION,
  LESSON_META,
  LESSON_TYPES,
  newModuleId,
  type LessonType,
  type ModuleId,
  type OrientationModule,
} from "@/features/orientation/lib/course-map";
import {
  lessonContentFields,
  moduleCheckFields,
  settingsFields,
  taskConfigFields,
  type EditLang,
} from "@/features/orientation/lib/editor-specs";
import {
  COMPETITOR_ANALYSIS_LESSON,
  DEFAULT_ORIENTATION_LESSONS,
  LESSON_IDS,
  blankTask,
  competitorAnalysisTask,
  isModuleLesson,
  type LessonTask,
  type ModuleCheck,
  newCustomLessonId,
  resolveOrientation,
  sortLessonsByModule,
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
    lockedUntilEarlier: false,
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
  // Module checks are generated from `moduleChecks`, never saved as lessons.
  const [lessons, setLessons] = React.useState<OrientationLesson[]>(() => initial.lessons.filter((l) => l.kind !== "check"));
  const [modules, setModules] = React.useState<OrientationModule[]>(initial.modules);
  const [openCheck, setOpenCheck] = React.useState<string | null>(null);
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

  // Lessons always read in journey order: grouped by module, modules in their order.
  const ordered = React.useMemo(() => sortLessonsByModule(lessons, modules), [lessons, modules]);
  const lessonIndex = Math.max(0, ordered.findIndex((l) => l.id === activeId));
  const lesson = ordered[lessonIndex];
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

  /** Up/down within a module; past the module's edge it joins the neighbouring module. */
  const moveLesson = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= ordered.length) return;
    const next = [...ordered];
    if (next[i].moduleId !== next[j].moduleId) next[i] = { ...next[i], moduleId: next[j].moduleId };
    else [next[i], next[j]] = [next[j], next[i]];
    setLessons(next);
    touch();
  };

  const insertLesson = (created: OrientationLesson) => {
    // Right after the lesson being edited, so it lands where the admin is working.
    setLessons([...ordered.slice(0, lessonIndex + 1), created, ...ordered.slice(lessonIndex + 1)]);
    setActiveId(created.id);
    touch();
  };

  /* modules */
  const addModule = () => {
    setModules((all) => [...all, { id: newModuleId(), title: { en: "New module", ar: "وحدة جديدة" } }]);
    touch();
  };

  const renameModule = (id: string, lang: EditLang, value: string) => {
    setModules((all) => all.map((m) => (m.id === id ? { ...m, title: { ...m.title, [lang]: value } } : m)));
    touch();
  };

  const moveModule = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= modules.length) return;
    const next = [...modules];
    [next[i], next[j]] = [next[j], next[i]];
    setModules(next);
    touch();
  };

  const deleteModule = async (id: string) => {
    if (modules.length <= 1) {
      toast.error("The training needs at least one module.");
      return;
    }
    const i = modules.findIndex((m) => m.id === id);
    const target = modules[i === 0 ? 1 : i - 1];
    const count = lessons.filter((l) => l.moduleId === id).length;
    const ok = await confirm({
      title: `Delete module “${modules[i].title.en}”?`,
      description: count
        ? `Its ${count} lesson${count === 1 ? "" : "s"} move to “${target.title.en}” — no lesson is deleted. Takes effect when you save.`
        : "It has no lessons. Takes effect when you save.",
      confirmText: "Delete module",
      variant: "destructive",
    });
    if (!ok) return;
    setModules((all) => all.filter((m) => m.id !== id));
    setLessons((all) => all.map((l) => (l.moduleId === id ? { ...l, moduleId: target.id } : l)));
    touch();
  };

  const restoreBuiltIn = (id: string) => {
    const found = DEFAULT_ORIENTATION_LESSONS.find((d) => d.id === id);
    if (!found) return;
    const home = LESSON_META[found.slug]?.moduleId;
    // Its default module may have been deleted; then it joins the last one.
    const def = modules.some((m) => m.id === home) ? found : { ...found, moduleId: modules[modules.length - 1].id };
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
    if (modules.some((m) => !m.title.en.trim() || !m.title.ar.trim())) {
      toast.error("Every module needs a title in English and Arabic.");
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
      for (const [moduleId, check] of Object.entries(copy.moduleChecks ?? {})) {
        const n = modules.findIndex((m) => m.id === moduleId) + 1;
        if (n === 0) continue;
        const bad = check.questions.findIndex((q) =>
          q.kind === "safe"
            ? !q.message.trim() || (q.correct !== 0 && q.correct !== 1)
            : !q.prompt.trim() || q.options.filter((o) => o.trim()).length < 2 || q.correct < 0 || q.correct >= q.options.filter((o) => o.trim()).length,
        );
        if (bad >= 0) {
          if (lang !== (label === "Arabic" ? "ar" : "en")) setLang(label === "Arabic" ? "ar" : "en");
          setOpenCheck(moduleId);
          toast.error(`Module ${n} check, question ${bad + 1} (${label}) is incomplete: it needs its question or message, answers, and a correct answer that exists.`);
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
      lessons: ordered,
      // `knownLessons` records which built-in lessons existed at this save, so a
      // lesson added to the app later still appears, while one removed here stays removed.
      content: {
        ...content,
        modules: modules.map((m) => ({ id: m.id, title: { en: m.title.en.trim(), ar: m.title.ar.trim() } })),
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
    setLessons(def.lessons.filter((l) => l.kind !== "check"));
    setModules(def.modules);
    setContent(def.content);
    setContentEn(def.contentEn);
    setActiveId(def.lessons[0].id);
    setDirty(false);
    setIsCustomised(false);
    setSavedAt(null);
    toast.success("Back to the original training.");
  };

  const moduleTitle = (id: ModuleId) => {
    const i = modules.findIndex((m) => m.id === id);
    return i >= 0 ? `${i + 1} · ${ar ? modules[i].title.ar : modules[i].title.en}` : id;
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
            {ordered.map((l, i) => {
              const active = l.id === lesson?.id;
              const showModule = i === 0 || ordered[i - 1].moduleId !== l.moduleId;
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
                  options={modules.map((m, i) => ({ value: m.id, label: `${i + 1} · ${m.title.en}` }))}
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
              <label className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
                <span>
                  <span className="block text-xs font-semibold">Locked until the earlier modules are done</span>
                  <span className="block text-[11px] text-muted-foreground">Like the knowledge check: opens once every lesson in the modules before it is complete</span>
                </span>
                <Switch checked={lesson.lockedUntilEarlier} onCheckedChange={(v) => updateLesson({ lockedUntilEarlier: v })} />
              </label>
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

            {/* Modules */}
            <Card title={`Modules (${modules.length})`} hint="Titles in both languages · deleting a module moves its lessons, it never deletes them">
              <ol className="space-y-2">
                {modules.map((m, i) => {
                  const count = lessons.filter((l) => l.moduleId === m.id).length;
                  const check = editedContent.moduleChecks?.[m.id];
                  const questions = check?.questions.length ?? 0;
                  return (
                    <li key={m.id} className="rounded-xl border border-border/70 p-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-xs font-bold">{i + 1}</span>
                      <Input
                        dir="ltr"
                        value={m.title.en}
                        placeholder="Title (English)"
                        onChange={(e) => renameModule(m.id, "en", e.target.value)}
                        className={cn("h-8 min-w-[10rem] flex-1", !m.title.en.trim() && "border-destructive")}
                      />
                      <Input
                        dir="rtl"
                        value={m.title.ar}
                        placeholder="العنوان بالعربي"
                        onChange={(e) => renameModule(m.id, "ar", e.target.value)}
                        className={cn("h-8 min-w-[10rem] flex-1", !m.title.ar.trim() && "border-destructive")}
                      />
                      <span className="w-20 text-xs text-muted-foreground">
                        {count} lesson{count === 1 ? "" : "s"}
                      </span>
                      <Button type="button" size="icon" variant="ghost" className="size-8" disabled={i === 0} onClick={() => moveModule(i, -1)} title="Move up">
                        <ArrowUp className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8"
                        disabled={i === modules.length - 1}
                        onClick={() => moveModule(i, 1)}
                        title="Move down"
                      >
                        <ArrowDown className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                        disabled={modules.length <= 1}
                        onClick={() => deleteModule(m.id)}
                        title="Delete module"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border/60 pt-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={openCheck === m.id ? "secondary" : "outline"}
                        className="h-8 gap-1.5"
                        aria-expanded={openCheck === m.id}
                        onClick={() => setOpenCheck(openCheck === m.id ? null : m.id)}
                      >
                        <ClipboardList className="size-3.5" />
                        Module check · {questions} question{questions === 1 ? "" : "s"} ({ar ? "Arabic" : "English"})
                      </Button>
                      <span className="text-[11px] text-muted-foreground">
                        {questions ? "Shown at the end of this module; passing it completes the module." : "No questions — no check for this module."}
                      </span>
                    </div>
                    {openCheck === m.id && (
                      <div className="mt-3 rounded-xl bg-muted/40 p-3">
                        <FieldsEditor
                          key={`${m.id}-${lang}`}
                          fields={moduleCheckFields}
                          value={(check ?? { passPercent: 70, questions: [] }) as unknown as Record<string, unknown>}
                          onChange={(next) => {
                            const update = (cur: SalesOrientationContent): SalesOrientationContent => ({
                              ...cur,
                              moduleChecks: { ...(cur.moduleChecks ?? {}), [m.id]: next as unknown as ModuleCheck },
                            });
                            if (ar) setContent(update);
                            else setContentEn(update);
                            touch();
                          }}
                        />
                      </div>
                    )}
                    </li>
                  );
                })}
              </ol>
              <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={addModule}>
                <Plus className="size-3.5" /> Add module
              </Button>
              <p className="text-[11px] text-muted-foreground">
                Put lessons into a module with each lesson&apos;s <b>Module</b> setting, or move a lesson past the edge of its module in the list.
              </p>
            </Card>

            {/* Training-wide settings */}
            <Card title="Training settings" hint="Shared by every lesson">
              <TextField
                label={`Suggested pace · ${ar ? "Arabic" : "English"}`}
                hint="Leave empty for the default wording — update it when the modules change"
                value={editedContent.pace ?? ""}
                dir={ar ? "rtl" : "ltr"}
                onChange={(v) => {
                  if (ar) setContent((cur) => ({ ...cur, pace: v }));
                  else setContentEn((cur) => ({ ...cur, pace: v }));
                  touch();
                }}
              />
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
