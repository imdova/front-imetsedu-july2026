"use client";

import * as React from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SeoSettings } from "@/lib/db/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { TagsInput } from "@/components/shared/tags-input";

export function SeoSettingsPanel({ initial }: { initial: SeoSettings }) {
  const [form, setForm] = React.useState(initial);
  const [saving, setSaving] = React.useState(false);
  const set = <K extends keyof SeoSettings>(k: K, v: SeoSettings[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    const res = await dal.seo.updateSettings(form);
    setSaving(false);
    if (res.ok) toast.success("SEO settings saved");
    else toast.error(res.error);
  };

  return (
    <Card>
      <CardContent className="space-y-5 py-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Site name"><Input value={form.siteName} onChange={(e) => set("siteName", e.target.value)} /></Field>
          <Field label="Title template" hint="Use %s for the page title"><Input value={form.titleTemplate} onChange={(e) => set("titleTemplate", e.target.value)} /></Field>
        </div>
        <Field label="Default title"><Input value={form.defaultTitle} onChange={(e) => set("defaultTitle", e.target.value)} /></Field>
        <Field label="Default description"><Textarea rows={2} value={form.defaultDescription} onChange={(e) => set("defaultDescription", e.target.value)} /></Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Default OG image URL"><Input value={form.defaultOgImage} onChange={(e) => set("defaultOgImage", e.target.value)} /></Field>
          <Field label="Twitter handle"><Input value={form.twitterHandle} onChange={(e) => set("twitterHandle", e.target.value)} /></Field>
        </div>
        <Field label="Canonical base URL"><Input value={form.canonicalBaseUrl} onChange={(e) => set("canonicalBaseUrl", e.target.value)} /></Field>
        <Field label="Default keywords"><TagsInput value={form.keywords} onChange={(v) => set("keywords", v)} /></Field>
        <Field label="robots.txt"><Textarea rows={4} className="font-mono text-xs" value={form.robotsTxt} onChange={(e) => set("robotsTxt", e.target.value)} /></Field>

        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle label="Indexable" hint="Allow search engines to index the site" checked={form.indexable} onChange={(v) => set("indexable", v)} />
          <Toggle label="Sitemap enabled" hint="Generate /sitemap.xml" checked={form.sitemapEnabled} onChange={(v) => set("sitemapEnabled", v)} />
        </div>

        <div className="flex justify-end">
          <Button className="gap-1.5" onClick={save} disabled={saving}>
            <Save className="size-4" /> {saving ? "Saving…" : "Save settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground/70">{hint}</p>}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
