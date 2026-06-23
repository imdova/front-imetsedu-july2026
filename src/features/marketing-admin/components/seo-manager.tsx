"use client";

import * as React from "react";
import { Gauge, FileSearch, CornerUpRight, EyeOff, AlertTriangle } from "lucide-react";

import type {
  SeoOverview, SeoSettings, SeoPage, SeoRedirect, SeoSchema, SchemaSummary,
} from "@/lib/db/seo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { KpiCard } from "@/components/shared/kpi-card";
import { SeoSettingsPanel } from "./seo-settings-panel";
import { SeoPagesPanel } from "./seo-pages-panel";
import { SeoRedirectsPanel } from "./seo-redirects-panel";
import { SeoSchemaPanel } from "./seo-schema-panel";
import {
  SeoSitemapsPanel, SeoBacklinksPanel, SeoGscPanel, SeoGeoPanel, SeoBrokenUrlsPanel,
} from "./seo-analytics-panels";

const SEVERITY: Record<string, "destructive" | "default" | "secondary"> = {
  high: "destructive", medium: "default", low: "secondary",
};

export function SeoManager({
  overview, settings, pages, redirects, schemas, schemaSummary,
}: {
  overview: SeoOverview;
  settings: SeoSettings;
  pages: SeoPage[];
  redirects: SeoRedirect[];
  schemas: SeoSchema[];
  schemaSummary: SchemaSummary;
}) {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="flex-wrap">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="settings">Global Settings</TabsTrigger>
        <TabsTrigger value="pages">Page Overrides</TabsTrigger>
        <TabsTrigger value="redirects">Redirects</TabsTrigger>
        <TabsTrigger value="schema">Schema</TabsTrigger>
        <TabsTrigger value="sitemaps">Sitemaps</TabsTrigger>
        <TabsTrigger value="backlinks">Backlinks</TabsTrigger>
        <TabsTrigger value="gsc">Search Console</TabsTrigger>
        <TabsTrigger value="geo">GEO</TabsTrigger>
        <TabsTrigger value="broken">Broken URLs</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Avg page score" value={`${overview.avgPageScore}/100`} icon={Gauge} intent="primary" />
          <KpiCard label="Page overrides" value={overview.pageOverrides} icon={FileSearch} intent="info" />
          <KpiCard label="Redirects" value={overview.redirects} icon={CornerUpRight} intent="warning" />
          <KpiCard label="No-index pages" value={overview.noindexPages} icon={EyeOff} intent="destructive" />
        </div>
        <Card>
          <CardContent className="space-y-3 py-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="size-4 text-warning" />
              <h3 className="text-sm font-semibold">Issues to fix</h3>
            </div>
            {overview.issues.length === 0 ? (
              <p className="text-sm text-muted-foreground">No issues detected. 🎉</p>
            ) : (
              <ul className="space-y-2">
                {overview.issues.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
                    <span className="text-sm">{i.label}</span>
                    <Badge variant={SEVERITY[i.severity]} className="capitalize">{i.severity}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="settings"><SeoSettingsPanel initial={settings} /></TabsContent>
      <TabsContent value="pages"><SeoPagesPanel initial={pages} /></TabsContent>
      <TabsContent value="redirects"><SeoRedirectsPanel initial={redirects} /></TabsContent>
      <TabsContent value="schema"><SeoSchemaPanel initial={schemas} initialSummary={schemaSummary} /></TabsContent>
      <TabsContent value="sitemaps"><SeoSitemapsPanel /></TabsContent>
      <TabsContent value="backlinks"><SeoBacklinksPanel /></TabsContent>
      <TabsContent value="gsc"><SeoGscPanel /></TabsContent>
      <TabsContent value="geo"><SeoGeoPanel /></TabsContent>
      <TabsContent value="broken"><SeoBrokenUrlsPanel /></TabsContent>
    </Tabs>
  );
}
