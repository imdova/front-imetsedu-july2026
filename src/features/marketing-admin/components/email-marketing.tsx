"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, MoreHorizontal, Users, Send, Mail, MousePointerClick, Percent, FileText, Zap,
  LayoutDashboard, ArrowRight, Eye, Sparkles, GitBranch, Pencil, Trash2, Play, Pause, ArrowUpDown,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  Campaign, CampaignInput, CampaignStatus, EmailTemplate, TemplateInput, TemplateCategory,
  AudienceSegment, Automation, EmailStats,
} from "@/lib/db/email-marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { SystemEmailsTab } from "./system-emails-tab";
import { SubscribersTab } from "./subscribers-tab";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useConfirm } from "@/hooks/use-confirm";
import { timeAgo } from "@/lib/utils/time-ago";
import { cn } from "@/lib/utils";
import { parseFlow, triggerSummary } from "@/features/marketing-admin/lib/automation-steps";

const STATUS_BADGE: Record<CampaignStatus, "default" | "secondary" | "outline"> = {
  SENT: "default", SCHEDULED: "outline", DRAFT: "secondary",
};
const emptyCampaign: CampaignInput = {
  subject: "", previewText: "", fromName: "IMETS School", replyTo: "hello@imetsedu.com", audience: "all", status: "DRAFT",
};
const emptyTemplate: TemplateInput = { name: "", subject: "", previewText: "", category: "" };

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
  const [tab, setTab] = React.useState("dashboard");

  const openRate = stats.totalRecipients ? Math.round((stats.totalOpens / stats.totalRecipients) * 1000) / 10 : 0;
  const clickRate = stats.totalRecipients ? Math.round((stats.totalClicks / stats.totalRecipients) * 1000) / 10 : 0;
  const recentCampaigns = React.useMemo(
    () => [...campaigns].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5),
    [campaigns],
  );
  const maxSegCount = Math.max(1, ...segments.map((s) => s.count));

  const refreshStats = React.useCallback(async () => {
    const res = await dal.emailMarketing.fetchEmailStats();
    if (res.ok) setStats(res.data);
  }, []);
  const upsertCampaign = (c: Campaign) =>
    setCampaigns((p) => (p.some((x) => x.id === c.id) ? p.map((x) => (x.id === c.id ? c : x)) : [c, ...p]));

  const segLabel = (v: string) => segments.find((s) => s.value === v)?.label ?? v;

  /* ── Campaign create/edit now live on the full-page wizard ── */
  const openCreateCmp = () => router.push("/admin/marketing/email/new");
  const openEditCmp = (c: Campaign) => router.push(`/admin/marketing/email/new?campaignId=${c.id}`);

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
  const openEditTpl = (t: EmailTemplate) => { setTplEditing(t); setTplForm({ name: t.name, subject: t.subject, previewText: t.previewText, category: t.category ?? "" }); setTplOpen(true); };
  const [previewTpl, setPreviewTpl] = React.useState<EmailTemplate | null>(null);
  const [tplCats, setTplCats] = React.useState<TemplateCategory[]>([]);
  const refreshTplCats = React.useCallback(async () => {
    const res = await dal.emailMarketing.fetchTemplateCategories();
    if (res.ok) setTplCats(res.data);
  }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- setState runs after an await, not synchronously
  React.useEffect(() => { refreshTplCats(); }, [refreshTplCats]);
  const addTplCat = async (name: string) => {
    const res = await dal.emailMarketing.createTemplateCategory(name);
    if (res.ok) { await refreshTplCats(); toast.success("Category added"); } else toast.error(res.error);
  };
  const renameTplCat = async (oldName: string, name: string) => {
    const res = await dal.emailMarketing.renameTemplateCategory(oldName, name);
    if (res.ok) { await refreshTplCats(); const r2 = await dal.emailMarketing.fetchTemplates(); if (r2.ok) setTemplates(r2.data); toast.success("Category renamed"); } else toast.error(res.error);
  };
  const deleteTplCat = async (name: string) => {
    const okConfirm = await confirm({ title: "Delete category", description: `“${name}” will be removed. Its templates become uncategorized.`, confirmText: "Delete", variant: "destructive" });
    if (!okConfirm) return;
    const res = await dal.emailMarketing.deleteTemplateCategory(name);
    if (res.ok) { await refreshTplCats(); const r2 = await dal.emailMarketing.fetchTemplates(); if (r2.ok) setTemplates(r2.data); toast.success("Category deleted"); } else toast.error(res.error);
  };
  const saveTpl = async () => {
    if (!tplForm.name.trim()) return;
    const res = tplEditing
      ? await dal.emailMarketing.updateTemplate(tplEditing.id, tplForm)
      : await dal.emailMarketing.createTemplate(tplForm);
    if (res.ok && res.data) {
      setTemplates((p) => (p.some((x) => x.id === res.data!.id) ? p.map((x) => (x.id === res.data!.id ? res.data! : x)) : [res.data!, ...p]));
      refreshTplCats();
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

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 rounded-none border-b border-border bg-transparent p-0">
          <TabTrigger value="dashboard" icon={LayoutDashboard} label="Dashboard" />
          <TabTrigger value="subscribers" icon={Users} label="Subscribers" />
          <TabTrigger value="campaigns" icon={Send} label="Campaigns" />
          <TabTrigger value="templates" icon={FileText} label="Templates" />
          <TabTrigger value="automations" icon={Zap} label="Automations" />
          <TabTrigger value="system" icon={Mail} label="System Emails" />
        </TabsList>

        {/* ── Dashboard ── */}
        <TabsContent value="dashboard" className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Subscribers" value={stats.totalSubscribers.toLocaleString()} icon={Users} intent="primary" />
            <KpiCard label="Campaigns sent" value={stats.sentCampaigns} icon={Send} intent="success" />
            <KpiCard label="Total reached" value={stats.totalRecipients.toLocaleString()} icon={Mail} intent="info" />
            <KpiCard label="Avg open rate" value={`${openRate}%`} icon={Percent} intent="warning" />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {/* Recent campaigns */}
            <div className="rounded-2xl border border-border/60 bg-card lg:col-span-2">
              <div className="flex items-center justify-between gap-3 border-b border-border/60 p-4">
                <div className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Send className="size-4" /></span>
                  <h3 className="text-sm font-semibold">Recent campaigns</h3>
                </div>
                {campaigns.length > 0 && (
                  <button onClick={() => setTab("campaigns")} className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
                    View all <ArrowRight className="size-3.5" />
                  </button>
                )}
              </div>
              {recentCampaigns.length === 0 ? (
                <div className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
                  <Mail className="size-8 opacity-40" />
                  <p className="text-sm font-medium">No campaigns yet</p>
                  <Button size="sm" className="mt-1 gap-1.5" onClick={openCreateCmp}><Plus className="size-4" /> Create your first</Button>
                </div>
              ) : (
                <ul className="divide-y divide-border/50">
                  {recentCampaigns.map((c) => (
                    <li key={c.id}>
                      <button onClick={() => openEditCmp(c)} className="flex w-full items-center gap-3 p-3.5 text-left transition hover:bg-muted/40">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{c.subject || "Untitled campaign"}</p>
                          <p className="truncate text-xs text-muted-foreground">
                            {segLabel(c.audience)} · {c.status === "SENT" && c.sentAt ? `Sent ${timeAgo(c.sentAt)}` : c.status === "SCHEDULED" && c.scheduledAt ? timeAgo(c.scheduledAt) : `Created ${timeAgo(c.createdAt)}`}
                          </p>
                        </div>
                        {c.status === "SENT" && (
                          <div className="hidden shrink-0 items-center gap-3 text-xs tabular-nums text-muted-foreground sm:flex">
                            <span className="inline-flex items-center gap-1"><Eye className="size-3.5" /> {c.openRate}%</span>
                            <span className="inline-flex items-center gap-1"><MousePointerClick className="size-3.5" /> {c.clickRate}%</span>
                          </div>
                        )}
                        <Badge variant={STATUS_BADGE[c.status]} className="shrink-0">{c.status}</Badge>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Side column: engagement + audiences + quick actions */}
            <div className="space-y-5">
              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><Eye className="size-4" /></span>
                  Engagement
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat label="Total opens" value={stats.totalOpens.toLocaleString()} sub={`${openRate}% open rate`} />
                  <MiniStat label="Total clicks" value={stats.totalClicks.toLocaleString()} sub={`${clickRate}% click rate`} />
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
                  <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-600"><Users className="size-4" /></span>
                  Audiences
                </h3>
                {segments.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No audience segments.</p>
                ) : (
                  <ul className="space-y-2.5">
                    {segments.map((s) => (
                      <li key={s.value}>
                        <div className="mb-1 flex items-center justify-between text-xs">
                          <span className="font-medium">{s.label}</span>
                          <span className="tabular-nums text-muted-foreground">{s.count.toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-primary/70" style={{ width: `${Math.round((s.count / maxSegCount) * 100)}%` }} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="grid gap-4 sm:grid-cols-3">
            <QuickAction icon={Send} title="New campaign" desc="Compose & send to a segment" onClick={openCreateCmp} />
            <QuickAction icon={FileText} title="New template" desc="Reusable branded design" onClick={openCreateTpl} />
            <QuickAction icon={Sparkles} title="New automation" desc="Smart drip sequence" onClick={createAut} />
          </div>
        </TabsContent>

        <TabsContent value="subscribers">
          <SubscribersTab />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={openCreateCmp}><Plus className="size-4" /> New campaign</Button>
          </div>
          <DataTable columns={campaignColumns} data={campaigns} pageSize={8}
            emptyState={<div className="flex flex-col items-center gap-2 text-muted-foreground"><Mail className="size-8 opacity-50" /><p className="text-sm font-medium">No campaigns yet</p></div>} />
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <TemplatesGallery
            templates={templates}
            categories={tplCats}
            onNew={openCreateTpl}
            onEdit={openEditTpl}
            onDelete={removeTpl}
            onPreview={setPreviewTpl}
            onUse={applyTpl}
            onOpenDesign={(t) => router.push(`/admin/marketing/email/builder?templateId=${t.id}`)}
            onAddCategory={addTplCat}
            onRenameCategory={renameTplCat}
            onDeleteCategory={deleteTplCat}
          />
        </TabsContent>

        <TabsContent value="automations" className="space-y-4">
          <AutomationsPanel
            automations={automations}
            onCreate={createAut}
            onToggle={toggleAut}
            onDelete={removeAut}
            onEdit={(a) => router.push(`/admin/marketing/email/automation?automationId=${a.id}`)}
          />
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <SystemEmailsTab />
        </TabsContent>
      </Tabs>

      {/* Template editor */}
      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{tplEditing ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Editor label="Name" required value={tplForm.name} onChange={(v) => setTplForm((f) => ({ ...f, name: v }))} />
            <Editor label="Subject" value={tplForm.subject} onChange={(v) => setTplForm((f) => ({ ...f, subject: v }))} />
            <Editor label="Preview text" value={tplForm.previewText} onChange={(v) => setTplForm((f) => ({ ...f, previewText: v }))} />
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Category</Label>
              <Input
                list="tpl-cat-options"
                value={tplForm.category ?? ""}
                onChange={(e) => setTplForm((f) => ({ ...f, category: e.target.value }))}
                placeholder="Uncategorized — type or pick a category"
              />
              <datalist id="tpl-cat-options">
                {tplCats.map((c) => <option key={c.name} value={c.name} />)}
              </datalist>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplOpen(false)}>Cancel</Button>
            <Button onClick={saveTpl} disabled={!tplForm.name.trim()}>{tplEditing ? "Save changes" : "Create template"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Template preview */}
      <Dialog open={!!previewTpl} onOpenChange={(o) => !o && setPreviewTpl(null)}>
        <DialogContent className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl">
          <DialogHeader className="border-b border-border/60 p-4">
            <DialogTitle className="truncate">{previewTpl?.name}</DialogTitle>
            {previewTpl?.subject && <DialogDescription className="truncate">{previewTpl.subject}</DialogDescription>}
          </DialogHeader>
          <div className="max-h-[70vh] overflow-auto bg-muted/30">
            {previewTpl?.body ? (
              <iframe title="Template preview" srcDoc={previewTpl.body} className="h-[70vh] w-full border-0 bg-white" sandbox="" />
            ) : (
              <div className="flex flex-col items-center gap-2 p-16 text-center text-muted-foreground">
                <FileText className="size-8 opacity-40" />
                <p className="text-sm">This template has no design yet.</p>
                {previewTpl && <Button size="sm" className="mt-1 gap-1.5" onClick={() => { const t = previewTpl; setPreviewTpl(null); router.push(`/admin/marketing/email/builder?templateId=${t.id}`); }}><Pencil className="size-4" /> Design it</Button>}
              </div>
            )}
          </div>
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

function TabTrigger({ value, icon: Icon, label }: { value: string; icon: React.ElementType; label: string }) {
  return (
    <TabsTrigger
      value={value}
      className={cn(
        "-mb-px gap-1.5 rounded-none border-b-2 border-transparent bg-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition hover:text-foreground",
        "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
      )}
    >
      <Icon className="size-4" /> <span>{label}</span>
    </TabsTrigger>
  );
}

function MiniStat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-xl bg-muted/40 p-3">
      <div className="text-lg font-bold tabular-nums">{value}</div>
      <div className="text-xs font-medium">{label}</div>
      {sub && <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function QuickAction({ icon: Icon, title, desc, onClick }: {
  icon: React.ElementType; title: string; desc: string; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition hover:border-primary/40 hover:shadow-md"
    >
      <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-foreground">{desc}</p>
      </div>
      <Plus className="size-4 text-muted-foreground transition group-hover:text-primary" />
    </button>
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

/* ────────────────────────── Automations list ────────────────────────── */

type AutFilter = "all" | "active" | "paused";
type AutSort = "newest" | "name" | "sent";

/** Gradient tiles cycled by card index (mirrors the reference design). */
const AUT_TILES = [
  "from-orange-500 to-orange-600",
  "from-sky-500 to-sky-600",
  "from-violet-500 to-violet-600",
  "from-emerald-500 to-emerald-600",
  "from-rose-500 to-rose-600",
  "from-indigo-500 to-indigo-600",
];

function AutomationsPanel({
  automations, onCreate, onToggle, onDelete, onEdit,
}: {
  automations: Automation[];
  onCreate: () => void;
  onToggle: (a: Automation) => void;
  onDelete: (a: Automation) => void;
  onEdit: (a: Automation) => void;
}) {
  const [filter, setFilter] = React.useState<AutFilter>("all");
  const [sort, setSort] = React.useState<AutSort>("newest");

  const counts = React.useMemo(() => ({
    all: automations.length,
    active: automations.filter((a) => a.active).length,
    paused: automations.filter((a) => !a.active).length,
  }), [automations]);

  const visible = React.useMemo(() => {
    const list = automations.filter((a) =>
      filter === "all" ? true : filter === "active" ? a.active : !a.active);
    const sorted = [...list];
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === "sent") sorted.sort((a, b) => b.sentCount - a.sentCount);
    else sorted.sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
    return sorted;
  }, [automations, filter, sort]);

  return (
    <div className="space-y-4">
      {/* Filter / sort bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-1 rounded-xl border border-border/60 bg-muted/40 p-1">
          {(["all", "active", "paused"] as AutFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium capitalize transition",
                filter === f ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
              <span className={cn(
                "rounded-full px-1.5 text-[11px] font-semibold tabular-nums",
                filter === f ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground",
              )}>{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Select value={sort} onValueChange={(v) => setSort(v as AutSort)}>
            <SelectTrigger className="h-9 w-[168px] gap-1.5">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Sort by: Newest</SelectItem>
              <SelectItem value="name">Sort by: Name</SelectItem>
              <SelectItem value="sent">Sort by: Most sent</SelectItem>
            </SelectContent>
          </Select>
          <Button className="gap-1.5" onClick={onCreate}><Plus className="size-4" /> New automation</Button>
        </div>
      </div>

      {/* Cards */}
      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 bg-card p-10 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Zap className="size-6" /></div>
          <p className="text-sm font-medium">{filter === "all" ? "No automations yet" : `No ${filter} automations`}</p>
          <p className="mt-1 text-xs text-muted-foreground">Create a smart drip sequence that runs on autopilot.</p>
          <Button className="mt-4 gap-1.5" onClick={onCreate}><Plus className="size-4" /> New automation</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((a, i) => (
            <AutomationCard key={a.id} a={a} index={i} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
          ))}
        </div>
      )}
    </div>
  );
}

function AutomationCard({
  a, index, onToggle, onDelete, onEdit,
}: {
  a: Automation; index: number;
  onToggle: (a: Automation) => void; onDelete: (a: Automation) => void; onEdit: (a: Automation) => void;
}) {
  const flow = React.useMemo(() => parseFlow(a.steps), [a.steps]);
  const emails = flow.steps.filter((s) => s.type === "email").length;
  const stepCount = flow.steps.length;
  const groups = flow.settings.triggerGroups ?? [];
  const desc = triggerSummary(a.trigger, groups);
  const tags = groups.length ? groups : [a.trigger === "subscriber_created" ? "New subscriber" : "Group trigger"];
  const tile = AUT_TILES[index % AUT_TILES.length];

  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        {/* Identity */}
        <div className="flex min-w-0 items-start gap-3.5">
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm", tile)}>
            <Zap className="size-5" />
          </span>
          <div className="min-w-0">
            <button onClick={() => onEdit(a)} className="truncate text-left text-base font-bold hover:text-primary">{a.name || "Untitled automation"}</button>
            <p className="mt-0.5 truncate text-sm text-muted-foreground">{desc}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {tags.slice(0, 3).map((t) => (
                <span key={t} className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">{t}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics + status + menu */}
        <div className="flex items-center justify-between gap-4 lg:justify-end lg:gap-6">
          <div className="flex items-center gap-5 sm:gap-7">
            <AutMetric value={a.sentCount.toLocaleString()} label="Sent" sub="All time" />
            <AutMetric value={emails} label="Emails" sub="In flow" />
            <AutMetric value={stepCount} label="Steps" sub="In flow" />
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <CountChip icon={Mail} n={emails} />
              <CountChip icon={GitBranch} n={stepCount} />
            </span>
            <StatusPill active={a.active} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8 rounded-full"><MoreHorizontal className="size-4" /></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => onEdit(a)}><Pencil className="size-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onToggle(a)}>
                  {a.active ? <><Pause className="size-4" /> Pause</> : <><Play className="size-4" /> Activate</>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onDelete(a)} className="text-destructive focus:text-destructive"><Trash2 className="size-4" /> Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}

function AutMetric({ value, label, sub }: { value: React.ReactNode; label: string; sub: string }) {
  return (
    <div className="text-center lg:text-left">
      <div className="text-2xl font-extrabold leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-[11px] font-semibold">{label}</div>
      <div className="text-[10px] text-muted-foreground">{sub}</div>
    </div>
  );
}

function CountChip({ icon: Icon, n }: { icon: React.ElementType; n: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-border/70 px-2 py-1 text-xs font-medium text-muted-foreground">
      <Icon className="size-3.5" /> {String(n).padStart(2, "0")}
    </span>
  );
}

function StatusPill({ active }: { active: boolean }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
      active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-border bg-muted text-muted-foreground",
    )}>
      <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-500" : "bg-muted-foreground/50")} />
      {active ? "Running" : "Paused"}
    </span>
  );
}

/* ────────────────────────── Templates gallery ────────────────────────── */

const UNCATEGORIZED = "__uncat__";

function TemplatesGallery({
  templates, categories, onNew, onEdit, onDelete, onPreview, onUse, onOpenDesign,
  onAddCategory, onRenameCategory, onDeleteCategory,
}: {
  templates: EmailTemplate[]; categories: TemplateCategory[];
  onNew: () => void; onEdit: (t: EmailTemplate) => void; onDelete: (t: EmailTemplate) => void;
  onPreview: (t: EmailTemplate) => void; onUse: (t: EmailTemplate) => void; onOpenDesign: (t: EmailTemplate) => void;
  onAddCategory: (name: string) => void; onRenameCategory: (oldName: string, name: string) => void; onDeleteCategory: (name: string) => void;
}) {
  const [active, setActive] = React.useState<string | null>(null); // null = All
  const [catDlg, setCatDlg] = React.useState<{ mode: "new" | "rename"; original?: string; value: string } | null>(null);

  const uncatCount = templates.filter((t) => !t.category).length;
  const visible = React.useMemo(() => {
    if (active === null) return templates;
    if (active === UNCATEGORIZED) return templates.filter((t) => !t.category);
    return templates.filter((t) => t.category === active);
  }, [templates, active]);

  const submitCat = () => {
    const v = catDlg?.value.trim();
    if (!v) return;
    if (catDlg!.mode === "new") onAddCategory(v);
    else if (catDlg!.original && catDlg!.original !== v) onRenameCategory(catDlg!.original, v);
    setCatDlg(null);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      {/* Category sidebar */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</span>
            <button onClick={() => setCatDlg({ mode: "new", value: "" })} title="Add category" className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><Plus className="size-4" /></button>
          </div>
          <div className="space-y-0.5 p-2">
            <CatRow label="All templates" count={templates.length} active={active === null} onClick={() => setActive(null)} />
            {categories.map((c) => (
              <CatRow
                key={c.name} label={c.name} count={c.count} active={active === c.name}
                onClick={() => setActive(c.name)}
                onRename={() => setCatDlg({ mode: "rename", original: c.name, value: c.name })}
                onDelete={() => onDeleteCategory(c.name)}
              />
            ))}
            {uncatCount > 0 && (
              <CatRow label="Uncategorized" count={uncatCount} active={active === UNCATEGORIZED} onClick={() => setActive(UNCATEGORIZED)} />
            )}
          </div>
        </div>
      </aside>

      {/* Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visible.length} {visible.length === 1 ? "template" : "templates"}{active && active !== UNCATEGORIZED ? ` in “${active}”` : ""}
          </p>
          <Button className="gap-1.5" onClick={onNew}><Plus className="size-4" /> New template</Button>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card p-12 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><FileText className="size-6" /></div>
            <p className="text-sm font-medium">No templates here yet</p>
            <Button className="mt-4 gap-1.5" onClick={onNew}><Plus className="size-4" /> New template</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {visible.map((t) => (
              <TemplateCard key={t.id} t={t} onEdit={onEdit} onDelete={onDelete} onPreview={onPreview} onUse={onUse} onOpenDesign={onOpenDesign} />
            ))}
          </div>
        )}
      </div>

      {/* Add / rename category */}
      <Dialog open={!!catDlg} onOpenChange={(o) => !o && setCatDlg(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{catDlg?.mode === "new" ? "New category" : "Rename category"}</DialogTitle></DialogHeader>
          <Input value={catDlg?.value ?? ""} autoFocus onChange={(e) => setCatDlg((d) => (d ? { ...d, value: e.target.value } : d))} onKeyDown={(e) => e.key === "Enter" && submitCat()} placeholder="e.g. CIC offers" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDlg(null)}>Cancel</Button>
            <Button onClick={submitCat} disabled={!catDlg?.value.trim()}>{catDlg?.mode === "new" ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CatRow({ label, count, active, onClick, onRename, onDelete }: {
  label: string; count: number; active: boolean; onClick: () => void; onRename?: () => void; onDelete?: () => void;
}) {
  return (
    <div className={cn("group flex items-center gap-1 rounded-lg pr-1 transition", active ? "bg-primary/10" : "hover:bg-muted/60")}>
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-1.5 text-left">
        <span className={cn("truncate text-sm", active ? "font-semibold text-primary" : "text-foreground")}>{label}</span>
        <span className={cn("shrink-0 rounded-full px-1.5 text-[11px] font-semibold tabular-nums", active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{count}</span>
      </button>
      {(onRename || onDelete) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition hover:bg-muted group-hover:opacity-100" title="Category options"><MoreHorizontal className="size-3.5" /></button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            {onRename && <DropdownMenuItem onClick={onRename}><Pencil className="size-4" /> Rename</DropdownMenuItem>}
            {onDelete && <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive"><Trash2 className="size-4" /> Delete</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function TemplateCard({ t, onEdit, onDelete, onPreview, onUse, onOpenDesign }: {
  t: EmailTemplate; onEdit: (t: EmailTemplate) => void; onDelete: (t: EmailTemplate) => void;
  onPreview: (t: EmailTemplate) => void; onUse: (t: EmailTemplate) => void; onOpenDesign: (t: EmailTemplate) => void;
}) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative h-52 overflow-hidden border-b border-border/60 bg-muted/40">
        {t.body ? (
          <div className="pointer-events-none absolute left-0 top-0 origin-top-left" style={{ width: 600, transform: "scale(0.417)" }}>
            <iframe title={t.name} srcDoc={t.body} className="h-[520px] w-[600px] border-0 bg-white" scrolling="no" sandbox="" />
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <FileText className="size-7 opacity-40" />
            <span className="text-[11px]">No design yet</span>
          </div>
        )}
        {/* Hover overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-foreground/40 opacity-0 backdrop-blur-[1px] transition group-hover:opacity-100">
          <Button size="sm" className="w-32 gap-1.5" onClick={() => onPreview(t)}><Eye className="size-4" /> Preview</Button>
          <Button size="sm" variant="secondary" className="w-32 gap-1.5" onClick={() => onOpenDesign(t)}><Pencil className="size-4" /> Design</Button>
        </div>
      </div>
      {/* Footer */}
      <div className="flex items-center justify-between gap-2 p-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{t.name}</p>
          {t.category ? <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">{t.category}</span> : null}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild><button className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground hover:bg-muted"><MoreHorizontal className="size-4" /></button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={() => onPreview(t)}><Eye className="size-4" /> Preview</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenDesign(t)}><Pencil className="size-4" /> Edit design</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(t)}><FileText className="size-4" /> Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onUse(t)}><Send className="size-4" /> Use in campaign</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onDelete(t)} className="text-destructive focus:text-destructive"><Trash2 className="size-4" /> Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
