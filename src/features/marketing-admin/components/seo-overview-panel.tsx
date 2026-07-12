"use client";

import * as React from "react";
import { CircleCheckBig, Pencil, Link2, TriangleAlert, XCircle } from "lucide-react";

import type { SeoOverview, SeoSettings } from "@/lib/db/seo";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SeoStatCard } from "./seo-stat-card";

export function SeoOverviewPanel({
  overview,
  settings,
}: {
  overview: SeoOverview;
  settings: SeoSettings;
}) {
  const coverage: { label: string; value: string; tone?: "ok" | "warn" }[] = [
    { label: "Sitemap", value: settings.sitemapEnabled ? "Enabled" : "Disabled", tone: settings.sitemapEnabled ? "ok" : "warn" },
    { label: "Global title template", value: settings.titleTemplate || "—" },
    { label: "Duplicate meta", value: "None" },
    { label: "Redirect issues", value: overview.redirects > 0 ? `${overview.redirects} active` : "None" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SeoStatCard label="Avg Page Score" value={`${overview.avgPageScore}/100`} icon={CircleCheckBig} tint="amber" />
        <SeoStatCard label="Page Overrides" value={overview.pageOverrides} icon={Pencil} tint="emerald" />
        <SeoStatCard label="Redirects" value={overview.redirects} icon={Link2} tint="blue" />
        <SeoStatCard label="Noindex Pages" value={overview.noindexPages} icon={TriangleAlert} tint="violet" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Indexing & coverage */}
        <Card>
          <CardContent className="py-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Indexing &amp; coverage</h3>
              <Badge
                variant="outline"
                className={settings.indexable
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-300"
                  : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-300"}
              >
                {settings.indexable ? "Indexable" : "Noindex"}
              </Badge>
            </div>
            <dl className="mt-3 divide-y divide-border/60">
              {coverage.map((c) => (
                <div key={c.label} className="flex items-center justify-between py-3 text-sm">
                  <dt className="text-muted-foreground">{c.label}</dt>
                  <dd className={c.tone === "warn" ? "font-medium text-amber-600" : "font-medium"}>{c.value}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>

        {/* Issues to fix */}
        <Card>
          <CardContent className="py-5">
            <h3 className="font-semibold">Issues to fix ({overview.issues.length})</h3>
            {overview.issues.length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">No issues detected. 🎉</p>
            ) : (
              <ul className="mt-3 space-y-2.5">
                {overview.issues.map((i) => (
                  <li key={i.id} className="flex items-start gap-2 text-sm">
                    <XCircle className="mt-0.5 size-4 shrink-0 text-rose-500" />
                    <span>{i.label}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
