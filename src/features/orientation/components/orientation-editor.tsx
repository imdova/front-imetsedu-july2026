"use client";

import * as React from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  FileText,
  Film,
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
import { lessonContentFields } from "@/features/orientation/lib/editor-specs";
import {
  DEFAULT_ORIENTATION_LESSONS,
  isModuleLesson,
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

/**
 * Sales Orientation editor.
 *
 * Starts from the training as it is today — nothing is removed unless an admin
 * removes it. Lessons can be edited, reordered, removed and added: built-in
 * lessons keep their interactive exercise (removing one only takes it out of
 * the training; its content stays saved and it can be restored), and custom
 * lessons are text plus YouTube videos. Everything is saved together.
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
    () => (lesson && isModuleLesson(lesson.id) ? lessonContentFields(lesson.id, courseOptions) : []),
    [lesson, courseOptions],
  );
  const removedBuiltIns = DEFAULT_ORIENTATION_LESSONS.filter((d) => !lessons.some((l) => l.id === d.id));

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

  const addCustomLesson = () => {
    const id = newCustomLessonId();
    const created: OrientationLesson = {
      id,
      kind: "custom",
      short: "درس جديد",
      en: "",
      heading: "درس جديد",
      intro: "",
      body: "",
      videos: [],
    };
    // Right after the lesson being edited, so it lands where the admin is working.
    setLessons((all) => [...all.slice(0, lessonIndex + 1), created, ...all.slice(lessonIndex + 1)]);
    setActiveId(id);
    touch();
  };

  const restoreBuiltIn = (id: string) => {
    const def = DEFAULT_ORIENTATION_LESSONS.find((d) => d.id === id);
    if (!def) return;
    setLessons((all) => [...all, def]);
    setActiveId(id);
    touch();
    toast.success(`“${def.short}” is back — its content was kept.`);
  };

  const removeLesson = async (target: OrientationLesson) => {
    if (lessons.length <= 1) {
      toast.error("The training needs at least one lesson.");
      return;
    }
    const ok = await confirm({
      title: `Remove “${target.short}”?`,
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
      if (!l.short.trim() || !l.heading.trim()) {
        setActiveId(l.id);
        toast.error("Every lesson needs a menu title and a heading.");
        return;
      }
    }
    const badVideo = lessons.find((l) => l.videos.some((v) => !youTubeId(v.url)));
    if (badVideo) {
      setActiveId(badVideo.id);
      toast.error("A video link isn't a valid YouTube link — fix it or delete that video first.");
      return;
    }
    if (lessons.some((l) => l.id === "practice")) {
      const badScenario = content.scenarios.findIndex((s) => s.options.filter((o) => o.correct).length !== 1);
      if (badScenario >= 0) {
        setActiveId("practice");
        toast.error(`Practice scenario ${badScenario + 1} needs exactly one correct reply.`);
        return;
      }
    }
    setSaving(true);
    const res = await dal.orientation.saveSalesOrientation({
      lessons,
      content: content as unknown as Record<string, unknown>,
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
    setActiveId(def.lessons[0].id);
    setDirty(false);
    setIsCustomised(false);
    setSavedAt(null);
    toast.success("Back to the original training.");
  };

  return (
    <div className="space-y-5">
      {Confirmation}

      {/* Toolbar */}
      <div className="sticky top-16 z-20 -mx-1 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-background/90 px-4 py-3 shadow-sm backdrop-blur">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/admin/crm/office?tab=orientation">
            <ArrowLeft className="size-4" /> Office
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
        <div className="ms-auto flex flex-wrap gap-2">
          {isCustomised && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={reset} disabled={saving}>
              <RotateCcw className="size-3.5" /> Undo all edits
            </Button>
          )}
          {lesson && (
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={`/admin/crm/office?tab=orientation#${lesson.id}`} target="_blank">
                <Eye className="size-3.5" /> Preview
              </Link>
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || !dirty}>
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save
          </Button>
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[18rem_1fr]">
        {/* Lessons */}
        <nav className="rounded-2xl border border-border/70 bg-card p-2 lg:sticky lg:top-36">
          <p className="px-2 pb-1.5 pt-1 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Lessons ({lessons.length})
          </p>
          <ol className="space-y-0.5">
            {lessons.map((l, i) => {
              const active = l.id === lesson?.id;
              return (
                <li key={l.id} className="group">
                  <div
                    className={cn(
                      "flex items-center gap-1 rounded-lg pe-1 transition-colors",
                      active ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveId(l.id)}
                      className={cn(
                        "flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-start text-sm",
                        active && "font-medium text-primary",
                      )}
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
                        {l.short}
                      </span>
                      {l.kind === "custom" && <FileText className="size-3 shrink-0 text-muted-foreground" aria-label="Custom lesson" />}
                      {l.videos.length > 0 && (
                        <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                          <Film className="size-3" />
                          {l.videos.length}
                        </span>
                      )}
                    </button>
                    <span className={cn("flex shrink-0 items-center", !active && "opacity-0 group-hover:opacity-100 focus-within:opacity-100")}>
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
              <DropdownMenuItem onClick={addCustomLesson} className="gap-2">
                <FileText className="size-4" />
                <span>
                  <span className="block text-sm">New lesson</span>
                  <span className="block text-[11px] text-muted-foreground">Your own text + YouTube videos</span>
                </span>
              </DropdownMenuItem>
              {removedBuiltIns.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[11px] text-muted-foreground">Restore a removed lesson</DropdownMenuLabel>
                  {removedBuiltIns.map((d) => (
                    <DropdownMenuItem key={d.id} onClick={() => restoreBuiltIn(d.id)} className="gap-2">
                      <Undo2 className="size-4" />
                      <span dir="auto" className="truncate">
                        {d.short}
                      </span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {lesson ? (
          <div className="min-w-0 space-y-5">
            {/* Lesson details */}
            <Card
              title={`Lesson ${lessonIndex + 1} · details`}
              hint={lesson.kind === "custom" ? "Custom lesson" : lesson.en || "Built-in lesson"}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField label="Menu title" value={lesson.short} onChange={(v) => updateLesson({ short: v })} />
                <TextField label="English label" value={lesson.en} ltr onChange={(v) => updateLesson({ en: v })} />
              </div>
              <TextField label="Heading" value={lesson.heading} onChange={(v) => updateLesson({ heading: v })} />
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold">Introduction</span>
                <Textarea dir="auto" rows={3} value={lesson.intro} onChange={(e) => updateLesson({ intro: e.target.value })} />
              </label>
              {lesson.kind === "custom" && (
                <label className="block">
                  <span className="mb-1.5 flex flex-wrap items-baseline justify-between gap-2">
                    <span className="text-xs font-semibold">Lesson text</span>
                    <span className="text-[11px] text-muted-foreground">Blank line = new paragraph · start lines with “- ” for bullets</span>
                  </span>
                  <Textarea
                    dir="auto"
                    rows={10}
                    value={lesson.body}
                    onChange={(e) => updateLesson({ body: e.target.value })}
                    className="leading-relaxed"
                  />
                </label>
              )}
            </Card>

            {/* Videos */}
            <VideosCard key={lesson.id} videos={lesson.videos} onChange={(videos) => updateLesson({ videos })} />

            {/* Built-in lesson content */}
            {lesson.kind === "module" && (
              <Card title="Lesson content" hint={lesson.id === "drill" ? undefined : "Add, edit, delete and reorder items"}>
                {contentFields.length === 0 ? (
                  <p className="rounded-xl bg-muted/50 p-4 text-sm text-muted-foreground">
                    The rapid drill draws random objections from the <b>Objection bank</b> lesson — edit them there.
                  </p>
                ) : (
                  <FieldsEditor
                    fields={contentFields}
                    value={content as unknown as Record<string, unknown>}
                    onChange={(next) => {
                      setContent(next as unknown as SalesOrientationContent);
                      touch();
                    }}
                  />
                )}
              </Card>
            )}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
            Add a lesson to get started.
          </p>
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

function TextField({
  label,
  value,
  onChange,
  ltr,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  ltr?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold">{label}</span>
      <Input dir={ltr ? "ltr" : "auto"} value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

/** A lesson's YouTube videos: paste a link, title it, reorder, preview, remove. */
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
    onChange([...videos, { id: newId(), title: title.trim(), provider: "youtube", url: clean }]);
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

  return (
    <Card title={`YouTube videos (${videos.length})`} hint="Shown above the lesson, in this order">
      {videos.length > 0 && (
        <ul className="space-y-2">
          {videos.map((v, i) => (
            <li key={v.id} className="rounded-xl border border-border/70 p-2.5">
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  dir="auto"
                  value={v.title}
                  placeholder="Video title"
                  onChange={(e) => onChange(videos.map((x) => (x.id === v.id ? { ...x, title: e.target.value } : x)))}
                  className="h-8 min-w-[12rem] flex-1"
                />
                <Input
                  dir="ltr"
                  value={v.url}
                  onChange={(e) => onChange(videos.map((x) => (x.id === v.id ? { ...x, url: e.target.value } : x)))}
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
              {!youTubeId(v.url) && <p className="mt-1 text-[11px] text-destructive">Not a valid YouTube link — it won&apos;t be saved.</p>}
              {preview === v.id && youTubeId(v.url) && (
                <div className="mt-2 max-w-xl">
                  <VideoFrame video={v} />
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
          <Input
            dir="auto"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title (optional)"
            className="sm:flex-[2]"
          />
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
