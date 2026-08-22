"use client";
/* eslint-disable @next/next/no-img-element -- S3-hosted graduate photos */

import * as React from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowDown, ArrowUp, Camera, ExternalLink, Loader2, Plus, Save, Trash2, Users } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { GraduateCohort } from "@/lib/dal/graduates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

type GradRow = { id: string; name: string; title: string; country: string; photoUrl: string; submittedAt: string; key: string };
const newKey = () => Math.random().toString(36).slice(2, 10);

/** Cohort editor: page copy + facts on the left, graduates (name / title / country / photo) on the right. */
export function GraduateCohortDetail({ initial }: { initial: GraduateCohort }) {
  const { confirm, Confirmation } = useConfirm();
  const [c, setC] = React.useState(initial);
  const [grads, setGrads] = React.useState<GradRow[]>(initial.graduates.map((g) => ({ ...g, key: g.id || newKey() })));
  const [saving, setSaving] = React.useState(false);
  const [uploadingKey, setUploadingKey] = React.useState<string | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const target = React.useRef<string | null>(null);

  const set = <K extends keyof GraduateCohort>(k: K, v: GraduateCohort[K]) => setC((p) => ({ ...p, [k]: v }));
  const setGrad = (key: string, patch: Partial<GradRow>) => setGrads((p) => p.map((g) => (g.key === key ? { ...g, ...patch } : g)));
  const move = (key: string, dir: -1 | 1) => setGrads((p) => {
    const i = p.findIndex((g) => g.key === key); const j = i + dir;
    if (i < 0 || j < 0 || j >= p.length) return p;
    const n = [...p]; [n[i], n[j]] = [n[j], n[i]]; return n;
  });

  const pickPhoto = (key: string) => { target.current = key; fileRef.current?.click(); };
  const onPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    const key = target.current; if (!f || !key) return;
    if (!f.type.startsWith("image/")) { toast.error("Pick an image (JPG/PNG)"); return; }
    if (f.size > 8 * 1024 * 1024) { toast.error("Image too large (max 8MB)"); return; }
    setUploadingKey(key);
    const r = await dal.upload.uploadFile(f);
    setUploadingKey(null);
    if (!r.ok) { toast.error(r.error); return; }
    setGrad(key, { photoUrl: r.data.url });
    toast.success("Photo uploaded — remember to save");
  };

  const save = async () => {
    if (!c.name.trim()) { toast.error("Cohort name is required"); return; }
    const bad = grads.find((g) => !g.name.trim());
    if (bad) { toast.error("Every graduate needs a name"); return; }
    setSaving(true);
    const r = await dal.graduates.updateCohort(c.id, {
      name: c.name.trim(), slug: c.slug.trim(), status: c.status,
      schoolLabel: c.schoolLabel, programTitle: c.programTitle, programTitleAccent: c.programTitleAccent, kicker: c.kicker, country: c.country,
      trainingHours: Number(c.trainingHours) || 0, classLabel: c.classLabel, classYear: c.classYear,
      issuedAt: c.issuedAt, footerTitle: c.footerTitle,
      graduates: grads.map((g) => ({ id: g.id, name: g.name.trim(), title: g.title.trim(), country: g.country.trim(), photoUrl: g.photoUrl })),
    });
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    setC(r.data);
    setGrads(r.data.graduates.map((g) => ({ ...g, key: g.id || newKey() })));
    toast.success("Cohort saved");
  };

  const removeGrad = async (g: GradRow) => {
    if (g.name && !(await confirm({ title: "Remove graduate", description: `Remove “${g.name}” from this cohort?`, confirmText: "Remove", variant: "destructive" }))) return;
    setGrads((p) => p.filter((x) => x.key !== g.key));
  };

  return (
    <div className="space-y-6">
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/graduates"><Button variant="ghost" size="icon" className="size-9" title="Back to cohorts"><ArrowLeft className="size-4" /></Button></Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold">{c.name}</h1>
              {c.status === "published" ? <Badge className="bg-success/12 text-success hover:bg-success/15">Published</Badge> : <Badge variant="secondary">Draft</Badge>}
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">/graduates/{c.slug} · {grads.length} graduate{grads.length === 1 ? "" : "s"} · {c.views.toLocaleString()} views</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a href={`/graduates/${c.slug}`} target="_blank" rel="noreferrer">
            <Button variant="outline" className="gap-1.5" disabled={c.status !== "published"}><ExternalLink className="size-4" /> View page</Button>
          </a>
          <Button className="gap-1.5" onClick={save} disabled={saving || !!uploadingKey}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_minmax(0,1fr)]">
        {/* Left: cohort details */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardContent className="space-y-4 pt-5">
              <p className="font-semibold">Cohort details</p>
              <Field label="Cohort name" required><Input value={c.name} onChange={(e) => set("name", e.target.value)} /></Field>
              <Field label="Slug" hint="Public URL: /graduates/{slug}"><Input value={c.slug} onChange={(e) => set("slug", e.target.value)} className="font-mono text-sm" /></Field>
              <Field label="Country"><Input value={c.country} onChange={(e) => set("country", e.target.value)} placeholder="e.g. Egypt / Saudi Arabia" /></Field>
              <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                <span className="text-sm font-medium">Published <span className="font-normal text-muted-foreground">(visible at its public URL)</span></span>
                <Switch checked={c.status === "published"} onCheckedChange={(v) => set("status", v ? "published" : "draft")} />
              </label>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4 pt-5">
              <p className="font-semibold">Page copy</p>
              <Field label="School label"><Input value={c.schoolLabel} onChange={(e) => set("schoolLabel", e.target.value)} placeholder="IMETS MEDICAL SCHOOL" /></Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Title"><Input value={c.programTitle} onChange={(e) => set("programTitle", e.target.value)} placeholder="Healthcare Quality" /></Field>
                <Field label="Title accent" hint="Rendered in gold"><Input value={c.programTitleAccent} onChange={(e) => set("programTitleAccent", e.target.value)} placeholder="Management" /></Field>
              </div>
              <Field label="Kicker"><Input value={c.kicker} onChange={(e) => set("kicker", e.target.value)} placeholder="PROFESSIONAL DIPLOMA · GRADUATION GALLERY" /></Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Training hours"><Input type="number" min={0} value={c.trainingHours} onChange={(e) => set("trainingHours", Number(e.target.value))} /></Field>
                <Field label="Class year"><Input value={c.classYear} onChange={(e) => set("classYear", e.target.value)} placeholder="2026" /></Field>
                <Field label="Class label"><Input value={c.classLabel} onChange={(e) => set("classLabel", e.target.value)} placeholder="AUGUST CLASS" /></Field>
              </div>
              <Field label="Issued on"><Input type="date" value={c.issuedAt} onChange={(e) => set("issuedAt", e.target.value)} /></Field>
              <Field label="Footer line"><Input value={c.footerTitle} onChange={(e) => set("footerTitle", e.target.value)} placeholder="Congratulations to every graduate" /></Field>
            </CardContent>
          </Card>
        </div>

        {/* Right: graduates */}
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2"><Users className="size-4 text-primary" /><p className="font-semibold">Graduates ({grads.length})</p></div>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setGrads((p) => [...p, { id: "", name: "", title: "", country: c.country, photoUrl: "", submittedAt: "", key: newKey() }])}>
                <Plus className="size-4" /> Add graduate
              </Button>
            </div>

            {grads.length === 0 ? (
              <p className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">No graduates yet — add the first one.</p>
            ) : (
              <div className="space-y-2">
                {grads.map((g, i) => (
                  <div key={g.key} className="flex flex-wrap items-center gap-3 rounded-xl border border-border/70 p-3 sm:flex-nowrap">
                    <button type="button" onClick={() => pickPhoto(g.key)} title="Upload / change photo" disabled={uploadingKey === g.key}
                      className={cn("relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-amber-400/70 bg-muted/40 text-muted-foreground transition hover:border-amber-500", !g.photoUrl && "border-dashed")}>
                      {g.photoUrl && <img src={g.photoUrl} alt="" className="size-full object-cover" />}
                      <span className={cn("absolute inset-0 grid place-items-center bg-black/40 text-white transition", g.photoUrl ? "opacity-0 hover:opacity-100" : "opacity-100 bg-transparent text-muted-foreground")}>
                        {uploadingKey === g.key ? <Loader2 className="size-5 animate-spin" /> : <Camera className="size-5" />}
                      </span>
                    </button>
                    <div className="grid min-w-0 flex-1 gap-2 sm:grid-cols-[1.4fr_1fr_1fr]">
                      <div className="relative">
                        <Input value={g.name} onChange={(e) => setGrad(g.key, { name: e.target.value })} placeholder="Full name *" className={cn(g.submittedAt && "pe-20")} />
                        {g.submittedAt && <Badge variant="secondary" className="absolute end-1.5 top-1/2 -translate-y-1/2 px-1.5 py-0 text-[10px]" title={`Submitted via the join form on ${g.submittedAt}`}>via form</Badge>}
                      </div>
                      <Input value={g.title} onChange={(e) => setGrad(g.key, { title: e.target.value })} placeholder="Title (e.g. RN, Pharmacist)" />
                      <Input value={g.country} onChange={(e) => setGrad(g.key, { country: e.target.value })} placeholder="Country" />
                    </div>
                    <div className="flex shrink-0 items-center gap-0.5">
                      <Button variant="ghost" size="icon" className="size-8" title="Move up" onClick={() => move(g.key, -1)} disabled={i === 0}><ArrowUp className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8" title="Move down" onClick={() => move(g.key, 1)} disabled={i === grads.length - 1}><ArrowDown className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8" title="Remove" onClick={() => removeGrad(g)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-[11px] text-muted-foreground">Click a photo circle to upload or replace the picture (square images look best). Changes apply when you press <span className="font-medium">Save changes</span>.</p>
          </CardContent>
        </Card>
      </div>
      {Confirmation}
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
