"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  ArrowLeft, Check, ExternalLink, Eye, FileText, Gauge, Loader2, Save, X,
} from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { SeoPublicPageDetail } from "@/lib/dal/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { KpiCard } from "@/components/shared/kpi-card";
import { cn } from "@/lib/utils";
import { SeoScoreBadge } from "@/features/marketing-admin/components/seo-pages-panel";

const TYPE_LABEL: Record<string, string> = { static: "Static page", course: "Course", blog: "Blog post", landing: "Landing page" };

/** One public page's SEO workspace: overview, score breakdown, content rename, meta editor. */
export function SeoPageDetail({ initial }: { initial: SeoPublicPageDetail }) {
  const router = useRouter();
  const [detail, setDetail] = React.useState(initial);
  const { page, checks } = detail;

  // Content (entity) fields
  const [title, setTitle] = React.useState(page.title);
  const [slug, setSlug] = React.useState(page.slug);
  const [savingContent, setSavingContent] = React.useState(false);

  // Meta override fields
  const o = detail.override;
  const [metaTitle, setMetaTitle] = React.useState(o?.title ?? "");
  const [metaTitleAr, setMetaTitleAr] = React.useState(o?.titleAr ?? "");
  const [metaDesc, setMetaDesc] = React.useState(o?.description ?? "");
  const [metaDescAr, setMetaDescAr] = React.useState(o?.descriptionAr ?? "");
  const [focusKeyword, setFocusKeyword] = React.useState(o?.focusKeyword ?? "");
  const [canonical, setCanonical] = React.useState(o?.canonical ?? "");
  const [ogImage, setOgImage] = React.useState(o?.ogImage ?? "");
  const [noindex, setNoindex] = React.useState(o?.noindex ?? false);
  const [savingMeta, setSavingMeta] = React.useState(false);

  const refresh = async (path = page.path) => {
    const r = await dal.seo.fetchPublicPageDetail(path);
    if (r.ok) setDetail(r.data);
  };

  const canEditContent = page.type !== "static";
  const canEditSlug = page.type === "course" || page.type === "blog";
  const slugChanged = canEditSlug && slug.trim() !== page.slug;

  const saveContent = async () => {
    setSavingContent(true);
    const r = await dal.seo.updatePublicPageEntity({
      type: page.type, id: page.entityId,
      ...(title.trim() !== page.title ? { title: title.trim() } : {}),
      ...(slugChanged ? { slug: slug.trim() } : {}),
    });
    setSavingContent(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Content updated");
    if (r.data.path !== page.path) {
      // Slug changed → the page lives at a new URL now.
      router.replace(`/admin/marketing/seo/page-detail?path=${encodeURIComponent(r.data.path)}`);
      void refresh(r.data.path);
    } else {
      void refresh();
    }
  };

  const saveMeta = async () => {
    setSavingMeta(true);
    const input = {
      path: page.path, title: metaTitle, titleAr: metaTitleAr, description: metaDesc, descriptionAr: metaDescAr,
      ogImage, focusKeyword, canonical, noindex,
    };
    const r = detail.override
      ? await dal.seo.updatePage(detail.override.id, input)
      : await dal.seo.createPage(input);
    setSavingMeta(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Meta tags saved");
    void refresh();
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing/seo">
            <Button variant="ghost" size="icon" className="size-9" title="Back to SEO Manager"><ArrowLeft className="size-4" /></Button>
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-semibold">{page.title || page.path}</h1>
              <SeoScoreBadge score={page.score} />
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{page.path}</p>
          </div>
        </div>
        <a href={page.path} target="_blank" rel="noreferrer">
          <Button variant="outline" className="gap-1.5"><ExternalLink className="size-4" /> View live page</Button>
        </a>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="SEO Score" value={`${page.score}/100`} icon={Gauge} intent={page.score >= 80 ? "success" : page.score >= 50 ? "warning" : "destructive"} />
        <KpiCard label="Views" value={page.views === null ? "—" : page.views.toLocaleString()} icon={Eye} intent="info" helperText={page.views === null ? "Not tracked for this type" : undefined} />
        <KpiCard label="Type" value={TYPE_LABEL[page.type] ?? page.type} icon={FileText} intent="primary" />
        <KpiCard label="Created" value={page.createdAt ? new Date(page.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" }) : "—"} icon={FileText} intent="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0 space-y-6">
          {/* Content (title + slug) */}
          <Card>
            <CardContent className="space-y-4 pt-5">
              <p className="font-semibold">Content</p>
              {canEditContent ? (
                <>
                  <div className="space-y-1.5">
                    <Label>Title</Label>
                    <Input value={title} onChange={(e) => setTitle(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Slug {!canEditSlug && <span className="font-normal text-muted-foreground">(fixed for landing pages)</span>}</Label>
                    <Input value={slug} onChange={(e) => setSlug(e.target.value)} disabled={!canEditSlug} className="font-mono text-sm" />
                    {slugChanged && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400">
                        Changing the slug changes the public URL — the old URL will 404. Add a redirect in the Redirections section after saving.
                      </p>
                    )}
                  </div>
                  <div className="flex justify-end border-t border-border/60 pt-3">
                    <Button className="gap-1.5" onClick={saveContent} disabled={savingContent || (!slugChanged && title.trim() === page.title)}>
                      {savingContent ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save content
                    </Button>
                  </div>
                </>
              ) : (
                <p className="rounded-lg border border-dashed border-border/70 p-4 text-sm text-muted-foreground">
                  This is a static route — its title and URL are fixed in the site code. Use the meta tags below to control how it appears in search results.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Meta tags */}
          <Card>
            <CardContent className="space-y-4 pt-5">
              <div className="flex items-center justify-between">
                <p className="font-semibold">Meta tags</p>
                {detail.override ? <Badge variant="secondary">custom meta</Badge> : <Badge variant="outline" className="text-muted-foreground">using defaults</Badge>}
              </div>
              <div className="space-y-1.5">
                <Label>Meta title <span className="font-normal text-muted-foreground">({metaTitle.length}/60 — ideal 30–60)</span></Label>
                <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder={detail.effective.title || "Falls back to the page title"} />
              </div>
              <div className="space-y-1.5">
                <Label>Meta description <span className="font-normal text-muted-foreground">({metaDesc.length}/165 — ideal 80–165)</span></Label>
                <Textarea rows={3} value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder={detail.effective.description || "Falls back to the global default"} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Meta title (Arabic)</Label><Input dir="rtl" value={metaTitleAr} onChange={(e) => setMetaTitleAr(e.target.value)} /></div>
                <div className="space-y-1.5"><Label>Focus keyword</Label><Input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. CPHQ certification" /></div>
              </div>
              <div className="space-y-1.5"><Label>Meta description (Arabic)</Label><Textarea dir="rtl" rows={2} value={metaDescAr} onChange={(e) => setMetaDescAr(e.target.value)} /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5"><Label>Canonical URL</Label><Input value={canonical} onChange={(e) => setCanonical(e.target.value)} placeholder={`https://imetsedu.com${page.path}`} /></div>
                <div className="space-y-1.5"><Label>OG image URL</Label><Input value={ogImage} onChange={(e) => setOgImage(e.target.value)} /></div>
              </div>
              <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
                <span className="text-sm font-medium">No-index this page <span className="font-normal text-muted-foreground">(hide from search engines)</span></span>
                <Switch checked={noindex} onCheckedChange={setNoindex} />
              </label>
              <div className="flex justify-end border-t border-border/60 pt-3">
                <Button className="gap-1.5" onClick={saveMeta} disabled={savingMeta}>
                  {savingMeta ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save meta tags
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right rail: score breakdown + search preview */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <Card>
            <CardContent className="space-y-2.5 pt-5">
              <p className="font-semibold">Score breakdown</p>
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2.5 text-sm">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full", c.pass ? "bg-success/12 text-success" : "bg-destructive/10 text-destructive")}>
                    {c.pass ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <span className={cn("flex-1", !c.pass && "text-muted-foreground")}>{c.label}</span>
                  <span className="text-xs tabular-nums text-muted-foreground">{c.pass ? c.points : 0}/{c.points}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-1 pt-5">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Search preview</p>
              <p className="line-clamp-1 text-[15px] font-medium text-blue-700 dark:text-blue-400">{metaTitle || detail.effective.title || page.title}</p>
              <p className="line-clamp-1 text-xs text-emerald-700 dark:text-emerald-500">imetsedu.com{page.path}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{metaDesc || detail.effective.description || "No meta description yet — search engines will pick their own snippet."}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
