"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  MessageSquare, Send, Plus, Trash2, Pencil, Loader2, Users, Zap,
  FileText, Megaphone, CheckCircle2, AlertTriangle, Clock, Inbox, CheckCheck, ArrowLeft,
  Search, Info, StickyNote, Check, Mail, CalendarDays, Tag, X, Paperclip, Mic, Download,
  BarChart3, TrendingUp, Clock3, Flame, Sparkles, ScrollText, Gauge, RefreshCw,
} from "lucide-react";

import { dal } from "@/lib/dal";
import type { WaStatus, WaGroup, WaTemplate, WaCampaign, WaAutomation, WaRecipient, WaConversation, WaThread, WaList, WaTemplateFolder, WaAnalytics } from "@/lib/dal/whatsapp";
import { WhatsappAutomationBuilder } from "@/features/admin/components/whatsapp-automation-builder";
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

type Tab = "inbox" | "analytics" | "templates" | "campaigns" | "automations";

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
  const [tab, setTab] = React.useState<Tab>("inbox");
  const [status] = React.useState(initialStatus);
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [groups] = React.useState(initialGroups);
  const { confirm, Confirmation } = useConfirm();

  const TABS: { key: Tab; label: string; icon: typeof FileText }[] = [
    { key: "inbox", label: "Live Chat", icon: Inbox },
    { key: "analytics", label: "Analytics", icon: BarChart3 },
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

      {tab === "inbox" && <InboxPanel templates={templates} connected={!!status?.configured} confirm={confirm} />}
      {tab === "analytics" && <AnalyticsPanel />}
      {tab === "campaigns" && <CampaignsPanel templates={templates} groups={groups} initial={initialCampaigns} confirm={confirm} />}
      {tab === "automations" && <AutomationsPanel templates={templates} groups={groups} initial={initialAutomations} confirm={confirm} />}
      {tab === "templates" && <TemplatesPanel templates={templates} setTemplates={setTemplates} confirm={confirm} />}
      {Confirmation}
    </div>
  );
}

/* ───────────────────────── Live Chat (inbox) ───────────────────────── */
function fmtTime(at?: string) {
  if (!at) return "";
  const d = new Date(at); const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : d.toLocaleDateString([], { day: "2-digit", month: "short" });
}

/** Date → "YYYY-MM-DDTHH:mm" in local time, for <input type="datetime-local">. */
function toLocalInput(d: Date) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

function fmtDay(at?: string) {
  if (!at) return "";
  const d = new Date(at); const now = new Date();
  const day = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((today.getTime() - day.getTime()) / 86_400_000);
  if (diff === 0) return "اليوم";
  if (diff === 1) return "أمس";
  return d.toLocaleDateString([], { day: "2-digit", month: "long", year: "numeric" });
}

const QUICK_REPLIES = [
  "مرحبًا! كيف يمكنني مساعدتك؟ 😊",
  "شكرًا لتواصلك مع IMETS 🌟",
  "سأتحقق من ذلك وأعود إليك فورًا.",
  "يمكنك حجز مقعدك من هنا:\nhttps://imetsedu.com/free-courses/cphq-preparation",
  "هل لديك أي استفسار آخر؟",
];

type InboxFilter = "open" | "unread" | "resolved" | "hot" | "due";

/** Lead temperature → display tokens. */
const TEMP: Record<string, { emoji: string; label: string; chip: string; bar: string; accent: string }> = {
  hot: { emoji: "🔥", label: "Hot", chip: "bg-red-500/10 text-red-600 dark:text-red-400", bar: "bg-red-500", accent: "border-s-red-500" },
  warm: { emoji: "🌤️", label: "Warm", chip: "bg-amber-500/10 text-amber-600 dark:text-amber-500", bar: "bg-amber-500", accent: "border-s-amber-400" },
  cold: { emoji: "❄️", label: "Cold", chip: "bg-sky-500/10 text-sky-600 dark:text-sky-400", bar: "bg-sky-500", accent: "border-s-transparent" },
};

/** mm:ss for the voice-recording timer. */
function fmtDur(s: number): string {
  const m = Math.floor(s / 60), r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

/** A caption is real content; bracket placeholders like [image] / the voice label are not. */
function isPlaceholderText(t: string): boolean {
  return !t || /^\[.*\]$/.test(t) || t === "🎤 Voice message" || /^📎/.test(t);
}

/** Fill {{1}}, {{2}}… in a template body with params (for the composer preview). */
function fillPreview(body: string, params: string[]): string {
  let out = body;
  params.forEach((p, i) => { out = out.split(`{{${i + 1}}}`).join(p || `{{${i + 1}}}`); });
  return out;
}

/* ───────────────────────── Analytics ───────────────────────── */
function AnalyticsPanel() {
  const [data, setData] = React.useState<WaAnalytics | null>(null);
  const [loading, setLoading] = React.useState(true);
  React.useEffect(() => { dal.whatsapp.fetchAnalytics().then((r) => { if (r.ok) setData(r.data); setLoading(false); }); }, []);

  if (loading) return <div className="grid h-64 place-items-center text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  if (!data) return <p className="rounded-xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">Couldn’t load analytics.</p>;

  const c = data.conversations;
  const maxDay = Math.max(1, ...data.messages.days.map((d) => d.in + d.out));
  const tempTotal = Math.max(1, c.hot + c.warm + c.cold);
  const fmtResp = data.responseMins == null ? "—" : data.responseMins < 60 ? `${data.responseMins}m` : `${Math.round(data.responseMins / 60)}h`;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi icon={MessageSquare} label="Conversations" value={c.total} sub={`${c.open} open · ${c.resolved} resolved`} tone="primary" />
        <Kpi icon={Flame} label="Hot leads" value={c.hot} sub={`${c.warm} warm · ${c.cold} cold`} tone="red" />
        <Kpi icon={Clock3} label="Avg response" value={fmtResp} sub="first reply time" tone="amber" />
        <Kpi icon={Zap} label="Active drips" value={data.automations.active} sub={`${data.automations.enrolled} enrolled · ${data.automations.completionRate}% done`} tone="emerald" />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold"><TrendingUp className="size-4 text-primary" /> Messages · last 14 days</p>
            <p className="text-xs text-muted-foreground">{data.messages.inbound} in · {data.messages.outbound} out</p>
          </div>
          <div className="flex h-40 items-end gap-1">
            {data.messages.days.map((d) => (
              <div key={d.day} className="flex flex-1 flex-col items-center gap-1" title={`${d.day}: ${d.in} in, ${d.out} out`}>
                <div className="flex w-full flex-col-reverse" style={{ height: "100%" }}>
                  <div className="w-full rounded-t-sm bg-[#25D366]" style={{ height: `${(d.out / maxDay) * 100}%` }} />
                  <div className="w-full rounded-t-sm bg-primary/70" style={{ height: `${(d.in / maxDay) * 100}%` }} />
                </div>
                <span className="text-[8px] text-muted-foreground">{d.day.slice(3)}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-3 text-[10px] text-muted-foreground"><span className="inline-flex items-center gap-1"><span className="size-2 rounded bg-primary/70" /> Inbound</span><span className="inline-flex items-center gap-1"><span className="size-2 rounded bg-[#25D366]" /> Outbound</span></div>
        </CardContent></Card>

        <Card><CardContent className="pt-5">
          <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold"><Flame className="size-4 text-red-500" /> Lead temperature</p>
          {([["hot", "🔥 Hot", c.hot, "bg-red-500"], ["warm", "🌤️ Warm", c.warm, "bg-amber-500"], ["cold", "❄️ Cold", c.cold, "bg-sky-500"]] as [string, string, number, string][]).map(([k, label, val, cls]) => (
            <div key={k} className="mb-2.5">
              <div className="mb-0.5 flex justify-between text-xs"><span>{label}</span><span className="font-semibold tabular-nums">{val}</span></div>
              <div className="h-2 rounded-full bg-muted"><div className={cn("h-full rounded-full", cls)} style={{ width: `${(val / tempTotal) * 100}%` }} /></div>
            </div>
          ))}
          <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground">Focus on 🔥 Hot first — filter them in Live Chat.</p>
        </CardContent></Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card><CardContent className="pt-5">
          <p className="mb-3 inline-flex items-center gap-1.5 text-sm font-semibold"><Megaphone className="size-4 text-primary" /> Campaigns</p>
          <div className="mb-3 grid grid-cols-3 gap-2 text-center">
            <Mini label="Total" value={data.campaigns.count} />
            <Mini label="Sent" value={data.campaigns.sent} />
            <Mini label="Failed" value={data.campaigns.failed} />
          </div>
          {data.campaigns.recent.length ? data.campaigns.recent.map((c2, i) => (
            <div key={i} className="flex items-center justify-between gap-2 border-t border-border/50 py-1.5 text-xs"><span className="truncate">{c2.name}</span><span className="shrink-0 text-muted-foreground">{c2.sent}/{c2.total}{c2.failed ? ` · ${c2.failed} failed` : ""}</span></div>
          )) : <p className="text-xs text-muted-foreground">No campaigns yet.</p>}
        </CardContent></Card>

        <Card><CardContent className="pt-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="inline-flex items-center gap-1.5 text-sm font-semibold"><Users className="size-4 text-primary" /> Top groups · phone reach</p>
            <span className="text-xs text-muted-foreground">{data.automations.sent} drip msgs sent</span>
          </div>
          {data.groups.length ? data.groups.map((g) => (
            <div key={g.name} className="flex items-center justify-between gap-2 border-t border-border/50 py-1.5 text-xs"><span className="truncate">{g.name}</span><span className="shrink-0 font-semibold tabular-nums">{g.phoneCount}</span></div>
          )) : <p className="text-xs text-muted-foreground">No groups.</p>}
        </CardContent></Card>
      </div>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, sub, tone = "primary" }: { icon: React.ElementType; label: string; value: React.ReactNode; sub?: string; tone?: "red" | "amber" | "emerald" | "primary" }) {
  const toneCls = tone === "red" ? "bg-red-500/10 text-red-600" : tone === "amber" ? "bg-amber-500/10 text-amber-600" : tone === "emerald" ? "bg-emerald-500/10 text-emerald-600" : "bg-primary/10 text-primary";
  return (
    <Card><CardContent className="flex items-center gap-3 py-4">
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", toneCls)}><Icon className="size-5" /></span>
      <div className="min-w-0"><p className="text-xl font-bold leading-none">{value}</p><p className="mt-1 truncate text-xs font-medium text-muted-foreground">{label}</p>{sub && <p className="truncate text-[10px] text-muted-foreground">{sub}</p>}</div>
    </CardContent></Card>
  );
}
function Mini({ label, value }: { label: string; value: number }) {
  return <div className="rounded-lg bg-muted/50 py-2"><p className="text-base font-bold tabular-nums">{value}</p><p className="text-[10px] text-muted-foreground">{label}</p></div>;
}

function InboxPanel({ templates, connected, confirm }: { templates: WaTemplate[]; connected: boolean; confirm: ReturnType<typeof useConfirm>["confirm"] }) {
  const [convos, setConvos] = React.useState<WaConversation[]>([]);
  const [active, setActive] = React.useState<string | null>(null);
  const [thread, setThread] = React.useState<WaThread | null>(null);
  const [text, setText] = React.useState("");
  const [note, setNote] = React.useState("");
  const [mode, setMode] = React.useState<"reply" | "note">("reply");
  const [sending, setSending] = React.useState(false);
  const [tplName, setTplName] = React.useState(templates[0]?.name ?? "");
  const [tplParams, setTplParams] = React.useState<string[]>(() => Array.from({ length: templates[0]?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")));
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<InboxFilter>("open");
  const [showInfo, setShowInfo] = React.useState(true);
  const [quickOpen, setQuickOpen] = React.useState(false);
  const [allLabels, setAllLabels] = React.useState<string[]>([]);
  const [labelFilter, setLabelFilter] = React.useState<string | null>(null);
  const [labelInput, setLabelInput] = React.useState("");
  const [lists, setLists] = React.useState<WaList[]>([]);
  const [listFilter, setListFilter] = React.useState<string | null>(null);
  const [manageOpen, setManageOpen] = React.useState(false);
  const [listMsg, setListMsg] = React.useState<{ name: string; mode: "text" | "template"; text: string; templateName: string; params: string[] } | null>(null);
  const openListMsg = (name: string) => setListMsg({ name, mode: "text", text: "", templateName: templates[0]?.name ?? "", params: Array.from({ length: templates[0]?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")) });
  const [newListName, setNewListName] = React.useState("");
  const [selected, setSelected] = React.useState<string[]>([]);
  const [bulkList, setBulkList] = React.useState("");
  const [groups, setGroups] = React.useState<WaGroup[]>([]);
  const [newOpen, setNewOpen] = React.useState(false);
  const [nc, setNc] = React.useState<{ phone: string; name: string; tplName: string; params: string[] }>({ phone: "", name: "", tplName: templates[0]?.name ?? "", params: [] });
  const [uploading, setUploading] = React.useState(false);
  const [recording, setRecording] = React.useState(false);
  const [recSecs, setRecSecs] = React.useState(0);
  const [aiBusy, setAiBusy] = React.useState<"summary" | "suggest" | "intent" | null>(null);
  const [aiPanel, setAiPanel] = React.useState<{ action: "summary" | "intent"; text: string } | null>(null);
  const [fuEdit, setFuEdit] = React.useState(false);
  const [fuDate, setFuDate] = React.useState("");
  const [fuNote, setFuNote] = React.useState("");
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => { const id = window.setInterval(() => setNow(Date.now()), 30_000); return () => window.clearInterval(id); }, []);
  const bottomRef = React.useRef<HTMLDivElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const recRef = React.useRef<{ rec: MediaRecorder; chunks: Blob[]; stream: MediaStream } | null>(null);
  // Size the inbox to fill from its top edge to the viewport bottom, so the reply
  // box is always visible regardless of page chrome height or browser zoom.
  const wrapRef = React.useRef<HTMLDivElement>(null);
  const [boxH, setBoxH] = React.useState<number | undefined>(undefined);
  React.useEffect(() => {
    const recalc = () => {
      const el = wrapRef.current; if (!el) return;
      const top = el.getBoundingClientRect().top;
      setBoxH(Math.max(420, Math.round(window.innerHeight - top - 16)));
    };
    const raf = window.requestAnimationFrame(recalc);
    window.addEventListener("resize", recalc);
    return () => { window.cancelAnimationFrame(raf); window.removeEventListener("resize", recalc); };
  }, []);

  const loadConvos = React.useCallback(async () => {
    const [r, l, ls] = await Promise.all([dal.whatsapp.fetchConversations(), dal.whatsapp.fetchLabels(), dal.whatsapp.fetchLists()]);
    if (r.ok) setConvos(r.data);
    if (l.ok) setAllLabels(l.data);
    if (ls.ok) setLists(ls.data);
  }, []);
  const loadThread = React.useCallback(async (phone: string) => { const r = await dal.whatsapp.fetchThread(phone); if (r.ok) setThread(r.data); }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- loaders setState only after an await
  React.useEffect(() => { loadConvos(); const id = window.setInterval(loadConvos, 12_000); return () => window.clearInterval(id); }, [loadConvos]);
  React.useEffect(() => {
    if (!active) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loaders setState only after an await
    loadThread(active); dal.whatsapp.markConversationRead(active).then(loadConvos);
    const id = window.setInterval(() => loadThread(active), 8_000);
    return () => window.clearInterval(id);
  }, [active, loadThread, loadConvos]);
  React.useEffect(() => { bottomRef.current?.scrollIntoView({ block: "end" }); }, [thread?.messages.length]);
  React.useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setRecSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [recording]);

  const sendFile = React.useCallback(async (file: File, voice = false) => {
    if (!active) return;
    setUploading(true);
    const r = await dal.whatsapp.sendMedia(active, file, { voice });
    setUploading(false);
    if (!r.ok) { toast.error(r.error); return; }
    loadThread(active); loadConvos();
  }, [active, loadThread, loadConvos]);

  const onPickFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      if (f.size > 25 * 1024 * 1024) { toast.error("File too large (max 25MB)"); }
      else sendFile(f);
    }
    e.target.value = "";
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
  const stopRec = (send: boolean) => {
    const m = recRef.current;
    setRecording(false);
    if (!m) return;
    m.rec.onstop = () => {
      m.stream.getTracks().forEach((t) => t.stop());
      const mt = m.rec.mimeType || "audio/webm";
      if (send && m.chunks.length) {
        const blob = new Blob(m.chunks, { type: mt });
        const ext = mt.includes("ogg") ? "ogg" : mt.includes("mp4") ? "m4a" : "webm";
        sendFile(new File([blob], `voice-${Date.now()}.${ext}`, { type: mt }), true);
      }
      recRef.current = null;
    };
    m.rec.stop();
  };

  const tpl = templates.find((t) => t.name === tplName);
  const q = search.trim().toLowerCase();
  const filtered = convos.filter((c) => {
    if (filter === "open" && c.status === "resolved") return false;
    if (filter === "unread" && (!c.unread || c.status === "resolved")) return false;
    if (filter === "resolved" && c.status !== "resolved") return false;
    if (filter === "hot" && (c.temperature !== "hot" || c.status === "resolved")) return false;
    if (filter === "due" && !c.followUpAt) return false;
    if (labelFilter && !(c.labels || []).includes(labelFilter)) return false;
    if (listFilter && !(c.lists || []).includes(listFilter)) return false;
    if (q && !`${c.name} ${c.phone} ${c.lastMessage} ${(c.labels || []).join(" ")} ${(c.lists || []).join(" ")}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const unreadCount = convos.filter((c) => c.unread > 0 && c.status !== "resolved").length;
  const hotCount = convos.filter((c) => c.temperature === "hot" && c.status !== "resolved").length;
  const nowMs = now;
  const dueCount = convos.filter((c) => c.followUpAt && new Date(c.followUpAt).getTime() < nowMs).length;
  // When viewing Hot leads, surface the highest score first; Due → soonest reminder first.
  const shown = filter === "hot" ? [...filtered].sort((a, b) => (b.score || 0) - (a.score || 0))
    : filter === "due" ? [...filtered].sort((a, b) => new Date(a.followUpAt || 0).getTime() - new Date(b.followUpAt || 0).getTime())
    : filtered;

  const startNew = async () => {
    const phone = nc.phone.replace(/\D/g, "");
    if (phone.length < 8) { toast.error("Enter a valid number with country code"); return; }
    if (!nc.tplName) { toast.error("Pick a template"); return; }
    setSending(true);
    const t = templates.find((x) => x.name === nc.tplName);
    const r = await dal.whatsapp.startConversation({ phone, name: nc.name, templateName: nc.tplName, language: t?.language ?? "ar", params: nc.params });
    setSending(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Conversation started");
    setNewOpen(false); setNc({ phone: "", name: "", tplName: templates[0]?.name ?? "", params: [] });
    await loadConvos(); setActive(phone); setMode("reply");
  };

  const applyLabels = async (next: string[]) => {
    if (!active) return;
    const r = await dal.whatsapp.setLabels(active, next);
    if (!r.ok) { toast.error(r.error); return; }
    setThread((t) => (t ? { ...t, labels: next } : t));
    loadConvos();
  };
  const removeLabel = (l: string) => applyLabels((thread?.labels || []).filter((x) => x !== l));
  const addLabel = (l: string) => { const v = l.trim(); if (v && !(thread?.labels || []).includes(v)) applyLabels([...(thread?.labels || []), v]); setLabelInput(""); };

  const refreshLists = async () => { const ls = await dal.whatsapp.fetchLists(); if (ls.ok) setLists(ls.data); };
  React.useEffect(() => { dal.whatsapp.fetchGroups().then((r) => { if (r.ok) setGroups(r.data); }); }, []);
  const setContactGroupFn = async (group: string, add: boolean) => {
    if (!active) return;
    const r = await dal.whatsapp.setContactGroup(active, group, add);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(add ? `Added to “${group}” — drip will start` : `Removed from “${group}”`);
    loadThread(active); loadConvos();
  };
  const toggleSelect = (phone: string) => setSelected((s) => (s.includes(phone) ? s.filter((x) => x !== phone) : [...s, phone]));
  const addSelectedToList = async () => {
    if (!bulkList || selected.length === 0) return;
    const results = await Promise.all(selected.map((phone) => {
      const c = convos.find((x) => x.phone === phone);
      const next = [...new Set([...(c?.lists || []), bulkList])];
      return dal.whatsapp.setConversationLists(phone, next);
    }));
    const failed = results.filter((r) => !r.ok).length;
    if (failed) toast.error(`${failed} of ${selected.length} failed`);
    else toast.success(`Added ${selected.length} chat${selected.length === 1 ? "" : "s"} to “${bulkList}”`);
    setSelected([]); setBulkList("");
    loadConvos(); refreshLists(); if (active) loadThread(active);
  };
  const toggleConvList = async (name: string) => {
    if (!active) return;
    const cur = thread?.lists || [];
    const next = cur.includes(name) ? cur.filter((x) => x !== name) : [...cur, name];
    const r = await dal.whatsapp.setConversationLists(active, next);
    if (!r.ok) { toast.error(r.error); return; }
    setThread((t) => (t ? { ...t, lists: next } : t));
    refreshLists(); loadConvos();
  };
  const createList = async (name: string) => {
    const v = name.trim(); if (!v) return;
    const r = await dal.whatsapp.createList(v);
    if (!r.ok) { toast.error(r.error); return; }
    setNewListName(""); toast.success("List created"); refreshLists();
  };
  const renameListFn = async (oldName: string, to: string) => {
    const v = to.trim(); if (!v || v === oldName) return;
    const r = await dal.whatsapp.renameList(oldName, v);
    if (!r.ok) { toast.error(r.error); return; }
    if (listFilter === oldName) setListFilter(v);
    toast.success("List renamed"); refreshLists(); loadConvos(); if (active) loadThread(active);
  };
  const deleteListFn = async (name: string) => {
    if (!(await confirm({ title: "Delete list", description: `“${name}” will be removed from all conversations.`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteList(name);
    if (!r.ok) { toast.error(r.error); return; }
    if (listFilter === name) setListFilter(null);
    toast.success("List deleted"); refreshLists(); loadConvos(); if (active) loadThread(active);
  };
  const sendToList = async () => {
    if (!listMsg) return;
    if (listMsg.mode === "text" && !listMsg.text.trim()) return;
    if (listMsg.mode === "template" && !listMsg.templateName) { toast.error("Pick a template"); return; }
    const payload = listMsg.mode === "template"
      ? { templateName: listMsg.templateName, language: templates.find((t) => t.name === listMsg.templateName)?.language ?? "ar", params: listMsg.params }
      : { text: listMsg.text.trim() };
    setSending(true);
    const r = await dal.whatsapp.sendListMessage(listMsg.name, payload);
    setSending(false);
    if (!r.ok) { toast.error(r.error); return; }
    const { sent, skipped, failed } = r.data;
    toast.success(`Sent to ${sent}${skipped ? ` · ${skipped} skipped (window closed)` : ""}${failed ? ` · ${failed} failed` : ""}`);
    setListMsg(null);
  };

  const sendReply = async () => {
    if (!active) return;
    setSending(true);
    let r;
    if (thread?.windowOpen) {
      if (!text.trim()) { setSending(false); return; }
      r = await dal.whatsapp.replyText(active, text.trim());
    } else {
      if (!tplName) { setSending(false); toast.error("Pick a template"); return; }
      r = await dal.whatsapp.replyTemplate(active, { templateName: tplName, language: tpl?.language ?? "ar", params: tplParams });
    }
    setSending(false);
    if (!r.ok) { toast.error(r.error); return; }
    setText(""); setTplParams([]);
    loadThread(active); loadConvos();
  };
  const runAi = async (action: "summary" | "suggest" | "intent") => {
    if (!active || aiBusy) return;
    setAiBusy(action);
    const r = await dal.whatsapp.aiCopilot(active, action);
    setAiBusy(null);
    if (!r.ok) { toast.error(r.error); return; }
    if (!r.data.ok) { toast.error(r.data.error || "AI error"); return; }
    if (action === "suggest") {
      setMode("reply");
      setText((t) => (t.trim() ? t.trim() + "\n" : "") + r.data.result);
      toast.success("تم إدراج الرد المقترح — راجعه قبل الإرسال");
    } else {
      setAiPanel({ action, text: r.data.result });
    }
  };
  const saveFollowUp = async () => {
    if (!active || !fuDate) return;
    const r = await dal.whatsapp.setFollowUp(active, { at: new Date(fuDate).toISOString(), note: fuNote.trim() });
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("تم ضبط التذكير");
    setFuEdit(false); setFuNote(""); loadThread(active); loadConvos();
  };
  const removeFollowUp = async () => {
    if (!active) return;
    const r = await dal.whatsapp.clearFollowUp(active);
    if (!r.ok) { toast.error(r.error); return; }
    setFuEdit(false); loadThread(active); loadConvos();
  };
  const saveNote = async () => {
    if (!active || !note.trim()) return;
    setSending(true);
    const r = await dal.whatsapp.addNote(active, note.trim());
    setSending(false);
    if (!r.ok) { toast.error(r.error); return; }
    setNote(""); loadThread(active);
  };
  const toggleResolve = async () => {
    if (!active || !thread) return;
    const next = thread.status === "resolved" ? "open" : "resolved";
    const r = await dal.whatsapp.setConversationStatus(active, next);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(next === "resolved" ? "Resolved" : "Reopened");
    loadThread(active); loadConvos();
  };

  const activeConvo = convos.find((c) => c.phone === active);
  const contact = thread?.contact;

  // Precompute which message starts a new day (for date separators).
  const daySep = new Map<string, string>();
  { let ld = ""; for (const m of thread?.messages ?? []) { const d = fmtDay(m.at); if (d && d !== ld) { ld = d; daySep.set(m.id, d); } } }
  const cols = showInfo && active ? "lg:grid-cols-[390px_1fr_280px]" : "lg:grid-cols-[390px_1fr]";

  return (
    <div ref={wrapRef} style={boxH ? { height: boxH } : undefined} className={cn("grid gap-0 overflow-hidden rounded-2xl border border-border/70 min-h-[420px]", !boxH && "h-[calc(100dvh_-_200px)]", cols)}>
      {/* ── Conversation list ── */}
      <div className={cn("flex min-h-0 flex-col border-e border-border/60 bg-card", active && "hidden lg:flex")}>
        <div className="space-y-2 border-b border-border/60 p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Conversations{convos.length ? ` · ${convos.length}` : ""}</p>
            <Button size="sm" className="h-8 gap-1.5" onClick={() => { const t = templates[0]; setNc({ phone: "", name: "", tplName: t?.name ?? "", params: Array.from({ length: t?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")) }); setNewOpen(true); }}><Plus className="size-3.5" /> New</Button>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search name / number / label…" className="ps-8" />
          </div>
          <div className="flex flex-wrap gap-1">
            {([["open", "Open"], ["hot", `🔥 Hot${hotCount ? ` ${hotCount}` : ""}`], ["due", `⏰ Due${dueCount ? ` ${dueCount}` : ""}`], ["unread", `Unread${unreadCount ? ` ${unreadCount}` : ""}`], ["resolved", "Resolved"]] as [InboxFilter, string][]).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setFilter(k)} className={cn("rounded-full px-2.5 py-1 text-xs font-medium transition-colors", filter === k ? (k === "hot" ? "bg-red-500 text-white" : k === "due" ? "bg-amber-500 text-white" : "bg-primary text-primary-foreground") : k === "hot" && hotCount ? "bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400" : k === "due" && dueCount ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 dark:text-amber-400" : "bg-muted text-muted-foreground hover:bg-muted/70")}>{l}</button>
            ))}
          </div>
          {allLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {labelFilter && <button type="button" onClick={() => setLabelFilter(null)} className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-medium text-primary"><X className="size-2.5" /> {labelFilter}</button>}
              {!labelFilter && allLabels.slice(0, 8).map((l) => (
                <button key={l} type="button" onClick={() => setLabelFilter(l)} className="inline-flex items-center gap-1 rounded-full border border-border/70 px-2 py-0.5 text-[10px] text-muted-foreground hover:bg-muted"><Tag className="size-2.5" /> {l}</button>
              ))}
            </div>
          )}
          {/* Lists (segments) */}
          <div className="flex flex-wrap items-center gap-1">
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"><Users className="size-3" /> Lists</span>
            {lists.map((l) => (
              <button key={l.name} type="button" onClick={() => setListFilter(listFilter === l.name ? null : l.name)}
                className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors",
                  listFilter === l.name ? "border-primary bg-primary/10 font-medium text-primary" : "border-border/70 text-muted-foreground hover:bg-muted")}>
                {l.name} <span className="tabular-nums opacity-70">{l.count}</span>
              </button>
            ))}
            <button type="button" onClick={() => setManageOpen(true)} title="Manage lists" className="grid size-5 place-items-center rounded-full border border-dashed border-border/70 text-muted-foreground hover:bg-muted hover:text-foreground"><Plus className="size-3" /></button>
          </div>
          {listFilter && (
            <div className="flex items-center justify-between gap-2 rounded-lg bg-primary/10 px-2.5 py-1.5">
              <span className="truncate text-[11px] font-medium text-primary">Filtering “{listFilter}”</span>
              <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => openListMsg(listFilter)}><Send className="size-3" /> Message list</Button>
            </div>
          )}
        </div>
        {/* Bulk add-to-list bar */}
        {selected.length > 0 && (
          <div className="flex items-center gap-2 border-b border-border/60 bg-primary/5 px-3 py-2">
            <span className="whitespace-nowrap text-xs font-semibold text-primary">{selected.length} selected</span>
            <Select value={bulkList} onValueChange={setBulkList}>
              <SelectTrigger className="h-8 flex-1 text-xs"><SelectValue placeholder={lists.length ? "Add to list…" : "No lists yet — create one"} /></SelectTrigger>
              <SelectContent position="popper">{lists.map((l) => <SelectItem key={l.name} value={l.name}>{l.name}</SelectItem>)}</SelectContent>
            </Select>
            <Button size="sm" className="h-8 shrink-0" disabled={!bulkList} onClick={addSelectedToList}>Add</Button>
            <button type="button" onClick={() => { setSelected([]); setBulkList(""); }} title="Clear selection" className="shrink-0 text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
          </div>
        )}
        <div className="min-h-0 flex-1 overflow-y-auto">
          {shown.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">{convos.length === 0 ? (connected ? "No conversations yet — they appear when a customer messages your WhatsApp number." : "Connect the Cloud API + webhook to receive messages.") : filter === "hot" ? "No hot leads right now." : filter === "due" ? "لا توجد متابعات مجدولة." : "No conversations match."}</p>
          ) : shown.map((c) => {
            const checked = selected.includes(c.phone);
            return (
            <div key={c.phone}
              className={cn("group flex w-full items-center border-b border-s-2 border-border/40 transition-colors", (TEMP[c.temperature] ?? TEMP.cold).accent, active === c.phone ? "bg-primary/10" : checked ? "bg-primary/[0.04]" : "hover:bg-muted/50")}>
              <button type="button" title="Select chat" onClick={() => toggleSelect(c.phone)}
                className={cn("ms-3 grid size-5 shrink-0 place-items-center rounded border transition", checked ? "border-primary bg-primary text-primary-foreground opacity-100" : cn("border-border/60 text-transparent", selected.length > 0 ? "opacity-100" : "opacity-0 group-hover:opacity-100"))}>
                <Check className="size-3.5" />
              </button>
              <button type="button" onClick={() => { setActive(c.phone); setMode("reply"); setAiPanel(null); setFuEdit(false); }}
                className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 text-start">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#25D366]/12 text-sm font-bold text-[#128C7E]">{(c.name || c.phone).charAt(0).toUpperCase()}</span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{c.temperature === "hot" && <span title={`Hot lead · ${c.score}/100`}>🔥 </span>}{c.name || `+${c.phone}`}</span>
                    <span className="shrink-0 text-[10px] text-muted-foreground">{fmtTime(c.lastMessageAt)}</span>
                  </span>
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-muted-foreground">{c.lastDirection === "out" ? "↩ " : ""}{c.lastMessage}</span>
                    {c.status === "resolved" ? <CheckCircle2 className="size-3.5 shrink-0 text-success" /> : c.unread > 0 ? <span className="grid size-5 shrink-0 place-items-center rounded-full bg-[#25D366] text-[10px] font-bold text-white">{c.unread}</span> : null}
                  </span>
                  {(c.followUpAt || (c.labels || []).length > 0 || (c.lists || []).length > 0) && (
                    <span className="mt-1 flex flex-wrap gap-1">
                      {c.followUpAt && (() => { const od = new Date(c.followUpAt).getTime() < nowMs; return (
                        <span title={`متابعة: ${new Date(c.followUpAt).toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}`} className={cn("inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-medium", od ? "bg-red-500/15 text-red-600 dark:text-red-400" : "bg-amber-500/15 text-amber-700 dark:text-amber-400")}><Clock3 className="size-2" />{od ? "متأخر" : fmtDay(c.followUpAt)}</span>
                      ); })()}
                      {(c.lists || []).slice(0, 3).map((l) => <span key={`li-${l}`} className="inline-flex items-center gap-0.5 rounded bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-700 dark:text-emerald-400"><Users className="size-2" />{l}</span>)}
                      {(c.labels || []).slice(0, 3).map((l) => <span key={`la-${l}`} className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">{l}</span>)}
                    </span>
                  )}
                </span>
              </button>
            </div>
            );
          })}
        </div>
      </div>

      {/* ── Thread ── */}
      <div className={cn("flex min-h-0 min-w-0 flex-col bg-[#efeae2]/40 dark:bg-muted/20", !active && "hidden lg:flex")}>
        {!active ? (
          <div className="grid flex-1 place-items-center p-8 text-center text-sm text-muted-foreground">
            <div><MessageSquare className="mx-auto mb-2 size-8 opacity-40" />Select a conversation to view the chat.</div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-border/60 bg-card px-4 py-2.5">
              <button type="button" className="lg:hidden" onClick={() => { setActive(null); setThread(null); }}><ArrowLeft className="size-5" /></button>
              <span className="grid size-9 place-items-center rounded-full bg-[#25D366]/12 text-sm font-bold text-[#128C7E]">{(activeConvo?.name || active).charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{activeConvo?.name || contact?.name || `+${active}`}</p>
                <p className="text-[11px] text-muted-foreground">+{active}</p>
              </div>
              {thread && (thread.windowOpen
                ? <Badge className="gap-1 bg-success/12 text-success"><CheckCircle2 className="size-3" /> open window</Badge>
                : <Badge variant="secondary" className="gap-1"><Clock className="size-3" /> 24h closed</Badge>)}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={toggleResolve}>
                {thread?.status === "resolved" ? <><X className="size-3.5" /> Reopen</> : <><Check className="size-3.5" /> Resolve</>}
              </Button>
              <Button variant="ghost" size="icon" className="size-8" title="Client info" onClick={() => setShowInfo((s) => !s)}><Info className="size-4" /></Button>
            </div>

            <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-4">
              {thread?.messages.map((m) => {
                const sep = daySep.get(m.id) || null;
                if (m.direction === "note") {
                  return (
                    <React.Fragment key={m.id}>
                      {sep && <DaySep label={sep} />}
                      <div className="flex justify-center">
                        <div className="max-w-[80%] rounded-lg border border-amber-300/50 bg-amber-50 px-3 py-1.5 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300">
                          <span className="inline-flex items-center gap-1 font-semibold"><StickyNote className="size-3" /> ملاحظة داخلية{m.author ? ` · ${m.author}` : ""}</span>
                          <p className="mt-0.5 whitespace-pre-wrap" dir="auto">{m.text}</p>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                }
                return (
                  <React.Fragment key={m.id}>
                    {sep && <DaySep label={sep} />}
                    <div className={cn("flex", m.direction === "out" ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm", m.direction === "out" ? "bg-[#dcf8c6] text-[#0a1424] dark:bg-[#005c4b] dark:text-white" : "bg-card")}>
                        {m.mediaUrl && <WaMedia url={m.mediaUrl} type={m.type} mime={m.mime} filename={m.filename} />}
                        {!(m.mediaUrl && isPlaceholderText(m.text)) && <p className="whitespace-pre-wrap break-words" dir="auto">{m.text}</p>}
                        <p className={cn("mt-0.5 flex items-center justify-end gap-1 text-[10px]", m.direction === "out" ? "text-[#0a1424]/50 dark:text-white/60" : "text-muted-foreground")}>
                          {fmtTime(m.at)}
                          {m.direction === "out" && (m.status === "failed"
                            ? <AlertTriangle className="size-3 text-destructive" />
                            : <CheckCheck className={cn("size-3", m.status === "read" ? "text-sky-500" : "")} />)}
                        </p>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Reply / Note composer */}
            <div className="border-t border-border/60 bg-card p-3">
              <div className="mb-2 flex items-center gap-4">
                {(["reply", "note"] as const).map((mk) => (
                  <button key={mk} type="button" onClick={() => setMode(mk)} className={cn("relative pb-1 text-xs font-semibold transition-colors", mode === mk ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
                    {mk === "reply" ? "Reply" : "Internal note"}
                    {mode === mk && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded bg-primary" />}
                  </button>
                ))}
                {mode === "reply" && thread && (
                  <div className="ms-auto flex items-center gap-0.5 rounded-full border border-violet-300/50 bg-violet-50/60 px-1 py-0.5 dark:border-violet-500/30 dark:bg-violet-950/20">
                    <span className="ps-1.5 text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">AI</span>
                    <button type="button" onClick={() => runAi("suggest")} disabled={!!aiBusy} title="اقترح ردًا جاهزًا" className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-900/40">
                      {aiBusy === "suggest" ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} Suggest reply
                    </button>
                    <button type="button" onClick={() => runAi("summary")} disabled={!!aiBusy} title="لخّص المحادثة" className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-900/40">
                      {aiBusy === "summary" ? <Loader2 className="size-3.5 animate-spin" /> : <ScrollText className="size-3.5" />} Summarize
                    </button>
                    <button type="button" onClick={() => runAi("intent")} disabled={!!aiBusy} title="حلّل نية العميل" className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 disabled:opacity-50 dark:text-violet-300 dark:hover:bg-violet-900/40">
                      {aiBusy === "intent" ? <Loader2 className="size-3.5 animate-spin" /> : <Gauge className="size-3.5" />} Intent
                    </button>
                  </div>
                )}
                {mode === "reply" && thread?.windowOpen && (
                  <div className="relative">
                    <Button variant="ghost" size="sm" className="gap-1 text-xs" onClick={() => setQuickOpen((o) => !o)}><Zap className="size-3.5" /> Quick replies</Button>
                    {quickOpen && (
                      <div className="absolute bottom-9 end-0 z-10 w-72 space-y-1 rounded-xl border border-border/70 bg-card p-1.5 shadow-lg">
                        {QUICK_REPLIES.map((qr, i) => (
                          <button key={i} type="button" onClick={() => { setText((t) => (t ? t + "\n" : "") + qr); setQuickOpen(false); }} className="block w-full truncate rounded-lg px-2 py-1.5 text-start text-xs hover:bg-muted" dir="rtl">{qr}</button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {mode === "reply" && aiPanel && (
                <div className="mb-2 rounded-xl border border-violet-300/50 bg-violet-50/50 p-3 dark:border-violet-500/30 dark:bg-violet-950/20">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                      {aiPanel.action === "summary" ? <><ScrollText className="size-3.5" /> ملخص المحادثة</> : <><Gauge className="size-3.5" /> تحليل النية</>}
                    </span>
                    <button type="button" onClick={() => setAiPanel(null)} className="text-violet-500 hover:text-violet-700 dark:hover:text-violet-300"><X className="size-3.5" /></button>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90" dir="auto">{aiPanel.text}</p>
                </div>
              )}

              {mode === "note" ? (
                <div className="flex items-end gap-2">
                  <Textarea rows={1} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a private note (not sent to the customer)…" dir="auto" className="max-h-32 min-h-[42px] resize-none bg-amber-50/50 dark:bg-amber-950/10" />
                  <Button onClick={saveNote} disabled={sending || !note.trim()} variant="secondary" className="shrink-0 gap-1.5">{sending ? <Loader2 className="size-4 animate-spin" /> : <StickyNote className="size-4" />} Note</Button>
                </div>
              ) : thread?.windowOpen ? (
                recording ? (
                  <div className="flex items-center gap-3 rounded-xl border border-red-300/60 bg-red-50/60 px-3 py-2.5 dark:border-red-500/30 dark:bg-red-950/20">
                    <span className="size-2.5 animate-pulse rounded-full bg-red-500" />
                    <span className="text-sm font-semibold tabular-nums text-red-700 dark:text-red-300">{fmtDur(recSecs)}</span>
                    <span className="text-xs text-muted-foreground">Recording voice…</span>
                    <div className="ms-auto flex items-center gap-2">
                      <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => stopRec(false)}><Trash2 className="size-4" /> Cancel</Button>
                      <Button size="sm" className="gap-1.5" onClick={() => stopRec(true)} disabled={uploading}>{uploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send</Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-end gap-1.5">
                    <input ref={fileInputRef} type="file" hidden onChange={onPickFile}
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip" />
                    <Button variant="ghost" size="icon" className="size-10 shrink-0" title="Attach file" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? <Loader2 className="size-5 animate-spin" /> : <Paperclip className="size-5" />}
                    </Button>
                    <Textarea rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }} placeholder="Type a reply…" dir="auto" className="max-h-32 min-h-[42px] resize-none" />
                    {text.trim() ? (
                      <Button onClick={sendReply} disabled={sending} className="size-10 shrink-0 rounded-full p-0">{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}</Button>
                    ) : (
                      <Button variant="ghost" size="icon" className="size-10 shrink-0" title="Record voice" onClick={startRec} disabled={uploading}><Mic className="size-5" /></Button>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-2">
                  {/* 24h window closed — Meta only allows an approved template until the customer replies. */}
                  <div className="flex items-start gap-2 rounded-lg border border-amber-300/50 bg-amber-50/60 px-2.5 py-2 text-[11px] leading-relaxed text-amber-800 dark:border-amber-500/30 dark:bg-amber-950/20 dark:text-amber-300">
                    <Clock className="mt-px size-3.5 shrink-0" />
                    <span>The 24-hour free-reply window is closed. Send an approved <span className="font-semibold">template</span> below — once the customer replies you can chat freely.</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <Select value={tplName} onValueChange={(v) => { setTplName(v); const t = templates.find((x) => x.name === v); setTplParams(Array.from({ length: t?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : ""))); }}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder={templates.length ? "Pick a template" : "No templates"} /></SelectTrigger>
                      <SelectContent position="popper">{templates.map((t) => <SelectItem key={t.id} value={t.name}>{t.name} · {t.language}</SelectItem>)}</SelectContent>
                    </Select>
                    <Button onClick={sendReply} disabled={sending || !tplName} className="shrink-0 gap-1.5">{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send</Button>
                  </div>
                  {tpl?.body && <p dir={tpl.language.startsWith("ar") ? "rtl" : "ltr"} className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{fillPreview(tpl.body, tplParams)}</p>}
                  {(tpl?.variables ?? 0) > 0 && tplParams.map((p, i) => (
                    <Input key={i} value={p} onChange={(e) => setTplParams((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))} placeholder={`{{${i + 1}}}${i === 0 ? " — {{name}} allowed" : ""}`} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── Client info panel ── */}
      {showInfo && active && (
        <aside className="hidden flex-col border-s border-border/60 bg-card lg:flex">
          <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
            <p className="text-sm font-semibold">Client info</p>
            <button type="button" onClick={() => setShowInfo(false)}><X className="size-4 text-muted-foreground" /></button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto p-4 text-sm">
            <div className="text-center">
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-[#25D366]/12 text-xl font-bold text-[#128C7E]">{(activeConvo?.name || contact?.name || active).charAt(0).toUpperCase()}</span>
              <p className="mt-2 font-semibold">{activeConvo?.name || contact?.name || "Unknown"}</p>
              <a href={`https://wa.me/${active}`} target="_blank" rel="noopener noreferrer" className="text-xs text-[#128C7E] hover:underline">+{active}</a>
            </div>
            {typeof thread?.score === "number" && (() => {
              const t = TEMP[thread.temperature || "cold"] ?? TEMP.cold;
              return (
                <div className="rounded-xl border border-border/60 p-3">
                  <div className="flex items-center justify-between">
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold", t.chip)}>{t.emoji} {t.label} lead</span>
                    <span className="text-sm font-bold tabular-nums">{thread.score}<span className="text-[10px] font-normal text-muted-foreground">/100</span></span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", t.bar)} style={{ width: `${thread.score}%` }} /></div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-muted-foreground">Auto-scored from buying intent, recency, engagement &amp; unread — higher means more likely to convert.</p>
                </div>
              );
            })()}
            {/* Follow-up reminder */}
            {(() => {
              const fu = thread?.followUpAt ? new Date(thread.followUpAt) : null;
              const overdue = !!fu && fu.getTime() < now;
              if (fuEdit) {
                return (
                  <div className="rounded-xl border border-border/60 p-3">
                    <p className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold"><Clock3 className="size-3.5" /> تذكير المتابعة</p>
                    <input type="datetime-local" value={fuDate} onChange={(e) => setFuDate(e.target.value)} className="mb-2 w-full rounded-lg border border-input bg-background px-2.5 py-1.5 text-xs" />
                    <Input value={fuNote} onChange={(e) => setFuNote(e.target.value)} placeholder="سبب المتابعة (اختياري)…" dir="auto" className="mb-2 h-8 text-xs" />
                    <div className="flex gap-1.5">
                      <Button size="sm" className="h-7 flex-1 gap-1 text-xs" onClick={saveFollowUp} disabled={!fuDate}><Check className="size-3.5" /> حفظ</Button>
                      <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setFuEdit(false)}>إلغاء</Button>
                    </div>
                  </div>
                );
              }
              if (fu) {
                return (
                  <div className={cn("rounded-xl border p-3", overdue ? "border-red-300/60 bg-red-50/50 dark:border-red-500/30 dark:bg-red-950/20" : "border-border/60")}>
                    <div className="flex items-center justify-between">
                      <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold", overdue && "text-red-600 dark:text-red-400")}><Clock3 className="size-3.5" /> {overdue ? "متأخر — للمتابعة" : "متابعة مجدولة"}</span>
                      <button type="button" onClick={removeFollowUp} title="تم" className="text-muted-foreground hover:text-success"><CheckCircle2 className="size-4" /></button>
                    </div>
                    <p className="mt-1.5 text-sm font-medium tabular-nums" dir="auto">{fu.toLocaleString("ar-EG", { dateStyle: "medium", timeStyle: "short" })}</p>
                    {thread?.followUpNote && <p className="mt-0.5 text-xs text-muted-foreground" dir="auto">{thread.followUpNote}</p>}
                    <button type="button" onClick={() => { setFuDate(toLocalInput(fu)); setFuNote(thread?.followUpNote || ""); setFuEdit(true); }} className="mt-1.5 text-[11px] text-primary hover:underline">تعديل</button>
                  </div>
                );
              }
              return (
                <button type="button" onClick={() => { setFuDate(toLocalInput(new Date(Date.now() + 864e5))); setFuNote(""); setFuEdit(true); }} className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 py-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                  <Clock3 className="size-3.5" /> جدولة متابعة
                </button>
              );
            })()}
            <Field2 icon={Mail} label="Email" value={contact?.email || "—"} />
            <Field2 icon={CalendarDays} label="Joined" value={contact?.createdAt ? new Date(contact.createdAt).toLocaleDateString() : "—"} />
            <Field2 icon={Info} label="Source" value={contact?.source || "—"} />
            <div>
              <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Zap className="size-3.5 text-emerald-600" /> Groups · start drip</p>
              <div className="flex flex-wrap gap-1">
                {(contact?.tags || []).length === 0 && <span className="text-xs text-muted-foreground">Not in any group yet.</span>}
                {(contact?.tags || []).map((t) => (
                  <span key={t} className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400">{t}<button type="button" title="Remove from group" onClick={() => setContactGroupFn(t, false)}><X className="size-2.5" /></button></span>
                ))}
              </div>
              <div className="mt-1.5">
                <Select value="" onValueChange={(v) => v && setContactGroupFn(v, true)}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="➕ Add to a group…" /></SelectTrigger>
                  <SelectContent position="popper">
                    {groups.filter((g) => !(contact?.tags || []).includes(g.name)).map((g) => <SelectItem key={g.name} value={g.name}>{g.name} <span className="text-muted-foreground">· {g.phoneCount}</span></SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">Adds this contact to a subscriber group — its WhatsApp &amp; email drip starts on the next cycle.</p>
            </div>
            <div className="border-t border-border/60 pt-3">
              <p className="mb-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Tag className="size-3.5" /> Labels</p>
              <div className="flex flex-wrap gap-1">
                {(thread?.labels || []).length === 0 && <span className="text-xs text-muted-foreground">None</span>}
                {(thread?.labels || []).map((l) => (
                  <span key={l} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">{l}<button type="button" onClick={() => removeLabel(l)}><X className="size-2.5" /></button></span>
                ))}
              </div>
              <div className="mt-1.5 flex gap-1">
                <Input value={labelInput} onChange={(e) => setLabelInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addLabel(labelInput); } }} placeholder="Add label…" list="wa-labels" className="h-8 text-xs" />
                <datalist id="wa-labels">{allLabels.map((l) => <option key={l} value={l} />)}</datalist>
                <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => addLabel(labelInput)}>Add</Button>
              </div>
            </div>
            {/* Lists membership */}
            <div className="border-t border-border/60 pt-3">
              <div className="mb-1.5 flex items-center justify-between">
                <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Users className="size-3.5" /> Lists</p>
                <button type="button" onClick={() => setManageOpen(true)} className="text-[10px] font-medium text-primary hover:underline">Manage</button>
              </div>
              {lists.length === 0 ? (
                <p className="text-xs text-muted-foreground">No lists yet — create one to segment contacts.</p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {lists.map((l) => {
                    const on = (thread?.lists || []).includes(l.name);
                    return (
                      <button key={l.name} type="button" onClick={() => toggleConvList(l.name)}
                        className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors",
                          on ? "border-primary bg-primary/10 font-medium text-primary" : "border-border/70 text-muted-foreground hover:bg-muted")}>
                        {on ? <Check className="size-2.5" /> : <Plus className="size-2.5" />} {l.name}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="mt-1.5 flex gap-1">
                <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); const v = newListName.trim(); if (v) { createList(v).then(() => toggleConvList(v)); } } }} placeholder="New list… (adds this contact)" className="h-8 text-xs" />
                <Button size="sm" variant="outline" className="h-8 shrink-0" onClick={() => { const v = newListName.trim(); if (v) createList(v).then(() => toggleConvList(v)); }}>Add</Button>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Manage lists */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Manage lists</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input value={newListName} onChange={(e) => setNewListName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); createList(newListName); } }} placeholder="New list name…" />
              <Button className="gap-1.5 shrink-0" onClick={() => createList(newListName)}><Plus className="size-4" /> Add</Button>
            </div>
            {lists.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">No lists yet.</p>
            ) : (
              <div className="max-h-72 space-y-1 overflow-y-auto">
                {lists.map((l) => <ManageListRow key={l.name} list={l} onRename={renameListFn} onDelete={deleteListFn} onMessage={() => { setManageOpen(false); openListMsg(l.name); }} />)}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Send message to list */}
      <Dialog open={!!listMsg} onOpenChange={(o) => !o && setListMsg(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Message “{listMsg?.name}”</DialogTitle></DialogHeader>
          {listMsg && (() => {
            const ltpl = templates.find((t) => t.name === listMsg.templateName);
            const varCount = ltpl?.variables ?? 0;
            return (
              <div className="space-y-3">
                {/* Text vs Template toggle */}
                <div className="flex gap-1 rounded-lg bg-muted p-1 text-xs">
                  {(["text", "template"] as const).map((mk) => (
                    <button key={mk} type="button" onClick={() => setListMsg((m) => (m ? { ...m, mode: mk } : m))}
                      className={cn("flex-1 rounded-md px-2 py-1.5 font-medium transition-colors", listMsg.mode === mk ? "bg-background shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                      {mk === "text" ? "Free text (open windows)" : "Template (reaches all)"}
                    </button>
                  ))}
                </div>

                {listMsg.mode === "text" ? (
                  <>
                    <p className="text-[11px] text-muted-foreground">Sends to everyone in this list whose 24-hour window is open. Contacts outside the window are skipped — use a template to reach them.</p>
                    <Textarea rows={5} value={listMsg.text} onChange={(e) => setListMsg((m) => (m ? { ...m, text: e.target.value } : m))} placeholder="Type your message…" dir="auto" />
                  </>
                ) : (
                  <>
                    <p className="text-[11px] text-muted-foreground">Sends an approved template to <span className="font-medium">every</span> member of the list (works even outside the 24h window). <code className="rounded bg-muted px-1">{"{{name}}"}</code> is replaced with each contact’s name.</p>
                    <Select value={listMsg.templateName || undefined} onValueChange={(v) => { const t = templates.find((x) => x.name === v); setListMsg((m) => (m ? { ...m, templateName: v, params: Array.from({ length: t?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")) } : m)); }}>
                      <SelectTrigger><SelectValue placeholder={templates.length ? "Pick a template" : "No templates"} /></SelectTrigger>
                      <SelectContent position="popper">{templates.map((t) => <SelectItem key={t.id} value={t.name}>{t.name} · {t.language}</SelectItem>)}</SelectContent>
                    </Select>
                    {ltpl?.body && <p dir={ltpl.language.startsWith("ar") ? "rtl" : "ltr"} className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">{fillPreview(ltpl.body, listMsg.params)}</p>}
                    {varCount > 0 && Array.from({ length: varCount }).map((_, i) => (
                      <Input key={i} value={listMsg.params[i] ?? ""} onChange={(e) => setListMsg((m) => (m ? { ...m, params: Array.from({ length: varCount }, (_, j) => (j === i ? e.target.value : m.params[j] ?? "")) } : m))} placeholder={`{{${i + 1}}}${i === 0 ? " — {{name}} allowed" : ""}`} />
                    ))}
                  </>
                )}
              </div>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setListMsg(null)} disabled={sending}>Cancel</Button>
            <Button onClick={sendToList} disabled={sending || (listMsg?.mode === "text" ? !listMsg?.text.trim() : !listMsg?.templateName)} className="gap-1.5">{sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New conversation */}
      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>New conversation</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Starting a chat with a number that hasn’t messaged you first requires an approved template.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Phone (country code) <span className="text-destructive">*</span></Label><Input value={nc.phone} onChange={(e) => setNc((s) => ({ ...s, phone: e.target.value }))} placeholder="9665xxxxxxxx" className="font-mono" /></div>
              <div className="space-y-1.5"><Label>Name (optional)</Label><Input value={nc.name} onChange={(e) => setNc((s) => ({ ...s, name: e.target.value }))} /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Template <span className="text-destructive">*</span></Label>
              <Select value={nc.tplName} onValueChange={(v) => { const t = templates.find((x) => x.name === v); setNc((s) => ({ ...s, tplName: v, params: Array.from({ length: t?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")) })); }}>
                <SelectTrigger><SelectValue placeholder={templates.length ? "Pick a template" : "No templates"} /></SelectTrigger>
                <SelectContent position="popper">{templates.map((t) => <SelectItem key={t.id} value={t.name}>{t.name} · {t.language}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            {nc.params.map((p, i) => (
              <Input key={i} value={p} onChange={(e) => setNc((s) => ({ ...s, params: s.params.map((x, j) => (j === i ? e.target.value : x)) }))} placeholder={`{{${i + 1}}} — {{name}} allowed`} />
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewOpen(false)} disabled={sending}>Cancel</Button>
            <Button onClick={startNew} disabled={sending} className="gap-1.5">{sending && <Loader2 className="size-4 animate-spin" />}<Send className="size-4" /> Start</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DaySep({ label }: { label: string }) {
  return <div className="my-2 flex justify-center"><span className="rounded-full bg-card px-3 py-0.5 text-[11px] font-medium text-muted-foreground shadow-sm">{label}</span></div>;
}

function ManageListRow({ list, onRename, onDelete, onMessage }: { list: WaList; onRename: (oldName: string, to: string) => void; onDelete: (name: string) => void; onMessage: () => void }) {
  const [editing, setEditing] = React.useState(false);
  const [val, setVal] = React.useState(list.name);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-border/60 px-2.5 py-1.5">
      {editing ? (
        <>
          <Input value={val} autoFocus onChange={(e) => setVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { onRename(list.name, val); setEditing(false); } if (e.key === "Escape") { setEditing(false); setVal(list.name); } }} className="h-7 text-sm" />
          <Button size="sm" className="h-7 shrink-0" onClick={() => { onRename(list.name, val); setEditing(false); }}>Save</Button>
        </>
      ) : (
        <>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{list.name}</span>
          <span className="shrink-0 rounded-full bg-muted px-1.5 text-[11px] font-semibold tabular-nums text-muted-foreground">{list.count}</span>
          <Button size="sm" variant="outline" className="h-7 shrink-0 gap-1 px-2 text-[11px]" disabled={!list.count} onClick={onMessage}><Send className="size-3" /> Message</Button>
          <button type="button" title="Rename" onClick={() => { setVal(list.name); setEditing(true); }} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted"><Pencil className="size-3.5" /></button>
          <button type="button" title="Delete" onClick={() => onDelete(list.name)} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="size-3.5" /></button>
        </>
      )}
    </div>
  );
}

/** Renders a message attachment inline — image / video / audio player / document link. */
function WaMedia({ url, type, mime, filename }: { url: string; type: string; mime?: string; filename?: string }) {
  const kind = type === "image" || (mime || "").startsWith("image/") ? "image"
    : type === "video" || (mime || "").startsWith("video/") ? "video"
      : type === "audio" || (mime || "").startsWith("audio/") ? "audio" : "document";
  if (kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary chat-attachment URLs; next/image can't optimize external user uploads
    return <a href={url} target="_blank" rel="noopener noreferrer" className="block"><img src={url} alt="attachment" className="mb-1 max-h-64 w-auto max-w-full rounded-lg object-cover" /></a>;
  }
  if (kind === "video") {
    return <video src={url} controls className="mb-1 max-h-64 w-auto max-w-full rounded-lg" />;
  }
  if (kind === "audio") {
    return <audio src={url} controls className="mb-1 w-56 max-w-full" />;
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="mb-1 flex items-center gap-2 rounded-lg bg-black/5 p-2 dark:bg-white/10">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><FileText className="size-4" /></span>
      <span className="min-w-0 flex-1 truncate text-xs font-medium">{filename || "Document"}</span>
      <Download className="size-4 shrink-0 text-muted-foreground" />
    </a>
  );
}

function Field2({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div>
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground"><Icon className="size-3.5" /> {label}</p>
      <p className="mt-0.5 break-words text-sm">{value}</p>
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
  const [params, setParams] = React.useState<string[]>(() => Array.from({ length: templates[0]?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")));
  const [sending, setSending] = React.useState(false);

  const tpl = templates.find((t) => t.name === templateName);
  const language = tpl?.language ?? "ar";
  const varCount = tpl?.variables ?? 0;
  const finalParams = Array.from({ length: varCount }, (_, i) => params[i] ?? "");
  const pickTemplate = (v: string) => {
    setTemplateName(v);
    const t = templates.find((x) => x.name === v);
    setParams(Array.from({ length: t?.variables ?? 0 }, (_, i) => (i === 0 ? "{{name}}" : "")));
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
      const c = await dal.whatsapp.createCampaign({ name: name || `Campaign ${new Date().toISOString().slice(0, 10)}`, templateName, language, bodyPreview: tpl?.body, defaultParams: finalParams, groups: pickedGroups, recipients: manualRecipients });
      if (!c.ok) { setSending(false); toast.error(c.error); return; }
      const res = await dal.whatsapp.sendCampaign(c.data.id);
      setSending(false);
      if (!res.ok) { toast.error(res.error); return; }
      toast.success(`Sent ${res.data.sent}/${res.data.total}${res.data.failed ? ` · ${res.data.failed} failed` : ""}`);
      if (res.data.errors?.length) toast.warning(res.data.errors[0]);
      refresh();
    } else {
      const res = await dal.whatsapp.sendBulk({ templateName, language, defaultParams: finalParams, groups: pickedGroups, recipients: manualRecipients });
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
          {varCount > 0 && (
            <div className="space-y-2">
              <Label>Template variables</Label>
              {Array.from({ length: varCount }).map((_, i) => (
                <Input key={i} value={params[i] ?? ""} onChange={(e) => setParams((p) => { const n = Array.from({ length: varCount }, (_, j) => p[j] ?? ""); n[i] = e.target.value; return n; })} placeholder={`{{${i + 1}}} — use {{name}} for the recipient's name`} />
              ))}
              <p className="text-[11px] text-muted-foreground">Use <code>{"{{name}}"}</code> to insert each recipient&apos;s name.</p>
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

function AutomationsPanel({ templates, groups, initial, confirm }: {
  templates: WaTemplate[]; groups: WaGroup[]; initial: WaAutomation[];
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [items, setItems] = React.useState(initial);
  // null = list view; { automation } = building (automation:null → new).
  const [building, setBuilding] = React.useState<{ automation: WaAutomation | null } | null>(null);

  const refresh = async () => { const r = await dal.whatsapp.fetchAutomations(); if (r.ok) setItems(r.data); };

  const toggleActive = async (a: WaAutomation) => {
    const r = await dal.whatsapp.updateAutomation(a.id, { active: !a.active });
    if (r.ok) { setItems((p) => p.map((x) => (x.id === a.id ? { ...x, active: !a.active } : x))); toast.success(!a.active ? "Activated" : "Paused"); } else toast.error(r.error);
  };
  const del = async (a: WaAutomation) => {
    if (!(await confirm({ title: "Delete automation", description: `“${a.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteAutomation(a.id);
    if (r.ok) { setItems((p) => p.filter((x) => x.id !== a.id)); toast.success("Deleted"); } else toast.error(r.error);
  };

  if (building) {
    return (
      <WhatsappAutomationBuilder
        automation={building.automation}
        templates={templates}
        groups={groups}
        onBack={() => { setBuilding(null); refresh(); }}
        onSaved={refresh}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{items.length} automation{items.length === 1 ? "" : "s"} — WhatsApp drips triggered when a contact joins a group.</p>
        <Button className="gap-1.5" onClick={() => setBuilding({ automation: null })}><Plus className="size-4" /> New automation</Button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/70 p-10 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600"><Zap className="size-6" /></span>
          <p className="mt-3 text-sm font-medium">No automations yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Build a visual drip that fires when a contact joins a group.</p>
          <Button className="mt-4 gap-1.5" onClick={() => setBuilding({ automation: null })}><Plus className="size-4" /> New automation</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => {
            let stepCount = 0; try { stepCount = (JSON.parse(a.steps || "{}").steps ?? []).length; } catch { /* ignore */ }
            return (
              <Card key={a.id}>
                <CardContent className="flex items-center gap-3 py-4">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", a.active ? "bg-success/12 text-success" : "bg-muted text-muted-foreground")}><Zap className="size-5" /></span>
                  <button className="min-w-0 flex-1 text-left" onClick={() => setBuilding({ automation: a })}>
                    <p className="truncate font-medium">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Joins “{a.triggerTag}” · {stepCount} steps · {a.sentCount} sent</p>
                  </button>
                  <Badge variant={a.active ? "default" : "secondary"}>{a.active ? "Running" : "Paused"}</Badge>
                  <Switch checked={a.active} onCheckedChange={() => toggleActive(a)} />
                  <Button variant="ghost" size="icon" className="size-8" title="Edit" onClick={() => setBuilding({ automation: a })}><Pencil className="size-4" /></Button>
                  <Button variant="ghost" size="icon" className="size-8" title="Delete" onClick={() => del(a)}><Trash2 className="size-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── Templates ───────────────────────── */
const EMPTY_TPL = { name: "", language: "ar", category: "marketing", folder: "", body: "", variables: 0, status: "approved" };
const WA_UNCAT = "__uncat__";

function TemplatesPanel({ templates, setTemplates, confirm }: {
  templates: WaTemplate[]; setTemplates: React.Dispatch<React.SetStateAction<WaTemplate[]>>;
  confirm: ReturnType<typeof useConfirm>["confirm"];
}) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<WaTemplate | null>(null);
  const [form, setForm] = React.useState(EMPTY_TPL);
  const [saving, setSaving] = React.useState(false);
  const [activeCat, setActiveCat] = React.useState<string | null>(null); // null = All
  const [folders, setFolders] = React.useState<WaTemplateFolder[]>([]);
  const [catDlg, setCatDlg] = React.useState<{ mode: "new" | "rename"; original?: string; value: string } | null>(null);
  const [folderTab, setFolderTab] = React.useState<"landing" | "course">("landing");
  const [syncingFolders, setSyncingFolders] = React.useState(false);

  const refreshFolders = React.useCallback(async () => { const r = await dal.whatsapp.fetchTemplateFolders(); if (r.ok) setFolders(r.data); }, []);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- loader setState only after an await
  React.useEffect(() => { refreshFolders(); }, [refreshFolders]);

  const uncatCount = templates.filter((t) => !(t.folder || "").trim()).length;

  const submitCat = async () => {
    const v = catDlg?.value.trim(); if (!v) return;
    const r = catDlg!.mode === "new"
      ? await dal.whatsapp.createTemplateFolder(v, folderTab)
      : (catDlg!.original && catDlg!.original !== v ? await dal.whatsapp.renameTemplateFolder(catDlg!.original, v) : { ok: true } as const);
    if (!r.ok) { toast.error(r.error); return; }
    if (catDlg!.mode === "rename" && activeCat === catDlg!.original) setActiveCat(v);
    toast.success(catDlg!.mode === "new" ? "Category created" : "Category renamed");
    setCatDlg(null); refreshFolders();
    const tr = await dal.whatsapp.fetchTemplates(); if (tr.ok) setTemplates(tr.data);
  };
  const deleteCat = async (name: string) => {
    if (!(await confirm({ title: "Delete category", description: `“${name}” will be removed. Its templates become uncategorized.`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteTemplateFolder(name);
    if (!r.ok) { toast.error(r.error); return; }
    if (activeCat === name) setActiveCat(null);
    toast.success("Category deleted"); refreshFolders();
    const tr = await dal.whatsapp.fetchTemplates(); if (tr.ok) setTemplates(tr.data);
  };

  const syncFolders = async () => {
    setSyncingFolders(true);
    const r = await dal.whatsapp.syncCourseTemplateFolders();
    setSyncingFolders(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Synced ${r.data.synced} course${r.data.synced === 1 ? "" : "s"}${r.data.created ? ` · ${r.data.created} new` : ""}`);
    refreshFolders();
  };
  const shownFolders = folders.filter((f) => (f.kind ?? "landing") === folderTab);

  const visible = React.useMemo(() => {
    if (activeCat === null) return templates;
    if (activeCat === WA_UNCAT) return templates.filter((t) => !(t.folder || "").trim());
    return templates.filter((t) => (t.folder || "").trim() === activeCat);
  }, [templates, activeCat]);

  const openNew = () => {
    setEditing(null);
    setForm({ ...EMPTY_TPL, folder: activeCat && activeCat !== WA_UNCAT ? activeCat : "" });
    setOpen(true);
  };
  const openEdit = (t: WaTemplate) => { setEditing(t); setForm({ name: t.name, language: t.language, category: t.category, folder: t.folder ?? "", body: t.body, variables: t.variables, status: t.status }); setOpen(true); };

  const save = async () => {
    if (!form.name.trim()) { toast.error("Template name is required (must match Meta)"); return; }
    setSaving(true);
    const payload = { ...form, folder: form.folder.trim() };
    const r = editing ? await dal.whatsapp.updateTemplate(editing.id, payload) : await dal.whatsapp.createTemplate(payload);
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    setTemplates((p) => editing ? p.map((x) => (x.id === r.data.id ? r.data : x)) : [r.data, ...p]);
    toast.success(editing ? "Saved" : "Template added");
    setOpen(false); refreshFolders();
  };
  const del = async (t: WaTemplate) => {
    if (!(await confirm({ title: "Delete template", description: `“${t.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const r = await dal.whatsapp.deleteTemplate(t.id);
    if (r.ok) { setTemplates((p) => p.filter((x) => x.id !== t.id)); toast.success("Deleted"); refreshFolders(); } else toast.error(r.error);
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[297px_minmax(0,1fr)]">
      {/* Category sidebar */}
      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-2xl border border-border/60 bg-card">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 p-3">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</span>
            <button onClick={() => setCatDlg({ mode: "new", value: "" })} title="New category" className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><Plus className="size-4" /></button>
          </div>
          <div className="px-2 pt-2">
            <div className="flex rounded-lg border border-border/60 bg-muted/40 p-0.5 text-xs font-medium">
              {([["landing", "Landing pages"], ["course", "Courses"]] as const).map(([k, l]) => (
                <button key={k} onClick={() => setFolderTab(k)}
                  className={cn("flex-1 rounded-md px-2 py-1.5 transition-colors", folderTab === k ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                  {l}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-0.5 p-2">
            <WaCatRow label="All templates" count={templates.length} active={activeCat === null} onClick={() => setActiveCat(null)} />
            {shownFolders.map((c) => (
              <WaCatRow key={c.name} label={c.name} count={c.count} active={activeCat === c.name} onClick={() => setActiveCat(c.name)}
                onRename={() => setCatDlg({ mode: "rename", original: c.name, value: c.name })} onDelete={() => deleteCat(c.name)} />
            ))}
            {folderTab === "course" && (
              <button onClick={syncFolders} disabled={syncingFolders}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-60">
                {syncingFolders ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Sync course categories
              </button>
            )}
            {shownFolders.length === 0 && folderTab === "landing" && (
              <p className="px-2 py-3 text-[11px] text-muted-foreground">No landing categories yet.</p>
            )}
            {folderTab === "landing" && uncatCount > 0 && (
              <WaCatRow label="Uncategorized" count={uncatCount} active={activeCat === WA_UNCAT} onClick={() => setActiveCat(WA_UNCAT)} />
            )}
          </div>
          <p className="border-t border-border/60 p-3 text-[11px] leading-relaxed text-muted-foreground">
            Add a category here, or assign one by typing its name in a template’s <span className="font-medium">Category</span> field.
          </p>
        </div>
      </aside>

      {/* Add / rename category */}
      <Dialog open={!!catDlg} onOpenChange={(o) => !o && setCatDlg(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{catDlg?.mode === "new" ? "New category" : "Rename category"}</DialogTitle></DialogHeader>
          <Input value={catDlg?.value ?? ""} autoFocus onChange={(e) => setCatDlg((d) => (d ? { ...d, value: e.target.value } : d))} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); submitCat(); } }} placeholder="e.g. CPHQ, CIC offers" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDlg(null)}>Cancel</Button>
            <Button onClick={submitCat} disabled={!catDlg?.value.trim()}>{catDlg?.mode === "new" ? "Add" : "Save"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {visible.length} {visible.length === 1 ? "template" : "templates"}{activeCat && activeCat !== WA_UNCAT ? ` in “${activeCat}”` : ""}
          </p>
          <Button className="gap-1.5" onClick={openNew}><Plus className="size-4" /> New template</Button>
        </div>

        {visible.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/70 bg-card p-12 text-center">
            <div className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-success/12 text-success"><MessageSquare className="size-6" /></div>
            <p className="text-sm font-medium">{templates.length === 0 ? "No templates yet" : "No templates here yet"}</p>
            <p className="mt-1 text-xs text-muted-foreground">Add one that matches an approved Meta template name.</p>
            <Button className="mt-4 gap-1.5" onClick={openNew}><Plus className="size-4" /> New template</Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {visible.map((t) => (
              <Card key={t.id}>
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="grid size-9 place-items-center rounded-lg bg-success/12 text-success"><MessageSquare className="size-[18px]" /></span>
                      <div>
                        <p className="font-mono text-sm font-medium">{t.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {(t.folder || "").trim() && <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/15"><Tag className="size-2.5" /> {t.folder}</Badge>}
                          <Badge variant="secondary" className="capitalize">{t.category}</Badge>
                          <Badge variant="outline" className="uppercase">{t.language}</Badge>
                          {t.variables > 0 && <Badge variant="outline">{t.variables} vars</Badge>}
                        </div>
                      </div>
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
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit template" : "New template"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Template name (must match Meta) <span className="text-destructive">*</span></Label><Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="e.g. cphq_welcome_ar" className="font-mono" /></div>
            <div className="space-y-1.5">
              <Label>Category <span className="font-normal text-muted-foreground">(for organizing — like email)</span></Label>
              <Input list="wa-folders" value={form.folder} onChange={(e) => setForm((f) => ({ ...f, folder: e.target.value }))} placeholder="e.g. CPHQ, CIC offers — type or pick, optional" />
              <datalist id="wa-folders">{folders.map((c) => <option key={c.name} value={c.name} />)}</datalist>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Language</Label><Input value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} placeholder="ar / en_US" /></div>
              <div className="space-y-1.5"><Label>Type <span className="font-normal text-muted-foreground">(Meta)</span></Label>
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

function WaCatRow({ label, count, active, onClick, onRename, onDelete }: { label: string; count: number; active: boolean; onClick: () => void; onRename?: () => void; onDelete?: () => void }) {
  return (
    <div className={cn("group flex items-center gap-1 rounded-lg pe-1 transition", active ? "bg-primary/10" : "hover:bg-muted/60")}>
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-1.5 text-left">
        <span className={cn("truncate text-sm", active ? "font-semibold text-primary" : "text-foreground")}>{label}</span>
        <span className={cn("shrink-0 rounded-full px-1.5 text-[11px] font-semibold tabular-nums", active ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground")}>{count}</span>
      </button>
      {(onRename || onDelete) && (
        <span className="flex shrink-0 items-center opacity-0 transition group-hover:opacity-100">
          {onRename && <button type="button" title="Rename" onClick={onRename} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="size-3" /></button>}
          {onDelete && <button type="button" title="Delete" onClick={onDelete} className="grid size-6 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-destructive"><Trash2 className="size-3" /></button>}
        </span>
      )}
    </div>
  );
}
