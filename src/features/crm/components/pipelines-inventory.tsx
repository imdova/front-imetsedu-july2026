"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { GitBranch, Users, Trophy, DollarSign, TrendingUp, LayoutGrid, Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import type { PipelineSummary, PipelineInventoryStats } from "@/lib/db/crm";
import { useRouter } from "@/i18n/navigation";
import { cn, formatCompact, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

export function PipelinesInventory({
  initial,
  stats,
}: {
  initial: PipelineSummary[];
  stats: PipelineInventoryStats;
}) {
  const t = useTranslations("Crm");
  const router = useRouter();
  const openPipeline = () => router.push("/admin/crm/pipeline");
  const [rows, setRows] = React.useState(initial);
  const [tab, setTab] = React.useState<"active" | "archived">("active");
  const [search, setSearch] = React.useState("");

  const filtered = rows.filter(
    (p) => (tab === "active" ? !p.archived : p.archived) && p.title.toLowerCase().includes(search.toLowerCase()),
  );
  const activeCount = rows.filter((p) => !p.archived).length;
  const archivedCount = rows.filter((p) => p.archived).length;

  const toggleArchive = (p: PipelineSummary) => {
    setRows((prev) => prev.map((r) => (r.id === p.id ? { ...r, archived: !r.archived } : r)));
    toast.success(p.archived ? t("pipelineRestored", { title: p.title }) : t("pipelineArchived", { title: p.title }));
  };

  const kpis = [
    { label: t("invTotalPipelines"), value: `${stats.totalPipelines}`, sub: t("invActive", { n: stats.activePipelines }), icon: GitBranch, tone: "bg-primary/12 text-primary" },
    { label: t("invTotalLeads"), value: `${stats.totalLeads}`, icon: Users, tone: "bg-chart-3/15 text-chart-3" },
    { label: t("invTotalEnrollments"), value: `${stats.totalEnrollments}`, icon: Trophy, tone: "bg-success/15 text-success" },
    { label: t("invTotalRevenue"), value: formatCurrency(stats.totalRevenue, "EGP"), icon: DollarSign, tone: "bg-warning/18 text-warning" },
    { label: t("invAvgConversion"), value: `${stats.avgConversion}%`, icon: TrendingUp, tone: "bg-chart-2/15 text-chart-2" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">{t("invTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("invSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("searchPipelines")} className="w-56 ps-9" />
          </div>
          <Button className="gap-1.5"><Plus className="size-4" />{t("newPipeline")}</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardContent className="space-y-2 pt-5">
              <div className="flex items-center justify-between">
                <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{k.label}</p>
                <span className={cn("grid size-8 place-items-center rounded-lg", k.tone)}><k.icon className="size-4" /></span>
              </div>
              <p className="font-heading text-2xl font-bold tabular-nums">{k.value}</p>
              {k.sub && <p className="text-xs text-muted-foreground">{k.sub}</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {([["active", t("invTabActive"), activeCount], ["archived", t("invTabArchived"), archivedCount]] as const).map(([key, label, count]) => (
          <button key={key} onClick={() => setTab(key)}
            className={cn("inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
              tab === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}>
            {label}<span className={cn("rounded-full px-1.5 text-xs tabular-nums", tab === key ? "bg-white/20" : "bg-muted")}>{count}</span>
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/70 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3 text-start font-semibold">{t("colTitle")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("colSource")}</th>
                  <th className="px-4 py-3 text-start font-semibold">{t("colCreatedAt")}</th>
                  <th className="px-4 py-3 text-center font-semibold">{t("colLeads")}</th>
                  <th className="px-4 py-3 text-center font-semibold">{t("colEnrollments")}</th>
                  <th className="px-4 py-3 text-end font-semibold">{t("colRevenue")}</th>
                  <th className="px-4 py-3 text-center font-semibold">{t("colConversion")}</th>
                  <th className="px-4 py-3 text-center font-semibold">{t("colArchive")}</th>
                  <th className="px-6 py-3 text-end font-semibold">{t("colActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id} className="border-b border-border/50 last:border-0 hover:bg-muted/30">
                    <td className="px-6 py-4">
                      <button type="button" onClick={openPipeline}
                        className="text-start font-medium text-primary hover:underline">
                        {p.title}
                      </button>
                    </td>
                    <td className="px-4 py-4"><Badge variant="outline">{p.source}</Badge></td>
                    <td className="px-4 py-4 text-muted-foreground tabular-nums">{p.createdAt}</td>
                    <td className="px-4 py-4 text-center"><span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">{p.leads}</span></td>
                    <td className="px-4 py-4 text-center"><span className="rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success tabular-nums">{p.enrollments}</span></td>
                    <td className="px-4 py-4 text-end font-medium tabular-nums">{p.revenue > 0 ? formatCurrency(p.revenue, "EGP") : "EGP 0"}</td>
                    <td className="px-4 py-4 text-center tabular-nums">{p.conversion}%</td>
                    <td className="px-4 py-4 text-center"><Switch checked={p.archived} onCheckedChange={() => toggleArchive(p)} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={openPipeline}><LayoutGrid className="size-3.5" />{t("open")}</Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5"><Pencil className="size-3.5" />{t("edit")}</Button>
                        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-destructive" onClick={() => toast.error(t("delete"))}><Trash2 className="size-3.5" />{t("delete")}</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
