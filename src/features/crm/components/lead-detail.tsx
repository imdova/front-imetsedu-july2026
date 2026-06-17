"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Phone,
  MessageCircle,
  Mail,
  StickyNote,
  ArrowRightLeft,
  FileText,
  ChevronDown,
  Pin,
  CalendarDays,
  Copy,
  LayoutGrid,
  CreditCard,
  Award,
  Plus,
  Upload,
  GraduationCap,
  CheckCircle2,
  GitBranch,
  ChevronRight,
  ArrowLeft,
  Check,
  Loader2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

import type { Lead, PipelineStage, ActivityKind, FollowUpStatus } from "@/lib/db/crm";
import { dal } from "@/lib/dal";
import { usePermission } from "@/hooks/use-permission";
import { cn, getInitials, createId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
  DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { PriorityBadge } from "./lead-badges";
import { PaymentCard, PaymentCardEmpty } from "./payment-card";
import { AssignPipelineTrigger } from "./assign-pipeline-dialog";
import { LeadPaymentTab } from "./lead-payment-tab";
import { LeadTransitionModal, type TransitionLogData } from "./lead-transition-modal";

const GATED_STAGES = ["contacted", "enrolled", "lost"] as const;
type GatedStage = (typeof GATED_STAGES)[number];
const isGated = (stageKey: string): stageKey is GatedStage =>
  (GATED_STAGES as readonly string[]).includes(stageKey);
import { usePipelineStages } from "@/hooks/use-pipeline-stages";
import { STAGE_LABEL_KEY } from "../lib/maps";
import { useAuth } from "@/store";

const ACTIVITY_ICON: Record<ActivityKind, React.ElementType> = {
  call: Phone, whatsapp: MessageCircle, email: Mail, note: StickyNote, stage: ArrowRightLeft, form: FileText,
};

/** Backend logs stage moves as the raw string "Stage changed to <stageKey>".
 * Turn that into a friendly, translated label (falls back to a prettified key
 * for custom-pipeline stages). Other activity text is returned unchanged. */
const prettifyStage = (k: string) => k.replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

/** Exact date + time for an activity, localized. */
function fmtDateTime(iso: string | undefined, locale: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}
function displayActivityText(
  text: string,
  t: (k: string, vals?: Record<string, string>) => string,
  tr: (k: string) => string,
): string {
  const m = text.match(/^Stage changed to\s+(.+)$/i);
  if (!m) return text;
  const key = m[1].trim();
  const label = STAGE_LABEL_KEY[key] ? tr(STAGE_LABEL_KEY[key]) : prettifyStage(key);
  return t("pipelineMovedTo", { stage: label });
}

const FOLLOWUP_STYLE: Record<FollowUpStatus, string> = {
  overdue: "bg-destructive/12 text-destructive",
  today: "bg-warning/18 text-warning",
  upcoming: "bg-chart-3/15 text-chart-3",
  done: "bg-success/15 text-success",
};

type PipelineStageList = { id: string; title: string; stages: { key: string; name: string }[] };

export function LeadDetail({
  lead: initial,
  stages,
  assignablePipelines = [],
  pipelineStages = [],
  courseOptions = [],
  groupOptions = [],
}: {
  lead: Lead;
  stages: PipelineStage[];
  assignablePipelines?: { id: string; title: string }[];
  pipelineStages?: PipelineStageList[];
  courseOptions?: { value: string; label: string; image?: string }[];
  groupOptions?: { value: string; label: string }[];
}) {
  const t = useTranslations("Crm");
  const locale = useLocale();
  const tr = t as unknown as (k: string) => string;
  const tv = t as unknown as (k: string, vals?: Record<string, string>) => string;
  // Action-button permission gates (hidden/disabled when not permitted).
  const canEdit = usePermission("crm.leads.edit");
  const canNote = usePermission("crm.leads.add_note");
  const canAssign = usePermission("crm.leads.assign");
  const canCert = usePermission("lms.certificates.upload");
  const { stages: crmStages, getDisplayName } = usePipelineStages(stages);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const displayActivityTextLocal = React.useCallback((text: string) => {
    const m = text.match(/^Stage changed to\s+(.+)$/i);
    if (!m) return text;
    const key = m[1].trim();
    const label = getDisplayName(key);
    return tv("pipelineMovedTo", { stage: label });
  }, [getDisplayName, tv]);

  const [lead, setLead] = React.useState(initial);
  const [channel, setChannel] = React.useState<"note" | "whatsapp" | "email" | "sms">("note");
  const [draft, setDraft] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState(initial.jobTitle ?? "");
  const [saving, setSaving] = React.useState(false);
  const [fuOpen, setFuOpen] = React.useState(false);
  const [fuNote, setFuNote] = React.useState("");
  const [fuDate, setFuDate] = React.useState("");
  const [fuTime, setFuTime] = React.useState("");
  const [fuSaving, setFuSaving] = React.useState(false);
  // Completing a follow-up opens a comment dialog (holds the target id).
  const [doneFu, setDoneFu] = React.useState<string | null>(null);
  const [doneNote, setDoneNote] = React.useState("");
  const [doneSaving, setDoneSaving] = React.useState(false);
  // A pending gated stage move, held while its qualification modal is open.
  const [pendingStage, setPendingStage] = React.useState<{ targetStage: GatedStage; run: (data?: TransitionLogData) => Promise<void> } | null>(null);

  /** Add the lead to a group's roster (so it appears in the group's student list). */
  const enrollInGroup = async (groupId: string) => {
    const r = await dal.groups.addLeadToGroup(groupId, lead.id);
    if (r.ok) toast.success(t("addedToGroup"));
    else toast.error(r.error);
  };

  // ─── Certificates ───
  const [certGroup, setCertGroup] = React.useState(groupOptions[0]?.value ?? "");
  const [certUploading, setCertUploading] = React.useState<"group" | "lms" | null>(null);
  const groupCertRef = React.useRef<HTMLInputElement>(null);
  const lmsCertRef = React.useRef<HTMLInputElement>(null);

  /** Upload a PDF and assign it as a certificate to this lead. */
  const uploadCert = async (file: File | undefined, which: "group" | "lms") => {
    if (!file) return;
    if (file.type !== "application/pdf") { toast.error(t("certPdfOnly")); return; }
    setCertUploading(which);
    const up = await dal.upload.uploadFile(file);
    if (!up.ok) { setCertUploading(null); toast.error(up.error); return; }
    const res = await dal.crm.assignCertificate(lead.id, {
      certificateLink: up.data.url,
      groupId: which === "group" ? (certGroup || undefined) : undefined,
    });
    setCertUploading(null);
    if (res.ok) { setLead(res.data); toast.success(t("certUploaded")); }
    else toast.error(res.error);
  };

  /** Schedule a new follow-up — appended to lead.data.followUps via PATCH. */
  const addFollowUp = async () => {
    if (!fuDate) { toast.error(t("fuDateRequired")); return; }
    setFuSaving(true);
    const dueDateTime = fuTime ? `${fuDate}T${fuTime}` : fuDate;
    const label = new Date(dueDateTime).toLocaleString(
      locale === "ar" ? "ar-EG" : "en-US",
      fuTime
        ? { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }
        : { month: "short", day: "numeric", year: "numeric" },
    );
    const followUps = [
      ...lead.followUps,
      { id: createId("fu"), note: fuNote.trim(), date: label, dueDate: dueDateTime, status: "upcoming" as const },
    ];
    const res = await dal.crm.updateLeadFields(lead.id, { dataPatch: { followUps } });
    setFuSaving(false);
    if (res.ok) {
      setLead(res.data);
      setFuOpen(false); setFuNote(""); setFuDate(""); setFuTime("");
      toast.success(t("fuAdded"));
    } else {
      toast.error(res.error);
    }
  };

  const doMoveStage = async (stageKey: string, logData?: TransitionLogData) => {
    const res = await dal.crm.updateLeadStage(lead.id, stageKey, logData, lead.pipelineHistory);
    if (res.ok && res.data) {
      setLead(res.data);
      toast.success(t("stageMoved", { stage: getDisplayName(stageKey) }));
      if (stageKey === "enrolled" && logData?.groupId) await enrollInGroup(logData.groupId);
    } else if (!res.ok) {
      toast.error(res.error);
    }
  };
  // Gated stages (contacted/enrolled/lost) open their qualification modal first,
  // mirroring the pipeline board; other stages move immediately.
  const moveStage = (stageKey: string) => {
    if (isGated(stageKey)) setPendingStage({ targetStage: stageKey, run: (data) => doMoveStage(stageKey, data) });
    else void doMoveStage(stageKey);
  };

  const copy = (value: string) => {
    navigator.clipboard?.writeText(value);
    toast.success(t("copied"));
  };

  /** Persist a note to the lead (becomes the pinned note); other channels are
   * compose-and-log until a messaging endpoint exists. */
  const saveComposer = async () => {
    if (!draft.trim()) return;
    if (channel === "note") {
      setSaving(true);
      // Append to the lead's activity timeline (kept forever, server-timestamped)
      // rather than overwriting a single pinned-note field.
      const res = await dal.crm.addLeadActivity(lead.id, draft.trim());
      setSaving(false);
      if (res.ok) {
        setLead(res.data);
        setDraft("");
        toast.success(t("noteSaved"));
      } else {
        toast.error(res.error);
      }
      return;
    }
    toast.success(t("messageSent", { channel: tr(`channel${channel[0].toUpperCase()}${channel.slice(1)}`) }));
    setDraft("");
  };

  const saveJobTitle = async () => {
    const next = jobTitle.trim();
    if (next === (lead.jobTitle ?? "")) return;
    const res = await dal.crm.updateLeadFields(lead.id, { jobTitle: next });
    if (res.ok) {
      setLead(res.data);
      toast.success(t("leadUpdated"));
    } else {
      toast.error(res.error);
    }
  };

  const assignPipelines = async (ids: string[]) => {
    const res = await dal.crm.setLeadPipelines(lead.id, ids);
    if (res.ok && res.data) setLead(res.data);
    else if (!res.ok) toast.error(res.error);
  };

  const doMoveStageInPipeline = async (pipelineId: string, stageKey: string, stageName: string, logData?: TransitionLogData) => {
    const pipelineName = lead.pipelines?.find((p) => p.id === pipelineId)?.title;
    const res = await dal.crm.setLeadStageInPipeline(lead.id, pipelineId, stageKey, pipelineName, logData, lead.pipelineHistory);
    if (res.ok && res.data) {
      const updated = res.data;
      const updatedPipelines = (updated.pipelines ?? lead.pipelines ?? []).map((p) =>
        p.id === pipelineId ? { ...p, stage: stageKey } : p,
      );
      setLead({ ...updated, pipelines: updatedPipelines });
      toast.success(t("stageMoved", { stage: stageName }));
      if (stageKey === "enrolled" && logData?.groupId) await enrollInGroup(logData.groupId);
    } else if (!res.ok) {
      toast.error(res.error);
    }
  };
  const moveStageInPipeline = (pipelineId: string, stageKey: string, stageName: string) => {
    if (isGated(stageKey)) setPendingStage({ targetStage: stageKey, run: (data) => doMoveStageInPipeline(pipelineId, stageKey, stageName, data) });
    else void doMoveStageInPipeline(pipelineId, stageKey, stageName);
  };

  /** Complete a follow-up: log it to the activity timeline (server-stamped
   * date + time) with its comment, then remove it from the follow-up list. */
  const completeFollowUp = async () => {
    if (!doneFu) return;
    const target = lead.followUps.find((f) => f.id === doneFu);
    setDoneSaving(true);
    const comment = doneNote.trim();
    const text = comment ? t("fuDoneActivity", { note: comment }) : t("fuDoneActivityNoNote");
    // 1. Append a timeline activity (kept forever, server-timestamped).
    const a = await dal.crm.addLeadActivity(lead.id, text, target?.note || undefined);
    if (!a.ok) { setDoneSaving(false); toast.error(a.error); return; }
    // 2. Remove the follow-up from the alerts list (it now lives in the timeline).
    const followUps = lead.followUps.filter((f) => f.id !== doneFu);
    const res = await dal.crm.updateLeadFields(lead.id, { dataPatch: { followUps } });
    setDoneSaving(false);
    if (res.ok) {
      setLead(res.data);
      setDoneFu(null); setDoneNote("");
      toast.success(t("doneBtn"));
    } else {
      toast.error(res.error);
    }
  };

  const plan = lead.paymentPlan;
  const pct = plan ? Math.round((plan.paid / plan.totalAmount) * 100) : 0;
  const courseImageFor = (courseName: string) => courseOptions.find((o) => o.label === courseName)?.image;
  // Use the raw backend data directly (mirrors how the reference project reads apiLead.data.pipelineHistory).
  const rawPipelineHistory: any[] = Array.isArray(lead.rawData?.pipelineHistory) ? lead.rawData.pipelineHistory : [];
  // Fallback: activity-based stage moves for leads that pre-date the pipelineHistory system.
  const stageMoveActivities = lead.activities.filter((a) => a.kind === "stage");
  const hasPipelineHistory = rawPipelineHistory.length > 0 || stageMoveActivities.length > 0;
  // Everything except stage moves goes in the timeline.
  const timelineActivities = lead.activities.filter((a) => a.kind !== "stage");
  // Resolve a course-of-interest id to its title (the lead carries ids; names
  // come from the populated list or the page's course catalogue).
  const courseLabel = (id: string, i: number) =>
    courseOptions.find((o) => o.value === id)?.label ?? lead.courseNames?.[i] ?? id;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="space-y-4 border-b pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative">
              <Avatar className="size-16 border">
                <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">{getInitials(lead.fullName)}</AvatarFallback>
              </Avatar>
              <span className="absolute -bottom-1 start-1/2 -translate-x-1/2 rounded-full border bg-card px-1.5 text-xs font-semibold tabular-nums shadow-sm">{lead.score}</span>
            </div>
            <div className="space-y-1.5">
              <h1 className="font-heading text-xl font-bold tracking-tight">{lead.fullName}</h1>
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                {lead.specialty && <span>{lead.specialty}</span>}
                {lead.country && <span>· {lead.country}</span>}
                <span className="inline-flex items-center gap-1 rounded border px-1.5 text-xs">EN</span>
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <span className="grid size-5 place-items-center rounded-full bg-chart-2/20 text-[0.6rem] font-semibold text-chart-2">{getInitials(lead.counselorName)}</span>
                  {lead.counselorName} <span className="text-muted-foreground">({t("fCounselor").toLowerCase()})</span>
                </span>
                <button onClick={() => copy(`${lead.phoneCountryCode}${lead.phone}`)} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground" dir="ltr">
                  <Phone className="size-3.5" />{lead.phoneCountryCode} {lead.phone}<Copy className="size-3" />
                </button>
                <button onClick={() => copy(lead.email)} className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground">
                  <Mail className="size-3.5" />{lead.email}<Copy className="size-3" />
                </button>
              </div>
            </div>
          </div>
          <PriorityBadge priority={lead.priority} />
        </div>

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2">
          <ActionBtn icon={Phone} label={t("actCall")} href={`tel:${lead.phoneCountryCode}${lead.phone}`} />
          <ActionBtn icon={MessageCircle} label={t("actWhatsApp")} href={`https://wa.me/${(lead.whatsApp ?? lead.phone).replace(/\D/g, "")}`} external />
          <ActionBtn icon={Mail} label={t("actEmail")} href={`mailto:${lead.email}`} />
          {canEdit && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setFuOpen(true)}><CalendarDays className="size-4" />{t("actSchedule")}</Button>}
          {canNote && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setChannel("note")}><StickyNote className="size-4" />{t("actNote")}</Button>}
          <div className="ms-auto flex flex-wrap items-center justify-end gap-2">
            {/* Admin-only: manage which pipelines this lead belongs to */}
            {isAdmin && (
              <AssignPipelineTrigger
                pipelines={assignablePipelines}
                assignedIds={lead.assignedPipelineIds}
                onSave={assignPipelines}
              />
            )}
            {canEdit && <PipelineStatusMenu
              pipelines={lead.pipelines ?? []}
              pipelineStages={pipelineStages}
              fallbackLabel={getDisplayName(lead.stageKey)}
              onMove={moveStageInPipeline}
              t={t}
            />}
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5"><LayoutGrid className="size-4" />{t("tabOverview")}</TabsTrigger>
          <TabsTrigger value="payment" className="gap-1.5"><CreditCard className="size-4" />{t("tabPayment")}</TabsTrigger>
          <TabsTrigger value="certificate" className="gap-1.5"><Award className="size-4" />{t("tabCertificate")}</TabsTrigger>
        </TabsList>

        {/* ───── Overview ───── */}
        <TabsContent value="overview" className="mt-5">
          <div className="grid gap-6 lg:grid-cols-[260px_1fr_340px]">
            {/* Left: profile */}
            <div className="space-y-6">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <Field label={t("fSpecialty")} value={lead.specialty || "—"} />
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("currentJobTitle")}</p>
                    <Input
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      onBlur={saveJobTitle}
                      placeholder={t("jobTitlePlaceholder")}
                      readOnly={!canEdit}
                      disabled={!canEdit}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("courseInterest")}</p>
                    {lead.coursesOfInterest.length ? (
                      <div className="space-y-2">
                        {lead.coursesOfInterest.map((cid, i) => (
                          <div key={cid} className="rounded-xl bg-gradient-to-r from-primary to-[oklch(0.55_0.2_295)] px-4 py-3 text-sm font-medium text-white">
                            <GraduationCap className="mb-1 size-4" />{courseLabel(cid, i)}
                          </div>
                        ))}
                      </div>
                    ) : <p className="text-sm text-muted-foreground">—</p>}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("inquiryDate")}</p>
                  <p className="mt-1 font-medium">{lead.createdAt}</p>
                </CardContent>
              </Card>
              {hasPipelineHistory && (
                <Card>
                  <CardHeader><CardTitle className="text-base">{t("pipelineHistory")}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {rawPipelineHistory.length > 0
                      ? rawPipelineHistory.map((item: any, idx: number) => {
                          const ld = item.logData || {};
                          const note = ld.note || ld.notes || ld.lossNote;
                          const SKIP = new Set(["notes","note","lossNote","at","stage","pipelineId","pipeline","isQualified","paymentReceiptUrl","paymentVerified","paymentReceiptName","paymentReceiptFileName","paymentReceiptMimeType","paymentReceiptDataBase64","groupId"]);
                          const enrolledGroupName = ld.groupId ? (groupOptions.find((g) => g.value === ld.groupId)?.label ?? ld.groupId) : null;
                          const dynamicEntries = Object.entries(ld).filter(([k, v]) => !SKIP.has(k) && v !== null && v !== undefined && v !== "" && v !== false);
                          const hasData = note || ld.isQualified !== undefined || ld.paymentVerified || ld.paymentReceiptUrl || enrolledGroupName || dynamicEntries.length > 0;
                          const labelFor = (k: string) => k.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
                          return (
                          <div key={`${item.stage}-${idx}`} className="flex items-start gap-2 text-sm">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><ArrowRightLeft className="size-3" /></span>
                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-medium leading-tight">{tv("pipelineMovedTo", { stage: getDisplayName(item.stage) })}</p>
                                {item.pipelineName && (
                                  <span className="inline-block rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] text-indigo-700">{item.pipelineName}</span>
                                )}
                              </div>
                              {hasData && (
                                <div className="rounded-md border border-indigo-100/50 bg-indigo-50/50 p-2 space-y-1.5">
                                  {note && <p className="text-xs italic text-muted-foreground">&ldquo;{note}&rdquo;</p>}
                                  <div className="flex flex-wrap gap-1.5">
                                    {ld.isQualified !== undefined && (
                                      <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-semibold uppercase", ld.isQualified === "yes" ? "border-green-200 bg-green-100/70 text-green-800" : "border-red-200 bg-red-100/70 text-red-700")}>
                                        {ld.isQualified === "yes" ? "✓ Qualified" : "✗ Not Qualified"}
                                      </span>
                                    )}
                                    {ld.paymentVerified && (
                                      <span className="rounded border border-green-200 bg-green-100/70 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-green-800">Payment verified</span>
                                    )}
                                    {ld.paymentReceiptUrl && (
                                      <a href={ld.paymentReceiptUrl} target="_blank" rel="noreferrer" className="rounded border border-orange-200 bg-orange-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-orange-700 underline">View Receipt 📄</a>
                                    )}
                                    {enrolledGroupName && (
                                      <span className="rounded border border-indigo-200 bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700">
                                        🎓 {enrolledGroupName}
                                      </span>
                                    )}
                                    {dynamicEntries.map(([k, v]) => (
                                      <span key={k} className="rounded border border-indigo-200/50 bg-indigo-100/50 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-indigo-700">
                                        {typeof v === "boolean" ? labelFor(k) : `${labelFor(k)}: ${v}`}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground">{item.at ? fmtDateTime(item.at, locale) : "—"}</p>
                            </div>
                          </div>
                          );
                        })
                      : stageMoveActivities.map((m) => (
                          <div key={m.id} className="flex items-start gap-2 text-sm">
                            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"><ArrowRightLeft className="size-3" /></span>
                            <div className="min-w-0">
                              <p className="font-medium leading-tight">{displayActivityTextLocal(m.text)}</p>
                              <p className="text-xs text-muted-foreground">{m.at ? fmtDateTime(m.at, locale) : m.ago}</p>
                            </div>
                          </div>
                        ))
                    }
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Middle: composer + history + timeline */}
            <div className="space-y-6">
              {lead.pinnedNote && (
                <div className="flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/8 p-4">
                  <Pin className="mt-0.5 size-4 text-warning" /><p className="text-sm">{lead.pinnedNote}</p>
                </div>
              )}
              <Card>
                <CardContent className="pt-6">
                  <div className="mb-3 flex flex-wrap gap-4 border-b text-sm">
                    {(["note", "whatsapp", "email", "sms"] as const).map((c) => (
                      <button key={c} onClick={() => setChannel(c)}
                        className={cn("flex items-center gap-1.5 border-b-2 pb-2 font-medium transition-colors",
                          channel === c ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                        {c === "note" ? <StickyNote className="size-4" /> : c === "email" ? <Mail className="size-4" /> : <MessageCircle className="size-4" />}
                        {c === "note" ? t("addNote") : tr(`channel${c[0].toUpperCase()}${c.slice(1)}`)}
                      </button>
                    ))}
                  </div>
                  <Textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={t("notePlaceholder")} className="min-h-28" />
                  <div className="mt-3 flex justify-end">
                    <Button onClick={saveComposer} disabled={!draft.trim() || saving || (channel === "note" && !canNote)}>{channel === "note" ? t("saveNote") : t("actSchedule")}</Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>{t("activityTimeline")}</CardTitle></CardHeader>
                <CardContent>
                  {timelineActivities.length > 0 ? (
                    <ol className="relative space-y-5 ps-6 before:absolute before:inset-y-1 before:start-[9px] before:w-px before:bg-border">
                      {timelineActivities.map((a) => {
                        const Icon = ACTIVITY_ICON[a.kind];
                        return (
                          <li key={a.id} className="relative">
                            <span className="absolute -start-6 grid size-5 place-items-center rounded-full bg-primary/10 text-primary ring-4 ring-background"><Icon className="size-3" /></span>
                            <p className="text-sm">{displayActivityTextLocal(a.text)}</p>
                            <p className="text-xs text-muted-foreground" title={a.ago}>{a.at ? fmtDateTime(a.at, locale) : a.ago}</p>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="py-6 text-center text-sm text-muted-foreground">{t("noActivityYet")}</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right: payment + follow-ups */}
            <div className="space-y-6">
              {plan ? (
                <PaymentCard plan={plan} pct={pct} courseImage={courseImageFor(plan.courseName)} />
              ) : (
                <PaymentCardEmpty />
              )}
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2 text-base"><CalendarDays className="size-4 text-primary" />{t("followUpAlerts")}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {canEdit && <Button variant="outline" size="sm" className="w-full gap-1.5 text-primary" onClick={() => setFuOpen(true)}><Plus className="size-4" />{t("addFollowUp")}</Button>}
                  {lead.followUps.map((f) => (
                    <div key={f.id} className="space-y-2 rounded-xl border p-3">
                      <Badge className={cn("border-transparent", FOLLOWUP_STYLE[f.status])}>
                        {tr(f.status === "today" ? "todayLabel" : f.status === "done" ? "doneLabel" : f.status === "overdue" ? "overdueLabel" : f.status)}
                      </Badge>
                      <p className="text-sm font-medium">{f.date}</p>
                      <p className="text-sm text-muted-foreground">{f.note || t("noNote")}</p>
                      {f.doneNote && (
                        <p className="rounded-lg bg-success/8 px-2.5 py-1.5 text-xs text-success">
                          <span className="font-semibold">{t("fuOutcome")}:</span> {f.doneNote}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => toast.info(t("updateLabel"))}><FileText className="size-3.5" />{t("updateLabel")}</Button>
                        <Button variant="outline" size="sm" className="gap-1.5 text-success" disabled={f.status === "done"} onClick={() => { setDoneFu(f.id); setDoneNote(f.doneNote ?? ""); }}><CheckCircle2 className="size-3.5" />{t("doneBtn")}</Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ───── Payment ───── */}
        <TabsContent value="payment" className="mt-5">
          <LeadPaymentTab leadName={lead.fullName} leadId={lead.id} plans={lead.paymentPlans ?? (plan ? [plan] : [])} onUpdated={setLead} courseOptions={courseOptions} />
        </TabsContent>

        {/* ───── Certificate ───── */}
        <TabsContent value="certificate" className="mt-5 space-y-5">
          <div className="space-y-1">
            <h2 className="font-heading text-xl font-bold tracking-tight">{t("certTabTitle", { name: lead.fullName })}</h2>
            <p className="text-sm text-muted-foreground">{t("certTabSubtitle")}</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-3 pt-6">
                  <p className="inline-flex items-center gap-1.5 font-semibold"><GraduationCap className="size-4" />{t("groupCertificate")}</p>
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("linkedGroup")}</p>
                    <Select value={certGroup} onValueChange={setCertGroup} disabled={groupOptions.length === 0}>
                      <SelectTrigger><SelectValue placeholder={t("selectGroupPh")} /></SelectTrigger>
                      <SelectContent>{groupOptions.map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <input ref={groupCertRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { void uploadCert(e.target.files?.[0], "group"); e.target.value = ""; }} />
                  <Button className="w-full gap-1.5" disabled={certUploading !== null || !canCert} onClick={() => groupCertRef.current?.click()}>
                    {certUploading === "group" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{t("choosePdf")}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t("reuploadGroup")}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="space-y-3 pt-6">
                  <p className="inline-flex items-center gap-1.5 font-semibold"><Award className="size-4" />{t("lmsCertificate")}</p>
                  <input ref={lmsCertRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => { void uploadCert(e.target.files?.[0], "lms"); e.target.value = ""; }} />
                  <Button variant="secondary" className="w-full gap-1.5" disabled={certUploading !== null || !canCert} onClick={() => lmsCertRef.current?.click()}>
                    {certUploading === "lms" ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}{t("choosePdf")}
                  </Button>
                  <p className="text-xs text-muted-foreground">{t("reuploadLms")}</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">{t("issuedCertificates")}</CardTitle></CardHeader>
              <CardContent>
                {lead.certificates && lead.certificates.length > 0 ? (
                  <ul className="space-y-2.5">
                    {lead.certificates.map((c, i) => (
                      <li key={`${c.code}-${i}`} className="flex items-center gap-3 rounded-xl border p-3">
                        <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-success/12 text-success"><Award className="size-4" /></span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium tabular-nums">{c.code}</p>
                          <p className="text-xs text-muted-foreground">{c.date}{c.groupId && groupOptions.find((g) => g.value === c.groupId) ? ` · ${groupOptions.find((g) => g.value === c.groupId)!.label}` : ""}</p>
                        </div>
                        <Button asChild variant="outline" size="sm" className="gap-1.5">
                          <a href={c.link} target="_blank" rel="noreferrer" download><Download className="size-3.5" />{t("certView")}</a>
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="grid place-items-center gap-3 rounded-xl border border-dashed py-16 text-center">
                    <Award className="size-9 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">{t("noCertificate")}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add / schedule follow-up */}
      <Dialog open={fuOpen} onOpenChange={(o) => { setFuOpen(o); if (!o) { setFuNote(""); setFuDate(""); setFuTime(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("addFollowUp")}</DialogTitle>
            <DialogDescription>{t("fuModalHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("fuDate")} <span className="text-destructive">*</span></Label>
                <Input type="date" value={fuDate} onChange={(e) => setFuDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("fuTime")}</Label>
                <Input type="time" value={fuTime} onChange={(e) => setFuTime(e.target.value)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("fuNote")}</Label>
              <Textarea rows={3} value={fuNote} onChange={(e) => setFuNote(e.target.value)} placeholder={t("fuNotePh")} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFuOpen(false)} disabled={fuSaving}>{t("cancel")}</Button>
            <Button onClick={addFollowUp} disabled={!fuDate || fuSaving} className="gap-1.5">
              {fuSaving && <Loader2 className="size-4 animate-spin" />}{t("fuSchedule")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mark follow-up done — capture an optional comment */}
      <Dialog open={!!doneFu} onOpenChange={(o) => { if (!o) { setDoneFu(null); setDoneNote(""); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("fuDoneTitle")}</DialogTitle>
            <DialogDescription>{t("fuDoneHint")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>{t("fuDoneComment")}</Label>
            <Textarea rows={3} value={doneNote} onChange={(e) => setDoneNote(e.target.value)} placeholder={t("fuDoneCommentPh")} />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDoneFu(null)} disabled={doneSaving}>{t("cancel")}</Button>
            <Button onClick={completeFollowUp} disabled={doneSaving} className="gap-1.5 bg-success text-white hover:bg-success/90">
              {doneSaving ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{t("fuDoneConfirm")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stage-transition qualification modal (same as the pipeline board) */}
      {pendingStage && (
        <LeadTransitionModal
          lead={lead}
          targetStage={pendingStage.targetStage}
          groupOptions={groupOptions}
          onConfirm={(data) => { void pendingStage.run(data); setPendingStage(null); }}
          onCancel={() => setPendingStage(null)}
        />
      )}
    </div>
  );
}

function ActionBtn({ icon: Icon, label, href, external }: { icon: React.ElementType; label: string; href: string; external?: boolean }) {
  return (
    <Button variant="outline" size="sm" className="gap-1.5" asChild>
      <a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}><Icon className="size-4" />{label}</a>
    </Button>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

/** Colored status dot keyed off the backend stage key/name. */
function stageDot(key: string, name: string): string {
  const k = `${key} ${name}`.toLowerCase();
  if (k.includes("lost")) return "bg-destructive";
  if (k.includes("enrol")) return "bg-success";
  if (k.includes("wait") || k.includes("payment")) return "bg-warning";
  if (k.includes("contact") || k.includes("qualif")) return "bg-chart-2";
  return "bg-muted-foreground/60";
}

/**
 * Two-level "Pipeline Status" control: the lead can belong to several pipelines,
 * so the menu first lets you pick a pipeline, then a stage *within* that pipeline
 * (matching the backend's per-pipeline stage model). Selecting a stage moves the
 * lead in that specific pipeline.
 */
function PipelineStatusMenu({
  pipelines,
  pipelineStages,
  fallbackLabel,
  onMove,
  t,
}: {
  pipelines: { id: string; title: string; stage: string }[];
  pipelineStages: PipelineStageList[];
  fallbackLabel: string;
  onMove: (pipelineId: string, stageKey: string, stageName: string) => void;
  t: (key: string, values?: Record<string, number | string>) => string;
}) {
  const [open, setOpen] = React.useState(false);
  const [view, setView] = React.useState<string | null>(null);

  // Compute active pipeline before hook call so we can pass its stages to the hook.
  const active = view ? pipelineStages.find((p) => p.id === view) : null;
  // Pass the active pipeline's stages so every stage gets its CRM-settings name.
  const { getDisplayName } = usePipelineStages(active?.stages, { skipFilter: true });

  const currentStageKey = (id: string) => pipelines.find((p) => p.id === id)?.stage;

  // Trigger button shows the current stage from the primary pipeline.
  // fallbackLabel is already the CRM-mapped name from the parent.
  const current = fallbackLabel;

  return (
    <DropdownMenu open={open} onOpenChange={(o) => { setOpen(o); if (!o) setView(null); }}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <GitBranch className="size-4" />
          {t("pipelineStatusLabel")} · {current}
          <ChevronDown className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        {!view ? (
          <>
            <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
              {t("selectPipeline")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {pipelines.length ? (
              pipelines.map((p) => (
                <DropdownMenuItem key={p.id} onSelect={(e) => { e.preventDefault(); setView(p.id); }} className="gap-2">
                  <GitBranch className="size-4 text-muted-foreground" />
                  {p.title}
                  <ChevronRight className="ms-auto size-4 opacity-60 rtl:rotate-180" />
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>{t("noPipeline")}</DropdownMenuItem>
            )}
          </>
        ) : (
          <>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setView(null); }} className="gap-2 font-medium">
              <ArrowLeft className="size-4 rtl:rotate-180" />
              {active?.title}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(active?.stages ?? []).map((s) => {
              const isCurrent = currentStageKey(view) === s.key;
              const isLost = `${s.key} ${s.name}`.toLowerCase().includes("lost");
              const displayName = getDisplayName(s.key);
              return (
                <DropdownMenuItem
                  key={s.key}
                  disabled={isCurrent}
                  onSelect={() => onMove(view, s.key, displayName)}
                  className={cn("gap-2", isLost && "text-destructive focus:text-destructive")}
                >
                  <span className={cn("size-2 rounded-full", stageDot(s.key, s.name))} />
                  {displayName}
                  {isCurrent && <Check className="ms-auto size-4 text-primary" />}
                </DropdownMenuItem>
              );
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
