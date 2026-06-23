"use client";

import * as React from "react";
import {
  ArrowLeft, Save, Eye, EyeOff, Plus, Trash2, ChevronUp, ChevronDown, Copy,
  ChevronLeft, ChevronRight, Settings2, BookmarkPlus,
} from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  ArticleSection, ArticleBlock, BlockType, SectionBg, BlogStatus, BlogAuthor, BlogCategory, BlogInput,
} from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TagsInput } from "@/components/shared/tags-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { ArticleSections } from "@/features/blog/components/article-sections";
import { cn } from "@/lib/utils";
import { BLOCK_PALETTE, newBlock, newSection, resizeColumns } from "@/features/blog-admin/article-builder-model";

export interface BuilderMeta {
  title: string; slug: string; excerpt: string; coverImageUrl: string; category: string;
  tags: string[]; authorId: string; authorName: string; status: BlogStatus; featured: boolean;
  seoTitle: string; seoDescription: string; publishedAt?: string;
}
export interface BuilderInitial { meta: Partial<BuilderMeta>; sections: ArticleSection[] }

const BG_OPTS: SectionBg[] = ["default", "muted", "soft", "primary", "dark", "gradient"];
type Ref = { s: number; c: number; b: number };

export function ArticleBuilder({
  mode, articleId, initial, authors, categories,
}: {
  mode: "new" | "edit";
  articleId?: string;
  initial: BuilderInitial;
  authors: BlogAuthor[];
  categories: BlogCategory[];
}) {
  const router = useRouter();
  const [meta, setMeta] = React.useState<BuilderMeta>({
    title: "", slug: "", excerpt: "", coverImageUrl: "", category: "", tags: [],
    authorId: "", authorName: "", status: "DRAFT", featured: false, seoTitle: "", seoDescription: "",
    ...initial.meta,
  });
  const [sections, setSections] = React.useState<ArticleSection[]>(initial.sections);
  const [sel, setSel] = React.useState<Ref | null>(null);
  const [preview, setPreview] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  const setM = <K extends keyof BuilderMeta>(k: K, v: BuilderMeta[K]) => setMeta((m) => ({ ...m, [k]: v }));

  /* ── section ops ── */
  const updateSection = (i: number, patch: Partial<ArticleSection>) =>
    setSections((s) => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addSection = () => setSections((s) => [...s, newSection(1)]);
  const removeSection = (i: number) => { setSections((s) => s.filter((_, idx) => idx !== i)); setSel(null); };
  const moveSection = (i: number, dir: -1 | 1) =>
    setSections((s) => { const n = [...s]; const j = i + dir; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });

  /* ── block ops ── */
  const mutateCol = (si: number, ci: number, fn: (blocks: ArticleBlock[]) => ArticleBlock[]) =>
    setSections((s) => s.map((sec, i) => i !== si ? sec : { ...sec, cols: sec.cols.map((col, j) => j !== ci ? col : { ...col, blocks: fn(col.blocks) }) }));
  const addBlock = (si: number, ci: number, type: BlockType) => {
    const block = newBlock(type);
    mutateCol(si, ci, (b) => [...b, block]);
    setSel({ s: si, c: ci, b: sections[si].cols[ci].blocks.length });
  };
  const updateBlock = (r: Ref, patch: Partial<ArticleBlock>) =>
    mutateCol(r.s, r.c, (b) => b.map((blk, idx) => (idx === r.b ? { ...blk, ...patch } : blk)));
  const removeBlock = (r: Ref) => { mutateCol(r.s, r.c, (b) => b.filter((_, idx) => idx !== r.b)); setSel(null); };
  const duplicateBlock = (r: Ref) =>
    mutateCol(r.s, r.c, (b) => { const copy = { ...b[r.b], id: `${b[r.b].id}_c` }; return [...b.slice(0, r.b + 1), copy, ...b.slice(r.b + 1)]; });
  const moveBlock = (r: Ref, dir: -1 | 1) =>
    mutateCol(r.s, r.c, (b) => { const n = [...b]; const j = r.b + dir; if (j < 0 || j >= n.length) return b; [n[r.b], n[j]] = [n[j], n[r.b]]; return n; });
  const moveBlockCol = (r: Ref, dir: -1 | 1) => {
    const sec = sections[r.s]; const cj = r.c + dir;
    if (cj < 0 || cj >= sec.cols.length) return;
    const block = sec.cols[r.c].blocks[r.b];
    setSections((s) => s.map((x, i) => i !== r.s ? x : {
      ...x, cols: x.cols.map((col, j) =>
        j === r.c ? { ...col, blocks: col.blocks.filter((_, k) => k !== r.b) }
        : j === cj ? { ...col, blocks: [...col.blocks, block] } : col),
    }));
    setSel(null);
  };

  const selectedBlock = sel ? sections[sel.s]?.cols[sel.c]?.blocks[sel.b] : undefined;

  /* ── save ── */
  const buildPayload = (): BlogInput => {
    const status = meta.status;
    const publishedAt = status === "PUBLISHED" && !meta.publishedAt ? new Date().toISOString() : meta.publishedAt;
    return {
      title: meta.title, slug: meta.slug || undefined, excerpt: meta.excerpt, coverImageUrl: meta.coverImageUrl,
      category: meta.category, tags: meta.tags, authorId: meta.authorId, authorName: meta.authorName,
      status, featured: meta.featured, seoTitle: meta.seoTitle, seoDescription: meta.seoDescription,
      publishedAt, sections,
    };
  };
  const save = async () => {
    if (!meta.title.trim()) { toast.error("Title is required"); return; }
    setSaving(true);
    const res = mode === "edit" && articleId
      ? await dal.blog.updateArticle(articleId, buildPayload())
      : await dal.blog.createArticle(buildPayload());
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    toast.success("Article saved");
    if (mode === "new") router.push(`/admin/blog/${res.data.id}/edit`);
  };
  const saveAsTemplate = async () => {
    const name = window.prompt("Template name:");
    if (!name?.trim()) return;
    const res = await dal.blog.createTemplate({ name: name.trim(), doc: { meta, sections } as Record<string, unknown> });
    if (res.ok) toast.success("Saved as template"); else toast.error(res.error);
  };

  return (
    <div className="space-y-4">
      {/* top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-2.5">
        <button onClick={() => router.push("/admin/blog")} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4 rtl:rotate-180" /> Articles
        </button>
        <div className="flex items-center gap-2">
          <Select value={meta.status} onValueChange={(v) => setM("status", v as BlogStatus)}>
            <SelectTrigger className="h-9 w-32"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="ARCHIVED">Archived</SelectItem></SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={saveAsTemplate}><BookmarkPlus className="size-4" /> Template</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreview((p) => !p)}>
            {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={save} disabled={saving}><Save className="size-4" /> {saving ? "Saving…" : "Save"}</Button>
        </div>
      </div>

      {/* meta */}
      {!preview && (
        <Card>
          <CardContent className="grid gap-4 py-5 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              <Field label="Title"><Input value={meta.title} onChange={(e) => setM("title", e.target.value)} placeholder="Article title" /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Slug (auto if blank)"><Input value={meta.slug} onChange={(e) => setM("slug", e.target.value)} placeholder="my-article" /></Field>
                <Field label="Category">
                  <Select value={meta.category || "_none"} onValueChange={(v) => setM("category", v === "_none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent><SelectItem value="_none">None</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
              </div>
              <Field label="Excerpt"><Textarea rows={2} value={meta.excerpt} onChange={(e) => setM("excerpt", e.target.value)} /></Field>
              <Field label="Tags"><TagsInput value={meta.tags} onChange={(v) => setM("tags", v)} /></Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Author">
                  <Select value={meta.authorId || "_none"} onValueChange={(v) => {
                    const a = authors.find((x) => x.id === v);
                    setMeta((m) => ({ ...m, authorId: v === "_none" ? "" : v, authorName: a?.name ?? "" }));
                  }}>
                    <SelectTrigger><SelectValue placeholder="None" /></SelectTrigger>
                    <SelectContent><SelectItem value="_none">None</SelectItem>{authors.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                  </Select>
                </Field>
                <label className="flex items-center justify-between self-end rounded-lg border border-border/70 px-3 py-2">
                  <span className="text-sm font-medium">Featured</span>
                  <Switch checked={meta.featured} onCheckedChange={(v) => setM("featured", v)} />
                </label>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <Field label="SEO title"><Input value={meta.seoTitle} onChange={(e) => setM("seoTitle", e.target.value)} /></Field>
                <Field label="SEO description"><Textarea rows={2} value={meta.seoDescription} onChange={(e) => setM("seoDescription", e.target.value)} /></Field>
              </div>
            </div>
            <Field label="Cover image"><ImageUpload value={meta.coverImageUrl} onChange={(url) => setM("coverImageUrl", url)} /></Field>
          </CardContent>
        </Card>
      )}

      {/* canvas / preview + inspector */}
      {preview ? (
        <Card><CardContent className="py-6">
          {sections.length ? <ArticleSections sections={sections} /> : <p className="text-center text-sm text-muted-foreground">No content yet.</p>}
        </CardContent></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-4">
            {sections.map((section, si) => (
              <Card key={section.id} className="border-border/70">
                <CardContent className="space-y-3 py-4">
                  <div className="flex flex-wrap items-center gap-2 border-b border-border/50 pb-3">
                    <Settings2 className="size-4 text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">Section {si + 1}</span>
                    <Select value={String(section.columns)} onValueChange={(v) => updateSection(si, resizeColumns(section, Number(v) as 1 | 2 | 3 | 4))}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>{[1, 2, 3, 4].map((n) => <SelectItem key={n} value={String(n)}>{n} column{n > 1 ? "s" : ""}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={section.bg} onValueChange={(v) => updateSection(si, { bg: v as SectionBg })}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>{BG_OPTS.map((bg) => <SelectItem key={bg} value={bg} className="capitalize">{bg}</SelectItem>)}</SelectContent>
                    </Select>
                    <div className="ms-auto flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => moveSection(si, -1)}><ChevronUp className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => moveSection(si, 1)}><ChevronDown className="size-4" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => removeSection(si)}><Trash2 className="size-4 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className={cn("grid gap-3", section.columns === 1 ? "grid-cols-1" : section.columns === 2 ? "sm:grid-cols-2" : section.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
                    {section.cols.map((col, ci) => (
                      <div key={col.id} className="space-y-2 rounded-lg bg-muted/30 p-2">
                        {col.blocks.map((block, bi) => {
                          const isSel = sel?.s === si && sel?.c === ci && sel?.b === bi;
                          return (
                            <button key={block.id} onClick={() => setSel({ s: si, c: ci, b: bi })}
                              className={cn("flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-start text-xs", isSel ? "border-primary bg-primary/5" : "border-border/60 bg-card hover:bg-muted")}>
                              <span className="font-medium capitalize">{block.type}</span>
                              <span className="line-clamp-1 flex-1 text-muted-foreground">{block.text || block.label || block.url || ""}</span>
                            </button>
                          );
                        })}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full gap-1 border-dashed"><Plus className="size-3.5" /> Block</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="max-h-72 overflow-y-auto">
                            {BLOCK_PALETTE.map((p) => <DropdownMenuItem key={p.type} onClick={() => addBlock(si, ci, p.type)}>{p.label}</DropdownMenuItem>)}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button variant="outline" className="w-full gap-1.5 border-dashed" onClick={addSection}><Plus className="size-4" /> Add section</Button>
          </div>

          {/* inspector */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <Card><CardContent className="py-4">
              {selectedBlock && sel
                ? <BlockInspector
                    block={selectedBlock}
                    multiCol={sections[sel.s].cols.length > 1}
                    onChange={(patch) => updateBlock(sel, patch)}
                    onMove={(d) => moveBlock(sel, d)}
                    onMoveCol={(d) => moveBlockCol(sel, d)}
                    onDuplicate={() => duplicateBlock(sel)}
                    onDelete={() => removeBlock(sel)}
                  />
                : <p className="text-sm text-muted-foreground">Select a block to edit it, or add one to a column.</p>}
            </CardContent></Card>
          </aside>
        </div>
      )}
    </div>
  );
}

/* ── per-block inspector ── */
function BlockInspector({
  block, multiCol, onChange, onMove, onMoveCol, onDuplicate, onDelete,
}: {
  block: ArticleBlock; multiCol: boolean;
  onChange: (patch: Partial<ArticleBlock>) => void;
  onMove: (dir: -1 | 1) => void; onMoveCol: (dir: -1 | 1) => void;
  onDuplicate: () => void; onDelete: () => void;
}) {
  const x = block;
  const linesToArr = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold capitalize text-muted-foreground">{block.type} block</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onMove(-1)} title="Up"><ChevronUp className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => onMove(1)} title="Down"><ChevronDown className="size-4" /></Button>
          {multiCol && <><Button variant="ghost" size="sm" onClick={() => onMoveCol(-1)} title="Prev column"><ChevronLeft className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={() => onMoveCol(1)} title="Next column"><ChevronRight className="size-4" /></Button></>}
          <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate"><Copy className="size-4" /></Button>
          <Button variant="ghost" size="sm" onClick={onDelete} title="Delete"><Trash2 className="size-4 text-destructive" /></Button>
        </div>
      </div>

      {block.type === "heading" && <>
        <F label="Text"><Input value={x.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></F>
        <F label="Level"><Select value={String(x.level ?? 2)} onValueChange={(v) => onChange({ level: Number(v) as 2 | 3 })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">H2</SelectItem><SelectItem value="3">H3</SelectItem></SelectContent></Select></F>
      </>}
      {(block.type === "paragraph" || block.type === "quote" || block.type === "testimonial" || block.type === "feature" || block.type === "callout" || block.type === "cta" || block.type === "hero") && (
        <F label="Text"><Textarea rows={4} value={x.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></F>
      )}
      {(block.type === "hero" || block.type === "image") && <F label="Caption / subtitle"><Input value={x.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} /></F>}
      {(block.type === "feature" || block.type === "callout" || block.type === "cta" || block.type === "hero" || block.type === "button") && (
        <F label="Label"><Input value={x.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} /></F>
      )}
      {(block.type === "cta" || block.type === "button" || block.type === "hero" || block.type === "embed") && (
        <F label="URL"><Input value={x.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} /></F>
      )}
      {(block.type === "quote" || block.type === "testimonial") && <F label="Cite"><Input value={x.cite ?? ""} onChange={(e) => onChange({ cite: e.target.value })} /></F>}
      {block.type === "callout" && <F label="Variant"><Select value={x.variant ?? "info"} onValueChange={(v) => onChange({ variant: v as ArticleBlock["variant"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["info", "tip", "warning", "success"].map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}</SelectContent></Select></F>}
      {block.type === "code" && <><F label="Language"><Input value={x.lang ?? ""} onChange={(e) => onChange({ lang: e.target.value })} /></F><F label="Code"><Textarea rows={6} className="font-mono text-xs" value={x.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></F></>}
      {(block.type === "list" || block.type === "checklist") && <>
        {block.type === "list" && <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"><span className="text-sm">Ordered</span><Switch checked={!!x.ordered} onCheckedChange={(v) => onChange({ ordered: v })} /></label>}
        <F label="Items (one per line)"><Textarea rows={5} value={(x.items ?? []).join("\n")} onChange={(e) => onChange({ items: linesToArr(e.target.value) })} /></F>
      </>}
      {block.type === "image" && <><F label="Image"><ImageUpload value={x.url} onChange={(url) => onChange({ url })} /></F><F label="Alt text"><Input value={x.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value })} /></F></>}
      {block.type === "gallery" && (
        <F label="Images">
          <div className="space-y-2">
            {(x.images ?? []).map((im, i) => (
              <div key={i} className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={im.url} alt="" className="size-10 rounded object-cover" />
                <span className="flex-1 truncate text-xs text-muted-foreground">{im.url}</span>
                <Button variant="ghost" size="sm" onClick={() => onChange({ images: (x.images ?? []).filter((_, j) => j !== i) })}><Trash2 className="size-3.5 text-destructive" /></Button>
              </div>
            ))}
            <ImageUpload value="" onChange={(url) => onChange({ images: [...(x.images ?? []), { url }] })} hint="Add a gallery image" />
          </div>
        </F>
      )}
      {block.type === "table" && (
        <F label="Rows (cells separated by | , row 0 = header)">
          <Textarea rows={6} className="font-mono text-xs"
            value={(x.rows ?? []).map((r) => r.join(" | ")).join("\n")}
            onChange={(e) => onChange({ rows: e.target.value.split("\n").map((l) => l.split("|").map((c) => c.trim())) })} />
        </F>
      )}
      {block.type === "stats" && (
        <F label="Metrics">
          <div className="space-y-2">
            {(x.metrics ?? []).map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input value={m.value} placeholder="100+" onChange={(e) => onChange({ metrics: (x.metrics ?? []).map((mm, j) => j === i ? { ...mm, value: e.target.value } : mm) })} />
                <Input value={m.label} placeholder="Students" onChange={(e) => onChange({ metrics: (x.metrics ?? []).map((mm, j) => j === i ? { ...mm, label: e.target.value } : mm) })} />
                <Button variant="ghost" size="sm" onClick={() => onChange({ metrics: (x.metrics ?? []).filter((_, j) => j !== i) })}><Trash2 className="size-3.5 text-destructive" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => onChange({ metrics: [...(x.metrics ?? []), { value: "", label: "" }] })}><Plus className="size-3.5" /> Add metric</Button>
          </div>
        </F>
      )}
      {block.type === "faq" && (
        <F label="FAQs">
          <div className="space-y-2">
            {(x.faqs ?? []).map((f, i) => (
              <div key={i} className="space-y-1 rounded-lg border border-border/60 p-2">
                <Input value={f.q} placeholder="Question" onChange={(e) => onChange({ faqs: (x.faqs ?? []).map((ff, j) => j === i ? { ...ff, q: e.target.value } : ff) })} />
                <Textarea rows={2} value={f.a} placeholder="Answer" onChange={(e) => onChange({ faqs: (x.faqs ?? []).map((ff, j) => j === i ? { ...ff, a: e.target.value } : ff) })} />
                <Button variant="ghost" size="sm" onClick={() => onChange({ faqs: (x.faqs ?? []).filter((_, j) => j !== i) })}><Trash2 className="size-3.5 text-destructive" /> Remove</Button>
              </div>
            ))}
            <Button variant="outline" size="sm" className="w-full gap-1" onClick={() => onChange({ faqs: [...(x.faqs ?? []), { q: "", a: "" }] })}><Plus className="size-3.5" /> Add FAQ</Button>
          </div>
        </F>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
