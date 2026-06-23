"use client";

import * as React from "react";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Clock, Mail, Zap } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { Automation, AutomationTrigger } from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SortableList } from "@/components/shared/sortable/sortable-list";

type Step =
  | { id: string; type: "wait"; delayMinutes: number }
  | { id: string; type: "email"; subject: string };

const makeId = () => `step_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4).toString(36)}`;

function parseSteps(raw?: string): Step[] {
  if (!raw) return [];
  try { const s = JSON.parse(raw); return Array.isArray(s) ? s : []; } catch { return []; }
}

export function AutomationBuilder({ automation }: { automation: Automation }) {
  const [name, setName] = React.useState(automation.name);
  const [trigger, setTrigger] = React.useState<AutomationTrigger>(automation.trigger);
  const [triggerTag, setTriggerTag] = React.useState(automation.triggerTag ?? "");
  const [active, setActive] = React.useState(automation.active);
  const [steps, setSteps] = React.useState<Step[]>(() => parseSteps(automation.steps));
  const [saving, setSaving] = React.useState(false);

  const addWait = () => setSteps((s) => [...s, { id: makeId(), type: "wait", delayMinutes: 60 }]);
  const addEmail = () => setSteps((s) => [...s, { id: makeId(), type: "email", subject: "New email" }]);
  const update = (id: string, patch: Partial<Step>) =>
    setSteps((s) => s.map((st) => (st.id === id ? ({ ...st, ...patch } as Step) : st)));
  const remove = (id: string) => setSteps((s) => s.filter((st) => st.id !== id));

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    const res = await dal.emailMarketing.updateAutomation(automation.id, {
      name, trigger, triggerTag: trigger === "tag_added" ? triggerTag : undefined, active,
      steps: JSON.stringify(steps),
    });
    setSaving(false);
    if (res.ok) toast.success("Automation saved"); else toast.error(res.error);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Link href="/admin/marketing/email" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to Email Marketing
        </Link>
        <Button size="sm" className="gap-1.5" onClick={save} disabled={saving}>
          <Save className="size-4" /> {saving ? "Saving…" : "Save automation"}
        </Button>
      </div>

      {/* Trigger config */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-2"><Zap className="size-4 text-primary" /><h3 className="text-sm font-semibold">Trigger</h3></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="When">
              <Select value={trigger} onValueChange={(v) => setTrigger(v as AutomationTrigger)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="subscriber_created">New subscriber</SelectItem>
                  <SelectItem value="tag_added">Tag added</SelectItem>
                </SelectContent>
              </Select>
            </Field>
            {trigger === "tag_added" && <Field label="Trigger tag"><Input value={triggerTag} onChange={(e) => setTriggerTag(e.target.value)} placeholder="lead" /></Field>}
            <label className="flex items-center justify-between self-end rounded-lg border border-border/70 px-3 py-2">
              <span className="text-sm font-medium">Active</span>
              <Switch checked={active} onCheckedChange={setActive} />
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted-foreground">Steps</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={addWait}><Clock className="size-4" /> Add wait</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={addEmail}><Mail className="size-4" /> Add email</Button>
          </div>
        </div>

        {steps.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">
            No steps yet — add a wait or email step to build the flow.
          </div>
        ) : (
          <SortableList
            items={steps}
            onReorder={setSteps}
            className="space-y-2"
            renderItem={(step, handle) => (
              <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3">
                <button {...handle.attributes} {...handle.listeners} className="cursor-grab text-muted-foreground" title="Drag">
                  <GripVertical className="size-4" />
                </button>
                <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                  {step.type === "wait" ? <Clock className="size-4" /> : <Mail className="size-4" />}
                </div>
                <div className="flex-1">
                  {step.type === "wait" ? (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Wait</span>
                      <Input type="number" value={step.delayMinutes} onChange={(e) => update(step.id, { delayMinutes: Number(e.target.value) })} className="h-8 w-24" />
                      <span className="text-muted-foreground">minutes</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline">Email</Badge>
                      <Input value={step.subject} onChange={(e) => update(step.id, { subject: e.target.value })} className="h-8" placeholder="Subject" />
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => remove(step.id)}><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            )}
          />
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
