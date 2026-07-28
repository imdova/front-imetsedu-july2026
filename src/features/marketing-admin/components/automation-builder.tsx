"use client";

import * as React from "react";
import {
  ArrowLeft, Save, Plus, Trash2, Copy, Clock, Mail, Zap, GitBranch,
  Settings2, Sparkles, MailOpen, MousePointerClick, Tag, UserMinus,
  Bell, FolderInput, ChevronUp, ChevronDown, Flag, Pencil, X,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { Automation, AutomationTrigger, EmailTemplate } from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { MultiSelect, type Option } from "@/components/shared/multi-select";
import { cn } from "@/lib/utils";
import {
  type Step, type StepType, type EmailStep, type DelayStep, type ConditionStep,
  type ActionStep, type FlowSettings, type DelayUnit, type ConditionOn,
  type ActionKind, type EmailLanguage, parseFlow, serializeFlow, makeStep, formatDelay,
  CONDITION_LABEL, ACTION_LABEL, triggerSummary, DEFAULT_FROM_NAME, DEFAULT_FROM_EMAIL,
} from "@/features/marketing-admin/lib/automation-steps";

/* ── Visual tokens per step type ── */
type Tone = { icon: React.ElementType; ring: string; tile: string; dot: string; label: string };
const TONE: Record<StepType, Tone> = {
  email: { icon: Mail, ring: "ring-blue-500/30", tile: "bg-blue-50 text-blue-600 border-blue-100", dot: "bg-blue-500", label: "Email" },
  delay: { icon: Clock, ring: "ring-amber-500/30", tile: "bg-amber-50 text-amber-600 border-amber-100", dot: "bg-amber-500", label: "Delay" },
  condition: { icon: GitBranch, ring: "ring-violet-500/30", tile: "bg-violet-50 text-violet-600 border-violet-100", dot: "bg-violet-500", label: "Condition" },
  action: { icon: Zap, ring: "ring-emerald-500/30", tile: "bg-emerald-50 text-emerald-600 border-emerald-100", dot: "bg-emerald-500", label: "Action" },
};

const ACTION_ICON: Record<ActionKind, React.ElementType> = {
  add_tag: Tag, remove_tag: Tag, move_group: FolderInput, unsubscribe: UserMinus, notify: Bell,
};

const PICKER: { type: StepType; title: string; desc: string }[] = [
  { type: "email", title: "Email", desc: "Send a designed email" },
  { type: "delay", title: "Delay", desc: "Wait before the next step" },
  { type: "condition", title: "Condition", desc: "Continue only if…" },
  { type: "action", title: "Action", desc: "Tag, move, notify…" },
];

export function AutomationBuilder({
  automation,
  templates = [],
}: {
  automation: Automation;
  templates?: EmailTemplate[];
}) {
  const initial = React.useMemo(() => {
    const flow = parseFlow(automation.steps);
    // Legacy automations stored a single group name in `triggerTag`; seed the
    // new multi-group array from it when the envelope has none yet.
    if ((!flow.settings.triggerGroups || flow.settings.triggerGroups.length === 0) && automation.triggerTag) {
      flow.settings.triggerGroups = automation.triggerTag.split(",").map((s) => s.trim()).filter(Boolean);
    }
    return flow;
  }, [automation.steps, automation.triggerTag]);

  const [name, setName] = React.useState(automation.name);
  const [trigger, setTrigger] = React.useState<AutomationTrigger>(automation.trigger);
  const [active, setActive] = React.useState(automation.active);
  const [settings, setSettings] = React.useState<FlowSettings>(initial.settings);
  const [groupOptions, setGroupOptions] = React.useState<Option[]>([]);

  React.useEffect(() => {
    dal.emailMarketing.fetchSubscriberGroups().then((res) => {
      if (res.ok) setGroupOptions(res.data.map((g) => ({ value: g.name, label: g.name, hint: `${g.count} subscribers` })));
    });
  }, []);
  const [steps, setSteps] = React.useState<Step[]>(initial.steps);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const markDirty = () => setDirty(true);
  const templateById = React.useMemo(
    () => Object.fromEntries(templates.map((t) => [t.id, t])),
    [templates],
  );

  /* ── step ops ── */
  const insertAt = (index: number, type: StepType) => {
    const step = makeStep(type);
    setSteps((s) => [...s.slice(0, index), step, ...s.slice(index)]);
    setSelectedId(step.id);
    markDirty();
  };
  const update = (id: string, patch: Partial<Step>) => {
    setSteps((s) => s.map((st) => (st.id === id ? ({ ...st, ...patch } as Step) : st)));
    markDirty();
  };
  const remove = (id: string) => {
    setSteps((s) => s.filter((st) => st.id !== id));
    setSelectedId((sel) => (sel === id ? null : sel));
    markDirty();
  };
  const duplicate = (id: string) => {
    setSteps((s) => {
      const i = s.findIndex((st) => st.id === id);
      if (i < 0) return s;
      const copy = { ...s[i], id: makeStep(s[i].type).id } as Step;
      return [...s.slice(0, i + 1), copy, ...s.slice(i + 1)];
    });
    markDirty();
  };
  const move = (id: string, dir: -1 | 1) => {
    setSteps((s) => {
      const i = s.findIndex((st) => st.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= s.length) return s;
      const next = [...s];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
    markDirty();
  };

  const emailCount = steps.filter((s) => s.type === "email").length;
  const selected = steps.find((s) => s.id === selectedId) ?? null;

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const res = await dal.emailMarketing.updateAutomation(automation.id, {
      name,
      trigger,
      // Mirror the selected groups into triggerTag (comma-joined) for legacy
      // list-view display; the array is the source of truth in `steps`.
      triggerTag: trigger === "tag_added" ? (settings.triggerGroups ?? []).join(", ") || undefined : undefined,
      active,
      steps: serializeFlow({ settings, steps }),
    });
    setSaving(false);
    if (res.ok) { toast.success("Automation saved"); setDirty(false); }
    else toast.error(res.error);
  };

  return (
    <div className="space-y-5">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-20 -mx-1 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-background/80 px-3 py-2.5 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing/email" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> <span className="hidden sm:inline">Email Marketing</span>
          </Link>
          <span className="text-border">/</span>
          <div className="flex items-center gap-2">
            <span className="grid size-7 place-items-center rounded-lg bg-primary/10 text-primary"><Sparkles className="size-3.5" /></span>
            <span className="max-w-[42vw] truncate text-sm font-semibold sm:max-w-none">{name || "Untitled automation"}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
            active ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
          )}>
            <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/50")} />
            {active ? "Active" : "Paused"}
          </span>
          <Switch checked={active} onCheckedChange={(v) => { setActive(v); markDirty(); }} />
          <Button size="sm" className="gap-1.5" onClick={save} disabled={saving || !dirty}>
            <Save className="size-4" /> {saving ? "Saving…" : dirty ? "Save" : "Saved"}
          </Button>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* ── Canvas ── */}
        <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-[radial-gradient(circle_at_1px_1px,theme(colors.border/60)_1px,transparent_0)] [background-size:22px_22px]">
          <div className="mx-auto flex max-w-md flex-col items-center px-4 py-10">
            {/* Trigger node */}
            <TriggerNode
              summary={triggerSummary(trigger, settings.triggerGroups)}
              selected={selectedId === "__trigger__"}
              onClick={() => setSelectedId(null)}
            />

            {steps.length === 0 ? (
              <>
                <Connector onInsert={(t) => insertAt(0, t)} />
                <EmptyDrop onInsert={(t) => insertAt(0, t)} />
              </>
            ) : (
              steps.map((step, i) => (
                <React.Fragment key={step.id}>
                  <Connector onInsert={(t) => insertAt(i, t)} />
                  <StepNode
                    step={step}
                    index={i}
                    total={steps.length}
                    selected={selectedId === step.id}
                    template={step.type === "email" && step.templateId ? templateById[step.templateId] : undefined}
                    onSelect={() => setSelectedId(step.id)}
                    onDelete={() => remove(step.id)}
                    onDuplicate={() => duplicate(step.id)}
                    onMove={(d) => move(step.id, d)}
                  />
                </React.Fragment>
              ))
            )}

            {steps.length > 0 && (
              <>
                <Connector onInsert={(t) => insertAt(steps.length, t)} />
                <div className="mt-1 inline-flex items-center gap-2 rounded-full border border-border/60 bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground">
                  <Flag className="size-3.5" /> End of workflow
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Inspector rail ── */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border/60 bg-card">
            {selected ? (
              <StepInspector
                step={selected}
                templates={templates}
                onChange={(patch) => update(selected.id, patch)}
                onClose={() => setSelectedId(null)}
                onDelete={() => remove(selected.id)}
              />
            ) : (
              <WorkflowSettings
                name={name} setName={(v) => { setName(v); markDirty(); }}
                trigger={trigger} setTrigger={(v) => { setTrigger(v); markDirty(); }}
                groupOptions={groupOptions}
                settings={settings} setSettings={(s) => { setSettings(s); markDirty(); }}
                emailCount={emailCount}
                sentCount={automation.sentCount}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────── Canvas pieces ────────────────────────── */

function TriggerNode({ summary, selected, onClick }: { summary: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative w-full rounded-2xl border border-transparent bg-gradient-to-br from-primary to-[#082a6b] p-4 text-left text-white shadow-sm transition",
        selected ? "ring-2 ring-primary/40 ring-offset-2" : "hover:shadow-md",
      )}
    >
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-white/15 backdrop-blur"><Zap className="size-5" /></span>
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-white/70">Trigger</div>
          <div className="truncate text-sm font-semibold">{summary}</div>
        </div>
      </div>
    </button>
  );
}

function Connector({ onInsert }: { onInsert: (t: StepType) => void }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative flex h-11 w-full items-center justify-center">
      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-gradient-to-b from-border via-border to-border/40" />
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            aria-label="Add step"
            className="relative z-10 grid size-7 place-items-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition hover:scale-110 hover:border-primary hover:text-primary"
          >
            <Plus className="size-4" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="center" className="w-64 p-2">
          <p className="px-2 pb-1.5 pt-1 text-xs font-medium text-muted-foreground">Add a next step</p>
          <div className="grid grid-cols-2 gap-1.5">
            {PICKER.map((p) => {
              const Icon = TONE[p.type].icon;
              return (
                <button
                  key={p.type}
                  onClick={() => { onInsert(p.type); setOpen(false); }}
                  className="flex flex-col items-start gap-1.5 rounded-lg border border-border/60 p-2.5 text-left transition hover:border-primary/40 hover:bg-primary/[0.03]"
                >
                  <span className={cn("grid size-8 place-items-center rounded-lg border", TONE[p.type].tile)}>
                    <Icon className="size-4" />
                  </span>
                  <span className="text-xs font-semibold">{p.title}</span>
                  <span className="text-[10px] leading-tight text-muted-foreground">{p.desc}</span>
                </button>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

function EmptyDrop({ onInsert }: { onInsert: (t: StepType) => void }) {
  return (
    <div className="w-full rounded-2xl border border-dashed border-border/70 bg-background/60 p-6 text-center">
      <p className="text-sm font-medium">Build your sequence</p>
      <p className="mt-1 text-xs text-muted-foreground">Add emails, delays and conditions to nurture new subscribers automatically.</p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {PICKER.map((p) => {
          const Icon = TONE[p.type].icon;
          return (
            <Button key={p.type} variant="outline" size="sm" className="gap-1.5" onClick={() => onInsert(p.type)}>
              <Icon className="size-3.5" /> {p.title}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function StepNode({
  step, index, total, selected, template, onSelect, onDelete, onDuplicate, onMove,
}: {
  step: Step; index: number; total: number; selected: boolean; template?: EmailTemplate;
  onSelect: () => void; onDelete: () => void; onDuplicate: () => void; onMove: (d: -1 | 1) => void;
}) {
  const tone = TONE[step.type];

  // Compact pill for delays (mirrors the "Wait 1 day(s)" chip).
  if (step.type === "delay") {
    return (
      <div className={cn("group relative", selected && "z-10")}>
        <button
          onClick={onSelect}
          className={cn(
            "inline-flex items-center gap-2 rounded-full border bg-background px-4 py-2 text-sm shadow-sm transition hover:shadow",
            selected ? "border-amber-400 ring-2 ring-amber-500/20" : "border-border/70",
          )}
        >
          <Clock className="size-4 text-amber-500" />
          <span className="font-medium text-foreground">{formatDelay(step)}</span>
        </button>
        <NodeToolbar index={index} total={total} onDelete={onDelete} onDuplicate={onDuplicate} onMove={onMove} />
      </div>
    );
  }

  const { title, subtitle } = describeStep(step, template);
  const Icon = step.type === "action" ? ACTION_ICON[step.action] : tone.icon;

  return (
    <div className={cn("group relative w-full", selected && "z-10")}>
      <button
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-3 rounded-2xl border bg-card p-3.5 text-left shadow-sm transition hover:shadow-md",
          selected ? cn("border-transparent ring-2 ring-offset-1", tone.ring) : "border-border/70",
        )}
      >
        <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl border", tone.tile)}>
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn("inline-block size-1.5 rounded-full", tone.dot)} />
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{tone.label}</span>
          </div>
          <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{title}</div>
          {subtitle && <div className="truncate text-xs text-muted-foreground">{subtitle}</div>}
        </div>
      </button>
      <NodeToolbar index={index} total={total} onDelete={onDelete} onDuplicate={onDuplicate} onMove={onMove} />
    </div>
  );
}

function NodeToolbar({
  index, total, onDelete, onDuplicate, onMove,
}: { index: number; total: number; onDelete: () => void; onDuplicate: () => void; onMove: (d: -1 | 1) => void }) {
  return (
    <div className="pointer-events-none absolute -right-2 top-1/2 flex -translate-y-1/2 translate-x-full flex-col gap-1 opacity-0 transition group-hover:pointer-events-auto group-hover:opacity-100">
      <IconBtn title="Move up" disabled={index === 0} onClick={() => onMove(-1)}><ChevronUp className="size-3.5" /></IconBtn>
      <IconBtn title="Move down" disabled={index === total - 1} onClick={() => onMove(1)}><ChevronDown className="size-3.5" /></IconBtn>
      <IconBtn title="Duplicate" onClick={onDuplicate}><Copy className="size-3.5" /></IconBtn>
      <IconBtn title="Delete" onClick={onDelete} danger><Trash2 className="size-3.5" /></IconBtn>
    </div>
  );
}

function IconBtn({ children, onClick, title, disabled, danger }: {
  children: React.ReactNode; onClick: () => void; title: string; disabled?: boolean; danger?: boolean;
}) {
  return (
    <button
      title={title}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "grid size-6 place-items-center rounded-md border border-border bg-background shadow-sm transition hover:bg-muted disabled:opacity-30",
        danger && "hover:border-destructive/40 hover:text-destructive",
      )}
    >
      {children}
    </button>
  );
}

function describeStep(step: Step, template?: EmailTemplate): { title: string; subtitle?: string } {
  switch (step.type) {
    case "email":
      return { title: step.subject || "Untitled email", subtitle: template ? `Design · ${template.name}` : step.previewText || "No design linked" };
    case "condition":
      return { title: "Continue only if…", subtitle: `Subscriber ${CONDITION_LABEL[step.on]}` };
    case "action":
      return { title: ACTION_LABEL[step.action], subtitle: step.value || undefined };
    default:
      return { title: "" };
  }
}

/* ────────────────────────── Inspector rail ────────────────────────── */

function WorkflowSettings({
  name, setName, trigger, setTrigger, groupOptions,
  settings, setSettings, emailCount, sentCount,
}: {
  name: string; setName: (v: string) => void;
  trigger: AutomationTrigger; setTrigger: (v: AutomationTrigger) => void;
  groupOptions: Option[];
  settings: FlowSettings; setSettings: (s: FlowSettings) => void;
  emailCount: number; sentCount: number;
}) {
  return (
    <div className="divide-y divide-border/60">
      <div className="flex items-center gap-2 p-4">
        <Settings2 className="size-4 text-primary" />
        <h3 className="text-sm font-semibold">Workflow settings</h3>
      </div>

      <div className="space-y-4 p-4">
        <Field label="Workflow name">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Welcome series" />
        </Field>
        <Field label="Trigger">
          <Select value={trigger} onValueChange={(v) => setTrigger(v as AutomationTrigger)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="subscriber_created">New subscriber joins</SelectItem>
              <SelectItem value="tag_added">When a subscriber joins a group</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {trigger === "tag_added" && (
          <Field label="Groups">
            <MultiSelect
              options={groupOptions}
              value={settings.triggerGroups ?? []}
              onChange={(v) => setSettings({ ...settings, triggerGroups: v })}
              placeholder="Select one or more groups…"
              searchPlaceholder="Search groups…"
              emptyText="No subscriber groups yet."
            />
            <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
              A subscriber enters this flow when they join <span className="font-medium">any</span> of the selected groups.
            </p>
          </Field>
        )}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Who is it from?</Label>
          <Input
            value={settings.fromName ?? DEFAULT_FROM_NAME}
            onChange={(e) => setSettings({ ...settings, fromName: e.target.value })}
            placeholder={DEFAULT_FROM_NAME}
          />
          <Input
            type="email" dir="ltr"
            value={settings.fromEmail ?? DEFAULT_FROM_EMAIL}
            onChange={(e) => setSettings({ ...settings, fromEmail: e.target.value })}
            placeholder={DEFAULT_FROM_EMAIL}
          />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Applied to every email in this automation.
          </p>
        </div>

        <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3">
          <span>
            <span className="block text-sm font-medium">Repeat for re-joins</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">Re-enter a subscriber if they trigger again (max once per day).</span>
          </span>
          <Switch checked={settings.repeat} onCheckedChange={(v) => setSettings({ ...settings, repeat: v })} />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden bg-border/60">
        <Stat label="Emails in flow" value={emailCount} />
        <Stat label="Total sent" value={sentCount.toLocaleString()} />
      </div>

      <p className="p-4 text-xs leading-relaxed text-muted-foreground">
        Select any step in the canvas to edit it, or use the + buttons to insert a new step anywhere in the sequence.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="bg-card p-4">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StepInspector({
  step, templates, onChange, onClose, onDelete,
}: {
  step: Step; templates: EmailTemplate[];
  onChange: (patch: Partial<Step>) => void; onClose: () => void; onDelete: () => void;
}) {
  const tone = TONE[step.type];
  const Icon = tone.icon;
  return (
    <div className="divide-y divide-border/60">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className={cn("grid size-8 place-items-center rounded-lg border", tone.tile)}><Icon className="size-4" /></span>
          <h3 className="text-sm font-semibold">Edit {tone.label.toLowerCase()}</h3>
        </div>
        <button onClick={onClose} className="grid size-7 place-items-center rounded-md text-muted-foreground hover:bg-muted" title="Close">
          <X className="size-4" />
        </button>
      </div>

      <div className="space-y-4 p-4">
        {step.type === "email" && <EmailFields step={step} templates={templates} onChange={onChange} />}
        {step.type === "delay" && <DelayFields step={step} onChange={onChange} />}
        {step.type === "condition" && <ConditionFields step={step} onChange={onChange} />}
        {step.type === "action" && <ActionFields step={step} onChange={onChange} />}
      </div>

      <div className="p-4">
        <Button variant="outline" size="sm" className="w-full gap-1.5 text-destructive hover:text-destructive" onClick={onDelete}>
          <Trash2 className="size-4" /> Delete step
        </Button>
      </div>
    </div>
  );
}

function EmailFields({ step, templates, onChange }: {
  step: EmailStep; templates: EmailTemplate[]; onChange: (p: Partial<EmailStep>) => void;
}) {
  return (
    <>
      <Field label="Email name">
        <Input value={step.name ?? ""} onChange={(e) => onChange({ name: e.target.value })} placeholder="Internal name (not shown to recipients)" />
      </Field>
      <Field label="Email subject">
        <Input value={step.subject} onChange={(e) => onChange({ subject: e.target.value })} placeholder="Welcome to IMETS 👋  ·  use {$last_name} to personalize" />
      </Field>

      {/* Email content */}
      <Field label="Email content">
        <Select value={step.templateId ?? "none"} onValueChange={(v) => onChange({ templateId: v === "none" ? undefined : v })}>
          <SelectTrigger><SelectValue placeholder="Pick a design" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No design</SelectItem>
            {templates.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
          </SelectContent>
        </Select>
      </Field>
      {step.templateId ? (
        <Link
          href={`/admin/marketing/email/builder?templateId=${step.templateId}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
        >
          <Pencil className="size-3.5" /> Edit email content in the builder
        </Link>
      ) : (
        <p className="text-xs text-muted-foreground">Pick a saved design, or create new ones in the Email builder.</p>
      )}

      {/* Tracking options */}
      <Section label="Tracking options">
        <CheckRow
          checked={!!step.trackClicks}
          onChange={(v) => onChange({ trackClicks: v })}
          title="Google Analytics link tracking"
          desc="Track clicks from this email (requires GA on your website)."
        />
        <CheckRow
          checked={step.trackOpens ?? true}
          onChange={(v) => onChange({ trackOpens: v })}
          title="Opens metric tracking"
          desc="Track opens with an invisible beacon embedded in the email."
        />
      </Section>

      {/* Language */}
      <Field label="Language">
        <Select value={step.language ?? "ar"} onValueChange={(v) => onChange({ language: v as EmailLanguage })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="ar">العربية (Arabic)</SelectItem>
          </SelectContent>
        </Select>
      </Field>
    </>
  );
}

/** Labelled block that groups several controls under one heading. */
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/** A checkbox-style row (title + description + switch) for tracking toggles. */
function CheckRow({ checked, onChange, title, desc }: {
  checked: boolean; onChange: (v: boolean) => void; title: string; desc: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-lg border border-border/60 bg-muted/20 p-2.5">
      <span>
        <span className="block text-xs font-medium">{title}</span>
        <span className="mt-0.5 block text-[11px] leading-relaxed text-muted-foreground">{desc}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function DelayFields({ step, onChange }: { step: DelayStep; onChange: (p: Partial<DelayStep>) => void }) {
  return (
    <Field label="Wait duration">
      <div className="flex gap-2">
        <Input
          type="number" min={1} value={step.amount}
          onChange={(e) => onChange({ amount: Math.max(1, Number(e.target.value) || 1) })}
          className="w-24"
        />
        <Select value={step.unit} onValueChange={(v) => onChange({ unit: v as DelayUnit })}>
          <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Field>
  );
}

function ConditionFields({ step, onChange }: { step: ConditionStep; onChange: (p: Partial<ConditionStep>) => void }) {
  const opts: { v: ConditionOn; icon: React.ElementType }[] = [
    { v: "opened", icon: MailOpen },
    { v: "not_opened", icon: Mail },
    { v: "clicked", icon: MousePointerClick },
    { v: "not_clicked", icon: MousePointerClick },
  ];
  return (
    <Field label="Continue only if the subscriber…">
      <div className="space-y-1.5">
        {opts.map(({ v, icon: I }) => (
          <button
            key={v}
            onClick={() => onChange({ on: v })}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left text-sm transition",
              step.on === v ? "border-violet-400 bg-violet-50/60 ring-1 ring-violet-500/20" : "border-border/60 hover:bg-muted/50",
            )}
          >
            <I className={cn("size-4", step.on === v ? "text-violet-600" : "text-muted-foreground")} />
            <span>{CONDITION_LABEL[v]}</span>
          </button>
        ))}
      </div>
    </Field>
  );
}

function ActionFields({ step, onChange }: { step: ActionStep; onChange: (p: Partial<ActionStep>) => void }) {
  const needsValue = step.action === "add_tag" || step.action === "remove_tag" || step.action === "move_group" || step.action === "notify";
  const valueLabel =
    step.action === "move_group" ? "Group name"
      : step.action === "notify" ? "Notify email"
        : "Tag";
  return (
    <>
      <Field label="Action">
        <Select value={step.action} onValueChange={(v) => onChange({ action: v as ActionKind })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(ACTION_LABEL) as ActionKind[]).map((a) => (
              <SelectItem key={a} value={a}>{ACTION_LABEL[a]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {needsValue && (
        <Field label={valueLabel}>
          <Input value={step.value ?? ""} onChange={(e) => onChange({ value: e.target.value })} placeholder={valueLabel} />
        </Field>
      )}
      {step.action === "unsubscribe" && (
        <p className="rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">The subscriber will be removed from future sends in this flow.</p>
      )}
    </>
  );
}

/* ── shared ── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
