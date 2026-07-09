"use client";

import * as React from "react";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { MessageTemplate } from "@/lib/dal/message-templates";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CourseOpt { id: string; title: string }

const OFFICE_PATH = "/admin/crm/office";

export function TemplateForm({ initial }: { initial?: MessageTemplate }) {
  const router = useRouter();
  const editing = Boolean(initial);

  const [courses, setCourses] = React.useState<CourseOpt[]>([]);
  const [title, setTitle] = React.useState(initial?.title ?? "");
  const [body, setBody] = React.useState(initial?.body ?? "");
  const [courseId, setCourseId] = React.useState(initial?.courseId ?? "");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.courses.fetchCourses();
      if (cancelled || !res.ok) return;
      setCourses(res.data.map((c) => ({ id: c.id, title: c.titleEn || c.titleAr || "Course" })));
    })();
    return () => { cancelled = true; };
  }, []);

  const back = () => router.push(OFFICE_PATH);

  const save = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Title and message are required"); return; }
    setSaving(true);
    const payload = { title: title.trim(), body, courseId };
    const res = editing
      ? await dal.messageTemplates.updateTemplate(initial!.id, payload)
      : await dal.messageTemplates.createTemplate(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    toast.success(editing ? "Template updated" : "Template created");
    router.push(OFFICE_PATH);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-5 rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
        <div className="space-y-1.5">
          <Label htmlFor="tpl-title">Title <span className="text-destructive">*</span></Label>
          <Input id="tpl-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Welcome message" />
        </div>

        <div className="space-y-1.5">
          <Label>Course</Label>
          <Select value={courseId || "_general"} onValueChange={(v) => setCourseId(v === "_general" ? "" : v)}>
            <SelectTrigger className="max-w-md"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_general">General (no course)</SelectItem>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">Choose the course this message belongs to, or keep it general.</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="tpl-body">Message <span className="text-destructive">*</span></Label>
          <Textarea id="tpl-body" rows={12} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write the ready-to-send message…" className="font-mono text-sm leading-relaxed" />
          <p className="text-xs text-muted-foreground">Line breaks and spacing are preserved — this is copied as-is into WhatsApp / Messenger.</p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button variant="outline" onClick={back} disabled={saving} className="gap-1.5">
          <ArrowLeft className="size-4" /> Cancel
        </Button>
        <Button onClick={save} disabled={saving || !title.trim() || !body.trim()} className="gap-1.5">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {editing ? "Save changes" : "Create template"}
        </Button>
      </div>
    </div>
  );
}
