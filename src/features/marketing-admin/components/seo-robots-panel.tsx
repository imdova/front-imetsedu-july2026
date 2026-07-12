"use client";

import * as React from "react";
import { Copy, Check, Bot } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SeoSettings } from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { SeoPanelHead } from "./seo-panel-head";

/** Build the effective robots.txt from the indexing toggle + custom directives. */
function generateRobots(indexable: boolean, custom: string, baseUrl: string): string {
  const lines: string[] = ["# Crawl directives for all user agents", "User-agent: *"];
  if (indexable) {
    lines.push("Allow: /", "Disallow: /admin/", "Disallow: /api/");
  } else {
    lines.push("Disallow: /");
  }
  const extra = custom
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l && !/^user-agent:/i.test(l));
  if (extra.length) {
    lines.push("", "# Custom directives", ...extra);
  }
  const base = (baseUrl || "https://imetsedu.com").replace(/\/$/, "");
  lines.push("", "# Sitemap reference", `Sitemap: ${base}/sitemap.xml`);
  return lines.join("\n");
}

export function SeoRobotsPanel({ initial }: { initial: SeoSettings }) {
  const [indexable, setIndexable] = React.useState(initial.indexable);
  const [custom, setCustom] = React.useState(initial.robotsTxt ?? "");
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const preview = React.useMemo(
    () => generateRobots(indexable, custom, initial.canonicalBaseUrl),
    [indexable, custom, initial.canonicalBaseUrl],
  );
  const lines = preview.split("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(preview);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Copy failed");
    }
  };

  const save = async () => {
    setSaving(true);
    const res = await dal.seo.updateSettings({ ...initial, indexable, robotsTxt: custom });
    setSaving(false);
    if (res.ok) toast.success("robots.txt updated");
    else toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      <SeoPanelHead
        crumb="Robots.txt Viewer"
        title="Robots.txt File"
        description="Live preview of your site's crawl directives and indexation rules."
        action={
          <Button variant="outline" className="gap-1.5" onClick={copy}>
            {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy to clipboard"}
          </Button>
        }
      />

      {/* Live preview */}
      <Card>
        <CardContent className="p-0">
          <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2.5 text-sm">
            <span className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 font-medium">
                <span className="size-2 rounded-full bg-emerald-500" /> Status: Live
              </span>
              <span className="text-muted-foreground">
                {indexable ? "Standard exclusion protocol detected" : "Site is blocked from indexing"}
              </span>
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">Read-only mode</span>
          </div>
          <div className="overflow-x-auto font-mono text-xs leading-relaxed">
            {lines.map((l, i) => {
              const isComment = l.trim().startsWith("#");
              const [key, ...rest] = l.split(":");
              const hasDirective = !isComment && rest.length > 0;
              return (
                <div key={i} className="flex">
                  <span className="w-10 shrink-0 select-none border-e border-border/50 px-2 py-0.5 text-right text-muted-foreground/50">
                    {i + 1}
                  </span>
                  <code className="whitespace-pre px-3 py-0.5">
                    {isComment ? (
                      <span className="text-muted-foreground/70 italic">{l}</span>
                    ) : hasDirective ? (
                      <>
                        <span className="font-semibold text-emerald-700 dark:text-emerald-400">{key}:</span>
                        <span>{rest.join(":")}</span>
                      </>
                    ) : (
                      <span>{l || " "}</span>
                    )}
                  </code>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Edit directives */}
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="flex items-center gap-3 border-b border-border/60 pb-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bot className="size-5" />
            </span>
            <div>
              <p className="font-semibold leading-tight">Edit directives</p>
              <p className="text-xs text-muted-foreground">These feed the generated file above</p>
            </div>
          </div>

          <label className="flex items-center gap-2.5">
            <Switch checked={indexable} onCheckedChange={setIndexable} />
            <span className="text-sm font-medium">Allow search engines to index the site</span>
          </label>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Custom robots.txt directives</Label>
            <Textarea
              rows={4}
              className="font-mono text-xs"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder={"Disallow: /private\nCrawl-delay: 1"}
            />
            <p className="text-xs text-muted-foreground">Appended to the generated file (e.g. Disallow: /private).</p>
          </div>

          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
