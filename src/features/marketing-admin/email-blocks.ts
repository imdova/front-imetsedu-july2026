/**
 * Email block model + HTML renderer + preset library for the email builder.
 * A "design" is persisted as a JSON string ({ blocks, settings }); `body` is the
 * rendered HTML produced by `renderDesign`. Block props are kept as a loose
 * record so the per-block editor can stay generic.
 *
 * Everything renders to table-safe, inline-styled HTML with brand colours
 * (IMETS blue + gold) so emails look on-brand in every client.
 */

/** IMETS brand identity — the single source of truth for email colours. */
export const BRAND = {
  blue: "#0b3fa8",
  blueDark: "#082a6b",
  gold: "#f4c430",
  ink: "#0a1424",
  site: "https://imetsedu.com",
};

/** Merge tags the send step fills per recipient (see backend sendBulk). */
export const PERSONALIZATION_TOKENS: { token: string; label: string }[] = [
  { token: "{{firstName}}", label: "First name" },
  { token: "{{name}}", label: "Full name" },
  { token: "{{email}}", label: "Email" },
];

export type BlockType =
  | "header"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "divider"
  | "spacer"
  | "hero"
  | "footer";

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
  background: "#eef2f9",
  contentBackground: "#ffffff",
  width: 600,
};

export const BLOCK_LABELS: Record<BlockType, string> = {
  header: "Brand header",
  heading: "Heading",
  text: "Text",
  button: "Button",
  image: "Image",
  divider: "Divider",
  spacer: "Spacer",
  hero: "Hero",
  footer: "Footer",
};

let seq = 0;
export const makeBlockId = () =>
  `blk_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export function defaultProps(type: BlockType): Record<string, string | number> {
  switch (type) {
    case "header":
      return { logoSrc: "", brandTop: "IMETS", brandSub: "Medical School", bg: BRAND.blue };
    case "heading":
      return { text: "Your heading", level: 2, align: "left", color: BRAND.ink };
    case "text":
      return { text: "Hello {{firstName}},\n\nWrite your message here. Use the personalization tags to greet each recipient by name.", align: "left", color: "#374151" };
    case "button":
      return { label: "Call to action", url: BRAND.site, bg: BRAND.blue, color: "#ffffff", align: "center" };
    case "image":
      return { src: "", alt: "", align: "center", width: 100 };
    case "divider":
      return { color: "#e5e7eb" };
    case "spacer":
      return { height: 24 };
    case "hero":
      return { title: "Big announcement", subtitle: "A short supporting line.", bg: BRAND.blue, color: "#ffffff", buttonLabel: "Learn more", buttonUrl: BRAND.site, buttonBg: BRAND.gold, buttonColor: BRAND.ink };
    case "footer":
      return { text: "IMETS Medical School — live online healthcare diplomas & certifications.", link: BRAND.site, linkLabel: "imetsedu.com", bg: "#f6f8fc", color: "#6b7280" };
  }
}

export function makeBlock(type: BlockType): Block {
  return { id: makeBlockId(), type, props: defaultProps(type) };
}

/* ── Preset library ── */
export interface Preset { id: string; label: string; make: () => Block }
const p = (type: BlockType, label: string, overrides: Record<string, string | number> = {}): Preset => ({
  id: `${type}-${label.toLowerCase().replace(/\s+/g, "-")}`,
  label,
  make: () => ({ id: makeBlockId(), type, props: { ...defaultProps(type), ...overrides } }),
});
export const PRESETS: Preset[] = [
  p("header", "Brand header"),
  p("hero", "Hero (blue + gold)"),
  p("heading", "Title", { text: "Welcome to IMETS", level: 1, align: "center", color: BRAND.blue }),
  p("heading", "Subtitle", { text: "Professional diplomas & courses", level: 3, align: "center", color: "#6b7280" }),
  p("text", "Paragraph"),
  p("button", "Blue CTA", { align: "center" }),
  p("button", "Gold CTA", { align: "center", bg: BRAND.gold, color: BRAND.ink }),
  p("image", "Image"),
  p("divider", "Divider"),
  p("spacer", "Spacer"),
  p("footer", "Footer"),
];

/**
 * A ready-made, on-brand starter template. Fresh block ids each call so it can
 * be loaded straight into the builder.
 */
export function brandStarter(): Design {
  const b = (type: BlockType, overrides: Record<string, string | number> = {}): Block => ({
    id: makeBlockId(),
    type,
    props: { ...defaultProps(type), ...overrides },
  });
  return {
    settings: { ...DEFAULT_SETTINGS },
    blocks: [
      b("header"),
      b("hero", {
        title: "Your journey in healthcare starts here",
        subtitle: "Live online diplomas & international certification prep.",
        buttonLabel: "Explore programs",
        buttonUrl: `${BRAND.site}/courses`,
      }),
      b("text", { text: "Hi {{firstName}},\n\nThank you for your interest in IMETS Medical School. Our programs are taught live by practicing consultants, in Arabic and English." }),
      b("button", { label: "Reserve your seat", url: `${BRAND.site}/courses`, bg: BRAND.gold, color: BRAND.ink, align: "center" }),
      b("divider"),
      b("text", { text: "Questions? Just reply to this email and an advisor will help you choose the right program.", align: "center", color: "#6b7280" }),
      b("footer"),
    ],
  };
}

/* ── Render ── */
const esc = (v: unknown) =>
  String(v ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
/** Preserve line breaks from textarea input in HTML output. */
const nl2br = (v: unknown) => esc(v).replace(/\n/g, "<br>");

export function renderBlock(b: Block): string {
  const x = b.props;
  switch (b.type) {
    case "header": {
      const logo = x.logoSrc
        ? `<img src="${esc(x.logoSrc)}" alt="${esc(x.brandTop)} ${esc(x.brandSub)}" style="max-height:44px;" />`
        : `<span style="font-family:Arial,sans-serif;font-weight:800;font-size:22px;letter-spacing:.5px;"><span style="color:${BRAND.gold};">${esc(x.brandTop)}</span> <span style="color:#ffffff;">${esc(x.brandSub)}</span></span>`;
      return `<div style="background:${esc(x.bg)};padding:22px 24px 18px;text-align:center;border-radius:10px 10px 0 0;">${logo}<div style="height:3px;width:56px;margin:14px auto 0;background:${BRAND.gold};border-radius:2px;"></div></div>`;
    }
    case "heading": {
      const size = x.level === 1 ? 28 : x.level === 3 ? 18 : 22;
      const lvl = x.level === 1 ? 1 : x.level === 3 ? 3 : 2;
      return `<h${lvl} style="margin:0 0 12px;font-size:${size}px;text-align:${esc(x.align)};color:${esc(x.color)};font-family:Arial,sans-serif;">${esc(x.text)}</h${lvl}>`;
    }
    case "text":
      return `<p style="margin:0 0 12px;font-size:15px;line-height:1.6;text-align:${esc(x.align)};color:${esc(x.color)};font-family:Arial,sans-serif;">${nl2br(x.text)}</p>`;
    case "button":
      return `<div style="text-align:${esc(x.align)};margin:8px 0 16px;"><a href="${esc(x.url)}" style="display:inline-block;background:${esc(x.bg)};color:${esc(x.color)};padding:12px 24px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;">${esc(x.label)}</a></div>`;
    case "image":
      return x.src ? `<div style="text-align:${esc(x.align)};margin:8px 0;"><img src="${esc(x.src)}" alt="${esc(x.alt)}" style="max-width:${esc(x.width)}%;border-radius:6px;" /></div>` : `<div style="margin:8px 0;padding:24px;text-align:center;background:#f3f4f6;color:#9ca3af;font-family:Arial,sans-serif;font-size:13px;border-radius:6px;">Image placeholder</div>`;
    case "divider":
      return `<hr style="border:none;border-top:1px solid ${esc(x.color)};margin:16px 0;" />`;
    case "spacer":
      return `<div style="height:${esc(x.height)}px;line-height:${esc(x.height)}px;font-size:1px;">&nbsp;</div>`;
    case "hero":
      return `<div style="background:${esc(x.bg)};color:${esc(x.color)};padding:38px 24px;text-align:center;border-radius:10px;margin-bottom:16px;font-family:Arial,sans-serif;"><h1 style="margin:0 0 10px;font-size:26px;line-height:1.25;">${esc(x.title)}</h1><p style="margin:0 0 20px;font-size:15px;opacity:.9;">${esc(x.subtitle)}</p><a href="${esc(x.buttonUrl)}" style="display:inline-block;background:${esc(x.buttonBg ?? BRAND.gold)};color:${esc(x.buttonColor ?? BRAND.ink)};padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">${esc(x.buttonLabel)}</a></div>`;
    case "footer":
      return `<div style="border-top:3px solid ${BRAND.gold};background:${esc(x.bg)};padding:20px 24px;text-align:center;border-radius:0 0 10px 10px;font-family:Arial,sans-serif;"><p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${esc(x.color)};">${nl2br(x.text)}</p><a href="${esc(x.link)}" style="font-size:12px;font-weight:700;color:${BRAND.blue};text-decoration:none;">${esc(x.linkLabel)}</a></div>`;
  }
}

/** A block that paints its own full-width band (no side padding around it). */
const isFullBleed = (t: BlockType) => t === "header" || t === "footer" || t === "hero";

export function renderDesign(design: Design): string {
  const { blocks, settings } = design;
  // Full-bleed blocks (header/footer/hero) render edge-to-edge; the rest sit in a
  // padded content band so text never touches the card edge.
  let out = "";
  let i = 0;
  while (i < blocks.length) {
    if (isFullBleed(blocks[i].type)) {
      out += renderBlock(blocks[i]);
      i++;
    } else {
      let group = "";
      while (i < blocks.length && !isFullBleed(blocks[i].type)) {
        group += renderBlock(blocks[i]);
        i++;
      }
      out += `<div style="padding:24px 28px;">${group}</div>`;
    }
  }
  return `<div style="background:${esc(settings.background)};padding:24px 12px;font-family:Arial,sans-serif;">
  <div style="max-width:${esc(settings.width)}px;margin:0 auto;background:${esc(settings.contentBackground)};border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(10,20,36,.06);">
${out}
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
