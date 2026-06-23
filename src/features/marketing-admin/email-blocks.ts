/**
 * Email block model + HTML renderer + preset library for the email builder.
 * A "design" is persisted as a JSON string ({ blocks, settings }); `body` is the
 * rendered HTML produced by `renderDesign`. Block props are kept as a loose
 * record so the per-block editor can stay generic.
 */

export type BlockType =
  | "heading" | "text" | "button" | "image" | "divider" | "spacer" | "hero";

export interface Block {
  id: string;
  type: BlockType;
  props: Record<string, string | number>;
}

export interface DesignSettings {
  background: string;
  contentBackground: string;
  width: number;
}

export interface Design {
  blocks: Block[];
  settings: DesignSettings;
}

export const DEFAULT_SETTINGS: DesignSettings = {
  background: "#f4f4f5",
  contentBackground: "#ffffff",
  width: 600,
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  heading: "Heading",
  text: "Text",
  button: "Button",
  image: "Image",
  divider: "Divider",
  spacer: "Spacer",
  hero: "Hero",
};

let seq = 0;
export const makeBlockId = () =>
  `blk_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export function defaultProps(type: BlockType): Record<string, string | number> {
  switch (type) {
    case "heading": return { text: "Your heading", level: 2, align: "left", color: "#111827" };
    case "text": return { text: "Write your message here. You can use {{name}} to personalize.", align: "left", color: "#374151" };
    case "button": return { label: "Call to action", url: "https://imetsedu.com", bg: "#4f46e5", color: "#ffffff", align: "center" };
    case "image": return { src: "", alt: "", align: "center", width: 100 };
    case "divider": return { color: "#e5e7eb" };
    case "spacer": return { height: 24 };
    case "hero": return { title: "Big announcement", subtitle: "A short supporting line.", bg: "#4f46e5", color: "#ffffff", buttonLabel: "Learn more", buttonUrl: "https://imetsedu.com" };
  }
}

export function makeBlock(type: BlockType): Block {
  return { id: makeBlockId(), type, props: defaultProps(type) };
}

/* ── Preset library (a representative subset of the spec's catalog) ── */
export interface Preset { id: string; label: string; make: () => Block }
const p = (type: BlockType, label: string, overrides: Record<string, string | number> = {}): Preset => ({
  id: `${type}-${label.toLowerCase().replace(/\s+/g, "-")}`,
  label,
  make: () => ({ id: makeBlockId(), type, props: { ...defaultProps(type), ...overrides } }),
});
export const PRESETS: Preset[] = [
  p("hero", "Hero + button"),
  p("heading", "Title", { text: "Welcome to IMETS", level: 1, align: "center" }),
  p("heading", "Subtitle", { text: "Professional diplomas & courses", level: 3, align: "center", color: "#6b7280" }),
  p("text", "Paragraph"),
  p("button", "CTA center", { align: "center" }),
  p("image", "Image"),
  p("divider", "Divider"),
  p("spacer", "Spacer"),
];

/* ── Render ── */
const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function renderBlock(b: Block): string {
  const x = b.props;
  switch (b.type) {
    case "heading": {
      const size = x.level === 1 ? 28 : x.level === 3 ? 18 : 22;
      return `<h${x.level === 1 ? 1 : x.level === 3 ? 3 : 2} style="margin:0 0 12px;font-size:${size}px;text-align:${esc(x.align)};color:${esc(x.color)};font-family:Arial,sans-serif;">${esc(x.text)}</h${x.level === 1 ? 1 : x.level === 3 ? 3 : 2}>`;
    }
    case "text":
      return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;text-align:${esc(x.align)};color:${esc(x.color)};font-family:Arial,sans-serif;">${esc(x.text)}</p>`;
    case "button":
      return `<div style="text-align:${esc(x.align)};margin:8px 0 16px;"><a href="${esc(x.url)}" style="display:inline-block;background:${esc(x.bg)};color:${esc(x.color)};padding:12px 22px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:600;">${esc(x.label)}</a></div>`;
    case "image":
      return x.src ? `<div style="text-align:${esc(x.align)};margin:8px 0;"><img src="${esc(x.src)}" alt="${esc(x.alt)}" style="max-width:${esc(x.width)}%;border-radius:6px;" /></div>` : `<div style="margin:8px 0;padding:24px;text-align:center;background:#f3f4f6;color:#9ca3af;font-family:Arial,sans-serif;font-size:13px;border-radius:6px;">Image placeholder</div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${esc(x.color)};margin:16px 0;" />`;
    case "spacer":
      return `<div style="height:${esc(x.height)}px;line-height:${esc(x.height)}px;font-size:1px;">&nbsp;</div>`;
    case "hero":
      return `<div style="background:${esc(x.bg)};color:${esc(x.color)};padding:32px 24px;text-align:center;border-radius:10px;margin-bottom:16px;font-family:Arial,sans-serif;"><h1 style="margin:0 0 8px;font-size:26px;">${esc(x.title)}</h1><p style="margin:0 0 16px;opacity:.9;">${esc(x.subtitle)}</p><a href="${esc(x.buttonUrl)}" style="display:inline-block;background:${esc(x.color)};color:${esc(x.bg)};padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:600;">${esc(x.buttonLabel)}</a></div>`;
  }
}

export function renderDesign(design: Design): string {
  const { blocks, settings } = design;
  const inner = blocks.map(renderBlock).join("\n");
  return `<div style="background:${esc(settings.background)};padding:24px 0;">
  <div style="max-width:${esc(settings.width)}px;margin:0 auto;background:${esc(settings.contentBackground)};padding:24px;border-radius:10px;">
${inner}
  </div>
</div>`;
}

export function parseDesign(raw?: string | null): Design {
  if (raw) {
    try {
      const d = JSON.parse(raw) as Partial<Design>;
      if (Array.isArray(d.blocks)) {
        return { blocks: d.blocks, settings: { ...DEFAULT_SETTINGS, ...(d.settings ?? {}) } };
      }
    } catch { /* fall through */ }
  }
  return { blocks: [], settings: { ...DEFAULT_SETTINGS } };
}
