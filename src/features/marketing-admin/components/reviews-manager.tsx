"use client";

import * as React from "react";
import {
  Plus, Pencil, Trash2, Video, GraduationCap, ThumbsUp, MessageCircle, Eye, EyeOff, ImageOff,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { StudentReview, StudentReviewInput, ReviewKind } from "@/lib/db/student-reviews";
import { REVIEW_KINDS } from "@/lib/db/student-reviews";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ImageUpload } from "@/components/shared/image-upload";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/hooks/use-confirm";

const KIND_META: Record<ReviewKind, { label: string; icon: React.ElementType }> = {
  video: { label: "Video", icon: Video },
  graduation: { label: "Graduation project", icon: GraduationCap },
  facebook: { label: "Facebook", icon: ThumbsUp },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
};

const EMPTY: StudentReviewInput = {
  kind: "video", studentName: "", role: "", country: "", caption: "",
  videoUrl: "", orientation: "portrait", imageUrl: "", rank: 0, isPublished: true,
};

const isVideo = (k: ReviewKind) => k === "video" || k === "graduation";
const poster = (url: string) => {
  const id = extractYouTubeVideoId(url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : "";
};

export function ReviewsManager() {
  const { confirm, Confirmation } = useConfirm();
  const [list, setList] = React.useState<StudentReview[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<"all" | ReviewKind>("all");
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<StudentReviewInput>(EMPTY);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.studentReviews.fetchAdminReviews();
    if (res.ok) setList(res.data);
    else toast.error(res.error);
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const set = <K extends keyof StudentReviewInput>(k: K, v: StudentReviewInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const openNew = () => { setEditingId(null); setForm(EMPTY); setOpen(true); };
  const openEdit = (r: StudentReview) => {
    setEditingId(r.id);
    const { id: _id, ...rest } = r;
    setForm(rest);
    setOpen(true);
  };

  const save = async () => {
    if (isVideo(form.kind) && !form.videoUrl.trim()) { toast.error("Add a YouTube URL"); return; }
    if (!isVideo(form.kind) && !form.imageUrl.trim()) { toast.error("Upload a screenshot"); return; }
    setSaving(true);
    const res = editingId
      ? await dal.studentReviews.updateReview(editingId, form)
      : await dal.studentReviews.createReview(form);
    setSaving(false);
    if (res.ok) {
      setList((p) => (editingId ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
      setOpen(false);
      toast.success(editingId ? "Review updated" : "Review added");
    } else toast.error(res.error);
  };

  const togglePublish = async (r: StudentReview) => {
    const prev = list;
    setList((p) => p.map((x) => (x.id === r.id ? { ...x, isPublished: !x.isPublished } : x)));
    const res = await dal.studentReviews.updateReview(r.id, { isPublished: !r.isPublished });
    if (!res.ok) { setList(prev); toast.error(res.error); }
  };

  const remove = async (r: StudentReview) => {
    if (!(await confirm({ title: "Delete review", description: r.studentName || KIND_META[r.kind].label, confirmText: "Delete", variant: "destructive" }))) return;
    const prev = list;
    setList((p) => p.filter((x) => x.id !== r.id));
    const res = await dal.studentReviews.deleteReview(r.id);
    if (res.ok) toast.success("Deleted");
    else { setList(prev); toast.error(res.error); }
  };

  const filtered = tab === "all" ? list : list.filter((r) => r.kind === tab);
  const counts = React.useMemo(() => {
    const c: Record<string, number> = { all: list.length };
    for (const k of REVIEW_KINDS) c[k] = list.filter((r) => r.kind === k).length;
    return c;
  }, [list]);

  const TABS: ("all" | ReviewKind)[] = ["all", ...REVIEW_KINDS];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Student Reviews</h1>
          <p className="text-sm text-muted-foreground">Video testimonials, graduation projects, and Facebook / WhatsApp screenshots for the public success-stories page.</p>
        </div>
        <Button className="gap-1.5" onClick={openNew}><Plus className="size-4" /> Add review</Button>
      </div>

      {/* Kind tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm">
        {TABS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium capitalize transition-colors",
              tab === k ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {k === "all" ? "All" : KIND_META[k].label}
            <span className={cn("rounded-full px-1.5 text-xs tabular-nums", tab === k ? "bg-white/20" : "bg-muted")}>{counts[k] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">No reviews yet — add your first.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => {
            const Meta = KIND_META[r.kind];
            const thumb = isVideo(r.kind) ? poster(r.videoUrl) : r.imageUrl;
            return (
              <Card key={r.id} className={cn(!r.isPublished && "opacity-60")}>
                <CardContent className="p-0">
                  <div className="relative aspect-video overflow-hidden rounded-t-xl bg-muted">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={r.studentName} className="size-full object-cover" />
                    ) : (
                      <div className="grid size-full place-items-center text-muted-foreground/40"><ImageOff className="size-8" /></div>
                    )}
                    <Badge variant="secondary" className="absolute left-2 top-2 gap-1"><Meta.icon className="size-3" />{Meta.label}</Badge>
                    {r.orientation === "portrait" && isVideo(r.kind) && (
                      <Badge variant="outline" className="absolute right-2 top-2 bg-background/80">Vertical</Badge>
                    )}
                  </div>
                  <div className="space-y-2 p-3">
                    <div className="min-h-[2.5rem]">
                      <p className="truncate text-sm font-semibold">{r.studentName || "—"}</p>
                      <p className="truncate text-xs text-muted-foreground">{[r.role, r.country].filter(Boolean).join(" · ") || (r.caption ? r.caption.slice(0, 40) : "")}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <button type="button" onClick={() => togglePublish(r)} className={cn("inline-flex items-center gap-1 text-xs font-medium", r.isPublished ? "text-emerald-600" : "text-muted-foreground")}>
                        {r.isPublished ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                        {r.isPublished ? "Published" : "Hidden"}
                      </button>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => openEdit(r)}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8" onClick={() => remove(r)}><Trash2 className="size-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Form dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editingId ? "Edit review" : "Add review"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                <Select value={form.kind} onValueChange={(v) => set("kind", v as ReviewKind)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {REVIEW_KINDS.map((k) => <SelectItem key={k} value={k}>{KIND_META[k].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Order (rank)">
                <Input type="number" value={String(form.rank)} onChange={(e) => set("rank", Number(e.target.value) || 0)} />
              </Field>
            </div>

            {isVideo(form.kind) ? (
              <>
                <Field label="YouTube URL">
                  <Input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} placeholder="https://youtube.com/watch?v=… or Shorts URL" dir="ltr" />
                </Field>
                {form.kind === "video" && (
                  <Field label="Orientation">
                    <Select value={form.orientation} onValueChange={(v) => set("orientation", v as "portrait" | "landscape")}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="portrait">Vertical (Shorts / Reels)</SelectItem>
                        <SelectItem value="landscape">Horizontal (normal video)</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              </>
            ) : (
              <Field label="Screenshot">
                <ImageUpload value={form.imageUrl} onChange={(url) => set("imageUrl", url)} hint="Upload the Facebook / WhatsApp review screenshot" />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Student name"><Input value={form.studentName} onChange={(e) => set("studentName", e.target.value)} /></Field>
              <Field label="Role / title"><Input value={form.role} onChange={(e) => set("role", e.target.value)} placeholder="Quality Specialist" /></Field>
              <Field label="Country"><Input value={form.country} onChange={(e) => set("country", e.target.value)} placeholder="Egypt" /></Field>
              <label className="flex items-center justify-between self-end rounded-lg border border-border/70 px-3 py-2.5">
                <span className="text-sm font-medium">Published</span>
                <Switch checked={form.isPublished} onCheckedChange={(v) => set("isPublished", v)} />
              </label>
            </div>
            <Field label="Caption / quote (optional)"><Textarea rows={2} value={form.caption} onChange={(e) => set("caption", e.target.value)} /></Field>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : editingId ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
