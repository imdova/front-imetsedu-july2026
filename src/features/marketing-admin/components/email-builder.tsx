"use client";

import * as React from "react";
import { GripVertical, Trash2, Bookmark, Settings2, Eye, EyeOff, Save, ArrowLeft, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { BrandBlock } from "@/lib/db/email-marketing";
import {
  type Block, type BlockType, type Design, type Preset,
  BLOCK_LABELS, PRESETS, PRESET_CATEGORY_ORDER, PERSONALIZATION_TOKENS, makeBlock, renderBlock, renderDesign, parseDesign, brandStarter, DEFAULT_SETTINGS,
} from "@/features/marketing-admin/email-blocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SortableList } from "@/components/shared/sortable/sortable-list";
import { cn } from "@/lib/utils";

const BLOCK_TYPES: BlockType[] = ["header", "heading", "text", "button", "image", "divider", "spacer", "hero", "footer"];

export function EmailBuilder({
  entityType, entityId, entityName, initialDesign, initialBrandBlocks,
}: {
  entityType: "campaign" | "template";
  entityId: string;
  entityName: string;
  initialDesign: string | null;
  initialBrandBlocks: BrandBlock[];
}) {
  const [design, setDesign] = React.useState<Design>(() => parseDesign(initialDesign));
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [showSettings, setShowSettings] = React.useState(false);
  const [preview, setPreview] = React.useState(false);
  const [brandBlocks, setBrandBlocks] = React.useState(initialBrandBlocks);
  const [saving, setSaving] = React.useState(false);

  const selected = design.blocks.find((b) => b.id === selectedId) ?? null;

  const addBlock = (block: Block) => {
    setDesign((d) => ({ ...d, blocks: [...d.blocks, block] }));
    setSelectedId(block.id); setShowSettings(false);
  };
  const reorder = (blocks: Block[]) => setDesign((d) => ({ ...d, blocks }));
  const updateBlock = (id: string, props: Record<string, string | number>) =>
    setDesign((d) => ({ ...d, blocks: d.blocks.map((b) => (b.id === id ? { ...b, props: { ...b.props, ...props } } : b)) }));
  const removeBlock = (id: string) => {
    setDesign((d) => ({ ...d, blocks: d.blocks.filter((b) => b.id !== id) }));
    if (selectedId === id) setSelectedId(null);
  };

  const saveAsBrand = async (block: Block) => {
    const name = window.prompt("Name this brand block:");
    if (!name?.trim()) return;
    const res = await dal.emailMarketing.createBrandBlock(name.trim(), JSON.stringify(block));
    if (res.ok) { setBrandBlocks((p) => [...p, res.data]); toast.success("Saved as brand block"); }
    else toast.error(res.error);
  };
  const insertBrand = (bb: BrandBlock) => {
    try {
      const parsed = JSON.parse(bb.block) as Block;
      addBlock({ ...parsed, id: makeBlock(parsed.type).id });
    } catch { toast.error("Brand block is corrupt"); }
  };
  const deleteBrand = async (bb: BrandBlock) => {
    const res = await dal.emailMarketing.deleteBrandBlock(bb.id);
    if (res.ok) setBrandBlocks((p) => p.filter((x) => x.id !== bb.id));
  };

  const save = async () => {
    setSaving(true);
    const json = JSON.stringify(design);
    const html = renderDesign(design);
    const res = entityType === "campaign"
      ? await dal.emailMarketing.saveCampaignDesign(entityId, json, html)
      : await dal.emailMarketing.saveTemplateDesign(entityId, json, html);
    setSaving(false);
    if (res.ok) toast.success("Design saved"); else toast.error(res.error);
  };

  return (
    <div className="flex h-[calc(100vh-2rem)] flex-col gap-3">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-card px-4 py-2.5">
        <div className="flex items-center gap-3">
          <Link href="/admin/marketing/email" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Back
          </Link>
          <span className="text-sm font-medium">{entityName}</span>
          <Badge variant="outline" className="capitalize">{entityType}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => {
              if (design.blocks.length && !window.confirm("Replace the current design with the IMETS brand template?")) return;
              setDesign(brandStarter());
              setSelectedId(null);
            }}
          >
            <Sparkles className="size-4" /> Brand template
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setPreview((p) => !p)}>
            {preview ? <EyeOff className="size-4" /> : <Eye className="size-4" />} {preview ? "Edit" : "Preview"}
          </Button>
          <Button size="sm" className="gap-1.5" onClick={save} disabled={saving}>
            <Save className="size-4" /> {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-3">
        {/* Palette */}
        {!preview && (
          <aside className="w-[346px] shrink-0 space-y-4 overflow-y-auto rounded-xl border border-border/70 bg-card p-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Quick blocks</p>
              <div className="grid grid-cols-2 gap-1.5">
                {BLOCK_TYPES.map((t) => (
                  <Button key={t} variant="outline" size="sm" className="justify-start gap-1" onClick={() => addBlock(makeBlock(t))}>
                    <Plus className="size-3" /> {BLOCK_LABELS[t]}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Library</p>
              <div className="space-y-3">
                {PRESET_CATEGORY_ORDER.map((cat) => {
                  const items = PRESETS.filter((pr) => pr.category === cat);
                  if (!items.length) return null;
                  return (
                    <div key={cat}>
                      <p className="mb-1.5 px-0.5 text-[10px] font-bold uppercase tracking-wide text-muted-foreground/70">{cat}</p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {items.map((pr) => <PresetItem key={pr.id} preset={pr} onAdd={() => addBlock(pr.make())} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Brand blocks</p>
              {brandBlocks.length === 0 ? (
                <p className="text-xs text-muted-foreground/70">Save a block to reuse it here.</p>
              ) : (
                <div className="space-y-1">
                  {brandBlocks.map((bb) => (
                    <div key={bb.id} className="flex items-center gap-1">
                      <button onClick={() => insertBrand(bb)} className="flex-1 rounded-md border border-border/60 px-2 py-1.5 text-start text-xs hover:bg-muted">{bb.name}</button>
                      <Button variant="ghost" size="sm" onClick={() => deleteBrand(bb)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button variant={showSettings ? "secondary" : "outline"} size="sm" className="w-full gap-1.5" onClick={() => { setShowSettings(true); setSelectedId(null); }}>
              <Settings2 className="size-4" /> Design settings
            </Button>
          </aside>
        )}

        {/* Canvas / preview */}
        <main className="min-w-0 flex-1 overflow-y-auto rounded-xl border border-border/70 bg-muted/30 p-4">
          {preview ? (
            <div className="mx-auto" dangerouslySetInnerHTML={{ __html: renderDesign(design) }} />
          ) : design.blocks.length === 0 ? (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Add blocks from the left to start designing.
            </div>
          ) : (
            <div className="mx-auto rounded-lg p-4" style={{ maxWidth: design.settings.width, background: design.settings.contentBackground }}>
              <SortableList
                items={design.blocks}
                onReorder={reorder}
                className="space-y-2"
                renderItem={(block, handle) => (
                  <div
                    onClick={() => { setSelectedId(block.id); setShowSettings(false); }}
                    className={cn(
                      "group relative rounded-md border-2 bg-white/60 transition-colors",
                      selectedId === block.id ? "border-primary" : "border-transparent hover:border-border",
                    )}
                  >
                    <div className="absolute -start-0.5 top-1 z-10 flex -translate-x-full flex-col gap-0.5 pe-1 opacity-0 group-hover:opacity-100">
                      <button {...handle.attributes} {...handle.listeners} className="cursor-grab rounded bg-card p-1 shadow-sm" title="Drag">
                        <GripVertical className="size-3.5 text-muted-foreground" />
                      </button>
                    </div>
                    <div className="pointer-events-none p-1" dangerouslySetInnerHTML={{ __html: renderBlock(block) }} />
                    <div className="absolute end-1 top-1 z-10 flex gap-0.5 opacity-0 group-hover:opacity-100">
                      <button onClick={(e) => { e.stopPropagation(); saveAsBrand(block); }} className="rounded bg-card p-1 shadow-sm" title="Save as brand block">
                        <Bookmark className="size-3.5 text-muted-foreground" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }} className="rounded bg-card p-1 shadow-sm" title="Delete">
                        <Trash2 className="size-3.5 text-destructive" />
                      </button>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </main>

        {/* Inspector */}
        {!preview && (
          <aside className="w-72 shrink-0 overflow-y-auto rounded-xl border border-border/70 bg-card p-4">
            {showSettings ? (
              <SettingsEditor design={design} onChange={(settings) => setDesign((d) => ({ ...d, settings }))} />
            ) : selected ? (
              <BlockEditor block={selected} onChange={(props) => updateBlock(selected.id, props)} />
            ) : (
              <p className="text-sm text-muted-foreground">Select a block to edit, or open Design settings.</p>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}

/* ── Inspector: per-block fields ── */
function BlockEditor({ block, onChange }: { block: Block; onChange: (props: Record<string, string | number>) => void }) {
  const x = block.props;
  const text = (k: string) => <Input value={String(x[k] ?? "")} onChange={(e) => onChange({ [k]: e.target.value })} />;
  const area = (k: string) => <Textarea rows={4} value={String(x[k] ?? "")} onChange={(e) => onChange({ [k]: e.target.value })} />;
  const num = (k: string) => <Input type="number" value={Number(x[k] ?? 0)} onChange={(e) => onChange({ [k]: Number(e.target.value) })} />;
  const color = (k: string) => (
    <input type="color" value={String(x[k] ?? "#000000")} onChange={(e) => onChange({ [k]: e.target.value })} className="h-9 w-full cursor-pointer rounded-md border border-border bg-background" />
  );
  const align = (k: string) => (
    <Select value={String(x[k] ?? "left")} onValueChange={(v) => onChange({ [k]: v })}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent><SelectItem value="left">Left</SelectItem><SelectItem value="center">Center</SelectItem><SelectItem value="right">Right</SelectItem></SelectContent>
    </Select>
  );
  const pick = (k: string, opts: [string, string][], numeric = false) => (
    <Select value={String(x[k] ?? opts[0][0])} onValueChange={(v) => onChange({ [k]: numeric ? Number(v) : v })}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{opts.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
    </Select>
  );
  /** Insert-personalization chips — append a merge tag to the given field. */
  const tokens = (k: string) => (
    <div className="flex flex-wrap gap-1 pt-1">
      <span className="text-[11px] text-muted-foreground/70">Insert:</span>
      {PERSONALIZATION_TOKENS.map((tk) => (
        <button
          key={tk.token}
          type="button"
          onClick={() => onChange({ [k]: `${String(x[k] ?? "")}${tk.token}` })}
          className="rounded border border-border/60 bg-muted/40 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
        >
          {tk.label}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted-foreground">{BLOCK_LABELS[block.type]} block</p>
      {block.type === "header" && <>
        <F label="Logo image URL (optional)">{text("logoSrc")}</F>
        <p className="-mt-2 text-[11px] leading-snug text-muted-foreground">Leave blank to use the IMETS wordmark. Use a hosted PNG/JPG — SVG may not render in email clients.</p>
        <div className="grid grid-cols-2 gap-3"><F label="Brand (gold)">{text("brandTop")}</F><F label="Brand (white)">{text("brandSub")}</F></div>
        <F label="Background">{color("bg")}</F>
      </>}
      {block.type === "heading" && <>
        <F label="Text">{area("text")}{tokens("text")}</F>
        <F label="Level"><Select value={String(x.level ?? 2)} onValueChange={(v) => onChange({ level: Number(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">H1</SelectItem><SelectItem value="2">H2</SelectItem><SelectItem value="3">H3</SelectItem></SelectContent></Select></F>
        <F label="Align">{align("align")}</F>
        <F label="Color">{color("color")}</F>
      </>}
      {block.type === "text" && <>
        <F label="Text">{area("text")}{tokens("text")}</F>
        <F label="Align">{align("align")}</F>
        <F label="Color">{color("color")}</F>
      </>}
      {block.type === "button" && <>
        <F label="Label">{text("label")}{tokens("label")}</F>
        <F label="URL">{text("url")}</F>
        <F label="Align">{align("align")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Background">{color("bg")}</F><F label="Text color">{color("color")}</F></div>
      </>}
      {block.type === "image" && <>
        <F label="Image URL">{text("src")}</F>
        <F label="Alt text">{text("alt")}</F>
        <F label="Align">{align("align")}</F>
        <F label="Width %">{num("width")}</F>
      </>}
      {block.type === "divider" && <F label="Color">{color("color")}</F>}
      {block.type === "spacer" && <F label="Height (px)">{num("height")}</F>}
      {block.type === "html" && <>
        <F label="HTML">
          <Textarea rows={14} className="font-mono text-xs" value={String(x.html ?? "")} onChange={(e) => onChange({ html: e.target.value })} />
        </F>
        <p className="text-xs text-muted-foreground">Rendered exactly as written. Use inline styles and table layout for email compatibility.</p>
      </>}
      {block.type === "hero" && <>
        <F label="Title">{text("title")}{tokens("title")}</F>
        <F label="Subtitle">{area("subtitle")}{tokens("subtitle")}</F>
        <F label="Button label">{text("buttonLabel")}</F>
        <F label="Button URL">{text("buttonUrl")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Background">{color("bg")}</F><F label="Text color">{color("color")}</F></div>
        <div className="grid grid-cols-2 gap-3"><F label="Button bg">{color("buttonBg")}</F><F label="Button text">{color("buttonColor")}</F></div>
      </>}
      {block.type === "footer" && <>
        <F label="Brand name">{text("brandName")}</F>
        <F label="Address">{text("address")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Phone">{text("phone")}</F><F label="Email">{text("email")}</F></div>
        <F label="Facebook URL">{text("facebookUrl")}</F>
        <F label="Twitter / X URL">{text("twitterUrl")}</F>
        <F label="Instagram URL">{text("instagramUrl")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Unsubscribe label">{text("unsubscribeLabel")}</F><F label="Unsubscribe URL">{text("unsubscribeUrl")}</F></div>
        <div className="grid grid-cols-2 gap-3"><F label="Background">{color("bg")}</F><F label="Muted text">{color("color")}</F></div>
      </>}

      {block.type === "videoCta" && <>
        <F label="Thumbnail image URL">{text("thumb")}</F>
        <F label="Video link URL">{text("videoUrl")}</F>
        <F label="Title">{text("title")}{tokens("title")}</F>
        <F label="Text">{area("text")}{tokens("text")}</F>
        <F label="Button label">{text("buttonLabel")}</F>
        <F label="Button URL">{text("buttonUrl")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Button bg">{color("buttonBg")}</F><F label="Button text">{color("buttonColor")}</F></div>
      </>}

      {block.type === "textImage" && <>
        <F label="Eyebrow (small label)">{text("eyebrow")}</F>
        <F label="Title">{text("title")}</F>
        <F label="Text">{area("text")}{tokens("text")}</F>
        <F label="Image URL">{text("image")}</F>
        <F label="Image side">{pick("imageSide", [["right", "Right"], ["left", "Left"]])}</F>
      </>}

      {block.type === "article" && <>
        <F label="Title">{text("title")}</F>
        <F label="Image URL">{text("image")}</F>
        <F label="Text">{area("text")}{tokens("text")}</F>
        <F label="Button label">{text("buttonLabel")}</F>
        <F label="Button URL">{text("buttonUrl")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Button bg">{color("buttonBg")}</F><F label="Button text">{color("buttonColor")}</F></div>
      </>}

      {(block.type === "features3" || block.type === "features4") && <>
        <F label="Heading">{text("heading")}</F>
        <F label="Intro">{text("intro")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="“View all” label">{text("viewAllLabel")}</F><F label="“View all” URL">{text("viewAllUrl")}</F></div>
        {Array.from({ length: block.type === "features4" ? 4 : 3 }, (_, i) => i + 1).map((i) => (
          <div key={i} className="rounded-lg border border-border/60 p-2.5 space-y-2">
            <p className="text-[11px] font-semibold text-muted-foreground">Feature {i}</p>
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <F label="Title">{text(`f${i}title`)}</F>
              <F label="Icon">{text(`f${i}icon`)}</F>
            </div>
            <F label="Text">{area(`f${i}text`)}</F>
            <F label="Icon color">{color(`f${i}color`)}</F>
          </div>
        ))}
      </>}

      {block.type === "imageGrid" && <>
        <F label="Image 1 URL">{text("img1")}</F>
        <F label="Image 2 URL">{text("img2")}</F>
        <F label="Image 3 URL">{text("img3")}</F>
        <F label="Image 4 URL (wide)">{text("img4")}</F>
      </>}

      {block.type === "gallery" && <>
        <F label="Large image URL">{text("img1")}</F>
        <F label="Top-right image URL">{text("img2")}</F>
        <F label="Bottom-right image URL">{text("img3")}</F>
      </>}

      {block.type === "buttons" && <>
        <F label="Number of buttons">{pick("count", [["2", "2 buttons"], ["3", "3 buttons"]], true)}</F>
        {Array.from({ length: Number(x.count) === 3 ? 3 : 2 }, (_, i) => i + 1).map((k) => (
          <div key={k} className="space-y-2 rounded-lg border border-border/60 p-2.5">
            <p className="text-[11px] font-semibold text-muted-foreground">Button {k}</p>
            <div className="grid grid-cols-2 gap-2"><F label="Label">{text(`l${k}`)}</F><F label="URL">{text(`u${k}`)}</F></div>
            <div className="grid grid-cols-2 gap-2"><F label="Background">{color(`bg${k}`)}</F><F label="Text color">{color(`color${k}`)}</F></div>
          </div>
        ))}
      </>}

      {block.type === "coupon" && <>
        <F label="Title">{text("title")}</F>
        <F label="Greeting">{text("greeting")}{tokens("greeting")}</F>
        <F label="Text">{area("text")}</F>
        <F label="Discount label">{text("discountLabel")}</F>
        <F label="Code label">{text("codeLabel")}</F>
        <F label="Code">{text("code")}</F>
        <div className="grid grid-cols-3 gap-2"><F label="Panel bg">{color("bg")}</F><F label="Left bg">{color("leftBg")}</F><F label="Badge bg">{color("badgeBg")}</F></div>
      </>}

      {block.type === "product" && <>
        <F label="Image URL">{text("image")}</F>
        <F label="Eyebrow">{text("eyebrow")}</F>
        <F label="Title">{text("title")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Price">{text("price")}</F><F label="Compare price">{text("comparePrice")}</F></div>
        <F label="Button label">{text("buttonLabel")}</F>
        <F label="Button URL">{text("buttonUrl")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Button bg">{color("buttonBg")}</F><F label="Button text">{color("buttonColor")}</F></div>
      </>}

      {block.type === "countdown" && <>
        <F label="Title (optional)">{text("title")}</F>
        <F label="End date &amp; time">
          <Input type="datetime-local" value={String(x.endDate ?? "")} onChange={(e) => onChange({ endDate: e.target.value })} />
        </F>
        <p className="-mt-2 text-[11px] leading-snug text-muted-foreground">Digits are a snapshot taken when you save. For a live-ticking timer, paste a countdown-GIF URL below.</p>
        <F label="Live GIF URL (optional)">{text("gifUrl")}</F>
        <F label="Align">{align("align")}</F>
        <div className="grid grid-cols-3 gap-2"><F label="Box">{color("boxBg")}</F><F label="Number">{color("numColor")}</F><F label="Label">{color("labelColor")}</F></div>
      </>}

      {block.type === "spotlight" && <>
        <F label="Eyebrow (small label)">{text("eyebrow")}</F>
        <F label="Title">{text("title")}</F>
        <F label="Text">{area("text")}{tokens("text")}</F>
        <F label="Button label">{text("buttonLabel")}</F>
        <F label="Button URL">{text("buttonUrl")}</F>
        <F label="Image URL">{text("image")}</F>
        <F label="Image side">{pick("imageSide", [["left", "Left"], ["right", "Right"]])}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Panel color">{color("bg")}</F><F label="Text color">{color("color")}</F></div>
        <div className="grid grid-cols-2 gap-3"><F label="Button bg">{color("buttonBg")}</F><F label="Button text">{color("buttonColor")}</F></div>
      </>}

      {block.type === "coursesList" && <>
        <F label="Section heading (optional)">{text("heading")}</F>
        <F label="Number of courses">{pick("count", [["2", "2 courses"], ["3", "3 courses"]], true)}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Button bg">{color("buttonBg")}</F><F label="Button text">{color("buttonColor")}</F></div>
        {Array.from({ length: Number(x.count) === 2 ? 2 : 3 }, (_, i) => i + 1).map((i) => (
          <div key={i} className="space-y-2 rounded-lg border border-border/60 p-2.5">
            <p className="text-[11px] font-semibold text-muted-foreground">Course {i}</p>
            <F label="Image URL">{text(`c${i}img`)}</F>
            <F label="Title">{text(`c${i}title`)}</F>
            <F label="Subtitle">{text(`c${i}subtitle`)}</F>
            <div className="grid grid-cols-2 gap-2"><F label="Button">{text(`c${i}btn`)}</F><F label="URL">{text(`c${i}url`)}</F></div>
          </div>
        ))}
      </>}
    </div>
  );
}

function SettingsEditor({ design, onChange }: { design: Design; onChange: (s: Design["settings"]) => void }) {
  const s = design.settings;
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted-foreground">Design settings</p>
      <F label="Outer background"><input type="color" value={s.background} onChange={(e) => onChange({ ...s, background: e.target.value })} className="h-9 w-full cursor-pointer rounded-md border border-border bg-background" /></F>
      <F label="Content background"><input type="color" value={s.contentBackground} onChange={(e) => onChange({ ...s, contentBackground: e.target.value })} className="h-9 w-full cursor-pointer rounded-md border border-border bg-background" /></F>
      <F label="Content width (px)"><Input type="number" value={s.width} onChange={(e) => onChange({ ...s, width: Number(e.target.value) || DEFAULT_SETTINGS.width })} /></F>
    </div>
  );
}

/** A library item: a scaled live thumbnail of the block plus its label. */
function PresetItem({ preset, onAdd }: { preset: Preset; onAdd: () => void }) {
  const html = React.useMemo(() => renderBlock(preset.make()), [preset]);
  return (
    <button
      onClick={onAdd}
      title={`Add ${preset.label}`}
      className="group block w-full overflow-hidden rounded-lg border border-border/60 bg-white text-start transition hover:border-primary/50 hover:shadow-sm"
    >
      <div className="relative h-[58px] overflow-hidden bg-white">
        <div
          className="pointer-events-none absolute left-0 top-0 origin-top-left"
          style={{ width: 600, transform: "scale(0.26)" }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className="flex items-center justify-between gap-1 border-t border-border/50 bg-muted/30 px-2 py-1">
        <span className="truncate text-[11px] font-medium">{preset.label}</span>
        <Plus className="size-3 shrink-0 text-primary opacity-0 transition group-hover:opacity-100" />
      </div>
    </button>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
