"use client";

import * as React from "react";
import {
  Plus, Trash2, Pencil, Loader2, GraduationCap, ExternalLink,
  ChevronDown, Eye, EyeOff, Video, ShieldCheck, GripVertical,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { FreeProgram, FreeLecture, VideoProvider } from "@/lib/dal/free-courses";
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

/** Mirror of the backend slug rule so the DTO can't 400 on us. */
const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)/g, "");

const EMPTY_PROGRAM = {
  titleEn: "", titleAr: "", slug: "", descriptionEn: "", descriptionAr: "",
  thumbnailUrl: "", seoTitle: "", seoDescription: "", isPublished: false,
};
const EMPTY_LECTURE = {
  titleEn: "", titleAr: "", descriptionEn: "", descriptionAr: "",
  videoProvider: "youtube" as VideoProvider, videoUrl: "", durationMinutes: "",
  resourceUrl: "", isPublished: true,
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

  const openCreate = () => {
    setEditing(null); setPForm(EMPTY_PROGRAM); setSlugTouched(false); setProgOpen(true);
  };
  const openEdit = (p: FreeProgram) => {
    setEditing(p);
    setPForm({
      titleEn: p.titleEn, titleAr: p.titleAr, slug: p.slug,
      descriptionEn: p.descriptionEn, descriptionAr: p.descriptionAr,
      thumbnailUrl: p.thumbnailUrl, seoTitle: p.seoTitle,
      seoDescription: p.seoDescription, isPublished: p.isPublished,
    });
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {programs.length} {programs.length === 1 ? "program" : "programs"} ·{" "}
          {programs.filter((p) => p.isPublished).length} published
        </p>
        <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> New program</Button>
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
  program, expanded, onToggle, onEdit, onDelete, onTogglePublish, setLectures, confirm,
}: {
  program: FreeProgram;
  expanded: boolean;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePublish: () => void;
  setLectures: (fn: (l: FreeLecture[]) => FreeLecture[]) => void;
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [lecOpen, setLecOpen] = React.useState(false);
  const [editingLec, setEditingLec] = React.useState<FreeLecture | null>(null);
  const [form, setForm] = React.useState(EMPTY_LECTURE);
  const [saving, setSaving] = React.useState(false);

  const openCreate = () => { setEditingLec(null); setForm(EMPTY_LECTURE); setLecOpen(true); };
  const openEdit = (l: FreeLecture) => {
    setEditingLec(l);
    setForm({
      titleEn: l.titleEn, titleAr: l.titleAr, descriptionEn: l.descriptionEn, descriptionAr: l.descriptionAr,
      videoProvider: l.videoProvider, videoUrl: l.videoUrl,
      durationMinutes: l.durationMinutes ? String(l.durationMinutes) : "",
      resourceUrl: l.resourceUrl, isPublished: l.isPublished,
    });
    setLecOpen(true);
  };

  const save = async () => {
    if (!form.titleEn.trim() || !form.titleAr.trim()) { toast.error("Both titles are required"); return; }
    setSaving(true);
    const payload = {
      ...form,
      durationMinutes: form.durationMinutes ? Number(form.durationMinutes) : 0,
      order: editingLec?.order ?? program.lectures.length,
    };
    const res = editingLec
      ? await dal.freeCourses.updateFreeLecture(editingLec.id, payload)
      : await dal.freeCourses.createFreeLecture(program.id, payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setLectures((prev) => (editingLec ? prev.map((x) => (x.id === res.data.id ? res.data : x)) : [...prev, res.data]));
    toast.success(editingLec ? "Lecture updated" : "Lecture added");
    setLecOpen(false);
  };

  const removeLecture = async (l: FreeLecture) => {
    if (!(await confirm({ title: "Delete lecture", description: `“${l.titleEn}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.freeCourses.deleteFreeLecture(l.id);
    if (res.ok) { setLectures((prev) => prev.filter((x) => x.id !== l.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  const playable = program.lectures.filter((l) => l.videoUrl).length;

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
            <span>{program.lectures.length} lectures</span>
            {program.lectures.length > 0 && playable < program.lectures.length && (
              <span className="text-amber-600 dark:text-amber-400">· {program.lectures.length - playable} without video</span>
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
        <div className="border-t border-border/60 bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-semibold">Lectures</p>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={openCreate}><Plus className="size-3.5" /> Add lecture</Button>
          </div>

          {program.lectures.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
              No lectures yet. Add one — a program with no playable lectures still shows publicly, but with nothing to watch.
            </p>
          ) : (
            <ol className="space-y-2">
              {program.lectures.map((l, i) => (
                <li key={l.id} className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-3 py-2.5">
                  <GripVertical className="size-4 shrink-0 text-muted-foreground/40" />
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-bold tabular-nums text-primary">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{l.titleEn}</p>
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      {l.videoProvider === "vdocipher" ? <ShieldCheck className="size-3" /> : <Video className="size-3" />}
                      {l.videoUrl ? l.videoProvider : <span className="text-amber-600 dark:text-amber-400">no video</span>}
                      {l.durationMinutes > 0 && <>· {l.durationMinutes} min</>}
                      {!l.isPublished && <>· <span className="text-muted-foreground">draft</span></>}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={() => openEdit(l)}><Pencil className="size-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => removeLecture(l)}><Trash2 className="size-3.5 text-destructive" /></Button>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}

      {/* Lecture dialog */}
      <Dialog open={lecOpen} onOpenChange={setLecOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editingLec ? "Edit lecture" : "Add lecture"}</DialogTitle></DialogHeader>
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

            <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
              <div className="space-y-1.5">
                <Label>Video source</Label>
                <Select value={form.videoProvider} onValueChange={(v) => setForm((f) => ({ ...f, videoProvider: v as VideoProvider }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
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
              </div>
            </div>

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

            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div>
                <p className="text-sm font-medium">Published</p>
                <p className="text-xs text-muted-foreground">Unpublished lectures stay hidden from the public page.</p>
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
