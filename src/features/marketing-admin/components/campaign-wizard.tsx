"use client";

import * as React from "react";
import {
  ArrowLeft, ArrowRight, Check, Mail, Users, FileText, Sparkles, Send, CalendarClock,
  Save, Upload, Plus, UserPlus, Paintbrush, Target, Layers, AtSign, X,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  Campaign, CampaignInput, EmailTemplate, AudienceOption, ManualRecipient, RecipientsPreview,
} from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

type Step = 0 | 1 | 2 | 3;
const STEPS = [
  { title: "Details", icon: Mail },
  { title: "Content", icon: FileText },
  { title: "Recipients", icon: Users },
  { title: "Review & send", icon: Send },
] as const;

const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

export function CampaignWizard({
  templates, audiences, editing,
}: {
  templates: EmailTemplate[];
  audiences: AudienceOption[];
  editing: Campaign | null;
}) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();

  const [step, setStep] = React.useState<Step>(0);
  const [busy, setBusy] = React.useState(false);

  /* ── Step 1: details ── */
  const [name, setName] = React.useState(editing?.name ?? "");
  const [subject, setSubject] = React.useState(editing?.subject ?? "");
  const [previewText, setPreviewText] = React.useState(editing?.previewText ?? "");
  const [fromName, setFromName] = React.useState(editing?.fromName ?? "IMETS Medical School");
  const [fromEmail, setFromEmail] = React.useState(editing?.fromEmail ?? "hello@imetsedu.com");
  const [replyTo, setReplyTo] = React.useState(editing?.replyTo ?? "hello@imetsedu.com");
  const [language, setLanguage] = React.useState(editing?.language ?? "en");
  const [trackOpens, setTrackOpens] = React.useState(editing?.trackOpens ?? true);
  const [trackClicks, setTrackClicks] = React.useState(editing?.trackClicks ?? true);

  /* ── Step 2: content ── */
  // null → start from scratch (design in the builder); otherwise a template id.
  const [templateId, setTemplateId] = React.useState<string | null>(null);

  /* ── Step 3: recipients ── */
  const initialSources = editing?.sources?.length
    ? editing.sources
    : editing?.audience && editing.audience !== "all" ? [`newsletter:${editing.audience}`] : [];
  const [sources, setSources] = React.useState<string[]>(initialSources);
  const [manual, setManual] = React.useState<ManualRecipient[]>(editing?.manualRecipients ?? []);
  const [preview, setPreview] = React.useState<RecipientsPreview | null>(null);
  const [previewing, setPreviewing] = React.useState(false);

  /* ── Scheduling ── */
  const [scheduleAt, setScheduleAt] = React.useState("");

  const selectedTemplate = templates.find((t) => t.id === templateId) ?? null;

  /* Live reach preview — debounced whenever the selection changes. */
  React.useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      if (sources.length === 0 && manual.length === 0) {
        if (alive) { setPreview(null); setPreviewing(false); }
        return;
      }
      if (alive) setPreviewing(true);
      const res = await dal.emailMarketing.previewRecipients(sources, manual);
      if (!alive) return;
      setPreviewing(false);
      if (res.ok) setPreview(res.data);
    }, 350);
    return () => { alive = false; clearTimeout(t); };
  }, [sources, manual]);

  const toggleSource = (key: string) =>
    setSources((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const totalReach = preview?.total ?? (sources.length === 0 ? manual.length : undefined);

  /* ── Validation per step ── */
  const canNext =
    step === 0 ? subject.trim().length > 0 && isEmail(fromEmail) :
    step === 2 ? sources.length > 0 || manual.length > 0 :
    true;

  /* ── Persist (create or update) + optional template seed ── */
  const buildPayload = (): CampaignInput => ({
    name: name.trim(),
    subject: subject.trim(),
    previewText: previewText.trim(),
    fromName: fromName.trim(),
    fromEmail: fromEmail.trim(),
    replyTo: replyTo.trim(),
    language,
    audience: "all",
    sources,
    manualRecipients: manual,
    trackOpens,
    trackClicks,
  });

  const persist = async (): Promise<string | null> => {
    const payload = buildPayload();
    let id = editing?.id ?? null;
    if (id) {
      const res = await dal.emailMarketing.updateCampaign(id, payload);
      if (!res.ok) { toast.error(res.error); return null; }
    } else {
      const res = await dal.emailMarketing.createCampaign(payload);
      if (!res.ok) { toast.error(res.error); return null; }
      id = res.data.id;
    }
    // Seed content from the chosen template (idempotent; scratch leaves design as-is).
    if (id && selectedTemplate) {
      await dal.emailMarketing.saveCampaignDesign(id, selectedTemplate.design ?? "", selectedTemplate.body ?? "");
    }
    return id;
  };

  const saveDraft = async () => {
    setBusy(true);
    const id = await persist();
    setBusy(false);
    if (id) { toast.success("Campaign saved as draft"); router.push("/admin/marketing/email"); }
  };

  const openDesigner = async () => {
    setBusy(true);
    const id = await persist();
    setBusy(false);
    if (id) router.push(`/admin/marketing/email/builder?campaignId=${id}`);
  };

  const sendNow = async () => {
    const ok = await confirm({
      title: "Send campaign now",
      description: `“${subject}” will be sent to ${totalReach ?? "the selected"} recipients. This can't be undone.`,
      confirmText: "Send now",
    });
    if (!ok) return;
    setBusy(true);
    const id = await persist();
    if (!id) { setBusy(false); return; }
    const res = await dal.emailMarketing.sendCampaign(id);
    setBusy(false);
    if (res.ok) { toast.success("Campaign sent"); router.push("/admin/marketing/email"); }
    else toast.error(res.ok === false ? res.error : "Send failed");
  };

  const scheduleSend = async () => {
    if (!scheduleAt) { toast.error("Pick a date and time first"); return; }
    setBusy(true);
    const id = await persist();
    if (!id) { setBusy(false); return; }
    const res = await dal.emailMarketing.scheduleCampaign(id, new Date(scheduleAt).toISOString());
    setBusy(false);
    if (res.ok) { toast.success("Campaign scheduled"); router.push("/admin/marketing/email"); }
    else toast.error(res.ok === false ? res.error : "Schedule failed");
  };

  return (
    <div className="space-y-6">
      <Stepper step={step} onStepClick={(s) => s < step && setStep(s)} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          {step === 0 && (
            <DetailsStep
              {...{ name, setName, subject, setSubject, previewText, setPreviewText,
                fromName, setFromName, fromEmail, setFromEmail, replyTo, setReplyTo,
                language, setLanguage, trackOpens, setTrackOpens, trackClicks, setTrackClicks }}
            />
          )}
          {step === 1 && (
            <ContentStep
              templates={templates}
              templateId={templateId}
              onPick={setTemplateId}
              onOpenDesigner={openDesigner}
              busy={busy}
            />
          )}
          {step === 2 && (
            <RecipientsStep
              audiences={audiences}
              sources={sources}
              toggleSource={toggleSource}
              manual={manual}
              setManual={setManual}
            />
          )}
          {step === 3 && (
            <ReviewStep
              {...{ name, subject, previewText, fromName, fromEmail, language,
                selectedTemplate, sources, audiences, manual, totalReach,
                scheduleAt, setScheduleAt }}
              onEditStep={setStep}
            />
          )}
        </div>

        {/* Right rail: live insights */}
        <InsightsRail
          step={step}
          subject={subject}
          selectedTemplate={selectedTemplate}
          totalReach={totalReach}
          previewing={previewing}
          preview={preview}
          sources={sources}
          manualCount={manual.length}
        />
      </div>

      {/* Footer nav */}
      <div className="flex items-center justify-between gap-3 border-t border-border/70 pt-4">
        <Button
          variant="ghost"
          onClick={() => (step === 0 ? router.push("/admin/marketing/email") : setStep((step - 1) as Step))}
          disabled={busy}
        >
          <ArrowLeft className="size-4" /> {step === 0 ? "Cancel" : "Back"}
        </Button>

        <div className="flex items-center gap-2">
          {step === 3 ? (
            <>
              <Button variant="outline" onClick={saveDraft} disabled={busy}>
                <Save className="size-4" /> Save draft
              </Button>
              <div className="flex items-center gap-1.5 rounded-lg border border-border/70 bg-card p-1 pl-2.5">
                <CalendarClock className="size-4 text-muted-foreground" />
                <Input
                  type="datetime-local"
                  value={scheduleAt}
                  onChange={(e) => setScheduleAt(e.target.value)}
                  className="h-8 w-[180px] border-0 shadow-none focus-visible:ring-0"
                />
                <Button variant="secondary" size="sm" onClick={scheduleSend} disabled={busy || !scheduleAt}>
                  Schedule
                </Button>
              </div>
              <Button onClick={sendNow} disabled={busy}>
                <Send className="size-4" /> Send now
              </Button>
            </>
          ) : (
            <Button onClick={() => setStep((step + 1) as Step)} disabled={!canNext || busy}>
              Next: {STEPS[step + 1].title} <ArrowRight className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {Confirmation}
    </div>
  );
}

/* ══════════════════════════ Stepper ══════════════════════════ */
function Stepper({ step, onStepClick }: { step: Step; onStepClick: (s: Step) => void }) {
  return (
    <div className="flex items-center gap-2">
      {STEPS.map((s, i) => {
        const done = i < step;
        const active = i === step;
        const Icon = s.icon;
        return (
          <React.Fragment key={s.title}>
            <button
              type="button"
              onClick={() => onStepClick(i as Step)}
              disabled={i >= step}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active && "bg-primary/10 text-primary",
                done && "text-foreground hover:bg-muted",
                !active && !done && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs ring-1",
                  active && "bg-primary text-primary-foreground ring-primary",
                  done && "bg-success text-white ring-success",
                  !active && !done && "ring-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
              <Icon className="size-4 sm:hidden" />
            </button>
            {i < STEPS.length - 1 && <div className="h-px flex-1 bg-border/70" />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ══════════════════════════ Step 1: details ══════════════════════════ */
function DetailsStep(p: {
  name: string; setName: (v: string) => void;
  subject: string; setSubject: (v: string) => void;
  previewText: string; setPreviewText: (v: string) => void;
  fromName: string; setFromName: (v: string) => void;
  fromEmail: string; setFromEmail: (v: string) => void;
  replyTo: string; setReplyTo: (v: string) => void;
  language: string; setLanguage: (v: string) => void;
  trackOpens: boolean; setTrackOpens: (v: boolean) => void;
  trackClicks: boolean; setTrackClicks: (v: boolean) => void;
}) {
  return (
    <Card>
      <CardContent className="space-y-5">
        <Field label="Campaign name" hint="Internal — used to identify the campaign in the list.">
          <Input value={p.name} onChange={(e) => p.setName(e.target.value)} placeholder="e.g. July intake — Hospital Management" />
        </Field>
        <Field label="Subject" required hint="Shown in the recipient's inbox. Personalize with {{name}}.">
          <Input value={p.subject} onChange={(e) => p.setSubject(e.target.value)} placeholder="🎓 Your seat is waiting, {{name}}" />
        </Field>
        <Field label="Preview text" hint="The gray text after the subject in most inboxes.">
          <Input value={p.previewText} onChange={(e) => p.setPreviewText(e.target.value)} placeholder="Enroll before the deadline and save 20%" />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="From name">
            <Input value={p.fromName} onChange={(e) => p.setFromName(e.target.value)} />
          </Field>
          <Field label="From email" required hint={!isEmail(p.fromEmail) ? "Enter a valid email" : undefined} error={!isEmail(p.fromEmail)}>
            <Input value={p.fromEmail} onChange={(e) => p.setFromEmail(e.target.value)} placeholder="hello@imetsedu.com" />
          </Field>
          <Field label="Reply-to">
            <Input value={p.replyTo} onChange={(e) => p.setReplyTo(e.target.value)} />
          </Field>
          <Field label="Language" hint="Used on the unsubscribe page.">
            <Select value={p.language} onValueChange={p.setLanguage}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="ar">Arabic</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="space-y-3 rounded-lg border border-border/70 bg-muted/30 p-4">
          <p className="text-sm font-medium">Tracking options</p>
          <ToggleRow label="Track opens" desc="Know how many recipients open the email." checked={p.trackOpens} onChange={p.setTrackOpens} />
          <ToggleRow label="Track clicks" desc="Measure clicks on links inside the email." checked={p.trackClicks} onChange={p.setTrackClicks} />
        </div>
      </CardContent>
    </Card>
  );
}

/* ══════════════════════════ Step 2: content ══════════════════════════ */
function ContentStep({
  templates, templateId, onPick, onOpenDesigner, busy,
}: {
  templates: EmailTemplate[];
  templateId: string | null;
  onPick: (id: string | null) => void;
  onOpenDesigner: () => void;
  busy: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* Start from scratch */}
      <button
        type="button"
        onClick={() => onPick(null)}
        className={cn(
          "flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-colors",
          templateId === null ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/70 hover:bg-muted/40",
        )}
      >
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <Sparkles className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Start from scratch</p>
          <p className="text-sm text-muted-foreground">Build your email block by block in the drag-and-drop designer.</p>
        </div>
        {templateId === null && <Check className="size-5 text-primary" />}
      </button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border/70" />
        <span className="text-xs font-medium text-muted-foreground">OR PICK A TEMPLATE</span>
        <div className="h-px flex-1 bg-border/70" />
      </div>

      {templates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
          No saved templates yet. Start from scratch above.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((t) => {
            const selected = t.id === templateId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onPick(t.id)}
                className={cn(
                  "group flex flex-col overflow-hidden rounded-xl border text-left transition-colors",
                  selected ? "border-primary ring-1 ring-primary" : "border-border/70 hover:border-primary/50",
                )}
              >
                <div className="relative h-40 overflow-hidden bg-muted/40">
                  {t.body ? (
                    <iframe
                      title={t.name}
                      srcDoc={t.body}
                      sandbox=""
                      tabIndex={-1}
                      className="pointer-events-none absolute left-0 top-0 h-[500px] w-[600px] origin-top-left scale-[0.42]"
                    />
                  ) : (
                    <div className="grid h-full place-items-center text-xs text-muted-foreground">
                      <FileText className="size-6 opacity-40" />
                    </div>
                  )}
                  {selected && (
                    <div className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Check className="size-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 border-t border-border/70 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{t.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{t.subject || "No subject"}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          {templateId === null
            ? "You'll design the content in the builder — you can open it now or after saving."
            : "The selected template's design will be copied into this campaign. You can still edit it in the builder."}
        </p>
        <Button variant="outline" onClick={onOpenDesigner} disabled={busy}>
          <Paintbrush className="size-4" /> Open designer
        </Button>
      </div>
    </div>
  );
}

/* ══════════════════════════ Step 3: recipients ══════════════════════════ */
function RecipientsStep({
  audiences, sources, toggleSource, manual, setManual,
}: {
  audiences: AudienceOption[];
  sources: string[];
  toggleSource: (key: string) => void;
  manual: ManualRecipient[];
  setManual: React.Dispatch<React.SetStateAction<ManualRecipient[]>>;
}) {
  const groups = React.useMemo(() => {
    const m = new Map<string, AudienceOption[]>();
    for (const a of audiences) { if (!m.has(a.group)) m.set(a.group, []); m.get(a.group)!.push(a); }
    return [...m.entries()];
  }, [audiences]);

  return (
    <Tabs defaultValue="audiences" className="space-y-4">
      <TabsList>
        <TabsTrigger value="audiences"><Target className="mr-1.5 size-4" /> Platform audiences</TabsTrigger>
        <TabsTrigger value="manual"><UserPlus className="mr-1.5 size-4" /> Add manually</TabsTrigger>
        <TabsTrigger value="import"><Upload className="mr-1.5 size-4" /> Upload Excel</TabsTrigger>
      </TabsList>

      <TabsContent value="audiences" className="space-y-5">
        {groups.map(([group, items]) => (
          <div key={group} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {items.map((a) => {
                const on = sources.includes(a.key);
                return (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => toggleSource(a.key)}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border p-3.5 text-left transition-colors",
                      on ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border/70 hover:bg-muted/40",
                    )}
                  >
                    <Checkbox checked={on} className="mt-0.5 pointer-events-none" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">{a.label}</p>
                        <Badge variant="secondary" className="tabular-nums">{a.count.toLocaleString()}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{a.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {audiences.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
            No platform audiences available.
          </div>
        )}
      </TabsContent>

      <TabsContent value="manual">
        <ManualEntry manual={manual} setManual={setManual} />
      </TabsContent>

      <TabsContent value="import">
        <ExcelImport onImport={(rows) => setManual((p) => dedupe([...p, ...rows]))} />
        {manual.length > 0 && <ManualList manual={manual} setManual={setManual} className="mt-4" />}
      </TabsContent>
    </Tabs>
  );
}

const dedupe = (rows: ManualRecipient[]) => {
  const m = new Map<string, ManualRecipient>();
  for (const r of rows) if (r.email) m.set(r.email.toLowerCase(), r);
  return [...m.values()];
};

function ManualEntry({
  manual, setManual,
}: {
  manual: ManualRecipient[];
  setManual: React.Dispatch<React.SetStateAction<ManualRecipient[]>>;
}) {
  const [n, setN] = React.useState("");
  const [e, setE] = React.useState("");
  const add = () => {
    if (!isEmail(e)) { toast.error("Enter a valid email"); return; }
    setManual((p) => dedupe([...p, { name: n.trim(), email: e.trim() }]));
    setN(""); setE("");
  };
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input placeholder="Full name (optional)" value={n} onChange={(ev) => setN(ev.target.value)} className="sm:flex-1" />
        <Input
          placeholder="email@example.com"
          value={e}
          onChange={(ev) => setE(ev.target.value)}
          onKeyDown={(ev) => ev.key === "Enter" && add()}
          className="sm:flex-1"
        />
        <Button onClick={add}><Plus className="size-4" /> Add</Button>
      </div>
      {manual.length > 0
        ? <ManualList manual={manual} setManual={setManual} />
        : <p className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">No manual recipients yet.</p>}
    </div>
  );
}

function ManualList({
  manual, setManual, className,
}: {
  manual: ManualRecipient[];
  setManual: React.Dispatch<React.SetStateAction<ManualRecipient[]>>;
  className?: string;
}) {
  return (
    <div className={cn("rounded-lg border border-border/70", className)}>
      <div className="flex items-center justify-between border-b border-border/70 px-3 py-2">
        <p className="text-xs font-medium text-muted-foreground">{manual.length.toLocaleString()} recipient{manual.length === 1 ? "" : "s"}</p>
        <Button variant="ghost" size="sm" onClick={() => setManual([])}>Clear all</Button>
      </div>
      <div className="max-h-64 divide-y divide-border/60 overflow-y-auto">
        {manual.map((r) => (
          <div key={r.email} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{r.name || "—"}</p>
              <p className="truncate text-xs text-muted-foreground">{r.email}</p>
            </div>
            <Button variant="ghost" size="icon" className="size-7" onClick={() => setManual((p) => p.filter((x) => x.email !== r.email))}>
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExcelImport({ onImport }: { onImport: (rows: ManualRecipient[]) => void }) {
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    try {
      const XLSX = await import("xlsx");
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });
      const rows: ManualRecipient[] = [];
      for (const raw of json) {
        const entries = Object.entries(raw);
        const emailKey = entries.find(([k]) => /e-?mail/i.test(k));
        const nameKey = entries.find(([k]) => /name/i.test(k));
        const email = String(emailKey?.[1] ?? "").trim();
        const nm = String(nameKey?.[1] ?? "").trim();
        if (isEmail(email)) rows.push({ email, name: nm });
      }
      if (rows.length === 0) { toast.error("No valid rows found. Expected columns: name, email."); return; }
      onImport(rows);
      toast.success(`Imported ${rows.length} recipient${rows.length === 1 ? "" : "s"}`);
    } catch {
      toast.error("Could not read that file. Use a .xlsx or .csv with name & email columns.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={loading}
        className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border/70 p-10 text-center transition-colors hover:border-primary/50 hover:bg-muted/30"
      >
        <div className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary">
          <Upload className="size-6" />
        </div>
        <p className="text-sm font-medium">{loading ? "Reading file…" : "Click to upload a spreadsheet"}</p>
        <p className="text-xs text-muted-foreground">.xlsx, .xls or .csv with <span className="font-medium">name</span> and <span className="font-medium">email</span> columns</p>
      </button>
    </div>
  );
}

/* ══════════════════════════ Step 4: review ══════════════════════════ */
function ReviewStep(p: {
  name: string; subject: string; previewText: string; fromName: string; fromEmail: string; language: string;
  selectedTemplate: EmailTemplate | null;
  sources: string[]; audiences: AudienceOption[]; manual: ManualRecipient[];
  totalReach: number | undefined;
  scheduleAt: string; setScheduleAt: (v: string) => void;
  onEditStep: (s: Step) => void;
}) {
  const sourceLabels = p.sources.map((k) => p.audiences.find((a) => a.key === k)?.label ?? k);
  return (
    <div className="space-y-4">
      <ReviewCard title="Details" onEdit={() => p.onEditStep(0)} icon={Mail}>
        <Row k="Campaign" v={p.name || "—"} />
        <Row k="Subject" v={p.subject || "—"} />
        <Row k="Preview text" v={p.previewText || "—"} />
        <Row k="From" v={`${p.fromName} <${p.fromEmail}>`} />
        <Row k="Language" v={p.language === "ar" ? "Arabic" : "English"} />
      </ReviewCard>

      <ReviewCard title="Content" onEdit={() => p.onEditStep(1)} icon={FileText}>
        <Row k="Source" v={p.selectedTemplate ? `Template — ${p.selectedTemplate.name}` : "Built from scratch"} />
        {p.selectedTemplate?.body && (
          <div className="mt-2 overflow-hidden rounded-lg border border-border/70">
            <iframe title="preview" srcDoc={p.selectedTemplate.body} sandbox="" className="h-64 w-full" />
          </div>
        )}
      </ReviewCard>

      <ReviewCard title="Recipients" onEdit={() => p.onEditStep(2)} icon={Users}>
        <Row k="Total reach" v={<span className="font-semibold">{(p.totalReach ?? 0).toLocaleString()}</span>} />
        <Row k="Audiences" v={sourceLabels.length ? sourceLabels.join(", ") : "—"} />
        <Row k="Manual / imported" v={p.manual.length ? `${p.manual.length.toLocaleString()} added` : "—"} />
      </ReviewCard>

      <div className="rounded-xl border border-border/70 bg-muted/30 p-4 text-sm text-muted-foreground">
        Ready to go out. Use <span className="font-medium text-foreground">Send now</span> to deliver immediately,
        set a date to <span className="font-medium text-foreground">Schedule</span>, or keep it as a draft.
      </div>
    </div>
  );
}

/* ══════════════════════════ Right rail: insights ══════════════════════════ */
function InsightsRail({
  step, subject, selectedTemplate, totalReach, previewing, preview, sources, manualCount,
}: {
  step: Step;
  subject: string;
  selectedTemplate: EmailTemplate | null;
  totalReach: number | undefined;
  previewing: boolean;
  preview: RecipientsPreview | null;
  sources: string[];
  manualCount: number;
}) {
  return (
    <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
      <KpiCard
        label="Total reach"
        value={previewing ? "…" : (totalReach ?? 0).toLocaleString()}
        icon={Users}
        intent="primary"
        helperText="Unique recipients after de-duplication"
      />
      <div className="grid grid-cols-2 gap-3">
        <KpiCard label="Audiences" value={sources.length} icon={Layers} intent="info" />
        <KpiCard label="Manual" value={manualCount} icon={AtSign} intent="warning" />
      </div>

      {preview && preview.breakdown.length > 0 && (
        <Card>
          <CardContent className="space-y-2.5">
            <p className="text-sm font-medium">Reach breakdown</p>
            {preview.breakdown.map((b) => (
              <div key={b.key} className="flex items-center justify-between text-sm">
                <span className="truncate text-muted-foreground">{b.label}</span>
                <span className="tabular-nums font-medium">{b.count.toLocaleString()}</span>
              </div>
            ))}
            <div className="mt-1 flex items-center justify-between border-t border-border/60 pt-2 text-sm">
              <span className="font-medium">Unique total</span>
              <span className="tabular-nums font-semibold">{preview.total.toLocaleString()}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inbox preview</p>
          <div className="flex items-start gap-2.5">
            <div className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary text-xs font-bold">IM</div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{subject || "Your subject line"}</p>
              <p className="truncate text-xs text-muted-foreground">
                {selectedTemplate ? selectedTemplate.name : "IMETS Medical School"}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Step {step + 1} of {STEPS.length} — {STEPS[step].title}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/* ══════════════════════════ small bits ══════════════════════════ */
function Field({
  label, children, required, hint, error,
}: {
  label: string; children: React.ReactNode; required?: boolean; hint?: string; error?: boolean;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-sm font-medium">
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
      {hint && <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{hint}</p>}
    </div>
  );
}

function ToggleRow({
  label, desc, checked, onChange,
}: {
  label: string; desc: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function ReviewCard({
  title, icon: Icon, onEdit, children,
}: {
  title: string; icon: typeof Mail; onEdit: () => void; children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="size-4 text-primary" />
            <p className="font-medium">{title}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit}>Edit</Button>
        </div>
        <div className="space-y-1.5">{children}</div>
      </CardContent>
    </Card>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 text-muted-foreground">{k}</span>
      <span className="min-w-0 truncate text-right">{v}</span>
    </div>
  );
}
