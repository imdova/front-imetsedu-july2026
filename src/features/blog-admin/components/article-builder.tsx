"use client";

import * as React from "react";
import {
  ArrowLeft, Eye, Pencil, Plus, Trash2, ChevronUp, ChevronDown, Copy, GripVertical,
  ChevronLeft, ChevronRight, BookmarkPlus, History, CheckCircle2, Circle, Send,
  Sparkles, Loader2, Undo2, Redo2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, DragOverlay, PointerSensor, KeyboardSensor, useSensor, useSensors,
  closestCorners, useDroppable, useDraggable,
  type DragEndEvent, type DragStartEvent, type CollisionDetection,
} from "@dnd-kit/core";
import {
  SortableContext, useSortable, arrayMove, verticalListSortingStrategy, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type {
  ArticleSection, ArticleBlock, BlockType, SectionBg, BlogStatus, BlogAuthor, BlogCategory, BlogInput, BlogPost,
} from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagsInput } from "@/components/shared/tags-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { RichTextEditor } from "@/components/shared/rich-text-editor/editor";
import { ArticleSections } from "@/features/blog/components/article-sections";
import { cn } from "@/lib/utils";
import { BLOCK_PALETTE, newBlock, newSection, resizeColumns } from "@/features/blog-admin/article-builder-model";
import { extractText, readability } from "@/features/blog-admin/article-scores";

export interface BuilderMeta {
  title: string; slug: string; excerpt: string; coverImageUrl: string; category: string;
  tags: string[]; authorId: string; authorName: string; language: string; status: BlogStatus; featured: boolean;
  seoTitle: string; seoDescription: string; publishedAt?: string;
}
export interface BuilderInitial { meta: Partial<BuilderMeta>; sections: ArticleSection[] }

const BG_OPTS: SectionBg[] = ["default", "muted", "soft", "primary", "dark", "gradient"];
const BG_DOT: Record<SectionBg, string> = {
  default: "bg-background border border-border", muted: "bg-muted", soft: "bg-primary/15",
  primary: "bg-primary", dark: "bg-foreground", gradient: "bg-gradient-to-br from-primary to-emerald-400",
};
const PALETTE_GROUPS: { title: string; types: BlockType[] }[] = [
  { title: "Text", types: ["heading", "paragraph", "list", "checklist", "quote"] },
  { title: "Media", types: ["image", "gallery", "embed", "table", "code"] },
  { title: "Components", types: ["hero", "stats", "feature", "testimonial", "callout", "faq", "cta", "button", "divider"] },
];
const LABEL: Record<string, string> = Object.fromEntries(BLOCK_PALETTE.map((p) => [p.type, p.label]));
const stripHtml = (html: string) => html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const wordCount = (b: ArticleBlock) => {
  const t = b.html ? stripHtml(b.html) : b.text ?? "";
  return t ? t.trim().split(/\s+/).filter(Boolean).length : 0;
};

type Ref = { s: number; c: number; b: number };
type Snap = { meta: BuilderMeta; sections: ArticleSection[] };
type Handle = { ref: (el: HTMLElement | null) => void; props: Record<string, unknown> };

function seedSections(initial: ArticleSection[]): ArticleSection[] {
  if (initial.length) return initial;
  const s = newSection(1);
  s.cols[0].blocks.push(newBlock("paragraph"));
  return [s];
}

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
    authorId: "", authorName: "", language: "en", status: "DRAFT", featured: false, seoTitle: "", seoDescription: "",
    ...initial.meta,
  });
  const [sections, setSections] = React.useState<ArticleSection[]>(() => seedSections(initial.sections));
  const [activeCol, setActiveCol] = React.useState<{ s: number; c: number }>({ s: 0, c: 0 });
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [preview, setPreview] = React.useState(false);
  const [rightTab, setRightTab] = React.useState<"manage" | "seo">("manage");
  const [saving, setSaving] = React.useState(false);
  const [autosaved, setAutosaved] = React.useState(false);
  const [focusKeyword, setFocusKeyword] = React.useState("");
  const [aiBusy, setAiBusy] = React.useState<null | "excerpt" | "tags" | "keyword">(null);
  const [restorable, setRestorable] = React.useState<Snap | null>(null);
  const [dragId, setDragId] = React.useState<string | null>(null);

  const dir: "ltr" | "rtl" = meta.language === "ar" ? "rtl" : "ltr";
  const setM = <K extends keyof BuilderMeta>(k: K, v: BuilderMeta[K]) => setMeta((m) => ({ ...m, [k]: v }));
  const toggleCollapse = (id: string) => setCollapsed((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  /* ── undo / redo ── */
  const [past, setPast] = React.useState<Snap[]>([]);
  const [future, setFuture] = React.useState<Snap[]>([]);
  const skipRef = React.useRef(false);
  const lastRef = React.useRef<string>("");
  React.useEffect(() => {
    if (skipRef.current) { skipRef.current = false; return; }
    const snap = { meta, sections };
    const t = setTimeout(() => {
      setPast((p) => { const prev = lastRef.current; lastRef.current = JSON.stringify(snap); return prev ? [...p.slice(-49), JSON.parse(prev) as Snap] : p; });
      setFuture([]);
    }, 500);
    return () => clearTimeout(t);
  }, [meta, sections]);
  const undo = () => setPast((p) => {
    if (!p.length) return p;
    const prev = p[p.length - 1]; skipRef.current = true;
    setFuture((f) => [{ meta, sections }, ...f]);
    setMeta(prev.meta); setSections(prev.sections); lastRef.current = JSON.stringify(prev);
    return p.slice(0, -1);
  });
  const redo = () => setFuture((f) => {
    if (!f.length) return f;
    const next = f[0]; skipRef.current = true;
    setPast((p) => [...p, { meta, sections }]);
    setMeta(next.meta); setSections(next.sections); lastRef.current = JSON.stringify(next);
    return f.slice(1);
  });

  /* ── autosave + draft recovery ── */
  const DRAFT_KEY = "imets_blog_draft_new";
  React.useEffect(() => {
    if (mode !== "new") return;
    try { const raw = localStorage.getItem(DRAFT_KEY); if (raw) setRestorable(JSON.parse(raw)); } catch { /* ignore */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    if (mode !== "new") return;
    const t = setTimeout(() => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ meta, sections })); setAutosaved(true); } catch { /* ignore */ } }, 1000);
    return () => clearTimeout(t);
  }, [mode, meta, sections]);
  const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ } };

  /* ── section ops ── */
  const updateSection = (i: number, patch: Partial<ArticleSection>) =>
    setSections((s) => s.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const addSection = (columns: 1 | 2 | 3 | 4) => setSections((s) => [...s, newSection(columns)]);
  const removeSection = (i: number) => setSections((s) => s.filter((_, idx) => idx !== i));
  const moveSection = (i: number, d: -1 | 1) =>
    setSections((s) => { const n = [...s]; const j = i + d; if (j < 0 || j >= n.length) return s; [n[i], n[j]] = [n[j], n[i]]; return n; });
  const duplicateSection = (si: number) => setSections((s) => {
    const o = s[si]; const sfx = () => Math.random().toString(36).slice(2, 6);
    const copy: ArticleSection = { ...o, id: `${o.id}_c${sfx()}`, cols: o.cols.map((col) => ({ id: `${col.id}_c${sfx()}`, blocks: col.blocks.map((b) => ({ ...b, id: `${b.id}_c${sfx()}` })) })) };
    return [...s.slice(0, si + 1), copy, ...s.slice(si + 1)];
  });

  /* ── block ops ── */
  const mutateCol = (si: number, ci: number, fn: (blocks: ArticleBlock[]) => ArticleBlock[]) =>
    setSections((s) => s.map((sec, i) => i !== si ? sec : { ...sec, cols: sec.cols.map((col, j) => j !== ci ? col : { ...col, blocks: fn(col.blocks) }) }));
  const addToActive = (type: BlockType) => setSections((prev) => {
    if (!prev.length) return prev;
    const s = Math.min(activeCol.s, prev.length - 1);
    const c = Math.min(activeCol.c, prev[s].cols.length - 1);
    return prev.map((sec, i) => i !== s ? sec : { ...sec, cols: sec.cols.map((col, j) => j !== c ? col : { ...col, blocks: [...col.blocks, newBlock(type)] }) });
  });
  const updateBlock = (r: Ref, patch: Partial<ArticleBlock>) =>
    mutateCol(r.s, r.c, (b) => b.map((blk, idx) => (idx === r.b ? { ...blk, ...patch } : blk)));
  const removeBlock = (r: Ref) => mutateCol(r.s, r.c, (b) => b.filter((_, idx) => idx !== r.b));
  const duplicateBlock = (r: Ref) =>
    mutateCol(r.s, r.c, (b) => { const copy = { ...b[r.b], id: `${b[r.b].id}_c${Math.random().toString(36).slice(2, 5)}` }; return [...b.slice(0, r.b + 1), copy, ...b.slice(r.b + 1)]; });
  const moveBlock = (r: Ref, d: -1 | 1) =>
    mutateCol(r.s, r.c, (b) => { const n = [...b]; const j = r.b + d; if (j < 0 || j >= n.length) return b; [n[r.b], n[j]] = [n[j], n[r.b]]; return n; });
  const moveBlockCol = (r: Ref, d: -1 | 1) => {
    const sec = sections[r.s]; const cj = r.c + d;
    if (cj < 0 || cj >= sec.cols.length) return;
    const block = sec.cols[r.c].blocks[r.b];
    setSections((s) => s.map((x, i) => i !== r.s ? x : { ...x, cols: x.cols.map((col, j) => j === r.c ? { ...col, blocks: col.blocks.filter((_, k) => k !== r.b) } : j === cj ? { ...col, blocks: [...col.blocks, block] } : col) }));
  };

  /* ── drag & drop ── */
  const sectionIds = sections.map((s) => s.id);
  const blockIdSet = React.useMemo(() => new Set(sections.flatMap((s) => s.cols.flatMap((c) => c.blocks.map((b) => b.id)))), [sections]);
  const findBlock = (id: string): Ref | null => {
    for (let s = 0; s < sections.length; s++)
      for (let c = 0; c < sections[s].cols.length; c++) {
        const b = sections[s].cols[c].blocks.findIndex((x) => x.id === id);
        if (b >= 0) return { s, c, b };
      }
    return null;
  };
  const resolveTarget = (o: string): { s: number; c: number; index: number } | null => {
    if (o.startsWith("col:")) { const [, sStr, cStr] = o.split(":"); const s = Number(sStr), c = Number(cStr); return { s, c, index: sections[s]?.cols[c]?.blocks.length ?? 0 }; }
    if (blockIdSet.has(o)) { const f = findBlock(o); if (f) return { s: f.s, c: f.c, index: f.b }; }
    const si = sections.findIndex((x) => x.id === o); if (si >= 0) return { s: si, c: 0, index: sections[si].cols[0].blocks.length };
    return null;
  };
  const insertBlockAt = (s: number, c: number, index: number, block: ArticleBlock) =>
    setSections((prev) => prev.map((sec, i) => i !== s ? sec : { ...sec, cols: sec.cols.map((col, j) => j !== c ? col : { ...col, blocks: [...col.blocks.slice(0, index), block, ...col.blocks.slice(index)] }) }));
  const moveBlockTo = (src: Ref, dest: { s: number; c: number; index: number }) =>
    setSections((prev) => {
      const copy = prev.map((sec) => ({ ...sec, cols: sec.cols.map((col) => ({ ...col, blocks: [...col.blocks] })) }));
      const [block] = copy[src.s].cols[src.c].blocks.splice(src.b, 1);
      let { s, c, index } = dest;
      if (s === src.s && c === src.c && index > src.b) index -= 1;
      copy[s].cols[c].blocks.splice(index, 0, block);
      return copy;
    });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const collision: CollisionDetection = (args) => {
    const a = String(args.active.id);
    const containers = sectionIds.includes(a)
      ? args.droppableContainers.filter((d) => sectionIds.includes(String(d.id)))
      : args.droppableContainers.filter((d) => { const id = String(d.id); return id.startsWith("col:") || blockIdSet.has(id); });
    return closestCorners({ ...args, droppableContainers: containers });
  };
  const onDragEnd = (e: DragEndEvent) => {
    setDragId(null);
    const { active, over } = e; if (!over) return;
    const a = String(active.id), o = String(over.id); if (a === o) return;
    if (a.startsWith("palette:")) { const t = resolveTarget(o); if (t) insertBlockAt(t.s, t.c, t.index, newBlock(a.slice(8) as BlockType)); return; }
    if (sectionIds.includes(a)) { const from = sectionIds.indexOf(a), to = sectionIds.indexOf(o); if (to >= 0 && from !== to) setSections((s) => arrayMove(s, from, to)); return; }
    const src = findBlock(a); if (!src) return;
    const dest = resolveTarget(o); if (dest) moveBlockTo(src, dest);
  };

  /* ── live SEO + readability ── */
  const asPost = React.useMemo(() => ({ ...meta, sections, content: "", views: 0, id: "" } as unknown as BlogPost), [meta, sections]);
  const analysis = React.useMemo(() => {
    const kw = focusKeyword.trim().toLowerCase();
    const body = extractText(asPost);
    const wc = body.trim().split(/\s+/).filter(Boolean).length;
    const kwCount = kw ? (body.toLowerCase().match(new RegExp(kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) || []).length : 0;
    const density = kw && wc ? Math.round((kwCount / wc) * 1000) / 10 : 0;
    const firstText = sections[0]?.cols[0]?.blocks.map((b) => b.text || (b.html ? stripHtml(b.html) : "")).find(Boolean) ?? "";
    const hasH2 = sections.some((s) => s.cols.some((c) => c.blocks.some((b) => b.type === "heading")));
    const imgs = sections.flatMap((s) => s.cols.flatMap((c) => c.blocks.filter((b) => b.type === "image" && b.url)));
    const allAlt = imgs.length === 0 || imgs.every((b) => !!b.alt);
    const metaDesc = meta.seoDescription || meta.excerpt;
    const seoTitle = meta.seoTitle || meta.title;
    const checks = [
      { label: "Focus keyword set", pass: !!kw },
      { label: "Keyword in title", pass: !!kw && meta.title.toLowerCase().includes(kw) },
      { label: "Keyword in intro", pass: !!kw && firstText.toLowerCase().includes(kw) },
      { label: "Keyword in slug", pass: !!kw && (meta.slug || "").toLowerCase().includes(kw.replace(/\s+/g, "-")) },
      { label: `Keyword density ${density}%`, pass: density >= 0.5 && density <= 3 },
      { label: `Title length ${seoTitle.length}/60`, pass: seoTitle.length >= 30 && seoTitle.length <= 60 },
      { label: `Meta description ${metaDesc.length}/160`, pass: metaDesc.length >= 120 && metaDesc.length <= 160 },
      { label: "Cover image set", pass: !!meta.coverImageUrl },
      { label: "Has a subheading (H2)", pass: hasH2 },
      { label: "All images have alt text", pass: allAlt },
      { label: `Length ${wc} words`, pass: wc >= 300 },
    ];
    return { checks, score: Math.round((checks.filter((c) => c.pass).length / checks.length) * 100) };
  }, [asPost, meta, sections, focusKeyword]);
  const read = React.useMemo(() => readability(asPost), [asPost]);

  /* ── AI assist ── */
  const runAi = async (type: "excerpt" | "tags" | "keyword", apply: (d: { excerpt?: string; tags?: string[]; keyword?: string }) => void) => {
    if (!meta.title.trim()) { toast.error("Add a title first"); return; }
    setAiBusy(type);
    const content = extractText({ sections, content: "" } as unknown as BlogPost).slice(0, 12000);
    const res = await dal.blog.aiAssist({ type, title: meta.title, content, excerpt: meta.excerpt, language: meta.language });
    setAiBusy(null);
    if (!res.ok) { toast.error(res.error); return; }
    apply(res.data);
  };
  const aiExcerpt = () => runAi("excerpt", (d) => { if (d.excerpt) { setM("excerpt", d.excerpt); toast.success("Excerpt generated"); } });
  const aiTags = () => runAi("tags", (d) => { if (d.tags?.length) { setMeta((m) => ({ ...m, tags: [...new Set([...m.tags, ...d.tags!])] })); toast.success("Tags suggested"); } });
  const aiKeyword = () => runAi("keyword", (d) => { if (d.keyword) { setFocusKeyword(d.keyword); toast.success("Focus keyword set"); } });

  /* ── save ── */
  const buildPayload = (): BlogInput => ({
    title: meta.title, slug: meta.slug || undefined, excerpt: meta.excerpt, coverImageUrl: meta.coverImageUrl,
    category: meta.category, tags: meta.tags, authorId: meta.authorId, authorName: meta.authorName,
    language: meta.language, status: meta.status, featured: meta.featured, seoTitle: meta.seoTitle, seoDescription: meta.seoDescription,
    publishedAt: meta.publishedAt, sections,
  });
  const save = async (statusOverride?: BlogStatus) => {
    if (!meta.title.trim()) { toast.error("Title is required"); return; }
    const status = statusOverride ?? meta.status;
    const payload: BlogInput = { ...buildPayload(), status, ...(status === "PUBLISHED" && !meta.publishedAt ? { publishedAt: new Date().toISOString() } : {}) };
    setSaving(true);
    const res = mode === "edit" && articleId ? await dal.blog.updateArticle(articleId, payload) : await dal.blog.createArticle(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    if (statusOverride) setM("status", statusOverride);
    clearDraft();
    toast.success(statusOverride === "PUBLISHED" ? "Article published" : "Draft saved");
    if (mode === "new") router.push(`/admin/blog/${res.data.id}/edit`);
  };
  const saveAsTemplate = async () => {
    const name = window.prompt("Template name:");
    if (!name?.trim()) return;
    const res = await dal.blog.createTemplate({ name: name.trim(), doc: { meta, sections } as Record<string, unknown> });
    if (res.ok) toast.success("Saved as template"); else toast.error(res.error);
  };

  const dragLabel = dragId
    ? dragId.startsWith("palette:") ? (LABEL[dragId.slice(8)] ?? "Block")
      : sectionIds.includes(dragId) ? "Section"
        : (LABEL[findBlock(dragId) ? sections[findBlock(dragId)!.s].cols[findBlock(dragId)!.c].blocks[findBlock(dragId)!.b].type : ""] ?? "Block")
    : "";

  return (
    <div className="space-y-4">
      {restorable && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm">
          <span className="inline-flex items-center gap-2"><History className="size-4 text-warning" /> We found an unsaved draft from a previous session.</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => { setMeta(restorable.meta); setSections(restorable.sections); setRestorable(null); }}>Restore</Button>
            <Button size="sm" variant="ghost" onClick={() => { clearDraft(); setRestorable(null); }}>Discard</Button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => router.push("/admin/blog")} className="mb-1 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4 rtl:rotate-180" /> Back to articles
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">{mode === "new" ? "New Article" : "Edit Article"}</h1>
            {autosaved && <span className="inline-flex items-center gap-1 text-xs text-success"><CheckCircle2 className="size-3.5" /> Autosaved</span>}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-lg border border-border/70">
            <Button variant="ghost" size="sm" className="rounded-none rounded-s-lg" onClick={undo} disabled={!past.length}><Undo2 className="size-4" /></Button>
            <Button variant="ghost" size="sm" className="rounded-none rounded-e-lg border-s border-border/70" onClick={redo} disabled={!future.length}><Redo2 className="size-4" /></Button>
          </div>
          <div className="flex items-center rounded-lg border border-border/70 p-0.5">
            <button onClick={() => setPreview(false)} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", !preview ? "bg-primary/10 text-primary" : "text-muted-foreground")}><Pencil className="size-4" /> Build</button>
            <button onClick={() => setPreview(true)} className={cn("inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", preview ? "bg-primary/10 text-primary" : "text-muted-foreground")}><Eye className="size-4" /> Preview</button>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={saveAsTemplate}><BookmarkPlus className="size-4" /> Save as template</Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => save()} disabled={saving}>{saving ? <Loader2 className="size-4 animate-spin" /> : <BookmarkPlus className="size-4" />} Save draft</Button>
          <Button size="sm" className="gap-1.5" onClick={() => save("PUBLISHED")} disabled={saving}><Send className="size-4" /> Publish</Button>
        </div>
      </div>

      {preview ? (
        <Card><CardContent className="py-6">
          {sections.some((s) => s.cols.some((c) => c.blocks.length)) ? <ArticleSections sections={sections} /> : <p className="text-center text-sm text-muted-foreground">No content yet.</p>}
        </CardContent></Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={collision} onDragStart={(e: DragStartEvent) => setDragId(String(e.active.id))} onDragEnd={onDragEnd} onDragCancel={() => setDragId(null)}>
          <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
            {/* left: title/slug/excerpt + canvas */}
            <div className="space-y-4">
              <Card><CardContent className="space-y-4 py-5">
                <Field label="Title" required><Input value={meta.title} onChange={(e) => setM("title", e.target.value)} className="text-lg font-semibold" placeholder="A compelling headline…" /></Field>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Slug</Label>
                  <div className="flex items-center rounded-lg border border-border/70 focus-within:ring-1 focus-within:ring-ring">
                    <span className="px-3 text-sm text-muted-foreground">/blog/</span>
                    <Input value={meta.slug} onChange={(e) => setM("slug", e.target.value)} placeholder="auto-generated" className="border-0 focus-visible:ring-0" />
                  </div>
                </div>
                <FieldWithAction label="Excerpt" action={<AiButton label="Generate" busy={aiBusy === "excerpt"} onClick={aiExcerpt} />}>
                  <Textarea rows={3} value={meta.excerpt} onChange={(e) => setM("excerpt", e.target.value)} placeholder="Summary…" />
                </FieldWithAction>
              </CardContent></Card>

              <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
                {sections.map((section, si) => (
                  <SortableSection key={section.id} id={section.id}>
                    {(secDrag) => (
                      <Card className="border-border/70">
                        <CardContent className="space-y-3 py-4">
                          <div className="flex flex-wrap items-center gap-3 border-b border-border/50 pb-3">
                            <button ref={secDrag.ref} {...secDrag.props} className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"><GripVertical className="size-4" /></button>
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Section {si + 1}</span>
                            <div className="flex items-center gap-1 rounded-lg border border-border/70 p-0.5">
                              {([1, 2, 3, 4] as const).map((n) => (
                                <button key={n} title={`${n} column${n > 1 ? "s" : ""}`} onClick={() => updateSection(si, resizeColumns(section, n))}
                                  className={cn("grid h-7 w-8 place-items-center rounded-md", section.columns === n ? "bg-primary/10" : "hover:bg-muted")}>
                                  <ColsGlyph n={n} active={section.columns === n} />
                                </button>
                              ))}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {BG_OPTS.map((bg) => (
                                <button key={bg} title={bg} onClick={() => updateSection(si, { bg })}
                                  className={cn("size-5 rounded-full", BG_DOT[bg], section.bg === bg && "ring-2 ring-primary ring-offset-1 ring-offset-background")} />
                              ))}
                            </div>
                            <div className="ms-auto flex gap-0.5">
                              <Button variant="ghost" size="sm" onClick={() => moveSection(si, -1)} disabled={si === 0}><ChevronUp className="size-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => moveSection(si, 1)} disabled={si === sections.length - 1}><ChevronDown className="size-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => duplicateSection(si)}><Copy className="size-4" /></Button>
                              <Button variant="ghost" size="sm" onClick={() => removeSection(si)} disabled={sections.length === 1}><Trash2 className="size-4 text-destructive" /></Button>
                            </div>
                          </div>

                          <div className={cn("grid gap-3", section.columns === 1 ? "grid-cols-1" : section.columns === 2 ? "sm:grid-cols-2" : section.columns === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4")}>
                            {section.cols.map((col, ci) => (
                              <DroppableCol key={col.id} id={`col:${si}:${ci}`} active={activeCol.s === si && activeCol.c === ci} onActivate={() => setActiveCol({ s: si, c: ci })}>
                                <SortableContext items={col.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                                  {col.blocks.map((block, bi) => (
                                    <SortableBlock key={block.id} id={block.id}>
                                      {(drag) => (
                                        <BlockCard
                                          block={block} dir={dir} drag={drag}
                                          collapsed={collapsed.has(block.id)}
                                          multiCol={section.cols.length > 1}
                                          onToggle={() => toggleCollapse(block.id)}
                                          onChange={(patch) => updateBlock({ s: si, c: ci, b: bi }, patch)}
                                          onMove={(d) => moveBlock({ s: si, c: ci, b: bi }, d)}
                                          onMoveCol={(d) => moveBlockCol({ s: si, c: ci, b: bi }, d)}
                                          onDuplicate={() => duplicateBlock({ s: si, c: ci, b: bi })}
                                          onDelete={() => removeBlock({ s: si, c: ci, b: bi })}
                                        />
                                      )}
                                    </SortableBlock>
                                  ))}
                                </SortableContext>
                                <Button variant="ghost" size="sm" className="w-full gap-1 border border-dashed border-border/60 text-muted-foreground"
                                  onClick={() => { setActiveCol({ s: si, c: ci }); addToActive("paragraph"); }}>
                                  <Plus className="size-3.5" /> Add
                                </Button>
                              </DroppableCol>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </SortableSection>
                ))}
              </SortableContext>

              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-dashed border-border/60 px-4 py-3">
                <span className="text-sm text-muted-foreground">Add a section:</span>
                {([1, 2, 3, 4] as const).map((n) => (
                  <Button key={n} variant="outline" size="sm" className="gap-1.5" onClick={() => addSection(n)}><ColsGlyph n={n} active={false} /> {n} col</Button>
                ))}
              </div>
            </div>

            {/* right: Manage / SEO */}
            <aside className="space-y-3 lg:sticky lg:top-20 lg:self-start">
              <div className="flex border-b border-border/60">
                {(["manage", "seo"] as const).map((t) => (
                  <button key={t} onClick={() => setRightTab(t)}
                    className={cn("-mb-px border-b-2 px-4 py-2 text-sm font-medium capitalize", rightTab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
                    {t === "seo" ? `SEO · ${analysis.score}` : "Manage"}
                  </button>
                ))}
              </div>

              {rightTab === "seo" ? (
                <Card><CardContent className="py-4">
                  <SeoPanel focusKeyword={focusKeyword} setFocusKeyword={setFocusKeyword} analysis={analysis} read={read} meta={meta} setM={setM} onAuto={aiKeyword} autoBusy={aiBusy === "keyword"} />
                </CardContent></Card>
              ) : (
                <>
                  <Card><CardContent className="space-y-3 py-4">
                    <p className="text-xs font-semibold text-muted-foreground">Drag a component into a column — or click to add to the selected one</p>
                    {PALETTE_GROUPS.map((g) => (
                      <div key={g.title} className="space-y-1.5">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">{g.title}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {g.types.map((type) => <PaletteItem key={type} type={type} label={LABEL[type] ?? type} onClick={() => addToActive(type)} />)}
                        </div>
                      </div>
                    ))}
                  </CardContent></Card>

                  <Card><CardContent className="space-y-4 py-4">
                    <p className="text-sm font-semibold">Publishing</p>
                    <Field label="Status">
                      <Select value={meta.status} onValueChange={(v) => setM("status", v as BlogStatus)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="DRAFT">Draft</SelectItem><SelectItem value="PUBLISHED">Published</SelectItem><SelectItem value="ARCHIVED">Archived</SelectItem></SelectContent>
                      </Select>
                    </Field>
                    <label className="flex items-center justify-between"><span className="text-sm font-medium">Feature on homepage</span><Switch checked={meta.featured} onCheckedChange={(v) => setM("featured", v)} /></label>
                  </CardContent></Card>

                  <Card><CardContent className="space-y-4 py-4">
                    <p className="text-sm font-semibold">Organize</p>
                    <Field label="Category">
                      <Select value={meta.category || "_none"} onValueChange={(v) => setM("category", v === "_none" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent><SelectItem value="_none">None</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Author">
                      <Select value={meta.authorId || "_none"} onValueChange={(v) => { const a = authors.find((x) => x.id === v); setMeta((m) => ({ ...m, authorId: v === "_none" ? "" : v, authorName: a?.name ?? "" })); }}>
                        <SelectTrigger><SelectValue placeholder="Select author" /></SelectTrigger>
                        <SelectContent><SelectItem value="_none">None</SelectItem>{authors.map((a) => <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>)}</SelectContent>
                      </Select>
                    </Field>
                    <Field label="Language">
                      <Select value={meta.language} onValueChange={(v) => setM("language", v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent>
                      </Select>
                    </Field>
                    <FieldWithAction label="Tags" action={<AiButton label="Suggest" busy={aiBusy === "tags"} onClick={aiTags} />}>
                      <TagsInput value={meta.tags} onChange={(v) => setM("tags", v)} />
                    </FieldWithAction>
                  </CardContent></Card>

                  <Card><CardContent className="space-y-3 py-4">
                    <p className="text-sm font-semibold">Cover image</p>
                    <Input value={meta.coverImageUrl} onChange={(e) => setM("coverImageUrl", e.target.value)} placeholder="Image URL (https://…)" />
                    <ImageUpload value={meta.coverImageUrl} onChange={(url) => setM("coverImageUrl", url)} />
                  </CardContent></Card>
                </>
              )}
            </aside>
          </div>

          <DragOverlay>
            {dragId ? <span className="rounded-md border border-primary/40 bg-card px-2.5 py-1 text-xs font-medium text-primary shadow-md">{dragLabel}</span> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
}

/* ── sortable / droppable wrappers ── */
function SortableSection({ id, children }: { id: string; children: (h: Handle) => React.ReactNode }) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners, setActivatorNodeRef } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}>
      {children({ ref: setActivatorNodeRef, props: { ...attributes, ...listeners } })}
    </div>
  );
}
function SortableBlock({ id, children }: { id: string; children: (h: Handle) => React.ReactNode }) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners, setActivatorNodeRef } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}>
      {children({ ref: setActivatorNodeRef, props: { ...attributes, ...listeners } })}
    </div>
  );
}
function DroppableCol({ id, active, onActivate, children }: { id: string; active: boolean; onActivate: () => void; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} onClick={onActivate}
      className={cn("space-y-2 rounded-lg border p-2 transition-colors", isOver ? "border-primary bg-primary/10" : active ? "border-primary/40 bg-primary/[0.03]" : "border-dashed border-border/60 bg-muted/20")}>
      {children}
    </div>
  );
}
function PaletteItem({ type, label, onClick }: { type: BlockType; label: string; onClick: () => void }) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({ id: `palette:${type}` });
  return (
    <button ref={setNodeRef} {...attributes} {...listeners} onClick={onClick}
      className={cn("cursor-grab rounded-md border border-border/60 px-2.5 py-1 text-xs font-medium hover:border-primary/50 hover:bg-primary/5 hover:text-primary active:cursor-grabbing", isDragging && "opacity-50")}>
      {label}
    </button>
  );
}

/* ── one block, inline editor ── */
function BlockCard({
  block, dir, drag, collapsed, multiCol, onToggle, onChange, onMove, onMoveCol, onDuplicate, onDelete,
}: {
  block: ArticleBlock; dir: "ltr" | "rtl"; drag: Handle; collapsed: boolean; multiCol: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<ArticleBlock>) => void;
  onMove: (d: -1 | 1) => void; onMoveCol: (d: -1 | 1) => void;
  onDuplicate: () => void; onDelete: () => void;
}) {
  const showWords = ["paragraph", "heading", "quote", "code", "feature", "callout", "cta", "hero", "testimonial"].includes(block.type);
  return (
    <div className="rounded-lg border border-border/70 bg-card">
      <div className="flex items-center gap-1.5 border-b border-border/50 px-2 py-1.5">
        <button ref={drag.ref} {...drag.props} className="cursor-grab touch-none text-muted-foreground/50 hover:text-muted-foreground active:cursor-grabbing"><GripVertical className="size-4" /></button>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{LABEL[block.type] ?? block.type}</span>
        {showWords && <span className="text-[11px] text-muted-foreground/70">· {wordCount(block)}w</span>}
        <div className="ms-auto flex items-center gap-0.5">
          <button onClick={onToggle} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted">{collapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}</button>
          <button onClick={() => onMove(-1)} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted"><ChevronUp className="size-4" /></button>
          <button onClick={() => onMove(1)} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted"><ChevronDown className="size-4" /></button>
          {multiCol && <>
            <button onClick={() => onMoveCol(-1)} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted"><ChevronLeft className="size-4" /></button>
            <button onClick={() => onMoveCol(1)} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted"><ChevronRight className="size-4" /></button>
          </>}
          <button onClick={onDuplicate} className="grid size-7 place-items-center rounded text-muted-foreground hover:bg-muted"><Copy className="size-4" /></button>
          <button onClick={onDelete} className="grid size-7 place-items-center rounded text-destructive hover:bg-destructive/10"><Trash2 className="size-4" /></button>
        </div>
      </div>
      {!collapsed && block.type !== "divider" && <div className="space-y-3 p-3"><BlockFields block={block} dir={dir} onChange={onChange} /></div>}
    </div>
  );
}

/* ── per-type editors ── */
function BlockFields({ block: x, dir, onChange }: { block: ArticleBlock; dir: "ltr" | "rtl"; onChange: (patch: Partial<ArticleBlock>) => void }) {
  const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <>
      {x.type === "heading" && <>
        <F label="Text"><Input value={x.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></F>
        <F label="Level"><Select value={String(x.level ?? 2)} onValueChange={(v) => onChange({ level: Number(v) as 2 | 3 })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">H2</SelectItem><SelectItem value="3">H3</SelectItem></SelectContent></Select></F>
      </>}
      {x.type === "paragraph" && (
        <F label="Rich text">
          <RichTextEditor value={x.html ?? x.text ?? ""} dir={dir} placeholder="Write your paragraph…"
            onChange={(html) => onChange({ html, text: stripHtml(html) })} />
        </F>
      )}
      {["quote", "testimonial", "feature", "callout", "cta", "hero"].includes(x.type) && (
        <F label="Text"><Textarea rows={4} value={x.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></F>
      )}
      {(x.type === "hero" || x.type === "image") && <F label="Caption / subtitle"><Input value={x.caption ?? ""} onChange={(e) => onChange({ caption: e.target.value })} /></F>}
      {["feature", "callout", "cta", "hero", "button"].includes(x.type) && <F label="Label"><Input value={x.label ?? ""} onChange={(e) => onChange({ label: e.target.value })} /></F>}
      {["cta", "button", "hero", "embed"].includes(x.type) && <F label="URL"><Input value={x.url ?? ""} onChange={(e) => onChange({ url: e.target.value })} /></F>}
      {(x.type === "quote" || x.type === "testimonial") && <F label="Cite"><Input value={x.cite ?? ""} onChange={(e) => onChange({ cite: e.target.value })} /></F>}
      {x.type === "callout" && <F label="Variant"><Select value={x.variant ?? "info"} onValueChange={(v) => onChange({ variant: v as ArticleBlock["variant"] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["info", "tip", "warning", "success"].map((v) => <SelectItem key={v} value={v} className="capitalize">{v}</SelectItem>)}</SelectContent></Select></F>}
      {x.type === "code" && <><F label="Language"><Input value={x.lang ?? ""} onChange={(e) => onChange({ lang: e.target.value })} /></F><F label="Code"><Textarea rows={6} className="font-mono text-xs" value={x.text ?? ""} onChange={(e) => onChange({ text: e.target.value })} /></F></>}
      {(x.type === "list" || x.type === "checklist") && <>
        {x.type === "list" && <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2"><span className="text-sm">Ordered</span><Switch checked={!!x.ordered} onCheckedChange={(v) => onChange({ ordered: v })} /></label>}
        <F label="Items (one per line)"><Textarea rows={5} value={(x.items ?? []).join("\n")} onChange={(e) => onChange({ items: lines(e.target.value) })} /></F>
      </>}
      {x.type === "image" && <><F label="Image"><ImageUpload value={x.url} onChange={(url) => onChange({ url })} /></F><F label="Alt text"><Input value={x.alt ?? ""} onChange={(e) => onChange({ alt: e.target.value })} /></F></>}
      {x.type === "gallery" && (
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
      {x.type === "table" && (
        <F label="Rows (cells separated by | , row 0 = header)">
          <Textarea rows={6} className="font-mono text-xs"
            value={(x.rows ?? []).map((r) => r.join(" | ")).join("\n")}
            onChange={(e) => onChange({ rows: e.target.value.split("\n").map((l) => l.split("|").map((c) => c.trim())) })} />
        </F>
      )}
      {x.type === "stats" && (
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
      {x.type === "faq" && (
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
    </>
  );
}

/* ── SEO + readability ── */
function SeoPanel({
  focusKeyword, setFocusKeyword, analysis, read, meta, setM, onAuto, autoBusy,
}: {
  focusKeyword: string;
  setFocusKeyword: (v: string) => void;
  analysis: { checks: { label: string; pass: boolean }[]; score: number };
  read: { score: number; label: string; words: number };
  meta: BuilderMeta;
  setM: <K extends keyof BuilderMeta>(k: K, v: BuilderMeta[K]) => void;
  onAuto: () => void;
  autoBusy: boolean;
}) {
  const scoreLabel = analysis.score >= 70 ? "Good" : analysis.score >= 40 ? "Fair" : "Needs work";
  const scoreColor = analysis.score >= 70 ? "text-success" : analysis.score >= 40 ? "text-warning" : "text-destructive";
  const barColor = analysis.score >= 70 ? "bg-success" : analysis.score >= 40 ? "bg-warning" : "bg-destructive";
  const metaTitle = meta.seoTitle || meta.title;
  const metaDesc = meta.seoDescription || meta.excerpt;
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">SEO analysis</span>
          <span className={cn("text-sm font-medium", scoreColor)}>{analysis.score} · {scoreLabel}</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", barColor)} style={{ width: `${analysis.score}%` }} /></div>
      </div>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Focus keyword</Label>
          <AiButton label="Auto" busy={autoBusy} onClick={onAuto} />
        </div>
        <Input value={focusKeyword} onChange={(e) => setFocusKeyword(e.target.value)} placeholder="e.g. SCFHS exam prep" />
      </div>
      <ul className="space-y-1.5">
        {analysis.checks.map((c) => (
          <li key={c.label} className="flex items-center gap-2 text-xs">
            {c.pass ? <CheckCircle2 className="size-3.5 shrink-0 text-success" /> : <Circle className="size-3.5 shrink-0 text-muted-foreground" />}
            <span className={c.pass ? "text-muted-foreground" : ""}>{c.label}</span>
          </li>
        ))}
      </ul>
      <div className="space-y-3 border-t border-border/60 pt-4">
        <p className="text-xs font-semibold text-muted-foreground">Search metadata</p>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Meta title</Label>
          <Input value={meta.seoTitle} onChange={(e) => setM("seoTitle", e.target.value)} placeholder="Defaults to title" />
          <p className="text-end text-[11px] text-muted-foreground">{metaTitle.length}/60</p>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Meta description</Label>
          <Textarea rows={3} value={meta.seoDescription} onChange={(e) => setM("seoDescription", e.target.value)} placeholder="Defaults to excerpt" />
          <p className="text-end text-[11px] text-muted-foreground">{metaDesc.length}/160</p>
        </div>
      </div>
      <div className="space-y-1 border-t border-border/60 pt-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground">Readability</span>
          <span className="text-sm font-medium">{read.label} · {read.score}/100</span>
        </div>
        <p className="text-xs text-muted-foreground">{read.words} words</p>
      </div>
    </div>
  );
}

/* ── small helpers ── */
function ColsGlyph({ n, active }: { n: number; active: boolean }) {
  return (
    <span className="flex h-3.5 w-4 items-center gap-px">
      {Array.from({ length: n }).map((_, i) => <span key={i} className={cn("h-full flex-1 rounded-[1px]", active ? "bg-primary" : "bg-muted-foreground/50")} />)}
    </span>
  );
}
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</Label>{children}</div>;
}
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
function FieldWithAction({ label, action, children }: { label: string; action: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{action}</div>
      {children}
    </div>
  );
}
function AiButton({ label, busy, onClick }: { label: string; busy: boolean; onClick: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs text-primary" onClick={onClick} disabled={busy}>
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />} {label}
    </Button>
  );
}
