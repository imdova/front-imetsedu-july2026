"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  MessageSquare, Send, Plus, Trash2, Pencil, Loader2, Users, Zap,
  FileText, Megaphone, CheckCircle2, AlertTriangle, Clock,
} from "lucide-react";

import { dal } from "@/lib/dal";
import type { WaStatus, WaGroup, WaTemplate, WaCampaign, WaAutomation, WaRecipient } from "@/lib/dal/whatsapp";
import { cn } from "@/lib/utils";
import { useConfirm } from "@/hooks/use-confirm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Tab = "templates" | "campaigns" | "automations";

/** "phone" or "phone,name" per line → recipients. */
function parseRecipients(text: string): WaRecipient[] {
  return text.split(/\n/).map((l) => l.trim()).filter(Boolean).map((l) => {
    const [phone, ...rest] = l.split(",");
    return { phone: phone.trim(), name: rest.join(",").trim() || undefined };
  }).filter((r) => r.phone.replace(/\D/g, "").length >= 6);
}

export function WhatsappMarketing({
  initialStatus, initialTemplates, initialGroups, initialCampaigns, initialAutomations,
}: {
  initialStatus: WaStatus | null;
  initialTemplates: WaTemplate[];
  initialGroups: WaGroup[];
  initialCampaigns: WaCampaign[];
  initialAutomations: WaAutomation[];
}) {
  const [tab, setTab] = React.useState<Tab>("campaigns");
  const [status] = React.useState(initialStatus);
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [groups] = React.useState(initialGroups);
  const { confirm, Confirmation } = useConfirm();

  const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "campaigns", label: "Campaigns", icon: Megaphone },
    { key: "automations", label: "Automations", icon: Zap },
    { key: "templates", label: "Templates", icon: FileText },
  ];

  return (
    <div className="space-y-5">
      {/* Config banner */}
      {!status?.configured && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300/60 bg-amber-50 p-4 text-sm dark:border-amber-500/30 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">WhatsApp Cloud API isn’t connected yet</p>
            <p className="mt-0.5 text-amber-700/90 dark:text-amber-300/80">
              Set <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">WHATSAPP_TOKEN</code> and{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">WHATSAPP_PHONE_NUMBER_ID</code> in the backend env (and{" "}
              <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/40">WHATSAPP_AUTOMATION_ENGINE=on</code> for automations). You can build campaigns &amp; automations now — they’ll send once connected.
            </p>
          </div>
        </div>
      )}
      {status?.configured && (
        <p className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <CheckCircle2 className="size-3.5" /> Connected · sender …{status.phoneId}
        </p>
      )}

      {/* Underline tabs */}
      <div className="flex gap-6 border-b border-border/60">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "relative -mb-px flex items-center gap-1.5 pb-3 text-sm font-medium transition-colors",
              tab === t.key ? "text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <t.icon className="size-4" /> {t.label}
            {tab === t.key && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-primary" />}
          </button>
        ))}
      </div>

      {tab === "campaigns" && <CampaignsPanel templates={templates} groups={groups} initial={initialCampaigns} confirm={confirm} />}
      {tab === "automations" && <AutomationsPanel templates={templates} groups={groups} initial={initialAutomations} confirm={confirm} />}
      {tab === "templates" && <TemplatesPanel templates={templates} setTemplates={setTemplates} confirm={confirm} />}
      {Confirmation}
    </div>
  );
}

/* ───────────────────────── Campaigns ───────────────────────── */
function CampaignsPanel({ templates, groups, initial, confirm }: {
  templates: WaTemplate[]; groups: WaGroup[]; initial: WaCampaign[];
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [campaigns, setCampaigns] = React.useState(initial);
  const [name, setName] = React.useState("");
  const [templateName, setTemplateName] = React.useState(templates[0]?.name ?? "");
  const [manual, setManual] = React.useState("");
  const [pickedGroups, setPickedGroups] = React.useState<string[]>([]);
  const [params, setParams] = React.useState<string[]>([]);
  const [sending, setSending] = React.useState(false);

  const tpl = templates.find((t) => t.name === templateName);
  const language = tpl?.language ?? "ar";
  const pickTemplate = (v: string) => {
    setTemplateName(v);
    const t = templates.find((x) => x.name === v);
    setParams(Array.from({ length: t?.variables ?? 0 }, () => ""));
  };

  const manualRecipients = parseRecipients(manual);
  const groupReach = groups.filter((g) => pickedGroups.includes(g.name)).reduce((s, g) => s + g.phoneCount, 0);
  const totalReach = manualRecipients.length + groupReach;

  const toggleGroup = (g: string) => setPickedGroups((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);

  const refresh = async () => { const r = await dal.whatsapp.fetchCampaigns(); if (r.ok) setCampaigns(r.data); };

  const sendNow = async (save: boolean) => {
    if (!templateName) { toast.error("Pick a template"); return; }
    if (totalReach === 0) { toast.error("Add recipients (numbers or a group)"); return; }
    setSending(true);
    if (save) {
      const c = await dal.whatsapp.createCampaign({ name: name || `Campaign ${new Date().toISOString().slice(0, 10)}`, templateName, language, bodyPreview: tpl?.body, defaultParams: params, groups: pickedGroups, recipients: manualRecipients });
      if (!c.ok) { setSending(false); toast.error(c.error); return; }
      const res = await dal.whatsapp.sendCampaign(c.data.id);
      setSending(false);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(`Sent ${res.data.sent}/${res.data.total}${res.data.failed ? ` · ${res.data.failed} failed` : ""}`);
      if (res.data.errors?.length) toast.warning(res.data.errors[0]);
      refresh();
    } else {
      const res = await dal.whatsapp.sendBulk({ templateName, language, defaultParams: params, groups: pickedGroups, recipients: manualRecipients });
      setSending(false);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(`Sent ${res.data.sent}/${res.data.total}${res.data.failed ? ` · ${res.data.failed} failed` : ""}`);
      if (res.data.errors?.length) toast.warning(res.data.errors[0]);
    }
  };

  const del = async (c: WaCampaign) => {
    if (!(await confirm({ title: "Delete campaign", description: `“${c.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteCampaign(c.id);
    if (r.ok) { setCampaigns((p) => p.filter((x) => x.id !== c.id)); toast.success("Deleted"); } else toast.error(r.error);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      {/* Compose */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center gap-2"><Megaphone className="size-4 text-primary" /><p className="font-semibold">New broadcast</p></div>
          <div className="space-y-1.5"><Label>Campaign name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CPHQ July reminder" /></div>
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
          {(tpl?.variables ?? 0) > 0 && (
            <div className="space-y-2">
              <Label>Template variables</Label>
              {params.map((v, i) => (
                <Input key={i} value={v} onChange={(e) => setParams((p) => p.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`{{${i + 1}}} — use {{name}} for the recipient's name`} />
              ))}
            </div>
          )}

          {groups.length > 0 && (
            <div className="space-y-1.5">
              <Label>Send to groups</Label>
              <div className="flex flex-wrap gap-1.5">
                {groups.map((g) => (
                  <button key={g.name} type="button" onClick={() => toggleGroup(g.name)}
                    className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      pickedGroups.includes(g.name) ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:bg-muted")}>
                    <Users className="size-3" /> {g.name} <span className="tabular-nums opacity-70">{g.phoneCount}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="space-y-1.5">
            <Label>…or paste numbers (one per line, optional <code>,name</code>)</Label>
            <Textarea rows={4} value={manual} onChange={(e) => setManual(e.target.value)} placeholder={"201001234567\n201007654321,Ahmed"} className="font-mono text-sm" />
          </div>

          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <span className="text-sm text-muted-foreground">Reach: <span className="font-semibold text-foreground tabular-nums">{totalReach}</span></span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => sendNow(false)} disabled={sending} className="gap-1.5">{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send now</Button>
              <Button onClick={() => sendNow(true)} disabled={sending} className="gap-1.5"><Send className="size-4" /> Send &amp; save</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sent campaigns */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-muted-foreground">Recent campaigns</p>
        {campaigns.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">No campaigns yet.</p>
        ) : campaigns.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center gap-3 py-3.5">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success/12 text-success"><MessageSquare className="size-4" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{c.name}</p>
                <p className="text-[11px] text-muted-foreground">{c.templateName} · {c.total} recipients{c.status === "sent" ? ` · ${c.sentCount} sent${c.failedCount ? `, ${c.failedCount} failed` : ""}` : ` · ${c.status}`}</p>
              </div>
              <Button variant="ghost" size="icon" className="size-8" title="Delete" onClick={() => del(c)}><Trash2 className="size-4 text-destructive" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ───────────────────────── Automations ───────────────────────── */
type AStep = { id: string; type: "message" | "delay"; templateName?: string; language?: string; params?: string[]; amount?: number; unit?: string };

function AutomationsPanel({ templates, groups, initial, confirm }: {
  templates: WaTemplate[]; groups: WaGroup[]; initial: WaAutomation[];
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [items, setItems] = React.useState(initial);
  const [editing, setEditing] = React.useState<WaAutomation | null>(null);
  const [open, setOpen] = React.useState(false);

  const [name, setName] = React.useState("");
  const [triggerGroups, setTriggerGroups] = React.useState<string[]>([]);
  const [steps, setSteps] = React.useState<AStep[]>([]);
  const [active, setActive] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const refresh = async () => { const r = await dal.whatsapp.fetchAutomations(); if (r.ok) setItems(r.data); };

  const openNew = () => {
    setEditing(null); setName(""); setTriggerGroups([]); setActive(true);
    setSteps([{ id: `s${Date.now()}`, type: "message", templateName: templates[0]?.name ?? "", language: templates[0]?.language ?? "ar", params: [] }]);
    setOpen(true);
  };
  const openEdit = (a: WaAutomation) => {
    setEditing(a); setName(a.name); setActive(a.active);
    let flow: { settings?: { triggerGroups?: string[] }; steps?: AStep[] } = {};
    try { flow = JSON.parse(a.steps || "{}"); } catch { /* ignore */ }
    setTriggerGroups(flow.settings?.triggerGroups ?? []);
    setSteps(flow.steps?.length ? flow.steps : [{ id: `s${Date.now()}`, type: "message", templateName: templates[0]?.name ?? "", language: "ar", params: [] }]);
    setOpen(true);
  };

  const addStep = (type: "message" | "delay") => setSteps((s) => [...s, type === "message"
    ? { id: `s${Date.now()}`, type, templateName: templates[0]?.name ?? "", language: templates[0]?.language ?? "ar", params: [] }
    : { id: `s${Date.now()}`, type, amount: 1, unit: "days" }]);
  const setStep = (i: number, patch: Partial<AStep>) => setSteps((s) => s.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const rmStep = (i: number) => setSteps((s) => s.filter((_, j) => j !== i));

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!triggerGroups.length) { toast.error("Pick at least one trigger group"); return; }
    setSaving(true);
    const stepsJson = JSON.stringify({ settings: { triggerGroups }, steps });
    const payload = { name, trigger: "tag_added", triggerTag: triggerGroups[0], steps: stepsJson, active };
    const r = editing ? await dal.whatsapp.updateAutomation(editing.id, payload) : await dal.whatsapp.createAutomation(payload);
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(editing ? "Saved" : "Automation created");
    setOpen(false); refresh();
  };

  const toggleActive = async (a: WaAutomation) => {
    const r = await dal.whatsapp.updateAutomation(a.id, { active: !a.active });
    if (r.ok) { setItems((p) => p.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x))); toast.success(!a.active ? "Activated" : "Paused"); } else toast.error(r.error);
  };
  const del = async (a: WaAutomation) => {
    if (!(await confirm({ title: "Delete automation", description: `“${a.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteAutomation(a.id);
    if (r.ok) { setItems((p) => p.filter((x) => x.id !== a.id)); toast.success("Deleted"); } else toast.error(r.error);
  };

  const toggleTg = (g: string) => setTriggerGroups((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} automation{items.length === 1 ? "" : "s"} — WhatsApp drips triggered when a subscriber joins a group.</p>
        <Button className="gap-1.5" onClick={openNew}><Plus className="size-4" /> New automation</Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">No automations yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            let stepCount = 0; try { stepCount = (JSON.parse(a.steps || "{}").steps ?? []).length; } catch { /* ignore */ }
            return (
              <Card key={a.id}>
                <CardContent className="flex items-center gap-3 py-4">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", a.active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")}><Zap className="size-5" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Joins “{a.triggerTag}” · {stepCount} steps · {a.sentCount} sent</p>
                  </div>
                  <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Running" : "Paused"}</Badge>
                  <Switch checked={a.active} onCheckedChange={() => toggleActive(a)} />
                  <Button variant="ghost" size="icon" className="size-8" title="Edit" onClick={() => openEdit(a)}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8" title="Delete" onClick={() => del(a)}><Trash2 className="size-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit automation" : "New WhatsApp automation"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5"><Label>Name <span className="text-destructive">*</span></Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. CPHQ WhatsApp welcome" /></div>
            <div className="space-y-1.5">
              <Label>Trigger — when a subscriber joins group(s) <span className="text-destructive">*</span></Label>
              <div className="flex flex-wrap gap-1.5">
                {groups.length === 0 && <span className="text-xs text-muted-foreground">No subscriber groups yet.</span>}
                {groups.map((g) => (
                  <button key={g.name} type="button" onClick={() => toggleTg(g.name)}
                    className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors",
                      triggerGroups.includes(g.name) ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:bg-muted")}>
                    <Users className="size-3" /> {g.name} <span className="tabular-nums opacity-70">{g.phoneCount}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Flow</Label>
              {steps.map((s, i) => (
                <div key={s.id} className="rounded-xl border border-border/70 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-primary">
                      {s.type === "message" ? <MessageSquare className="size-3.5" /> : <Clock className="size-3.5" />} {s.type === "message" ? `Message ${i + 1}` : "Delay"}
                    </span>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => rmStep(i)}><Trash2 className="size-3.5 text-destructive" /></Button>
                  </div>
                  {s.type === "message" ? (
                    <div className="space-y-2">
                      <Select value={s.templateName} onValueChange={(v) => { const t = templates.find((x) => x.name === v); setStep(i, { templateName: v, language: t?.language ?? "ar", params: Array.from({ length: t?.variables ?? 0 }, (_, k) => s.params?.[k] ?? "") }); }}>
                        <SelectTrigger><SelectValue placeholder="Pick a template" /></SelectTrigger>
                        <SelectContent position="popper">{templates.map((t) => <SelectItem key={t.id} value={t.name}>{t.name} · {t.language}</SelectItem>)}</SelectContent>
                      </Select>
                      {(templates.find((t) => t.name === s.templateName)?.variables ?? 0) > 0 && (s.params ?? []).map((p, k) => (
                        <Input key={k} value={p} onChange={(e) => setStep(i, { params: (s.params ?? []).map((x, j) => (j === k ? e.target.value : x)) })} placeholder={`{{${k + 1}}} — {{name}} allowed`} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Wait</span>
                      <Input type="number" min={1} value={s.amount} onChange={(e) => setStep(i, { amount: Number(e.target.value) })} className="w-20" />
                      <Select value={s.unit} onValueChange={(v) => setStep(i, { unit: v })}>
                        <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                        <SelectContent position="popper"><SelectItem value="minutes">minutes</SelectItem><SelectItem value="hours">hours</SelectItem><SelectItem value="days">days</SelectItem></SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addStep("message")}><MessageSquare className="size-3.5" /> Add message</Button>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => addStep("delay")}><Clock className="size-3.5" /> Add delay</Button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3">
              <div><p className="text-sm font-medium">Active</p><p className="text-xs text-muted-foreground">Enrol new group members and send automatically.</p></div>
              <Switch checked={active} onCheckedChange={setActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gap-1.5">{saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Create"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ───────────────────────── Templates ───────────────────────── */
const EMPTY_TPL = { name: "", language: "ar", category: "marketing", body: "", variables: 0, status: "approved" };

function TemplatesPanel({ templates, setTemplates, confirm }: {
  templates: WaTemplate[]; setTemplates: React.Dispatch<React.SetStateAction<WaTemplate[]>>;
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<WaTemplate | null>(null);
  const [form, setForm] = React.useState(EMPTY_TPL);
  const [saving, setSaving] = React.useState(false);

  const openNew = () => { setEditing(null); setForm(EMPTY_TPL); setOpen(true); };
  const openEdit = (t: WaTemplate) => { setEditing(t); setForm({ name: t.name, language: t.language, category: t.category, body: t.body, variables: t.variables, status: t.status }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Template name is required (must match Meta)"); return; }
    setSaving(true);
    const r = editing ? await dal.whatsapp.updateTemplate(editing.id, form) : await dal.whatsapp.createTemplate(form);
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    setTemplates((p) => editing ? p.map((x) => (x.id === r.data.id ? r.data : x)) : [r.data, ...p]);
    toast.success(editing ? "Saved" : "Template added");
    setOpen(false);
  };
  const del = async (t: WaTemplate) => {
    if (!(await confirm({ title: "Delete template", description: `“${t.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteTemplate(t.id);
    if (r.ok) { setTemplates((p) => p.filter((x) => x.id !== t.id)); toast.success("Deleted"); } else toast.error(r.error);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Mirror your Meta-approved templates here so campaigns &amp; automations can use them.</p>
        <Button className="gap-1.5" onClick={openNew}><Plus className="size-4" /> New template</Button>
      </div>
      {templates.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">No templates yet. Add one that matches an approved Meta template name.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {templates.map((t) => (
            <Card key={t.id}>
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="grid size-9 place-items-center rounded-lg bg-success/12 text-success"><MessageSquare className="size-[18px]" /></span>
                    <div><p className="font-mono text-sm font-medium">{t.name}</p><div className="mt-1 flex items-center gap-1.5"><Badge variant="secondary" className="capitalize">{t.category}</Badge><Badge variant="outline" className="uppercase">{t.language}</Badge>{t.variables > 0 && <Badge variant="outline">{t.variables} vars</Badge>}</div></div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => openEdit(t)}><Pencil className="size-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="size-7" onClick={() => del(t)}><Trash2 className="size-3.5 text-destructive" /></Button>
                  </div>
                </div>
                {t.body && <p dir={t.language.startsWith("ar") ? "rtl" : "ltr"} className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">{t.body}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Template name (must match Meta) <span className="text-destructive">*</span></Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. cphq_welcome_ar" className="font-mono" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Language</Label><Input value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} placeholder="ar / en_US" /></div>
              <div className="space-y-1.5"><Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent position="popper"><SelectItem value="marketing">Marketing</SelectItem><SelectItem value="utility">Utility</SelectItem><SelectItem value="authentication">Authentication</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5"><Label>Body preview (use {"{{1}}"} for variables)</Label><Textarea rows={4} dir={form.language.startsWith("ar") ? "rtl" : "ltr"} value={form.body} onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))} /></div>
            <div className="space-y-1.5"><Label>Number of variables</Label><Input type="number" min={0} value={form.variables} onChange={(e) => setForm((f) => ({ ...f, variables: Number(e.target.value) }))} className="w-24" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving} className="gap-1.5">{saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
