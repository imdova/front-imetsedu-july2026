"use client";

import * as React from "react";
import {
  Plus, Trash2, Pencil, Loader2, GraduationCap, ExternalLink, Wand2,
  ChevronDown, Eye, EyeOff, Video, ShieldCheck, ListChecks, Lock, Layers,
  GripVertical, ChevronUp,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { FreeProgram, FreeLecture, FreeModule, VideoProvider } from "@/lib/dal/free-courses";
import type { QuizRow, QuizCategoryOption } from "@/lib/dal/quizzes";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { SortableList } from "@/components/shared/sortable/sortable-list";
import type { DragHandleProps } from "@/components/shared/sortable/sortable-item";

/** Mirror of the backend slug rule so the DTO can't 400 on us. */
const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const EMPTY_PROGRAM = {
  titleEn: "", titleAr: "", slug: "", descriptionEn: "", descriptionAr: "",
  thumbnailUrl: "", seoTitle: "", seoDescription: "", quizId: "", isPublished: false,
};
const EMPTY_LECTURE = {
  titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "",
  videoProvider: "youtube" as VideoProvider, videoUrl: "", durationMinutes: "",
  resourceUrl: "", isPublished: true,
  kind: "lesson" as "lesson" | "quiz", quizId: "", moduleId: "",
};

export function FreeCoursesManager({ initial }: { initial: FreeProgram[] }) {
  const { confirm, Confirmation } = useConfirm();
  const [programs, setPrograms] = React.useState<FreeProgram[]>(initial);
  const [openId, setOpenId] = React.useState<string | null>(null);

  const [progOpen, setProgOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<FreeProgram | null>(null);
  const [pForm, setPForm] = React.useState(EMPTY_PROGRAM);
  const [saving, setSaving] = React.useState(false);
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [generating, setGenerating] = React.useState(false);

  // Quiz bank (for the category → quiz selector).
  const [quizCats, setQuizCats] = React.useState<QuizCategoryOption[]>([]);
  const [quizzes, setQuizzes] = React.useState<QuizRow[]>([]);
  const [quizCat, setQuizCat] = React.useState("");
  React.useEffect(() => {
    dal.quizzes.fetchQuizCategories().then((r) => { if (r.ok) setQuizCats(r.data); });
    dal.quizzes.fetchQuizzes().then((r) => { if (r.ok) setQuizzes(r.data); });
  }, []);

  /** Create a draft free program for each real published course (same title + image). */
  const generateFromCourses = async () => {
    setGenerating(true);
    const res = await dal.courses.fetchCourses();
    if (!res.ok) { setGenerating(false); toast.error(res.error); return; }
    const existing = new Set(programs.map((p) => p.slug));
    const toCreate = res.data.filter((c) => c.status === "published" && c.slug && !existing.has(slugify(c.slug)));
    if (toCreate.length === 0) { setGenerating(false); toast("Every course already has a free program"); return; }
    const created: FreeProgram[] = [];
    for (const c of toCreate) {
      const r = await dal.freeCourses.createFreeProgram({
        titleEn: c.titleEn,
        titleAr: c.titleAr || c.titleEn,
        slug: slugify(c.slug || c.titleEn),
        thumbnailUrl: c.thumbnailUrl || "",
        isPublished: false,
      });
      if (r.ok) created.push(r.data);
    }
    setPrograms((prev) => [...prev, ...created]);
    setGenerating(false);
    toast.success(`Created ${created.length} free program${created.length === 1 ? "" : "s"} from courses (as drafts)`);
  };

  const openCreate = () => {
    setEditing(null); setPForm(EMPTY_PROGRAM); setSlugTouched(false); setQuizCat(""); setProgOpen(true);
  };
  const openEdit = (p: FreeProgram) => {
    setEditing(p);
    setPForm({
      titleEn: p.titleEn, titleAr: p.titleAr, slug: p.slug,
      descriptionEn: p.descriptionEn, descriptionAr: p.descriptionAr,
      thumbnailUrl: p.thumbnailUrl, seoTitle: p.seoTitle,
      seoDescription: p.seoDescription, quizId: p.quizId, isPublished: p.isPublished,
    });
    setQuizCat(quizzes.find((q) => q.id === p.quizId)?.categoryId ?? "");
    setSlugTouched(true);
    setProgOpen(true);
  };

  const saveProgram = async () => {
    if (!pForm.titleEn.trim() || !pForm.titleAr.trim()) { toast.error("Both English and Arabic titles are required"); return; }
    const slug = slugify(pForm.slug || pForm.titleEn);
    if (!slug) { toast.error("Enter a valid slug"); return; }
    setSaving(true);
    const payload = { ...pForm, slug };
    const res = editing
      ? await dal.freeCourses.updateFreeProgram(editing.id, payload)
      : await dal.freeCourses.createFreeProgram(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setPrograms((prev) =>
      editing ? prev.map((x) => (x.id === res.data.id ? { ...res.data, lectures: x.lectures } : x)) : [...prev, res.data],
    );
    toast.success(editing ? "Program updated" : "Program created");
    setProgOpen(false);
  };

  const removeProgram = async (p: FreeProgram) => {
    if (!(await confirm({
      title: "Delete program",
      description: `“${p.titleEn}” and all its lectures will be deleted. This can't be undone.`,
      confirmText: "Delete", variant: "destructive",
    }))) return;
    const res = await dal.freeCourses.deleteFreeProgram(p.id);
    if (res.ok) { setPrograms((prev) => prev.filter((x) => x.id !== p.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  const togglePublish = async (p: FreeProgram) => {
    const res = await dal.freeCourses.updateFreeProgram(p.id, { isPublished: !p.isPublished });
    if (!res.ok) { toast.error(res.error); return; }
    setPrograms((prev) => prev.map((x) => (x.id === p.id ? { ...x, isPublished: res.data.isPublished } : x)));
    toast.success(res.data.isPublished ? "Published — now live" : "Unpublished — hidden from the public page");
  };

  const setLectures = (programId: string, fn: (l: FreeLecture[]) => FreeLecture[]) =>
    setPrograms((prev) => prev.map((p) => (p.id === programId ? { ...p, lectures: fn(p.lectures) } : p)));
  const setModules = (programId: string, fn: (m: FreeModule[]) => FreeModule[]) =>
    setPrograms((prev) => prev.map((p) => (p.id === programId ? { ...p, modules: fn(p.modules) } : p)));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {programs.length} {programs.length === 1 ? "program" : "programs"} ·{" "}
          {programs.filter((p) => p.isPublished).length} published
        </p>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-1.5" onClick={generateFromCourses} disabled={generating}>
            {generating ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
            {generating ? "Generating…" : "Generate from courses"}
          </Button>
          <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> New program</Button>
        </div>
      </div>

      {programs.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-16 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><GraduationCap className="size-7" /></span>
          <p className="font-medium">No free programs yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Create a program, add its lectures, then publish it — it appears on <code className="text-xs">/free-courses</code> immediately.
          </p>
          <Button variant="outline" className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> New program</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {programs.map((p) => (
            <ProgramRow
              key={p.id}
              program={p}
              expanded={openId === p.id}
              onToggle={() => setOpenId(openId === p.id ? null : p.id)}
              onEdit={() => openEdit(p)}
              onDelete={() => removeProgram(p)}
              onTogglePublish={() => togglePublish(p)}
              setLectures={(fn) => setLectures(p.id, fn)}
              setModules={(fn) => setModules(p.id, fn)}
              quizCats={quizCats}
              quizzes={quizzes}
              confirm={confirm}
            />
          ))}
        </div>
      )}

      {/* Program dialog */}
      <Dialog open={progOpen} onOpenChange={setProgOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit program" : "New free program"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title (English) <span className="text-destructive">*</span></Label>
                <Input
                  value={pForm.titleEn}
                  onChange={(e) => {
                    const titleEn = e.target.value;
                    setPForm((f) => ({ ...f, titleEn, slug: slugTouched ? f.slug : slugify(titleEn) }));
                  }}
                  placeholder="Hospital Management Basics"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Title (Arabic) <span className="text-destructive">*</span></Label>
                <Input dir="rtl" value={pForm.titleAr} onChange={(e) => setPForm((f) => ({ ...f, titleAr: e.target.value }))} placeholder="أساسيات إدارة المستشفيات" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Slug <span className="text-destructive">*</span></Label>
              <Input
                value={pForm.slug}
                onChange={(e) => { setSlugTouched(true); setPForm((f) => ({ ...f, slug: e.target.value })); }}
                onBlur={(e) => setPForm((f) => ({ ...f, slug: slugify(e.target.value) }))}
                placeholder="hospital-management-basics"
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">/free-courses/{pForm.slug || "…"}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Description (English)</Label>
                <Textarea rows={3} value={pForm.descriptionEn} onChange={(e) => setPForm((f) => ({ ...f, descriptionEn: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Description (Arabic)</Label>
                <Textarea rows={3} dir="rtl" value={pForm.descriptionAr} onChange={(e) => setPForm((f) => ({ ...f, descriptionAr: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Thumbnail</Label>
              <ImageUpload value={pForm.thumbnailUrl} onChange={(url) => setPForm((f) => ({ ...f, thumbnailUrl: url }))} />
            </div>

            {/* Quiz selector: category → quiz */}
            <div className="space-y-2 rounded-xl border border-border/70 p-3">
              <Label className="text-sm font-medium">Quiz (optional)</Label>
              <p className="text-xs text-muted-foreground">Shown after the lectures. Leave empty to use the built-in default quiz.</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Category</Label>
                  <Select value={quizCat || "none"} onValueChange={(v) => { setQuizCat(v === "none" ? "" : v); setPForm((f) => ({ ...f, quizId: "" })); }}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None (default) —</SelectItem>
                      {quizCats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quiz</Label>
                  <Select value={pForm.quizId || "none"} onValueChange={(v) => setPForm((f) => ({ ...f, quizId: v === "none" ? "" : v }))} disabled={!quizCat}>
                    <SelectTrigger><SelectValue placeholder={quizCat ? "Select quiz" : "Pick a category first"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— None —</SelectItem>
                      {quizzes.filter((q) => q.categoryId === quizCat).map((q) => (
                        <SelectItem key={q.id} value={q.id}>{q.titleEn || q.titleAr} · {q.questionsCount}Q</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <details className="rounded-xl border border-border/70 p-3">
              <summary className="cursor-pointer text-sm font-medium">SEO (optional)</summary>
              <div className="mt-3 space-y-3">
                <div className="space-y-1.5">
                  <Label>Meta title</Label>
                  <Input value={pForm.seoTitle} onChange={(e) => setPForm((f) => ({ ...f, seoTitle: e.target.value }))} placeholder="Falls back to the program title" />
                </div>
                <div className="space-y-1.5">
                  <Label>Meta description</Label>
                  <Textarea rows={2} value={pForm.seoDescription} onChange={(e) => setPForm((f) => ({ ...f, seoDescription: e.target.value }))} placeholder="Falls back to the description" />
                </div>
              </div>
            </details>

            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Only published programs appear on /free-courses.</p>
              </div>
              <Switch checked={pForm.isPublished} onCheckedChange={(v) => setPForm((f) => ({ ...f, isPublished: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProgOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveProgram} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

/* ─────────────────────────── Program row ─────────────────────────── */

function ProgramRow({
  program, expanded, onToggle, onEdit, onDelete, onTogglePublish, setLectures, setModules, quizCats, quizzes, confirm,
}: {
  program: FreeProgram;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  setLectures: (fn: (l: FreeLecture[]) => FreeLecture[]) => void;
  setModules: (fn: (m: FreeModule[]) => FreeModule[]) => void;
  quizCats: QuizCategoryOption[];
  quizzes: QuizRow[];
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [lecOpen, setLecOpen] = React.useState(false);
  const [editingLec, setEditingLec] = React.useState<FreeLecture | null>(null);
  const [form, setForm] = React.useState(EMPTY_LECTURE);
  const [quizCat, setQuizCat] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [modDlg, setModDlg] = React.useState<{ id?: string; titleEn: string; titleAr: string } | null>(null);
  const [modSaving, setModSaving] = React.useState(false);

  const openCreate = (kind: "lesson" | "quiz", moduleId: string) => {
    setEditingLec(null); setQuizCat(""); setForm({ ...EMPTY_LECTURE, kind, moduleId }); setLecOpen(true);
  };
  const openEdit = (l: FreeLecture) => {
    setEditingLec(l);
    setQuizCat(l.kind === "quiz" ? (quizzes.find((q) => q.id === l.quizId)?.categoryId ?? "") : "");
    setForm({
      titleEn: l.titleEn, titleAr: l.titleAr, descriptionEn: l.descriptionEn, descriptionAr: l.descriptionAr,
      videoProvider: l.videoProvider, videoUrl: l.videoUrl,
      durationMinutes: l.durationMinutes ? String(l.durationMinutes) : "",
      resourceUrl: l.resourceUrl, isPublished: l.isPublished,
      kind: l.kind, quizId: l.quizId, moduleId: l.moduleId,
    });
    setLecOpen(true);
  };

  const save = async () => {
    if (!form.titleEn.trim() || !form.titleAr.trim()) { toast.error("Both titles are required"); return; }
    setSaving(true);
    const inModule = program.lectures.filter((l) => l.moduleId === form.moduleId).length;
    const payload = {
      titleEn: form.titleEn, titleAr: form.titleAr, descriptionEn: form.descriptionEn, descriptionAr: form.descriptionAr,
      kind: form.kind, moduleId: form.moduleId || undefined,
      quizId: form.kind === "quiz" ? form.quizId : "",
      videoProvider: form.videoProvider, videoUrl: form.kind === "quiz" ? "" : form.videoUrl,
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 0,
      resourceUrl: form.resourceUrl, isPublished: form.isPublished,
      order: editingLec?.order ?? inModule,
    };
    const res = editingLec
      ? await dal.freeCourses.updateFreeLecture(editingLec.id, payload)
      : await dal.freeCourses.createFreeLecture(program.id, payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setLectures((prev) => (editingLec ? prev.map((x) => (x.id === res.data.id ? res.data : x)) : [...prev, res.data]));
    toast.success(editingLec ? "Saved" : "Added");
    setLecOpen(false);
  };

  const removeLecture = async (l: FreeLecture) => {
    if (!(await confirm({ title: `Delete ${l.kind}`, description: `“${l.titleEn}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.freeCourses.deleteFreeLecture(l.id);
    if (res.ok) { setLectures((prev) => prev.filter((x) => x.id !== l.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  /* ── Modules ── */
  const submitModule = async () => {
    const titleEn = modDlg?.titleEn.trim();
    if (!titleEn) return;
    setModSaving(true);
    const input = { titleEn, titleAr: modDlg?.titleAr?.trim() ?? "" };
    const res = modDlg?.id
      ? await dal.freeCourses.updateFreeModule(modDlg.id, input)
      : await dal.freeCourses.createFreeModule(program.id, { ...input, order: program.modules.length });
    setModSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setModules((prev) => (modDlg?.id ? prev.map((m) => (m.id === res.data.id ? res.data : m)) : [...prev, res.data]));
    toast.success(modDlg?.id ? "Module renamed" : "Module added");
    setModDlg(null);
  };
  const deleteModule = async (m: FreeModule) => {
    if (!(await confirm({ title: "Delete module", description: `“${m.titleEn}” and its lessons/quizzes will be deleted.`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.freeCourses.deleteFreeModule(m.id);
    if (res.ok) {
      setModules((prev) => prev.filter((x) => x.id !== m.id));
      setLectures((prev) => prev.filter((x) => x.moduleId !== m.id));
      toast.success("Module deleted");
    } else toast.error(res.error);
  };

  const itemsOf = (moduleId: string) => program.lectures.filter((l) => l.moduleId === moduleId).sort((a, b) => a.order - b.order);
  const ungrouped = program.lectures.filter((l) => !l.moduleId).sort((a, b) => a.order - b.order);

  /** Persist a new lesson/quiz order for a group: reindex by array position (optimistic + API). */
  const reorderItems = async (ordered: FreeLecture[]) => {
    const posById = new Map(ordered.map((l, i) => [l.id, i]));
    setLectures((prev) => prev.map((l) => (posById.has(l.id) ? { ...l, order: posById.get(l.id)! } : l)));
    const changed = ordered.map((l, i) => ({ l, i })).filter(({ l, i }) => l.order !== i);
    const results = await Promise.all(changed.map(({ l, i }) => dal.freeCourses.updateFreeLecture(l.id, { order: i })));
    if (results.some((r) => !r.ok)) toast.error("Couldn't save the new order — refresh and try again.");
  };
  /** Arrow move: shift the item at `index` by `dir` (-1 up / +1 down) within its group. */
  const moveItem = (list: FreeLecture[], index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= list.length) return;
    const ordered = [...list];
    [ordered[index], ordered[j]] = [ordered[j], ordered[index]];
    reorderItems(ordered);
  };
  const lockedCount = program.lectures.filter((l) => l.locked).length;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <button type="button" onClick={onToggle} className="grid size-8 shrink-0 place-items-center rounded-lg hover:bg-muted" aria-expanded={expanded}>
          <ChevronDown className={cn("size-4 transition-transform", expanded && "rotate-180")} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold">{program.titleEn}</p>
            <span className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
              program.isPublished ? "bg-success/10 text-success" : "bg-muted text-muted-foreground",
            )}>
              {program.isPublished ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
              {program.isPublished ? "Live" : "Draft"}
            </span>
          </div>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="font-mono">/free-courses/{program.slug}</span>
            <span>·</span>
            <span>{program.modules.length} {program.modules.length === 1 ? "module" : "modules"} · {program.lectures.length} items</span>
            {lockedCount > 0 && (
              <span className="text-amber-600 dark:text-amber-400">· {lockedCount} locked</span>
            )}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          {program.isPublished && (
            <Button asChild variant="ghost" size="icon" className="size-8" title="View live">
              <a href={`/free-courses/${program.slug}`} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></a>
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onTogglePublish}>{program.isPublished ? "Unpublish" : "Publish"}</Button>
          <Button variant="ghost" size="icon" className="size-8" title="Edit" onClick={onEdit}><Pencil className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8" title="Delete" onClick={onDelete}><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      </div>

      {expanded && (
        <div className="space-y-3 border-t border-border/60 bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Modules</p>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setModDlg({ titleEn: "", titleAr: "" })}><Plus className="size-3.5" /> Add module</Button>
          </div>

          {program.modules.length === 0 && ungrouped.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
              No modules yet. Add a module, then add lessons and quizzes inside it.
            </p>
          ) : (
            <div className="space-y-3">
              {program.modules.map((m) => {
                const items = itemsOf(m.id);
                return (
                  <div key={m.id} className="overflow-hidden rounded-xl border border-border/70 bg-card">
                    <div className="flex items-center gap-2 border-b border-border/60 px-3 py-2.5">
                      <Layers className="size-4 shrink-0 text-primary" />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{m.titleEn}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</span>
                      <Button variant="ghost" size="icon" className="size-7" title="Rename module" onClick={() => setModDlg({ id: m.id, titleEn: m.titleEn, titleAr: m.titleAr })}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-7" title="Delete module" onClick={() => deleteModule(m)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                    <div className="space-y-1.5 p-2">
                      {items.length === 0
                        ? <p className="px-2 py-2 text-center text-xs text-muted-foreground">No lessons or quizzes yet.</p>
                        : (
                          <SortableList
                            items={items}
                            onReorder={(next) => reorderItems(next)}
                            renderItem={(l, handle) => (
                              <ItemLine
                                l={l} index={items.findIndex((x) => x.id === l.id)} handle={handle}
                                onUp={() => moveItem(items, items.findIndex((x) => x.id === l.id), -1)}
                                onDown={() => moveItem(items, items.findIndex((x) => x.id === l.id), 1)}
                                isFirst={items[0]?.id === l.id} isLast={items[items.length - 1]?.id === l.id}
                                onEdit={() => openEdit(l)} onDelete={() => removeLecture(l)}
                              />
                            )}
                            className="space-y-1.5"
                          />
                        )}
                      <div className="flex gap-2 pt-1">
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openCreate("lesson", m.id)}><Video className="size-3.5" /> Add lesson</Button>
                        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => openCreate("quiz", m.id)}><ListChecks className="size-3.5" /> Add quiz</Button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {ungrouped.length > 0 && (
                <div className="overflow-hidden rounded-xl border border-dashed border-border/70 bg-card">
                  <div className="border-b border-border/60 px-3 py-2 text-xs font-semibold text-muted-foreground">Ungrouped (legacy)</div>
                  <div className="space-y-1.5 p-2">
                    <SortableList
                      items={ungrouped}
                      onReorder={(next) => reorderItems(next)}
                      renderItem={(l, handle) => (
                        <ItemLine
                          l={l} index={ungrouped.findIndex((x) => x.id === l.id)} handle={handle}
                          onUp={() => moveItem(ungrouped, ungrouped.findIndex((x) => x.id === l.id), -1)}
                          onDown={() => moveItem(ungrouped, ungrouped.findIndex((x) => x.id === l.id), 1)}
                          isFirst={ungrouped[0]?.id === l.id} isLast={ungrouped[ungrouped.length - 1]?.id === l.id}
                          onEdit={() => openEdit(l)} onDelete={() => removeLecture(l)}
                        />
                      )}
                      className="space-y-1.5"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Module add / rename dialog */}
      <Dialog open={!!modDlg} onOpenChange={(o) => !o && setModDlg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{modDlg?.id ? "Rename module" : "New module"}</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="space-y-1.5">
              <Label>Title (English) <span className="text-destructive">*</span></Label>
              <Input autoFocus value={modDlg?.titleEn ?? ""} onChange={(e) => setModDlg((d) => (d ? { ...d, titleEn: e.target.value } : d))} onKeyDown={(e) => e.key === "Enter" && submitModule()} placeholder="e.g. Module 1 — Foundations" />
            </div>
            <div className="space-y-1.5">
              <Label>Title (Arabic)</Label>
              <Input dir="rtl" value={modDlg?.titleAr ?? ""} onChange={(e) => setModDlg((d) => (d ? { ...d, titleAr: e.target.value } : d))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModDlg(null)} disabled={modSaving}>Cancel</Button>
            <Button onClick={submitModule} disabled={modSaving || !modDlg?.titleEn.trim()} className="gap-1.5">{modSaving && <Loader2 className="size-4 animate-spin" />}{modDlg?.id ? "Save" : "Add module"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lecture / quiz dialog */}
      <Dialog open={lecOpen} onOpenChange={setLecOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingLec ? "Edit" : "Add"} {form.kind === "quiz" ? "quiz" : "lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title (English) <span className="text-destructive">*</span></Label>
                <Input value={form.titleEn} onChange={(e) => setForm((f) => ({ ...f, titleEn: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Title (Arabic) <span className="text-destructive">*</span></Label>
                <Input dir="rtl" value={form.titleAr} onChange={(e) => setForm((f) => ({ ...f, titleAr: e.target.value }))} />
              </div>
            </div>

            {form.kind === "quiz" ? (
              /* Quiz: pick from the Quiz Bank (category → quiz). No video/quiz selected = locked. */
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Quiz category</Label>
                  <Select value={quizCat} onValueChange={(v) => { setQuizCat(v); setForm((f) => ({ ...f, quizId: "" })); }}>
                    <SelectTrigger><SelectValue placeholder="Choose a category" /></SelectTrigger>
                    <SelectContent position="popper">
                      {quizCats.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Quiz</Label>
                  <Select value={form.quizId} onValueChange={(v) => setForm((f) => ({ ...f, quizId: v }))} disabled={!quizCat}>
                    <SelectTrigger><SelectValue placeholder={quizCat ? "Choose a quiz" : "Pick a category first"} /></SelectTrigger>
                    <SelectContent position="popper">
                      {quizzes.filter((q) => q.categoryId === quizCat).map((q) => (
                        <SelectItem key={q.id} value={q.id}>{q.titleEn}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!form.quizId && <p className="text-[11px] text-amber-600 dark:text-amber-400">No quiz picked → shows as 🔒 locked publicly.</p>}
                </div>
              </div>
            ) : (
              /* Lesson: video source. No video = locked. */
              <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
                <div className="space-y-1.5">
                  <Label>Video source</Label>
                  <Select value={form.videoProvider} onValueChange={(v) => setForm((f) => ({ ...f, videoProvider: v as VideoProvider }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="youtube">YouTube</SelectItem>
                      <SelectItem value="vdocipher">VdoCipher</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{form.videoProvider === "vdocipher" ? "VdoCipher video ID" : "YouTube URL"}</Label>
                  <Input
                    value={form.videoUrl}
                    onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder={form.videoProvider === "vdocipher" ? "1a2b3c4d…" : "https://youtube.com/watch?v=…"}
                    className="font-mono text-sm"
                  />
                  {!form.videoUrl && <p className="text-[11px] text-amber-600 dark:text-amber-400">No video → shows as 🔒 locked publicly.</p>}
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Description (English)</Label>
                <Textarea rows={2} value={form.descriptionEn} onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Description (Arabic)</Label>
                <Textarea rows={2} dir="rtl" value={form.descriptionAr} onChange={(e) => setForm((f) => ({ ...f, descriptionAr: e.target.value }))} />
              </div>
            </div>

            {form.kind === "lesson" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Duration (minutes)</Label>
                  <Input type="number" min={0} value={form.durationMinutes} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))} placeholder="12" />
                </div>
                <div className="space-y-1.5">
                  <Label>Resource URL (optional)</Label>
                  <Input value={form.resourceUrl} onChange={(e) => setForm((f) => ({ ...f, resourceUrl: e.target.value }))} placeholder="Slides / PDF link" />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Unpublished items stay hidden from the public page.</p>
              </div>
              <Switch checked={form.isPublished} onCheckedChange={(v) => setForm((f) => ({ ...f, isPublished: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLecOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editingLec ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────────────────── Item line ─────────────────────────── */

function ItemLine({ l, index, handle, onUp, onDown, isFirst, isLast, onEdit, onDelete }: {
  l: FreeLecture; index: number;
  handle?: DragHandleProps; onUp?: () => void; onDown?: () => void; isFirst?: boolean; isLast?: boolean;
  onEdit: () => void; onDelete: () => void;
}) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border border-border/70 bg-background px-2 py-2", handle?.isDragging && "ring-2 ring-primary/40")}>
      {handle && (
        <button
          type="button" title="Drag to reorder"
          className="shrink-0 cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
          {...handle.attributes} {...(handle.listeners ?? {})}
        >
          <GripVertical className="size-4" />
        </button>
      )}
      {(onUp || onDown) && (
        <div className="flex shrink-0 flex-col">
          <button type="button" title="Move up" disabled={isFirst} onClick={onUp} className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"><ChevronUp className="size-3.5" /></button>
          <button type="button" title="Move down" disabled={isLast} onClick={onDown} className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"><ChevronDown className="size-3.5" /></button>
        </div>
      )}
      <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold tabular-nums text-primary">{index + 1}</span>
      {l.kind === "quiz"
        ? <ListChecks className="size-4 shrink-0 text-muted-foreground" />
        : (l.videoProvider === "vdocipher" ? <ShieldCheck className="size-4 shrink-0 text-muted-foreground" /> : <Video className="size-4 shrink-0 text-muted-foreground" />)}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{l.titleEn}</p>
        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="uppercase tracking-wide">{l.kind}</span>
          {l.locked
            ? <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400"><Lock className="size-3" /> locked · {l.kind === "quiz" ? "no quiz" : "no video"}</span>
            : l.kind === "lesson" && l.durationMinutes > 0 ? <>· {l.durationMinutes} min</> : null}
          {!l.isPublished && <>· <span>draft</span></>}
        </p>
      </div>
      <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={onEdit}><Pencil className="size-3.5" /></Button>
      <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={onDelete}><Trash2 className="size-3.5 text-destructive" /></Button>
    </div>
  );
}
