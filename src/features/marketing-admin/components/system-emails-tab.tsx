"use client";

import * as React from "react";
import { Mail, Save, Send, Loader2, GraduationCap, CreditCard, KeyRound, Award } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { TxEmailTemplate } from "@/lib/dal/transactional-email";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Form = { subject: string; body: string; isActive: boolean };

const KIND_ICON: Record<string, React.ElementType> = {
  enrollment_success: GraduationCap,
  purchase_success: CreditCard,
  access_welcome: KeyRound,
  certificate_issued: Award,
};

export function SystemEmailsTab() {
  const [templates, setTemplates] = React.useState<TxEmailTemplate[]>([]);
  const [forms, setForms] = React.useState<Record<string, Form>>({});
  const [loading, setLoading] = React.useState(true);
  const [testEmail, setTestEmail] = React.useState("");
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [testingId, setTestingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await dal.transactionalEmail.fetchTemplates();
      if (res.ok) {
        setTemplates(res.data);
        setForms(Object.fromEntries(res.data.map((t) => [t.id, { subject: t.subject, body: t.body, isActive: t.isActive }])));
      } else toast.error(res.error);
      setLoading(false);
    })();
  }, []);

  const setField = (id: string, patch: Partial<Form>) => setForms((f) => ({ ...f, [id]: { ...f[id], ...patch } }));
  const isDirty = (t: TxEmailTemplate) => {
    const f = forms[t.id];
    return f && (f.subject !== t.subject || f.body !== t.body || f.isActive !== t.isActive);
  };

  const save = async (t: TxEmailTemplate) => {
    const f = forms[t.id];
    setSavingId(t.id);
    const res = await dal.transactionalEmail.updateTemplate(t.id, f);
    setSavingId(null);
    if (res.ok) {
      setTemplates((prev) => prev.map((x) => (x.id === t.id ? res.data : x)));
      toast.success("Template saved");
    } else toast.error(res.error);
  };

  const test = async (t: TxEmailTemplate) => {
    if (!testEmail.trim()) { toast.error("Enter a test email address above"); return; }
    const f = forms[t.id];
    setTestingId(t.id);
    const res = await dal.transactionalEmail.sendTest(testEmail.trim(), f.subject, f.body);
    setTestingId(null);
    if (res.ok) toast.success(`Test sent to ${testEmail.trim()}`);
    else toast.error(res.error);
  };

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">Loading system emails…</p>;
  if (templates.length === 0) return <p className="py-16 text-center text-sm text-muted-foreground">No system email templates found.</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-primary/90">
          These emails are sent <strong>automatically</strong> to customers on key events. Edit the subject &amp; HTML body,
          toggle each on/off, and send yourself a test. Use <code className="rounded bg-primary/10 px-1">{"{{variable}}"}</code> placeholders.
        </p>
        <div className="flex items-center gap-2">
          <Input value={testEmail} onChange={(e) => setTestEmail(e.target.value)} placeholder="you@example.com" className="h-9 w-52" />
        </div>
      </div>

      {templates.map((t) => {
        const Icon = KIND_ICON[t.key] ?? Mail;
        const f = forms[t.id];
        if (!f) return null;
        return (
          <Card key={t.id}>
            <CardContent className="space-y-4 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className={cn("grid size-9 place-items-center rounded-xl", f.isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}><Icon className="size-4.5" /></span>
                  <div>
                    <p className="font-semibold leading-tight">{t.name}</p>
                    <code className="text-xs text-muted-foreground">{t.key}</code>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <span className={cn(f.isActive ? "text-emerald-600" : "text-muted-foreground")}>{f.isActive ? "Active" : "Off"}</span>
                  <Switch checked={f.isActive} onCheckedChange={(v) => setField(t.id, { isActive: v })} />
                </label>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Subject</Label>
                <Input value={f.subject} onChange={(e) => setField(t.id, { subject: e.target.value })} />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">HTML body</Label>
                <Textarea value={f.body} onChange={(e) => setField(t.id, { body: e.target.value })} rows={8} className="font-mono text-xs" dir="ltr" />
              </div>

              {t.variables.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Variables:</span>
                  {t.variables.map((v) => <Badge key={v} variant="outline" className="font-mono text-[0.7rem]">{`{{${v}}}`}</Badge>)}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-3">
                <Button variant="outline" size="sm" className="gap-1.5" disabled={testingId === t.id} onClick={() => test(t)}>
                  {testingId === t.id ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}Send test
                </Button>
                <Button size="sm" className="gap-1.5" disabled={!isDirty(t) || savingId === t.id} onClick={() => save(t)}>
                  {savingId === t.id ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Save
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
