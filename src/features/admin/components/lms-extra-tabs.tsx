"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Plus, SlidersHorizontal, UploadCloud, Link2, FileText, Trash2, Pencil, Paperclip, UserPlus, Download, Search, Columns3, Loader2, X,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { PickerDialog } from "./lms-picker-dialog";

type EnrolledStudent = { id: string; name: string; email: string; country: string; leadSource: string };
type StudentOption = { id: string; name: string; email: string };

interface Material { id: string; name: string; category: string; size: string; uploadDate: string; targetGroup: string }
interface Assignment { id: string; title: string; priority: string; dueDate: string; createdDate: string; attachments: number; files: string[] }

/* ───────────────────────── Study Materials ───────────────────────── */
export function StudyMaterialsTab({ lmsId, initial = [] }: { lmsId: string; initial?: Material[] }) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState<Material[]>(initial);
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<"upload" | "link">("link");
  const [title, setTitle] = React.useState("");
  const [linkUrl, setLinkUrl] = React.useState("");
  const [fileUrl, setFileUrl] = React.useState("");
  const [fileName, setFileName] = React.useState("");
  const [uploading, setUploading] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const onFile = async (file?: File) => {
    if (!file || uploading) return;
    setUploading(true);
    const res = await dal.upload.uploadFile(file);
    setUploading(false);
    if (!res.ok) { toast.error(res.error || t("smUploadFailed")); return; }
    setFileUrl(res.data.url);
    setFileName(file.name);
    if (!title.trim()) setTitle(file.name.replace(/\.[^.]+$/, ""));
  };

  const reset = () => { setTitle(""); setLinkUrl(""); setFileUrl(""); setFileName(""); setMode("link"); };

  const add = async () => {
    if (!title.trim()) return;
    const document = mode === "upload" ? fileUrl : linkUrl.trim();
    if (mode === "upload" && !fileUrl) { toast.error(t("smFileRequired")); return; }
    if (mode === "link" && !linkUrl.trim()) { toast.error(t("smLinkRequired")); return; }
    setSaving(true);
    const res = await dal.lms.addLmsMaterial(lmsId, { title: title.trim(), document });
    setSaving(false);
    if (res.ok) {
      const m = res.data as { _id?: string; id?: string };
      setRows((p) => [{ id: m._id ?? m.id ?? `m_${Date.now()}`, name: title.trim(), category: mode === "upload" ? "File" : "Link", size: "—", uploadDate: "—", targetGroup: "All" }, ...p]);
      toast.success(t("smMaterialAdded"));
      setOpen(false); reset();
    } else {
      toast.error(res.error);
    }
  };

  const removeMaterial = async (id: string) => {
    const prev = rows;
    setRows((p) => p.filter((x) => x.id !== id));
    const res = await dal.lms.deleteLmsMaterial(lmsId, id);
    if (!res.ok) { setRows(prev); toast.error(res.error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight">{t("smHub")}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("smSubtitle")}</p>
        </div>
        <Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" />{t("smAddMaterial")}</Button>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between p-5"><h3 className="font-heading text-base font-bold">{t("smUploaded")}</h3><Button variant="ghost" size="icon" className="size-8 text-muted-foreground"><SlidersHorizontal className="size-4" /></Button></div>
        <table className="w-full text-sm">
          <thead><tr className="border-y bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 text-start font-semibold"><input type="checkbox" /></th>
            <th className="px-3 py-3 text-start font-semibold">{t("smColFileName")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("smColCategory")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("smColSize")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("smColUploadDate")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("smColTargetGroup")}</th>
            <th className="px-5 py-3 text-end font-semibold" />
          </tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id} className="border-b last:border-0">
                <td className="px-5 py-3"><input type="checkbox" /></td>
                <td className="px-3 py-3"><span className="inline-flex items-center gap-2 font-medium"><FileText className="size-4 text-primary" />{m.name}</span></td>
                <td className="px-3 py-3"><Badge variant="secondary">{m.category}</Badge></td>
                <td className="px-3 py-3 text-muted-foreground">{m.size}</td>
                <td className="px-3 py-3 text-muted-foreground tabular-nums">{m.uploadDate}</td>
                <td className="px-3 py-3 text-muted-foreground">{m.targetGroup}</td>
                <td className="px-5 py-3 text-end"><Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeMaterial(m.id)}><Trash2 className="size-4" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-3 text-sm text-muted-foreground">{t("matShowing", { n: rows.length })}</p>
      </div>

      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("smModalTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="inline-flex w-full rounded-lg border p-0.5">
              {(["upload", "link"] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={cn("inline-flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium",
                    mode === m ? "bg-primary/10 text-primary" : "text-muted-foreground")}>
                  {m === "upload" ? <UploadCloud className="size-4" /> : <Link2 className="size-4" />}
                  {m === "upload" ? t("smUploadFile") : t("smExternalLink")}
                </button>
              ))}
            </div>
            <div className="space-y-1.5"><Label>{t("smMaterialTitle")} <span className="text-destructive">*</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("smMaterialTitlePh")} /></div>
            {mode === "upload" ? (
              <div className="space-y-1.5">
                <Label>{t("smFile")} <span className="text-destructive">*</span></Label>
                {fileUrl ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl border bg-muted/30 p-4">
                    <span className="inline-flex min-w-0 items-center gap-2 text-sm font-medium"><FileText className="size-4 shrink-0 text-primary" /><span className="truncate">{fileName}</span></span>
                    <Button type="button" variant="ghost" size="icon" className="size-8" onClick={() => { setFileUrl(""); setFileName(""); }}><Trash2 className="size-4" /></Button>
                  </div>
                ) : (
                  <label className={cn("grid cursor-pointer place-items-center gap-1.5 rounded-xl border-2 border-dashed py-10 text-center hover:bg-muted/30", uploading && "pointer-events-none opacity-70")}>
                    <UploadCloud className={cn("size-7 text-muted-foreground", uploading && "animate-pulse")} /><p className="font-medium">{uploading ? t("smUploading") : t("smBrowse")}</p><p className="text-xs text-muted-foreground">{t("smFormats")}</p>
                    <input type="file" className="hidden" accept=".pdf,.docx,.xlsx,.pptx" disabled={uploading} onChange={(e) => onFile(e.target.files?.[0])} />
                  </label>
                )}
              </div>
            ) : (
              <div className="space-y-1.5"><Label>{t("smLinkUrl")}</Label><Input dir="ltr" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder={t("smLinkPh")} /></div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("smCancel")}</Button>
            <Button onClick={add} disabled={!title.trim() || saving || uploading}>{t("smAddMaterial")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────── Assignments ─────────────────────────
 * Scoped to exactly one owner: pass `lmsId` for an LMS-course assignment, or
 * `groupId` for a group assignment — never both (the backend create DTO
 * expects a single owner field). */
export function AssignmentsTab({ lmsId, groupId }: { lmsId?: string; groupId?: string }) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState<Assignment[]>([]);
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [dueDate, setDueDate] = React.useState("");
  const [priority, setPriority] = React.useState("regular");
  const [files, setFiles] = React.useState<{ name: string; url: string }[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!lmsId && !groupId) return;
    dal.lms.fetchAssignments({ lmsId, group: groupId }).then((res) => { if (res.ok) setRows(res.data); });
  }, [lmsId, groupId]);

  const onFiles = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    for (const file of Array.from(list)) {
      const res = await dal.upload.uploadFile(file);
      if (res.ok) setFiles((p) => [...p, { name: file.name, url: res.data.url }]);
      else toast.error(res.error || t("asgUploadFailed"));
    }
    setUploading(false);
  };
  const removeFile = (url: string) => setFiles((p) => p.filter((f) => f.url !== url));

  const add = async () => {
    if (!title.trim() || !dueDate) return;
    setBusy(true);
    const res = await dal.lms.createAssignment({
      title, dueDate, priority, files: files.map((f) => f.url),
      ...(lmsId ? { lmsId } : { group: groupId }),
    });
    setBusy(false);
    if (res.ok) {
      setRows((p) => [res.data, ...p]);
      toast.success(t("asgCreated"));
      setOpen(false); setTitle(""); setDueDate(""); setPriority("regular"); setFiles([]);
    } else {
      toast.error(res.error || t("asgCreated"));
    }
  };

  const remove = async (id: string) => {
    const res = await dal.lms.deleteLmsAssignment(id);
    if (res.ok) setRows((p) => p.filter((x) => x.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-heading text-xl font-bold tracking-tight">{t("asgHub")}</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">{t("asgSubtitle")}</p>
        </div>
        <Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" />{t("asgAdd")}</Button>
      </div>

      <div className="rounded-xl border bg-card">
        <div className="p-5"><h3 className="font-heading text-base font-bold">{t("asgCourseAssignments")}</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="border-y bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 text-start font-semibold">{t("asgColTitle")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("asgColPriority")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("asgColDue")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("asgColCreated")}</th>
            <th className="px-3 py-3 text-center font-semibold">{t("asgColAttachments")}</th>
            <th className="px-5 py-3 text-end font-semibold">{t("asgColActions")}</th>
          </tr></thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} className="py-14 text-center text-muted-foreground">{t("asgNone")}</td></tr>
            ) : rows.map((a) => (
              <tr key={a.id} className="border-b last:border-0">
                <td className="px-5 py-3 font-medium">{a.title}</td>
                <td className="px-3 py-3"><Badge variant="secondary">{a.priority}</Badge></td>
                <td className="px-3 py-3 text-muted-foreground">{a.dueDate}</td>
                <td className="px-3 py-3 text-muted-foreground tabular-nums">{a.createdDate}</td>
                <td className="px-3 py-3 text-center">
                  {a.attachments > 0 ? (
                    <button type="button" onClick={() => window.open(a.files[0], "_blank")} className="inline-flex items-center gap-1 text-primary tabular-nums hover:underline">
                      <Paperclip className="size-3.5" />{a.attachments}
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-muted-foreground tabular-nums"><Paperclip className="size-3.5" />{a.attachments}</span>
                  )}
                </td>
                <td className="px-5 py-3"><div className="flex items-center justify-end gap-1"><Button variant="ghost" size="icon" className="size-8 text-primary"><Pencil className="size-4" /></Button><Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(a.id)}><Trash2 className="size-4" /></Button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-5 py-3 text-sm text-muted-foreground">{t("asgShowing", { n: rows.length })}</p>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{t("asgModalTitle")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>{t("asgTitle")} <span className="text-destructive">*</span></Label><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={t("asgTitlePh")} /></div>
            <div className="space-y-1.5"><Label>{t("asgDue")} <span className="text-destructive">*</span></Label><Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>{t("asgPriority")}</Label>
              <Select value={priority} onValueChange={setPriority}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>
                <SelectItem value="regular">{t("asgPriorityRegular")}</SelectItem><SelectItem value="high">{t("asgPriorityHigh")}</SelectItem><SelectItem value="urgent">{t("asgPriorityUrgent")}</SelectItem>
              </SelectContent></Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("asgAttachments")}</Label>
              {files.length > 0 && (
                <ul className="space-y-1.5">
                  {files.map((f) => (
                    <li key={f.url} className="flex items-center gap-2 rounded-lg border bg-muted/20 px-3 py-2 text-sm">
                      <FileText className="size-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate">{f.name}</span>
                      <Button type="button" variant="ghost" size="icon" className="size-6 shrink-0" onClick={() => removeFile(f.url)}><X className="size-3.5" /></Button>
                    </li>
                  ))}
                </ul>
              )}
              <label className={cn("grid cursor-pointer place-items-center gap-1.5 rounded-xl border-2 border-dashed py-8 text-center hover:bg-muted/30", uploading && "pointer-events-none opacity-70")}>
                {uploading ? <Loader2 className="size-7 animate-spin text-muted-foreground" /> : <UploadCloud className="size-7 text-muted-foreground" />}
                <p className="font-medium">{uploading ? t("smUploading") : t("asgUploadFiles")}</p><p className="text-xs text-muted-foreground">{t("asgUploadHint")}</p>
                <input type="file" multiple accept=".pdf,.doc,.docx,.xlsx,.pptx,.zip" disabled={uploading} className="hidden" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} />
              </label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>{t("smCancel")}</Button>
            <Button onClick={add} disabled={!title.trim() || !dueDate || busy || uploading}>{t("asgModalTitle")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────── Students ───────────────────────── */
export function StudentsTab({ lmsId, students: initial, availableStudents }: {
  lmsId: string;
  students: EnrolledStudent[];
  availableStudents: StudentOption[];
}) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState(initial);
  const [available, setAvailable] = React.useState(availableStudents);
  const [search, setSearch] = React.useState("");
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const filtered = rows.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()));

  const enroll = async (id: string) => {
    const opt = available.find((s) => s.id === id);
    if (!opt) return;
    setBusy(true);
    const res = await dal.lms.assignLmsStudent(lmsId, id);
    setBusy(false);
    if (res.ok) {
      setRows((p) => [{ id: opt.id, name: opt.name, email: opt.email, country: "", leadSource: "" }, ...p]);
      setAvailable((p) => p.filter((x) => x.id !== id));
      toast.success(t("stuEnrolled", { name: opt.name }));
      setPickerOpen(false);
    } else toast.error(res.error);
  };

  const remove = async (s: EnrolledStudent) => {
    const prev = rows;
    setRows((p) => p.filter((x) => x.id !== s.id));
    const res = await dal.lms.unassignLmsStudent(lmsId, s.id);
    if (res.ok) { setAvailable((p) => [{ id: s.id, name: s.name, email: s.email }, ...p]); toast.success(t("stuRemoved", { name: s.name })); }
    else { setRows(prev); toast.error(res.error); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-heading text-xl font-bold tracking-tight">{t("stuTitle")} <span className="text-muted-foreground tabular-nums">({rows.length})</span></h2>
        <div className="flex items-center gap-2">
          <Button className="gap-1.5" onClick={() => setPickerOpen(true)}><UserPlus className="size-4" />{t("stuNewEnrollment")}</Button>
          <Button variant="outline" className="gap-1.5"><Download className="size-4" />{t("stuExport")}</Button>
        </div>
      </div>

      <div className="relative min-w-[220px]">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("stuSearch")} className="ps-9" />
      </div>

      <div className="rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead><tr className="border-b text-xs uppercase tracking-wide text-muted-foreground">
            <th className="px-5 py-3 text-start font-semibold">{t("stuColStudent")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("stuColCountry")}</th>
            <th className="px-3 py-3 text-start font-semibold">{t("stuColSource")}</th>
            <th className="px-5 py-3 text-end font-semibold">{t("stuColActions")}</th>
          </tr></thead>
          <tbody>
            {filtered.length ? filtered.map((s) => (
              <tr key={s.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">{getInitials(s.name)}</AvatarFallback></Avatar>
                    <div className="min-w-0"><p className="truncate font-medium">{s.name}</p><p className="truncate text-xs text-muted-foreground">{s.email}</p></div>
                  </div>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{s.country || "—"}</td>
                <td className="px-3 py-3 text-muted-foreground">{s.leadSource || "—"}</td>
                <td className="px-5 py-3 text-end"><Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => remove(s)}><Trash2 className="size-4" /></Button></td>
              </tr>
            )) : (
              <tr><td colSpan={4} className="py-16 text-center"><p className="font-semibold">{t("stuNoMatch")}</p><p className="mt-1 text-sm text-muted-foreground">{t("stuNoMatchHint")}</p></td></tr>
            )}
          </tbody>
        </table>
        <p className="px-5 py-3 text-sm text-muted-foreground">{t("stuShowing", { from: filtered.length ? 1 : 0, to: filtered.length, total: filtered.length })}</p>
      </div>

      <PickerDialog
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        title={t("stuPickerTitle")}
        description={t("stuPickerDesc")}
        empty={t("stuNoneAvailable")}
        busy={busy}
        items={available.map((s) => ({ id: s.id, primary: s.name, secondary: s.email }))}
        onPick={enroll}
      />
    </div>
  );
}
