"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Plus, Trash2, Radar as RadarIcon, Download, Eraser, Link2, Search, Bot, Unlink, CheckCircle2,
  Shuffle, ExternalLink, Globe, AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type {
  Sitemap, SitemapSummary, SitemapStatus, Backlink, BacklinkSummary, LinkAttribute, BacklinkStatus,
  GscRow, GscSummary, GeoMention, GeoSummary, BrokenUrl, BrokenSummary,
} from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { SeoPanelHead } from "./seo-panel-head";
import { SeoStatCard } from "./seo-stat-card";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

/* ══ Sitemaps ══ */
export function SeoSitemapsPanel() {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<Sitemap[]>([]);
  const [summary, setSummary] = React.useState<SitemapSummary>({ total: 0, discoveredUrls: 0, errorRate: 0 });
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [type, setType] = React.useState("xml");

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.seo.fetchSitemaps();
    if (res.ok) { setRows(res.data.data); setSummary(res.data.summary); }
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!url.trim()) return;
    const res = await dal.seo.createSitemap({ url, type: type || "xml" });
    if (res.ok) { toast.success("Sitemap added"); setOpen(false); setUrl(""); setType("xml"); load(); } else toast.error(res.error);
  };
  const recrawl = async (s: Sitemap) => { const res = await dal.seo.recrawlSitemap(s.id); if (res.ok) { toast.success("Recrawled"); load(); } };
  const remove = async (s: Sitemap) => {
    if (!(await confirm({ title: "Delete sitemap", description: s.url, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.seo.deleteSitemap(s.id); if (res.ok) { toast.success("Deleted"); load(); } else toast.error(res.error);
  };

  const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString("en-US") : "Never");
  const statusPill = (st: SitemapStatus) => {
    const styles: Record<SitemapStatus, string> = {
      ok: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300",
      error: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300",
      pending: "border-border bg-muted text-muted-foreground",
    };
    const label = st === "ok" ? "SUCCESS" : st === "error" ? "ERROR" : "PENDING";
    return <span className={cn("inline-flex rounded-full border px-2.5 py-0.5 text-[0.65rem] font-semibold", styles[st])}>{label}</span>;
  };

  return (
    <div className="space-y-4">
      <SeoPanelHead
        crumb="Sitemaps"
        title="Sitemap Manager"
        description="Register and monitor your XML sitemaps."
        action={<Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> Submit sitemap</Button>}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <SeoStatCard label="Total Sitemaps" value={summary.total} sub="active indices" icon={Globe} tint="emerald" />
        <SeoStatCard label="Discovered URLs" value={summary.discoveredUrls.toLocaleString()} sub="total links" icon={Link2} tint="blue" />
        <SeoStatCard label="Error Rate" value={`${summary.errorRate}%`} sub="failed indexing" icon={AlertTriangle} tint={summary.errorRate > 0 ? "rose" : "emerald"} />
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full min-w-[46rem] text-sm">
            <thead>
              <tr className="border-b border-border/60 text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3 text-start font-medium">Sitemap URL</th>
                <th className="px-4 py-3 text-start font-medium">Type</th>
                <th className="px-4 py-3 text-start font-medium">Last Crawled</th>
                <th className="px-4 py-3 text-start font-medium">URLs Found</th>
                <th className="px-4 py-3 text-start font-medium">Status</th>
                <th className="px-4 py-3 text-end font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">Loading…</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No sitemaps submitted yet.</td></tr>
              ) : (
                rows.map((s) => (
                  <tr key={s.id} className="border-b border-border/40 last:border-0">
                    <td className="px-4 py-3 font-mono text-xs">{s.url}</td>
                    <td className="px-4 py-3 uppercase text-muted-foreground">{s.type || "XML"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{fmt(s.lastCrawled)}</td>
                    <td className="px-4 py-3 font-medium tabular-nums text-primary">{s.urlsFound}</td>
                    <td className="px-4 py-3">{statusPill(s.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-8" title="Recrawl" onClick={() => recrawl(s)}><Shuffle className="size-4" /></Button>
                        <Button asChild variant="ghost" size="icon" className="size-8" title="Open">
                          <a href={s.url} target="_blank" rel="noreferrer"><ExternalLink className="size-4" /></a>
                        </Button>
                        <Button variant="ghost" size="icon" className="size-8" title="Delete" onClick={() => remove(s)}><Trash2 className="size-4 text-destructive" /></Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Submit sitemap</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">
                Sitemap URL <span className="text-destructive">*</span>
              </Label>
              <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/sitemap.xml" />
              <p className="text-xs text-muted-foreground">Absolute (https://…) or a path like /sitemap.xml</p>
            </div>
            <Field label="Type">
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="xml">XML</SelectItem>
                  <SelectItem value="image">IMAGE</SelectItem>
                  <SelectItem value="video">VIDEO</SelectItem>
                  <SelectItem value="news">NEWS</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!url.trim()}>Submit</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

/* ══ Backlinks ══ */
export function SeoBacklinksPanel() {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<Backlink[]>([]);
  const [summary, setSummary] = React.useState<BacklinkSummary>({ total: 0, referringDomains: 0, avgAuthority: 0, lost: 0 });
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ sourceUrl: "", anchor: "", destination: "", authority: 50, attribute: "dofollow" as LinkAttribute, status: "new" as BacklinkStatus });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.seo.fetchBacklinks();
    if (res.ok) { setRows(res.data.data); setSummary(res.data.summary); }
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.sourceUrl.trim()) return;
    const res = await dal.seo.createBacklink(form);
    if (res.ok) { toast.success("Backlink added"); setOpen(false); load(); } else toast.error(res.error);
  };
  const scan = async () => { const res = await dal.seo.scanBacklinks(); if (res.ok) { toast.success(`Scan complete — ${res.data} new`); load(); } else toast.error(res.error); };
  const remove = async (b: Backlink) => {
    if (!(await confirm({ title: "Delete backlink", description: b.sourceUrl, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.seo.deleteBacklink(b.id); if (res.ok) { toast.success("Deleted"); load(); } else toast.error(res.error);
  };

  const columns: ColumnDef<Backlink>[] = [
    { accessorKey: "sourceUrl", header: "Source", cell: ({ row }) => <a href={row.original.sourceUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary hover:underline">{row.original.sourceUrl}</a> },
    { accessorKey: "anchor", header: "Anchor", cell: ({ row }) => <span className="text-sm">{row.original.anchor}</span> },
    { accessorKey: "destination", header: "Destination", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.destination}</span> },
    { accessorKey: "authority", header: "DA", cell: ({ row }) => <span className="tabular-nums">{row.original.authority}</span> },
    { accessorKey: "attribute", header: "Rel", cell: ({ row }) => <Badge variant={row.original.attribute === "dofollow" ? "default" : "secondary"}>{row.original.attribute}</Badge> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "live" ? "default" : row.original.status === "lost" ? "destructive" : "outline"}>{row.original.status}</Badge> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Backlinks" value={summary.total} icon={Link2} intent="primary" />
        <KpiCard label="Referring domains" value={summary.referringDomains} icon={Link2} intent="info" />
        <KpiCard label="Avg authority" value={summary.avgAuthority} icon={RadarIcon} intent="success" />
        <KpiCard label="Lost" value={summary.lost} icon={Unlink} intent="destructive" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-1.5" onClick={scan}><RadarIcon className="size-4" /> Scan</Button>
        <Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> Add backlink</Button>
      </div>
      <DataTable columns={columns} data={rows} isLoading={loading} pageSize={8} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add backlink</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Field label="Source URL"><Input value={form.sourceUrl} onChange={(e) => setForm((f) => ({ ...f, sourceUrl: e.target.value }))} /></Field>
            <Field label="Anchor text"><Input value={form.anchor} onChange={(e) => setForm((f) => ({ ...f, anchor: e.target.value }))} /></Field>
            <Field label="Destination"><Input value={form.destination} onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))} placeholder="/courses" /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Authority"><Input type="number" value={form.authority} onChange={(e) => setForm((f) => ({ ...f, authority: Number(e.target.value) }))} /></Field>
              <Field label="Rel">
                <Select value={form.attribute} onValueChange={(v) => setForm((f) => ({ ...f, attribute: v as LinkAttribute }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="dofollow">dofollow</SelectItem><SelectItem value="nofollow">nofollow</SelectItem></SelectContent>
                </Select>
              </Field>
              <Field label="Status">
                <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as BacklinkStatus }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="new">new</SelectItem><SelectItem value="live">live</SelectItem><SelectItem value="lost">lost</SelectItem></SelectContent>
                </Select>
              </Field>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!form.sourceUrl.trim()}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

/* ══ Google Search Console ══ */
export function SeoGscPanel() {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<GscRow[]>([]);
  const [summary, setSummary] = React.useState<GscSummary>({ clicks: 0, impressions: 0, ctr: 0, position: 0 });
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.seo.fetchGsc();
    if (res.ok) { setRows(res.data.data); setSummary(res.data.summary); }
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const importSample = async () => {
    const res = await dal.seo.importGsc([
      { kind: "query", key: "imets diploma", clicks: 120, impressions: 3000, ctr: 4.0, position: 5.2 },
      { kind: "page", key: "/courses/ai-for-business", clicks: 88, impressions: 2100, ctr: 4.2, position: 6.1 },
    ]);
    if (res.ok) { toast.success(`Imported ${res.data} rows`); load(); } else toast.error(res.error);
  };
  const clear = async () => {
    if (!(await confirm({ title: "Clear all GSC data", description: "Removes every imported row.", confirmText: "Clear", variant: "destructive" }))) return;
    const res = await dal.seo.clearGsc(); if (res.ok) { toast.success("Cleared"); load(); } else toast.error(res.error);
  };
  const remove = async (r: GscRow) => { const res = await dal.seo.deleteGscRow(r.id); if (res.ok) { toast.success("Deleted"); load(); } };

  const columns: ColumnDef<GscRow>[] = [
    { accessorKey: "kind", header: "Kind", cell: ({ row }) => <Badge variant="outline">{row.original.kind}</Badge> },
    { accessorKey: "key", header: "Query / Page", cell: ({ row }) => <span className="font-mono text-xs">{row.original.key}</span> },
    { accessorKey: "clicks", header: "Clicks", cell: ({ row }) => <span className="tabular-nums">{row.original.clicks.toLocaleString()}</span> },
    { accessorKey: "impressions", header: "Impressions", cell: ({ row }) => <span className="tabular-nums">{row.original.impressions.toLocaleString()}</span> },
    { accessorKey: "ctr", header: "CTR", cell: ({ row }) => <span className="tabular-nums">{row.original.ctr}%</span> },
    { accessorKey: "position", header: "Pos", cell: ({ row }) => <span className="tabular-nums">{row.original.position}</span> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Clicks" value={summary.clicks.toLocaleString()} icon={Search} intent="primary" />
        <KpiCard label="Impressions" value={summary.impressions.toLocaleString()} icon={Search} intent="info" />
        <KpiCard label="Avg CTR" value={`${summary.ctr}%`} icon={RadarIcon} intent="success" />
        <KpiCard label="Avg position" value={summary.position} icon={RadarIcon} intent="warning" />
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="outline" className="gap-1.5" onClick={importSample}><Download className="size-4" /> Import</Button>
        <Button variant="outline" className="gap-1.5" onClick={clear} disabled={!rows.length}><Eraser className="size-4" /> Clear</Button>
      </div>
      <DataTable columns={columns} data={rows} isLoading={loading} pageSize={8} />
      {Confirmation}
    </div>
  );
}

/* ══ GEO (AI answer-engine mentions) ══ */
export function SeoGeoPanel() {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<GeoMention[]>([]);
  const [summary, setSummary] = React.useState<GeoSummary>({ total: 0, mentions: 0, mentionRate: 0, engines: 0 });
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ prompt: "", engine: "ChatGPT", mentioned: false, citationUrl: "", notes: "" });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.seo.fetchGeo();
    if (res.ok) { setRows(res.data.data); setSummary(res.data.summary); }
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.prompt.trim()) return;
    const res = await dal.seo.createGeo(form);
    if (res.ok) { toast.success("Mention added"); setOpen(false); setForm({ prompt: "", engine: "ChatGPT", mentioned: false, citationUrl: "", notes: "" }); load(); } else toast.error(res.error);
  };
  const remove = async (g: GeoMention) => {
    if (!(await confirm({ title: "Delete mention", description: g.prompt, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.seo.deleteGeo(g.id); if (res.ok) { toast.success("Deleted"); load(); } else toast.error(res.error);
  };

  const columns: ColumnDef<GeoMention>[] = [
    { accessorKey: "prompt", header: "Prompt", cell: ({ row }) => <span className="text-sm">{row.original.prompt}</span> },
    { accessorKey: "engine", header: "Engine", cell: ({ row }) => <Badge variant="outline">{row.original.engine}</Badge> },
    { accessorKey: "mentioned", header: "Mentioned", cell: ({ row }) => <Badge variant={row.original.mentioned ? "default" : "secondary"}>{row.original.mentioned ? "Yes" : "No"}</Badge> },
    { accessorKey: "citationUrl", header: "Citation", cell: ({ row }) => row.original.citationUrl ? <a href={row.original.citationUrl} target="_blank" rel="noreferrer" className="font-mono text-xs text-primary hover:underline">link</a> : <span className="text-muted-foreground">—</span> },
    { accessorKey: "notes", header: "Notes", cell: ({ row }) => <span className="line-clamp-1 max-w-xs text-xs text-muted-foreground">{row.original.notes || "—"}</span> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Prompts tracked" value={summary.total} icon={Bot} intent="primary" />
        <KpiCard label="Mentions" value={summary.mentions} icon={CheckCircle2} intent="success" />
        <KpiCard label="Mention rate" value={`${summary.mentionRate}%`} icon={RadarIcon} intent="info" />
        <KpiCard label="Engines" value={summary.engines} icon={Bot} intent="warning" />
      </div>
      <div className="flex justify-end"><Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> Track prompt</Button></div>
      <DataTable columns={columns} data={rows} isLoading={loading} pageSize={8} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Track AI prompt</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Field label="Prompt"><Input value={form.prompt} onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Engine">
                <Select value={form.engine} onValueChange={(v) => setForm((f) => ({ ...f, engine: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["ChatGPT", "Perplexity", "Gemini", "Claude", "Copilot"].map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}</SelectContent>
                </Select>
              </Field>
              <label className="flex items-center justify-between self-end rounded-lg border border-border/70 px-3 py-2">
                <span className="text-sm font-medium">Mentioned</span>
                <Switch checked={form.mentioned} onCheckedChange={(v) => setForm((f) => ({ ...f, mentioned: v }))} />
              </label>
            </div>
            <Field label="Citation URL"><Input value={form.citationUrl} onChange={(e) => setForm((f) => ({ ...f, citationUrl: e.target.value }))} /></Field>
            <Field label="Notes"><Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} /></Field>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!form.prompt.trim()}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}

/* ══ Broken URLs (404 monitor) ══ */
export function SeoBrokenUrlsPanel() {
  const { confirm, Confirmation } = useConfirm();
  const [rows, setRows] = React.useState<BrokenUrl[]>([]);
  const [summary, setSummary] = React.useState<BrokenSummary>({ total: 0, open: 0, resolved: 0 });
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ url: "", statusCode: 404, referrer: "" });

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await dal.seo.fetchBroken();
    if (res.ok) { setRows(res.data.data); setSummary(res.data.summary); }
    setLoading(false);
  }, []);
  React.useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!form.url.trim()) return;
    const res = await dal.seo.createBroken({ url: form.url, statusCode: form.statusCode, referrer: form.referrer || undefined });
    if (res.ok) { toast.success("URL added"); setOpen(false); setForm({ url: "", statusCode: 404, referrer: "" }); load(); } else toast.error(res.error);
  };
  const toggleResolved = async (b: BrokenUrl) => { const res = await dal.seo.resolveBroken(b.id, !b.resolved); if (res.ok) { toast.success(b.resolved ? "Reopened" : "Resolved"); load(); } };
  const remove = async (b: BrokenUrl) => {
    if (!(await confirm({ title: "Delete entry", description: b.url, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.seo.deleteBroken(b.id); if (res.ok) { toast.success("Deleted"); load(); } else toast.error(res.error);
  };

  const columns: ColumnDef<BrokenUrl>[] = [
    { accessorKey: "url", header: "URL", cell: ({ row }) => <span className="font-mono text-xs">{row.original.url}</span> },
    { accessorKey: "statusCode", header: "Code", cell: ({ row }) => <Badge variant="destructive">{row.original.statusCode}</Badge> },
    { accessorKey: "referrer", header: "Referrer", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.referrer || "—"}</span> },
    { accessorKey: "hits", header: "Hits", cell: ({ row }) => <span className="tabular-nums">{row.original.hits}</span> },
    { accessorKey: "resolved", header: "Resolved", cell: ({ row }) => <Switch checked={row.original.resolved} onCheckedChange={() => toggleResolved(row.original)} /> },
    { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end"><Button variant="ghost" size="sm" onClick={() => remove(row.original)}><Trash2 className="size-4 text-destructive" /></Button></div> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard label="Total" value={summary.total} icon={Unlink} intent="primary" />
        <KpiCard label="Open" value={summary.open} icon={Unlink} intent="destructive" />
        <KpiCard label="Resolved" value={summary.resolved} icon={CheckCircle2} intent="success" />
      </div>
      <div className="flex justify-end"><Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" /> Add URL</Button></div>
      <DataTable columns={columns} data={rows} isLoading={loading} pageSize={8} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add broken URL</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <Field label="URL"><Input value={form.url} onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))} placeholder="/old-path" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Status code"><Input type="number" value={form.statusCode} onChange={(e) => setForm((f) => ({ ...f, statusCode: Number(e.target.value) }))} /></Field>
              <Field label="Referrer"><Input value={form.referrer} onChange={(e) => setForm((f) => ({ ...f, referrer: e.target.value }))} /></Field>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add} disabled={!form.url.trim()}>Add</Button></DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
