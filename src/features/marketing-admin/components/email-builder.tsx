"use client";

import * as React from "react";
import { GripVertical, Trash2, Bookmark, Settings2, Eye, EyeOff, Save, ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { BrandBlock } from "@/lib/db/email-marketing";
import {
  type Block, type BlockType, type Design,
  BLOCK_LABELS, PRESETS, makeBlock, renderBlock, renderDesign, parseDesign, DEFAULT_SETTINGS,
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

const BLOCK_TYPES: BlockType[] = ["heading", "text", "button", "image", "divider", "spacer", "hero"];

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
          <aside className="w-56 shrink-0 space-y-4 overflow-y-auto rounded-xl border border-border/70 bg-card p-3">
            <div>
              <p className="mb-2 text-xs font-semibold text-muted-foreground">Blocks</p>
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
              <div className="space-y-1">
                {PRESETS.map((pr) => (
                  <button key={pr.id} onClick={() => addBlock(pr.make())}
                    className="w-full rounded-md border border-border/60 px-2 py-1.5 text-start text-xs hover:bg-muted">
                    {pr.label}
                  </button>
                ))}
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

  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold text-muted-foreground">{BLOCK_LABELS[block.type]} block</p>
      {block.type === "heading" && <>
        <F label="Text">{area("text")}</F>
        <F label="Level"><Select value={String(x.level ?? 2)} onValueChange={(v) => onChange({ level: Number(v) })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">H1</SelectItem><SelectItem value="2">H2</SelectItem><SelectItem value="3">H3</SelectItem></SelectContent></Select></F>
        <F label="Align">{align("align")}</F>
        <F label="Color">{color("color")}</F>
      </>}
      {block.type === "text" && <>
        <F label="Text">{area("text")}</F>
        <F label="Align">{align("align")}</F>
        <F label="Color">{color("color")}</F>
      </>}
      {block.type === "button" && <>
        <F label="Label">{text("label")}</F>
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
      {block.type === "hero" && <>
        <F label="Title">{text("title")}</F>
        <F label="Subtitle">{area("subtitle")}</F>
        <F label="Button label">{text("buttonLabel")}</F>
        <F label="Button URL">{text("buttonUrl")}</F>
        <div className="grid grid-cols-2 gap-3"><F label="Background">{color("bg")}</F><F label="Text color">{color("color")}</F></div>
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

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
