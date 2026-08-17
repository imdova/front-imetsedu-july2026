"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, Check, FileText, Info, Loader2, Megaphone, Mic, Paperclip,
  Send, Square, Type, Upload, Users, X,
} from "lucide-react";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { WaGroup, WaRecipient, WaTemplate } from "@/lib/dal/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DetailRow, MediaPreview, fmtDur, parseRecipients, parseWaRecipientsFile, type WaMediaAttachment,
} from "@/features/admin/components/whatsapp-shared";

/**
 * Two-step WhatsApp campaign builder (Build → Review & send), rendered on its
 * own page at /admin/whatsapp-campaigns/new. On success it redirects back to
 * the Campaigns tab of the WhatsApp Marketing page.
 */
export function WhatsappCampaignWizard({ templates, groups }: { templates: WaTemplate[]; groups: WaGroup[] }) {
  const router = useRouter();
  const [step, setStep] = React.useState<0 | 1>(0);
  const [name, setName] = React.useState("");
  const [mode, setMode] = React.useState<"template" | "manual">(templates.length ? "template" : "manual");

  // Template mode
  const [templateName, setTemplateName] = React.useState(templates[0]?.name ?? "");
  const [params, setParams] = React.useState<string[]>(() => Array.from({ length: templates[0]?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")));

  // Manual mode
  const [text, setText] = React.useState("");
  const [media, setMedia] = React.useState<WaMediaAttachment | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [recSecs, setRecSecs] = React.useState(0);
  const recRef = React.useRef<{ rec: MediaRecorder; chunks: Blob[]; stream: MediaStream } | null>(null);
  const fileRef = React.useRef<HTMLInputElement>(null);
  const excelRef = React.useRef<HTMLInputElement>(null);

  // Recipients
  const [pickedGroups, setPickedGroups] = React.useState<string[]>([]);
  const [manual, setManual] = React.useState("");
  const [imported, setImported] = React.useState<WaRecipient[]>([]);
  const [sending, setSending] = React.useState(false);

  const tpl = templates.find((t) => t.name === templateName);
  const language = mode === "template" ? (tpl?.language ?? "ar") : "ar";
  const varCount = tpl?.variables ?? 0;
  const finalParams = Array.from({ length: varCount }, (_, i) => params[i] ?? "");
  const pickTemplate = (v: string) => {
    setTemplateName(v);
    const t = templates.find((x) => x.name === v);
    setParams(Array.from({ length: t?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")));
  };

  const manualRecipients = React.useMemo(() => {
    const seen = new Set<string>();
    return [...parseRecipients(manual), ...imported].filter((r) => {
      const n = r.phone.replace(/\D/g, ""); if (!n || seen.has(n)) return false; seen.add(n); return true;
    });
  }, [manual, imported]);
  const groupReach = groups.filter((g) => pickedGroups.includes(g.name)).reduce((s, g) => s + g.phoneCount, 0);
  const totalReach = manualRecipients.length + groupReach;

  const toggleGroup = (g: string) => setPickedGroups((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);

  const contentReady = mode === "template" ? !!templateName : (text.trim().length > 0 || !!media);
  const canReview = contentReady && totalReach > 0 && !uploading && !recording;

  const previewBody = mode === "template"
    ? (tpl?.body ?? "").replace(/\{\{(\d+)\}\}/g, (_, n) => finalParams[Number(n) - 1] || `{{${n}}}`)
    : text;

  /* ── Media attach / voice record ── */
  React.useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => setRecSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [recording]);

  const uploadMedia = async (file: File, voice = false) => {
    if (file.size > 25 * 1024 * 1024) { toast.error("File too large (max 25MB)"); return; }
    setUploading(true);
    const r = await dal.whatsapp.uploadCampaignMedia(file, { voice, filename: file.name });
    setUploading(false);
    if (!r.ok) { toast.error(r.error); return; }
    setMedia({ url: r.data.url, kind: r.data.kind, mime: r.data.mime, filename: r.data.filename });
  };
  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (f) void uploadMedia(f); e.target.value = "";
  };
  const startRec = async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) { toast.error("Recording not supported in this browser"); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/ogg;codecs=opus", "audio/webm;codecs=opus", "audio/webm", "audio/mp4"].find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(t)) || "";
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (ev) => { if (ev.data.size) chunks.push(ev.data); };
      rec.start();
      recRef.current = { rec, chunks, stream };
      setRecSecs(0); setRecording(true);
    } catch { toast.error("Microphone permission denied"); }
  };
  const stopRec = (save: boolean) => {
    const m = recRef.current;
    setRecording(false);
    if (!m) return;
    m.rec.onstop = () => {
      m.stream.getTracks().forEach((t) => t.stop());
      const mt = m.rec.mimeType || "audio/webm";
      if (save && m.chunks.length) {
        const ext = mt.includes("ogg") ? "ogg" : mt.includes("mp4") ? "m4a" : "webm";
        void uploadMedia(new File([new Blob(m.chunks, { type: mt })], `voice-${Date.now()}.${ext}`, { type: mt }), true);
      }
      recRef.current = null;
    };
    m.rec.stop();
  };

  const importExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    try {
      const rows = await parseWaRecipientsFile(f);
      if (rows.length === 0) { toast.error("No valid rows. Expected a phone (and optional name) column."); return; }
      setImported((p) => {
        const seen = new Set(p.map((r) => r.phone.replace(/\D/g, "")));
        const add = rows.filter((r) => { const n = r.phone.replace(/\D/g, ""); if (seen.has(n)) return false; seen.add(n); return true; });
        return [...p, ...add];
      });
      toast.success(`Imported ${rows.length} number${rows.length === 1 ? "" : "s"}`);
    } catch { toast.error("Could not read that file. Use .xlsx/.csv with a phone column."); }
  };

  const send = async () => {
    setSending(true);
    const c = await dal.whatsapp.createCampaign({
      name: name || `Campaign ${new Date().toISOString().slice(0, 10)}`,
      mode,
      ...(mode === "template"
        ? { templateName, language, bodyPreview: tpl?.body, defaultParams: finalParams }
        : { text, mediaUrl: media?.url, mediaKind: media?.kind, mediaFilename: media?.filename }),
      groups: pickedGroups, recipients: manualRecipients,
    });
    if (!c.ok) { setSending(false); toast.error(c.error); return; }
    const res = await dal.whatsapp.sendCampaign(c.data.id);
    setSending(false);
    if (!res.ok) { toast.error(res.error); return; }
    toast.success(`Sent ${res.data.sent}/${res.data.total}${res.data.failed ? ` · ${res.data.failed} failed` : ""}`);
    if (res.data.errors?.length) toast.warning(res.data.errors[0]);
    router.push(`/admin/whatsapp-campaigns/${c.data.id}`);
  };

  const stepDot = (n: 0 | 1, label: string) => (
    <button type="button" onClick={() => n < step && setStep(n)} disabled={n > step}
      className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        step === n ? "bg-primary/10 text-primary" : n < step ? "text-foreground hover:bg-muted" : "text-muted-foreground")}>
      <span className={cn("grid size-5 place-items-center rounded-full text-xs ring-1",
        step === n ? "bg-primary text-primary-foreground ring-primary" : n < step ? "bg-success text-white ring-success" : "ring-border")}>
        {n < step ? <Check className="size-3" /> : n + 1}</span>
      {label}
    </button>
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-4">
      {/* Stepper */}
      <div className="flex items-center gap-2">
        {stepDot(0, "Build")}
        <div className="h-px flex-1 bg-border/60" />
        {stepDot(1, "Review & send")}
      </div>

      <input ref={fileRef} type="file" accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xlsx,.xls,.csv,.zip" className="hidden" onChange={onPickFile} />
      <input ref={excelRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={importExcel} />

      {step === 0 ? (
        <Card>
          <CardContent className="space-y-5 pt-5">
            {/* Name */}
            <div className="space-y-1.5">
              <Label>Campaign name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CPHQ July reminder" />
            </div>

            {/* Content */}
            <div className="space-y-3">
              <Label>Content</Label>
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setMode("template")}
                  className={cn("flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                    mode === "template" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/70 hover:bg-muted/40")}>
                  <FileText className="size-4 text-primary" /><div><p className="font-medium">Use a template</p><p className="text-xs text-muted-foreground">Approved · sends to anyone</p></div>
                </button>
                <button type="button" onClick={() => setMode("manual")}
                  className={cn("flex items-center gap-2 rounded-xl border p-3 text-left text-sm transition-colors",
                    mode === "manual" ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/70 hover:bg-muted/40")}>
                  <Type className="size-4 text-primary" /><div><p className="font-medium">Write manually</p><p className="text-xs text-muted-foreground">Text + media</p></div>
                </button>
              </div>

              {mode === "template" ? (
                <div className="space-y-3 rounded-xl border border-border/60 p-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label>Template <span className="text-destructive">*</span></Label>
                      <Select value={templateName} onValueChange={pickTemplate}>
                        <SelectTrigger><SelectValue placeholder={templates.length ? "Pick a template" : "No templates yet"} /></SelectTrigger>
                        <SelectContent position="popper">
                          {templates.map((t) => <SelectItem key={t.id} value={t.name}>{t.name} · {t.language}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5"><Label>Language</Label><Input value={language} disabled className="font-mono text-sm" /></div>
                  </div>
                  {tpl?.body && <p dir={language.startsWith("ar") ? "rtl" : "ltr"} className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{tpl.body}</p>}
                  {varCount > 0 && (
                    <div className="space-y-2">
                      <Label>Template variables</Label>
                      {Array.from({ length: varCount }).map((_, i) => (
                        <Input key={i} value={params[i] ?? ""} onChange={(e) => setParams((p) => { const n = Array.from({ length: varCount }, (_, j) => p[j] ?? ""); n[i] = e.target.value; return n; })} placeholder={`{{${i + 1}}} — use {{name}} for the recipient's name`} />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3 rounded-xl border border-border/60 p-3">
                  <Textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={"Write your message…\nUse {{name}} to greet each recipient."} />
                  {/* Attach / record */}
                  {recording ? (
                    <div className="flex items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-2.5">
                      <span className="size-2.5 animate-pulse rounded-full bg-destructive" />
                      <span className="flex-1 text-sm text-muted-foreground">Recording… {fmtDur(recSecs)}</span>
                      <Button variant="ghost" size="sm" onClick={() => stopRec(false)}>Cancel</Button>
                      <Button size="sm" className="gap-1.5" onClick={() => stopRec(true)}><Square className="size-3.5" /> Stop</Button>
                    </div>
                  ) : media ? (
                    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-muted/30 p-3">
                      <div className="min-w-0 flex-1"><MediaPreview media={media} /></div>
                      <Button variant="ghost" size="icon" className="size-8" title="Remove" onClick={() => setMedia(null)}><X className="size-4" /></Button>
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Paperclip className="size-4" />} {uploading ? "Uploading…" : "Attach file / image / video"}
                      </Button>
                      <Button variant="outline" size="sm" className="gap-1.5" onClick={startRec} disabled={uploading}><Mic className="size-4" /> Record voice</Button>
                    </div>
                  )}
                  <p className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                    <Info className="mt-0.5 size-3 shrink-0" />
                    Free-form messages only reach contacts who messaged you in the last 24h. For cold audiences, use a template.
                  </p>
                </div>
              )}
            </div>

            {/* Recipients */}
            <div className="space-y-3">
              <Label>Recipients</Label>
              {groups.length > 0 && (
                <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
                  {groups.map((g) => {
                    const on = pickedGroups.includes(g.name);
                    return (
                      <button key={g.name} type="button" onClick={() => toggleGroup(g.name)}
                        className={cn("flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors",
                          on ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/70 hover:bg-muted/40")}>
                        <div className="flex items-center justify-between">
                          <Users className={cn("size-4", on ? "text-primary" : "text-muted-foreground")} />
                          <Badge variant="secondary" className="tabular-nums">{g.phoneCount}</Badge>
                        </div>
                        <p className="truncate text-sm font-medium">{g.name}</p>
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => excelRef.current?.click()}><Upload className="size-4" /> Import from Excel</Button>
                {imported.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    {imported.length} imported
                    <button type="button" className="text-destructive hover:underline" onClick={() => setImported([])}>clear</button>
                  </span>
                )}
              </div>
              <details className="rounded-lg border border-border/60">
                <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-muted-foreground">…or paste numbers manually</summary>
                <div className="p-3 pt-0">
                  <Textarea rows={3} value={manual} onChange={(e) => setManual(e.target.value)} placeholder={"201001234567\n201007654321,Ahmed"} className="font-mono text-sm" />
                  <p className="mt-1 text-[11px] text-muted-foreground">One per line, optional <code>,name</code>.</p>
                </div>
              </details>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <span className="text-sm text-muted-foreground">Reach: <span className="font-semibold text-foreground tabular-nums">{totalReach}</span></span>
              <Button disabled={!canReview} className="gap-1.5" onClick={() => setStep(1)}>Next: Review <ArrowRight className="size-4" /></Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-2"><Megaphone className="size-4 text-primary" /><p className="font-semibold">Review &amp; send</p></div>

            {/* WhatsApp-style preview */}
            <div>
              <p className="mb-1.5 text-xs font-medium text-muted-foreground">Message preview</p>
              <div className="rounded-xl bg-[#e5ddd5] p-4 dark:bg-muted/40">
                <div dir={language.startsWith("ar") ? "rtl" : "ltr"} className="ml-auto max-w-[85%] space-y-2 rounded-lg rounded-tr-none bg-[#d9fdd3] p-2.5 text-sm text-neutral-900 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-50">
                  {mode === "manual" && media && <MediaPreview media={media} className="max-w-full" />}
                  {mode === "template" && tpl?.headerUrl && (
                    <MediaPreview media={{ url: tpl.headerUrl, kind: tpl.headerKind, mime: "", filename: tpl.headerFilename }} className="max-w-full" />
                  )}
                  {previewBody
                    ? <p className="whitespace-pre-wrap break-words">{previewBody}</p>
                    : mode === "manual" && media ? <p className="text-xs opacity-70">{media.filename}</p> : null}
                  <p className="text-right text-[10px] opacity-60">12:00 ✓✓</p>
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-2 rounded-xl border border-border/60 p-3 text-sm">
              <DetailRow k="Campaign" v={name || "Untitled"} />
              <DetailRow k="Content" v={mode === "template" ? `Template — ${templateName}` : media ? `Manual — text + ${media.kind}` : "Manual — text"} />
              <DetailRow k="Language" v={language === "ar" ? "Arabic" : language} />
              <DetailRow k="Groups" v={pickedGroups.length ? `${pickedGroups.join(", ")} (${groupReach})` : "—"} />
              <DetailRow k="Manual / imported" v={manualRecipients.length ? `${manualRecipients.length} numbers` : "—"} />
              <div className="flex items-center justify-between border-t border-border/60 pt-2">
                <span className="font-medium">Total reach</span>
                <span className="font-semibold tabular-nums">{totalReach.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3">
              <Button variant="ghost" onClick={() => setStep(0)} disabled={sending} className="gap-1.5"><ArrowLeft className="size-4" /> Back</Button>
              <Button onClick={send} disabled={sending || totalReach === 0} className="gap-1.5">
                {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
