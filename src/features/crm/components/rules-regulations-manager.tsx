"use client";

import * as React from "react";
import { ScrollText, Users, GraduationCap, BookOpen, Pencil, Trash2, Plus, Loader2, Search, SearchX } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { CrmRule, RuleAudience } from "@/lib/dal/crm-rules";
import { useAuth } from "@/store";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const AR_RE = /[؀-ۿ]/;

const AUDIENCES: { value: RuleAudience; label: string; sub: string; icon: React.ElementType; accent: string }[] = [
  { value: "staff", label: "For Staff — Work Instructions", sub: "تعليمات العمل للموظفين", icon: Users, accent: "from-blue-500 to-blue-400" },
  { value: "students", label: "Students Enrollment Process", sub: "عملية تسجيل الطلاب", icon: GraduationCap, accent: "from-emerald-500 to-emerald-400" },
  { value: "general", label: "General", sub: "قواعد عامة", icon: BookOpen, accent: "from-violet-500 to-violet-400" },
];

const emptyForm: { title: string; audience: RuleAudience; body: string } = { title: "", audience: "staff", body: "" };

/** Render a rule body: "-"/"*"/"•" lines → bullets, lines ending ":" → sub-heading. */
function RuleBody({ body }: { body: string }) {
  const rtl = AR_RE.test(body);
  const lines = body.split("\n");
  return (
    <div dir={rtl ? "rtl" : "ltr"} className={cn("space-y-1.5 text-sm leading-relaxed", rtl ? "text-right" : "text-left")}>
      {lines.map((raw, i) => {
        const line = raw.trim();
        if (!line) return <div key={i} className="h-2" aria-hidden />;
        if (/^[-*•]/.test(line)) {
          return (
            <div key={i} className="flex gap-2">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" aria-hidden />
              <span className="text-foreground/90">{line.replace(/^[-*•]\s*/, "")}</span>
            </div>
          );
        }
        if (line.endsWith(":")) {
          return <p key={i} className="pt-1 font-semibold text-foreground">{line}</p>;
        }
        return <p key={i} className="text-foreground/90">{line}</p>;
      })}
    </div>
  );
}

export function RulesRegulationsManager() {
  const { user } = useAuth();
  const canManage = !user?.staffRole; // super-admin only
  const { confirm, Confirmation } = useConfirm();

  const [rules, setRules] = React.useState<CrmRule[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CrmRule | null>(null);
  const [form, setForm] = React.useState(emptyForm);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.crmRules.fetchCrmRules();
      if (cancelled) return;
      if (res.ok) setRules(res.data);
      else toast.error(res.error);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q ? rules.filter((r) => r.title.toLowerCase().includes(q) || r.body.toLowerCase().includes(q)) : rules;

  const openCreate = () => { setEditing(null); setForm(emptyForm); setOpen(true); };
  const openEdit = (r: CrmRule) => { setEditing(r); setForm({ title: r.title, audience: r.audience, body: r.body }); setOpen(true); };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const payload = { title: form.title.trim(), audience: form.audience, body: form.body };
    const res = editing
      ? await dal.crmRules.updateCrmRule(editing.id, payload)
      : await dal.crmRules.createCrmRule(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setRules((p) => (editing ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
    toast.success(editing ? "Rule updated" : "Rule added");
    setOpen(false);
  };

  const remove = async (r: CrmRule) => {
    if (!(await confirm({ title: "Delete rule", description: `“${r.title}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.crmRules.deleteCrmRule(r.id);
    if (res.ok) { setRules((p) => p.filter((x) => x.id !== r.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  if (loading) {
    return <div className="flex min-h-[320px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  // Group by audience, keeping the AUDIENCES order; skip empty groups.
  const groups = AUDIENCES.map((a) => ({ meta: a, items: visible.filter((r) => r.audience === a.value) })).filter((g) => g.items.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search rules…" className="ps-9" />
        </div>
        {canManage && <Button className="shrink-0 gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add rule</Button>}
      </div>

      {rules.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><ScrollText className="size-7" /></span>
          <p className="font-medium text-foreground">No rules yet</p>
          {canManage && <Button variant="outline" className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add rule</Button>}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="size-6" /></span>
          <p className="text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.meta.value} className="space-y-4">
              <div className="flex items-center gap-3">
                <span className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br text-white", g.meta.accent)}><g.meta.icon className="size-5" /></span>
                <div>
                  <h2 className="text-base font-semibold tracking-tight">{g.meta.label}</h2>
                  <p className="text-xs text-muted-foreground" dir="rtl">{g.meta.sub}</p>
                </div>
                <span className="ms-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">{g.items.length}</span>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {g.items.map((r) => {
                  const titleRtl = AR_RE.test(r.title);
                  return (
                    <article key={r.id} className="group relative overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
                      <span className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", g.meta.accent)} />
                      <div className="flex items-start justify-between gap-3 border-b p-4 pt-5">
                        <h3 className={cn("font-semibold text-foreground", titleRtl && "text-right")} dir={titleRtl ? "rtl" : "ltr"}>{r.title}</h3>
                        {canManage && (
                          <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="size-7" title="Edit" onClick={() => openEdit(r)}><Pencil className="size-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => remove(r)}><Trash2 className="size-3.5 text-destructive" /></Button>
                          </div>
                        )}
                      </div>
                      <div className="p-4"><RuleBody body={r.body} /></div>
                    </article>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* Add / edit dialog (super-admin) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader><DialogTitle>{editing ? "Edit rule" : "New rule"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-[1fr_220px]">
              <div className="space-y-1.5">
                <Label>Title <span className="text-destructive">*</span></Label>
                <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. الكوميشن — Commission" />
              </div>
              <div className="space-y-1.5">
                <Label>Section</Label>
                <Select value={form.audience} onValueChange={(v) => setForm((f) => ({ ...f, audience: v as RuleAudience }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <Textarea
                rows={12}
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                placeholder={"Write the rule here.\n- Lines starting with a dash become bullets.\nLines ending with a colon become sub-headings:"}
                dir="auto"
                className="text-sm leading-relaxed"
              />
              <p className="text-xs text-muted-foreground">Lines beginning with “-”, “*” or “•” render as bullets. A line ending with “:” renders as a sub-heading. Arabic is shown right-to-left automatically.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={save} disabled={saving || !form.title.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
