"use client";

import * as React from "react";
import { toast } from "sonner";
import { AlertTriangle, ArrowLeft, CheckCheck, Loader2, RefreshCw, Send, Users } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { WaCampaignReport } from "@/lib/dal/whatsapp";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { cn } from "@/lib/utils";
import {
  CampaignStatusBadge, DeliveryStatusBadge, DetailRow, MediaPreview,
} from "@/features/admin/components/whatsapp-shared";

const fmtAt = (v?: string | null) =>
  v ? new Date(v).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "—";

/** Campaign overview + details + statistics + per-recipient delivery report. */
export function WhatsappCampaignDetail({ initial }: { initial: WaCampaignReport }) {
  const [report, setReport] = React.useState(initial);
  const [refreshing, setRefreshing] = React.useState(false);
  const { campaign: c, stats, recipients } = report;

  const refresh = async () => {
    setRefreshing(true);
    const r = await dal.whatsapp.fetchCampaignReport(c.id);
    setRefreshing(false);
    if (r.ok) setReport(r.data);
    else toast.error(r.error);
  };

  const reached = stats.delivered + stats.read;
  const pct = (n: number) => (stats.total ? Math.round((n / stats.total) * 100) : 0);
  const language = c.language || "ar";
  const previewBody = c.mode === "manual"
    ? c.text
    : (c.bodyPreview || "").replace(/\{\{(\d+)\}\}/g, (_, n) => c.defaultParams[Number(n) - 1] || `{{${n}}}`);
  const failedRows = recipients.filter((r) => r.status === "failed");

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/whatsapp-templates?tab=campaigns">
            <Button variant="ghost" size="icon" className="size-9" title="Back to campaigns"><ArrowLeft className="size-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold">{c.name}</h1>
              <CampaignStatusBadge status={c.status} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {c.mode === "manual" ? "Manual message" : `Template · ${c.templateName}`} · created {fmtAt(c.createdAt)}{c.sentAt ? ` · sent ${fmtAt(c.sentAt)}` : ""}
            </p>
          </div>
        </div>
        <Button variant="outline" className="gap-1.5" onClick={refresh} disabled={refreshing}>
          {refreshing ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />} Refresh statuses
        </Button>
      </div>

      {/* Overview stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Recipients" value={stats.total.toLocaleString()} icon={Users} intent="primary" />
        <KpiCard label="Accepted by Meta" value={(stats.accepted + reached).toLocaleString()} icon={Send} intent="info" helperText="Handed to WhatsApp servers" />
        <KpiCard label="Delivered" value={reached.toLocaleString()} icon={CheckCheck} intent="success" helperText={stats.read ? `${stats.read} read` : undefined} />
        <KpiCard label="Failed" value={stats.failed.toLocaleString()} icon={AlertTriangle} intent={stats.failed ? "destructive" : "warning"} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          {/* Statistics */}
          <Card>
            <CardContent className="space-y-3 pt-5">
              <p className="font-semibold">Statistics</p>
              {([
                ["Delivered", reached, "bg-success"],
                ["Read", stats.read, "bg-blue-500"],
                ["Awaiting status", stats.accepted, "bg-muted-foreground/40"],
                ["Failed", stats.failed, "bg-destructive"],
                ["Not sent", stats.notSent, "bg-border"],
              ] as const).map(([label, n, color]) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="w-28 shrink-0 text-muted-foreground">{label}</span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", color)} style={{ width: `${pct(n)}%` }} />
                  </div>
                  <span className="w-20 shrink-0 text-right tabular-nums">{n.toLocaleString()} · {pct(n)}%</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Failure reasons */}
          {failedRows.length > 0 && (
            <Card>
              <CardContent className="space-y-3 pt-5">
                <div className="flex items-center gap-2 text-destructive"><AlertTriangle className="size-4" /><p className="font-semibold">Why messages failed</p></div>
                {[...new Set(failedRows.map((r) => r.error || "Delivery failed"))].map((reason) => (
                  <div key={reason} className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
                    <p className="text-destructive">{reason}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {failedRows.filter((r) => (r.error || "Delivery failed") === reason).length} recipient(s).
                      {/24 hours|re-engagement/i.test(reason) && " These contacts are outside the 24-hour window — resend using an approved template to reach them."}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Per-recipient report */}
          <Card>
            <CardContent className="space-y-3 pt-5">
              <p className="font-semibold">Recipient report</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/70 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      <th className="py-2 pe-3">Phone</th>
                      <th className="py-2 pe-3">Name</th>
                      <th className="py-2 pe-3">Status</th>
                      <th className="py-2">Reason / time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {recipients.map((r) => (
                      <tr key={r.phone}>
                        <td className="py-2 pe-3 font-mono text-xs">{r.phone}</td>
                        <td className="max-w-[140px] truncate py-2 pe-3">{r.name || "—"}</td>
                        <td className="py-2 pe-3"><DeliveryStatusBadge status={r.status} /></td>
                        <td className="py-2 text-xs text-muted-foreground">
                          {r.status === "failed" && r.error
                            ? <span className="text-destructive">{r.error}</span>
                            : fmtAt(r.at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail: details + message preview */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardContent className="space-y-2 pt-5 text-sm">
              <p className="mb-1 font-semibold">Details</p>
              <DetailRow k="Type" v={c.mode === "manual" ? "Manual (text + media)" : "Template"} />
              {c.mode === "template" && <DetailRow k="Template" v={c.templateName || "—"} />}
              <DetailRow k="Language" v={language === "ar" ? "Arabic" : language} />
              {c.mode === "manual" && c.mediaKind && <DetailRow k="Media" v={c.mediaKind} />}
              <DetailRow k="Created" v={fmtAt(c.createdAt)} />
              <DetailRow k="Sent" v={fmtAt(c.sentAt)} />
              <DetailRow k="Recipients" v={c.total.toLocaleString()} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2 pt-5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Message</p>
              <div className="rounded-xl bg-[#e5ddd5] p-3 dark:bg-muted/40">
                <div dir={language.startsWith("ar") ? "rtl" : "ltr"} className="ml-auto max-w-full space-y-2 rounded-lg rounded-tr-none bg-[#d9fdd3] p-2.5 text-sm text-neutral-900 shadow-sm dark:bg-emerald-900/40 dark:text-emerald-50">
                  {c.mode === "manual" && c.mediaUrl && (
                    <MediaPreview media={{ url: c.mediaUrl, kind: c.mediaKind, mime: "", filename: c.mediaFilename }} className="max-w-full" />
                  )}
                  {previewBody
                    ? <p className="whitespace-pre-wrap break-words">{previewBody}</p>
                    : <p className="text-xs opacity-70">{c.mediaFilename || "No text"}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
