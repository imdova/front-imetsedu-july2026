"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, MoreHorizontal, Users, Send, CalendarClock, Mail, Eye, MousePointerClick, Percent, FileText, Zap,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  Campaign, CampaignInput, CampaignStatus, EmailTemplate, TemplateInput,
  AudienceSegment, Automation, EmailStats,
} from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SystemEmailsTab } from "./system-emails-tab";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { timeAgo } from "@/lib/utils/time-ago";

const STATUS_BADGE: Record<CampaignStatus, "default" | "secondary" | "outline"> = {
  SENT: "default", SCHEDULED: "outline", DRAFT: "secondary",
};
const emptyCampaign: CampaignInput = {
  subject: "", previewText: "", fromName: "IMETS School", replyTo: "hello@imetsedu.com", audience: "all", status: "DRAFT",
};
const emptyTemplate: TemplateInput = { name: "", subject: "", previewText: "" };

export function EmailMarketing({
  initialCampaigns, initialTemplates, initialAutomations, initialSegments, initialStats,
}: {
  initialCampaigns: Campaign[];
  initialTemplates: EmailTemplate[];
  initialAutomations: Automation[];
  initialSegments: AudienceSegment[];
  initialStats: EmailStats;
}) {
  const { confirm, Confirmation } = useConfirm();
  const router = useRouter();
  const [campaigns, setCampaigns] = React.useState(initialCampaigns);
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [automations, setAutomations] = React.useState(initialAutomations);
  const segments = initialSegments;
  const [stats, setStats] = React.useState(initialStats);

  const refreshStats = React.useCallback(async () => {
    const res = await dal.emailMarketing.fetchEmailStats();
    if (res.ok) setStats(res.data);
  }, []);
  const upsertCampaign = (c: Campaign) =>
    setCampaigns((p) => (p.some((x) => x.id === c.id) ? p.map((x) => (x.id === c.id ? c : x)) : [c, ...p]));

  const segLabel = (v: string) => segments.find((s) => s.value === v)?.label ?? v;

  /* ── Campaign editor ── */
  const [cmpOpen, setCmpOpen] = React.useState(false);
  const [cmpEditing, setCmpEditing] = React.useState<Campaign | null>(null);
  const [cmpForm, setCmpForm] = React.useState<CampaignInput>(emptyCampaign);
  const openCreateCmp = () => { setCmpEditing(null); setCmpForm(emptyCampaign); setCmpOpen(true); };
  const openEditCmp = (c: Campaign) => {
    setCmpEditing(c);
    setCmpForm({ subject: c.subject, previewText: c.previewText, fromName: c.fromName, replyTo: c.replyTo, audience: c.audience, status: c.status });
    setCmpOpen(true);
  };
  const saveCmp = async () => {
    if (!cmpForm.subject.trim()) return;
    const res = cmpEditing
      ? await dal.emailMarketing.updateCampaign(cmpEditing.id, cmpForm)
      : await dal.emailMarketing.createCampaign(cmpForm);
    if (res.ok && res.data) { upsertCampaign(res.data); toast.success(cmpEditing ? "Campaign updated" : "Campaign created"); setCmpOpen(false); refreshStats(); }
    else toast.error(res.ok ? "Not found" : res.error);
  };

  /* ── Schedule + test modals ── */
  const [schedFor, setSchedFor] = React.useState<Campaign | null>(null);
  const [schedAt, setSchedAt] = React.useState("");
  const [testFor, setTestFor] = React.useState<Campaign | null>(null);
  const [testEmail, setTestEmail] = React.useState("");

  const doSchedule = async () => {
    if (!schedFor || !schedAt) return;
    const res = await dal.emailMarketing.scheduleCampaign(schedFor.id, new Date(schedAt).toISOString());
    if (res.ok && res.data) { upsertCampaign(res.data); toast.success("Campaign scheduled"); setSchedFor(null); setSchedAt(""); refreshStats(); }
    else toast.error(res.ok ? "Not found" : res.error);
  };
  const doTest = async () => {
    if (!testFor || !testEmail) return;
    const res = await dal.emailMarketing.testCampaign(testFor.id, testEmail);
    if (res.ok) { toast.success(`Test sent to ${testEmail}`); setTestFor(null); setTestEmail(""); }
    else toast.error(res.error);
  };

  const send = async (c: Campaign) => {
    const okConfirm = await confirm({
      title: "Send campaign now", description: `“${c.subject}” will be sent to the ${segLabel(c.audience)} segment.`,
      confirmText: "Send", variant: "default",
    });
    if (!okConfirm) return;
    const res = await dal.emailMarketing.sendCampaign(c.id);
    if (res.ok && res.data) { upsertCampaign(res.data); toast.success("Campaign sent"); refreshStats(); }
    else toast.error(res.ok ? "Not found" : res.error);
  };
  const unschedule = async (c: Campaign) => {
    const res = await dal.emailMarketing.unscheduleCampaign(c.id);
    if (res.ok && res.data) { upsertCampaign(res.data); toast.success("Moved back to draft"); refreshStats(); }
  };
  const duplicate = async (c: Campaign) => {
    const res = await dal.emailMarketing.duplicateCampaign(c.id);
    if (res.ok && res.data) { upsertCampaign(res.data); toast.success("Campaign duplicated"); refreshStats(); }
  };
  const removeCmp = async (c: Campaign) => {
    const okConfirm = await confirm({ title: "Delete campaign", description: `“${c.subject}” will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.emailMarketing.deleteCampaign(c.id);
    if (res.ok) { setCampaigns((p) => p.filter((x) => x.id !== c.id)); toast.success("Campaign deleted"); refreshStats(); }
    else toast.error(res.error);
  };

  /* ── Templates ── */
  const [tplOpen, setTplOpen] = React.useState(false);
  const [tplEditing, setTplEditing] = React.useState<EmailTemplate | null>(null);
  const [tplForm, setTplForm] = React.useState<TemplateInput>(emptyTemplate);
  const openCreateTpl = () => { setTplEditing(null); setTplForm(emptyTemplate); setTplOpen(true); };
  const openEditTpl = (t: EmailTemplate) => { setTplEditing(t); setTplForm({ name: t.name, subject: t.subject, previewText: t.previewText }); setTplOpen(true); };
  const saveTpl = async () => {
    if (!tplForm.name.trim()) return;
    const res = tplEditing
      ? await dal.emailMarketing.updateTemplate(tplEditing.id, tplForm)
      : await dal.emailMarketing.createTemplate(tplForm);
    if (res.ok && res.data) {
      setTemplates((p) => (p.some((x) => x.id === res.data!.id) ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [res.data!, ...p]));
      toast.success(tplEditing ? "Template updated" : "Template created"); setTplOpen(false);
    } else toast.error(res.ok ? "Not found" : res.error);
  };
  const applyTpl = async (t: EmailTemplate) => {
    const res = await dal.emailMarketing.createCampaign({ ...emptyCampaign, subject: t.subject, previewText: t.previewText });
    if (res.ok) { upsertCampaign(res.data); toast.success(`Campaign seeded from “${t.name}”`); refreshStats(); }
  };
  const removeTpl = async (t: EmailTemplate) => {
    const okConfirm = await confirm({ title: "Delete template", description: `“${t.name}” will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.emailMarketing.deleteTemplate(t.id);
    if (res.ok) { setTemplates((p) => p.filter((x) => x.id !== t.id)); toast.success("Template deleted"); }
    else toast.error(res.error);
  };

  /* ── Automations ── */
  const createAut = async () => {
    const res = await dal.emailMarketing.createAutomation({ name: "Untitled automation", trigger: "subscriber_created" });
    if (res.ok) { router.push(`/admin/marketing/email/automation?automationId=${res.data.id}`); }
    else toast.error(res.error);
  };
  const toggleAut = async (a: Automation) => {
    const res = await dal.emailMarketing.toggleAutomation(a.id);
    if (res.ok && res.data) { setAutomations((p) => p.map((x) => (x.id === res.data!.id ? res.data! : x))); toast.success(res.data.active ? "Automation activated" : "Automation paused"); }
  };
  const removeAut = async (a: Automation) => {
    const okConfirm = await confirm({ title: "Delete automation", description: `“${a.name}” will be removed.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.emailMarketing.deleteAutomation(a.id);
    if (res.ok) { setAutomations((p) => p.filter((x) => x.id !== a.id)); toast.success("Automation deleted"); }
    else toast.error(res.error);
  };

  const campaignColumns: ColumnDef<Campaign>[] = [
    {
      accessorKey: "subject", header: "Campaign",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.subject}</p>
          <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">{row.original.previewText}</p>
        </div>
      ),
    },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={STATUS_BADGE[row.original.status]}>{row.original.status}</Badge> },
    { accessorKey: "audience", header: "Audience", cell: ({ row }) => <span className="text-sm">{segLabel(row.original.audience)}</span> },
    { accessorKey: "recipientCount", header: "Recipients", cell: ({ row }) => <span className="tabular-nums">{row.original.recipientCount.toLocaleString()}</span> },
    {
      id: "rates", header: "Open / Click",
      cell: ({ row }) => row.original.status === "SENT"
        ? <span className="text-sm tabular-nums">{row.original.openRate}% / {row.original.clickRate}%</span>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      id: "when", header: "When",
      cell: ({ row }) => {
        const c = row.original;
        if (c.status === "SENT" && c.sentAt) return <span className="text-sm text-muted-foreground">Sent {timeAgo(c.sentAt)}</span>;
        if (c.status === "SCHEDULED" && c.scheduledAt) return <span className="text-sm text-muted-foreground">{timeAgo(c.scheduledAt)}</span>;
        return <span className="text-sm text-muted-foreground">Created {timeAgo(c.createdAt)}</span>;
      },
    },
    {
      id: "actions", header: "",
      cell: ({ row }) => {
        const c = row.original;
        return (
          <div className="flex justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => openEditCmp(c)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/admin/marketing/email/builder?campaignId=${c.id}`)}>Design email</DropdownMenuItem>
                {c.status !== "SENT" && <DropdownMenuItem onClick={() => send(c)}>Send now</DropdownMenuItem>}
                {c.status === "DRAFT" && <DropdownMenuItem onClick={() => { setSchedFor(c); setSchedAt(""); }}>Schedule…</DropdownMenuItem>}
                {c.status === "SCHEDULED" && <DropdownMenuItem onClick={() => unschedule(c)}>Unschedule</DropdownMenuItem>}
                <DropdownMenuItem onClick={() => { setTestFor(c); setTestEmail(""); }}>Send test…</DropdownMenuItem>
                <DropdownMenuItem onClick={() => duplicate(c)}>Duplicate</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={() => removeCmp(c)}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const templateColumns: ColumnDef<EmailTemplate>[] = [
    { accessorKey: "name", header: "Template", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    { accessorKey: "subject", header: "Subject", cell: ({ row }) => <span className="text-sm">{row.original.subject}</span> },
    { accessorKey: "createdAt", header: "Created", cell: ({ row }) => <span className="text-sm text-muted-foreground">{timeAgo(row.original.createdAt)}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => applyTpl(row.original)}>Use</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEditTpl(row.original)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/admin/marketing/email/builder?templateId=${row.original.id}`)}>Design</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={() => removeTpl(row.original)}>Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Subscribers" value={stats.totalSubscribers.toLocaleString()} icon={Users} intent="primary" />
        <KpiCard label="Scheduled" value={stats.scheduledCampaigns} icon={CalendarClock} intent="info" />
        <KpiCard label="Sent" value={stats.sentCampaigns} icon={Send} intent="success" />
        <KpiCard label="Total reached" value={stats.totalRecipients.toLocaleString()} icon={Mail} intent="warning" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Campaigns sent" value={stats.sentCampaigns} icon={Send} intent="primary" />
        <KpiCard label="Total opens" value={stats.totalOpens.toLocaleString()} icon={Eye} intent="info" />
        <KpiCard label="Total clicks" value={stats.totalClicks.toLocaleString()} icon={MousePointerClick} intent="warning" />
        <KpiCard
          label="Avg open rate"
          value={`${stats.totalRecipients ? Math.round((stats.totalOpens / stats.totalRecipients) * 1000) / 10 : 0}%`}
          icon={Percent}
          intent="success"
        />
      </div>

      {/* Per-segment KPI grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {segments.map((s) => (
          <KpiCard key={s.value} label={s.label} value={s.count.toLocaleString()} icon={Users} intent="info" />
        ))}
      </div>

      <Tabs defaultValue="campaigns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="system">System Emails</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={openCreateCmp}><Plus className="size-4" /> New campaign</Button>
          </div>
          <DataTable columns={campaignColumns} data={campaigns} pageSize={8}
            emptyState={<div className="flex flex-col items-center gap-2 text-muted-foreground"><Mail className="size-8 opacity-50" /><p className="text-sm font-medium">No campaigns yet</p></div>} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={openCreateTpl}><Plus className="size-4" /> New template</Button>
          </div>
          <DataTable columns={templateColumns} data={templates} pageSize={8}
            emptyState={<div className="flex flex-col items-center gap-2 text-muted-foreground"><FileText className="size-8 opacity-50" /><p className="text-sm font-medium">No templates yet</p></div>} />
        </TabsContent>

        <TabsContent value="automations" className="space-y-3">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={createAut}><Plus className="size-4" /> New automation</Button>
          </div>
          {automations.length === 0 ? (
            <div className="rounded-xl border border-border/70 bg-card p-10 text-center text-sm text-muted-foreground">No automations yet</div>
          ) : automations.map((a) => (
            <div key={a.id} className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Zap className="size-5" /></div>
                <div>
                  <p className="font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Trigger: {a.trigger === "subscriber_created" ? "New subscriber" : `Tag added${a.triggerTag ? ` (${a.triggerTag})` : ""}`} · {a.sentCount.toLocaleString()} sent
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={a.active} onCheckedChange={() => toggleAut(a)} />
                <Button variant="outline" size="sm" onClick={() => router.push(`/admin/marketing/email/automation?automationId=${a.id}`)}>Edit</Button>
                <Button variant="ghost" size="sm" onClick={() => removeAut(a)}>Delete</Button>
              </div>
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Use “Edit” to open the visual step builder (wait / email) for each automation.</p>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemEmailsTab />
        </TabsContent>
      </Tabs>

      {/* Campaign editor */}
      <Dialog open={cmpOpen} onOpenChange={setCmpOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{cmpEditing ? "Edit campaign" : "New campaign"}</DialogTitle>
            <DialogDescription>Subject, sender and audience. The block content is designed in the email builder (later phase).</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Editor label="Subject" required value={cmpForm.subject} onChange={(v) => setCmpForm((f) => ({ ...f, subject: v }))} />
            <Editor label="Preview text" value={cmpForm.previewText} onChange={(v) => setCmpForm((f) => ({ ...f, previewText: v }))} />
            <div className="grid grid-cols-2 gap-4">
              <Editor label="From name" value={cmpForm.fromName} onChange={(v) => setCmpForm((f) => ({ ...f, fromName: v }))} />
              <Editor label="Reply-to" value={cmpForm.replyTo} onChange={(v) => setCmpForm((f) => ({ ...f, replyTo: v }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Audience</Label>
              <Select value={cmpForm.audience} onValueChange={(v) => setCmpForm((f) => ({ ...f, audience: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{segments.map((s) => <SelectItem key={s.value} value={s.value}>{s.label} ({s.count.toLocaleString()})</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCmpOpen(false)}>Cancel</Button>
            <Button onClick={saveCmp} disabled={!cmpForm.subject.trim()}>{cmpEditing ? "Save changes" : "Create campaign"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template editor */}
      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{tplEditing ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Editor label="Name" required value={tplForm.name} onChange={(v) => setTplForm((f) => ({ ...f, name: v }))} />
            <Editor label="Subject" value={tplForm.subject} onChange={(v) => setTplForm((f) => ({ ...f, subject: v }))} />
            <Editor label="Preview text" value={tplForm.previewText} onChange={(v) => setTplForm((f) => ({ ...f, previewText: v }))} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplOpen(false)}>Cancel</Button>
            <Button onClick={saveTpl} disabled={!tplForm.name.trim()}>{tplEditing ? "Save changes" : "Create template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule */}
      <Dialog open={!!schedFor} onOpenChange={(o) => !o && setSchedFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Schedule campaign</DialogTitle><DialogDescription>{schedFor?.subject}</DialogDescription></DialogHeader>
          <Editor label="Send at" type="datetime-local" value={schedAt} onChange={setSchedAt} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSchedFor(null)}>Cancel</Button>
            <Button onClick={doSchedule} disabled={!schedAt}>Schedule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Test send */}
      <Dialog open={!!testFor} onOpenChange={(o) => !o && setTestFor(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Send test email</DialogTitle><DialogDescription>{testFor?.subject}</DialogDescription></DialogHeader>
          <Editor label="Recipient email" type="email" value={testEmail} onChange={setTestEmail} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestFor(null)}>Cancel</Button>
            <Button onClick={doTest} disabled={!testEmail}>Send test</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}

function Editor({
  label, value, onChange, required, type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; required?: boolean; type?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
