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
  | "logoHeader"
  | "heading"
  | "text"
  | "button"
  | "image"
  | "divider"
  | "spacer"
  | "hero"
  | "footer"
  // ── rich content blocks ──
  | "videoCta"
  | "textImage"
  | "article"
  | "features3"
  | "features4"
  | "imageGrid"
  | "gallery"
  | "buttons"
  | "coupon"
  | "product"
  | "countdown"
  | "spotlight"
  | "coursesList"
  // ── RTL newsletter sections (editable equivalents of the hand-authored HTML) ──
  | "emailImageLogo"
  | "emailHero"
  | "emailStepper"
  | "emailText"
  | "emailList"
  | "emailCallout"
  | "emailCta"
  | "emailSignature"
  | "emailFooter"
  | "html";

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
  logoHeader: "Logo header",
  heading: "Heading",
  text: "Text",
  button: "Button",
  image: "Image",
  divider: "Divider",
  spacer: "Spacer",
  hero: "Hero",
  footer: "Footer",
  videoCta: "Highlight video",
  textImage: "Text + image",
  article: "Article layout",
  features3: "3 features",
  features4: "4 features",
  imageGrid: "Image grid",
  gallery: "Gallery",
  buttons: "Button row",
  coupon: "Coupon / voucher",
  product: "Product card",
  countdown: "Countdown",
  spotlight: "Spotlight card",
  coursesList: "Courses list",
  emailImageLogo: "Logo image (RTL)",
  emailHero: "Gradient hero (RTL)",
  emailStepper: "Progress stepper",
  emailText: "Rich text (RTL)",
  emailList: "Checklist / list",
  emailCallout: "Note callout",
  emailCta: "CTA button (RTL)",
  emailSignature: "Instructor signature",
  emailFooter: "WhatsApp footer",
  html: "Rich text",
};

let seq = 0;
export const makeBlockId = () =>
  `blk_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export function defaultProps(type: BlockType): Record<string, string | number> {
  switch (type) {
    case "header":
      return { logoSrc: `${BRAND.site}/logo-email.png`, brandTop: "IMETS", brandSub: "Medical School", bg: BRAND.blue };
    case "logoHeader":
      // A clean centered logo on a solid, fully editable background. Falls back
      // to a text wordmark when no logo image is set.
      return { logoSrc: `${BRAND.site}/logo-email.png`, bg: BRAND.blue, padding: 26, wordTop: "IMETS", wordSub: "Medical School", topColor: BRAND.gold, subColor: "#ffffff" };
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
      return {
        brandName: "IMETS Medical School",
        address: "Nasr City, Cairo, Egypt",
        phone: "+201008815007",
        email: "info@imetsacademy.com",
        facebookUrl: "https://facebook.com/imetsacademy",
        twitterUrl: "https://twitter.com/imetsacademy",
        instagramUrl: "https://instagram.com/imetsacademy",
        unsubscribeLabel: "Unsubscribe",
        unsubscribeUrl: `${BRAND.site}/unsubscribe`,
        bg: "#0b1e63", color: "#c7d2ec",
      };
    case "videoCta":
      return { thumb: "", videoUrl: BRAND.site, title: "Introducing a new program", text: "Watch a short intro and discover what makes IMETS diplomas different — live sessions with practicing consultants.", buttonLabel: "Read more", buttonUrl: BRAND.site, bg: "#ffffff", buttonBg: BRAND.blue, buttonColor: "#ffffff" };
    case "textImage":
      return { eyebrow: "New", title: "Nailing it on the head", text: "A short supporting paragraph that sits beside the image and explains the highlight in a sentence or two.", image: "", imageSide: "right" };
    case "article":
      return { title: "Get ready for the new intake", image: "", text: "Introduce the article with a clear, benefit-led paragraph. Keep it to two or three lines so the layout stays clean.", buttonLabel: "Take a closer look", buttonUrl: BRAND.site, buttonBg: BRAND.blue, buttonColor: "#ffffff" };
    case "features3":
      return {
        heading: "Features", intro: "Everything your program includes at a glance.", viewAllLabel: "View all", viewAllUrl: BRAND.site,
        f1icon: "⏱", f1color: "#16a34a", f1title: "Time saver", f1text: "Save hours with a ready structure that just works.",
        f2icon: "🎨", f2color: "#f59e0b", f2title: "Clean design", f2text: "On-brand blocks that look sharp in every inbox.",
        f3icon: "⚙️", f3color: "#ef4444", f3title: "Easy to customise", f3text: "Anyone on the team can build a perfect email.",
      };
    case "features4":
      return {
        heading: "All features", intro: "Neque porro quisquam est qui dolorem ipsum.", viewAllLabel: "View all", viewAllUrl: BRAND.site,
        f1icon: "⏱", f1color: "#16a34a", f1title: "Time saver", f1text: "A ready structure so nothing distracts the reader.",
        f2icon: "🎨", f2color: "#f59e0b", f2title: "Clean design", f2text: "Blocks that look great across desktop and mobile.",
        f3icon: "⚙️", f3color: "#ef4444", f3title: "Easy to customise", f3text: "Build a perfect newsletter with an amazing tool.",
        f4icon: "📈", f4color: "#0ea5e9", f4title: "More subscribers", f4text: "Content readers stay with, letter after letter.",
      };
    case "imageGrid":
      return { img1: "", img2: "", img3: "", img4: "" };
    case "gallery":
      return { img1: "", img2: "", img3: "" };
    case "buttons":
      return {
        count: 2,
        l1: "Button", u1: BRAND.site, bg1: BRAND.blue, color1: "#ffffff",
        l2: "Button", u2: BRAND.site, bg2: BRAND.gold, color2: BRAND.ink,
        l3: "Button", u3: BRAND.site, bg3: BRAND.blue, color3: "#ffffff",
        bg: BRAND.blue, color: "#ffffff",
      };
    case "coupon":
      return { title: "DISCOUNT / VOUCHER", greeting: "Dear Customer,", text: "Thank you for being with us. This is how we show love!", discountLabel: "-50%", codeLabel: "YOUR CODE BELOW", code: "DISCOUNT50", bg: "#2f7bff", leftBg: "#ffffff", badgeBg: "#ef4444" };
    case "product":
      return { image: "", eyebrow: "New collection", title: "Lovemyjob pink t-shirt", text: "", price: "$9.99", comparePrice: "$15.99", buttonLabel: "Shop now", buttonUrl: BRAND.site, buttonBg: BRAND.blue, buttonColor: "#ffffff" };
    case "countdown":
      return { title: "Offer ends in", endDate: "", gifUrl: "", boxBg: BRAND.ink, numColor: "#ffffff", labelColor: "#f4c430", align: "center" };
    case "spotlight":
      return { eyebrow: "", title: "Digital Marketing", text: "Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore.", buttonLabel: "Read More", buttonUrl: BRAND.site, image: "", imageSide: "left", bg: "#6f4fd8", color: "#ffffff", buttonBg: BRAND.gold, buttonColor: BRAND.ink };
    case "coursesList":
      return {
        heading: "Featured courses", count: 3, buttonBg: BRAND.blue, buttonColor: "#ffffff",
        c1img: "", c1title: "CPHQ Preparation", c1subtitle: "Healthcare Quality", c1btn: "View course", c1url: `${BRAND.site}/courses`,
        c2img: "", c2title: "CIC Certification", c2subtitle: "Infection Control", c2btn: "View course", c2url: `${BRAND.site}/courses`,
        c3img: "", c3title: "Hospital Management", c3subtitle: "Diploma", c3btn: "View course", c3url: `${BRAND.site}/courses`,
      };
    case "html":
      // Simple default so the block opens in the visual editor; authors can
      // switch to HTML mode for fully custom (table-based) sections.
      return { html: `<p>اكتب المحتوى هنا…</p>` };

    /* ── RTL newsletter sections ── */
    case "emailImageLogo":
      return { logoSrc: `${BRAND.site}/logo-email.png`, logoAlt: "IMETS Medical School", bg: "#ffffff", width: 180 };
    case "emailHero":
      return { emoji: "🎉", title: "عنوان رئيسي", pill: "نص صغير أسفل العنوان", gradFrom: "#1111D4", gradTo: "#082a6b", gradFallback: "#132a7a" };
    case "emailStepper":
      return { stepLabel: "الخطوة 2 من 3", s1text: "التسجيل", s1state: "done", s2text: "مشاهدة المحاضرة المجانية", s2state: "current", s3text: "متابعة رحلتك", s3state: "upcoming" };
    case "emailText":
      return { greeting: "مرحبًا {{FirstName}}،", body: "اكتب فقرتك هنا. اترك سطرًا فارغًا لبدء فقرة جديدة، واستخدم **النص** للخط العريض.", leadIn: "" };
    case "emailList":
      return { variant: "check", items: "العنصر الأول\nالعنصر الثاني\nالعنصر الثالث" };
    case "emailCallout":
      return { text: "⏳ ملاحظة مهمة تظهر داخل صندوق ملوّن", bg: "#fff8e6", border: "#f6e4b0", color: "#8a6d00" };
    case "emailCta":
      return { label: "▶ ابدأ الآن", url: `${BRAND.site}/free-courses/cphq-preparation`, variant: "yellow", showArrow: 1, showFallback: 1, fallbackPrompt: "لا يعمل الزر؟", fallbackLink: "اضغط هنا" };
    case "emailSignature":
      return { avatarUrl: `${BRAND.site}/instructor-cphq.webp`, signoff: "نتمنى لك رحلة موفقة،", name: "Dr. Ahmed Habib", role: "CPHQ Instructor · IMETS Medical School" };
    case "emailFooter":
      return {
        helpPrompt: "هل تحتاج مساعدة في اختيار المسار المناسب؟",
        waUrl: "https://wa.me/201142293143", waLabel: "تحدث مع أحد مستشاري IMETS",
        brandName: "IMETS Medical School", brandTagline: "المعهد الأمريكي لجودة الرعاية الصحية وإدارة المستشفيات",
        siteUrl: BRAND.site, siteLabel: "imetsedu.com", email: "hello@imetsedu.com",
        disclaimer: "لقد تلقيت هذا البريد لأنك سجّلت في المحاضرة المجانية على موقع IMETS.", unsubLabel: "إلغاء الاشتراك",
      };
  }
}

export function makeBlock(type: BlockType): Block {
  return { id: makeBlockId(), type, props: defaultProps(type) };
}

/* ── Preset library ── */
export type PresetCategory = "Headers" | "Newsletter (RTL)" | "Text" | "Content" | "Media" | "Buttons" | "Commerce" | "Interactive" | "Layout";
/** Display order of the classified library groups. */
export const PRESET_CATEGORY_ORDER: PresetCategory[] = ["Headers", "Newsletter (RTL)", "Text", "Content", "Media", "Buttons", "Commerce", "Interactive", "Layout"];

export interface Preset { id: string; label: string; category: PresetCategory; make: () => Block }
const p = (type: BlockType, label: string, category: PresetCategory, overrides: Record<string, string | number> = {}): Preset => ({
  id: `${type}-${label.toLowerCase().replace(/\s+/g, "-")}`,
  label,
  category,
  make: () => ({ id: makeBlockId(), type, props: { ...defaultProps(type), ...overrides } }),
});
export const PRESETS: Preset[] = [
  // Headers — logo on an editable solid band (change the logo image + bg colour).
  p("logoHeader", "White header + logo", "Headers", { bg: "#ffffff", logoSrc: "", topColor: BRAND.blue, subColor: BRAND.ink }),
  p("logoHeader", "Blue header + logo", "Headers", { bg: BRAND.blue, logoSrc: `${BRAND.site}/logo-email.png`, topColor: BRAND.gold, subColor: "#ffffff" }),
  // Newsletter (RTL) — Arabic email sections, each editable via fields.
  p("emailImageLogo", "Logo image", "Newsletter (RTL)"),
  p("emailHero", "Gradient hero", "Newsletter (RTL)"),
  p("emailStepper", "Progress stepper", "Newsletter (RTL)"),
  p("emailText", "Rich text", "Newsletter (RTL)"),
  p("emailList", "Checklist", "Newsletter (RTL)"),
  p("emailList", "Numbered list", "Newsletter (RTL)", { variant: "number", items: "الخطوة الأولى\nالخطوة الثانية\nالخطوة الثالثة" }),
  p("emailCallout", "Note callout", "Newsletter (RTL)"),
  p("emailCta", "CTA button (yellow)", "Newsletter (RTL)"),
  p("emailCta", "WhatsApp button", "Newsletter (RTL)", { variant: "whatsapp", label: "تحدث مع مستشار البرنامج", url: "https://wa.me/201142293143", showFallback: 0 }),
  p("emailSignature", "Instructor signature", "Newsletter (RTL)"),
  p("emailFooter", "WhatsApp footer", "Newsletter (RTL)"),
  // Text
  p("heading", "Title", "Text", { text: "Welcome to IMETS", level: 1, align: "center", color: BRAND.blue }),
  p("heading", "Subtitle", "Text", { text: "Professional diplomas & courses", level: 3, align: "center", color: "#6b7280" }),
  // Content
  p("videoCta", "Highlight video", "Content"),
  p("textImage", "Text + image (right)", "Content"),
  p("textImage", "Text + image (left)", "Content", { imageSide: "left" }),
  p("article", "Article layout", "Content"),
  p("spotlight", "Spotlight (image left)", "Content"),
  p("spotlight", "Spotlight (image right)", "Content", { title: "Content Marketing", imageSide: "right" }),
  p("coursesList", "Courses list", "Content"),
  p("features3", "Highlight 3 features", "Content"),
  p("features4", "Highlight 4 features", "Content"),
  // Media
  p("imageGrid", "Image grid", "Media"),
  p("gallery", "Gallery", "Media"),
  // Buttons
  p("button", "Blue CTA", "Buttons", { align: "center" }),
  p("button", "Gold CTA", "Buttons", { align: "center", bg: BRAND.gold, color: BRAND.ink }),
  p("buttons", "2 buttons", "Buttons"),
  p("buttons", "3 buttons", "Buttons", { count: 3 }),
  // Commerce
  p("coupon", "Coupon / voucher", "Commerce"),
  p("product", "Product card", "Commerce"),
  // Interactive
  p("countdown", "Countdown timer", "Interactive"),
  // Layout
  p("html", "Custom HTML", "Layout"),
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
/** Escaped text with a light **bold** → <strong> convention (used by RTL blocks). */
const mdBold = (v: unknown) =>
  esc(v).replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#0f172a;">$1</strong>');
/** Font stack shared by every RTL newsletter section. */
const RTL_FONT = "'Segoe UI',Tahoma,Arial,sans-serif";
/** Number-emoji markers for the ordered-list variant. */
const NUM_EMOJI = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

/* ── Rich-block render helpers (table-safe, inline-styled) ── */
const pad2 = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
/** Full-width image inside a cell, or a neutral placeholder of the given height. */
const cellImg = (src: unknown, h: number, radius = 8) =>
  src
    ? `<img src="${esc(src)}" alt="" width="100%" style="display:block;width:100%;height:auto;border-radius:${radius}px;" />`
    : `<div style="width:100%;height:${h}px;background:#eef1f6;border-radius:${radius}px;"></div>`;
const emailBtn = (label: unknown, url: unknown, bg: unknown, color: unknown) =>
  `<a href="${esc(url)}" style="display:inline-block;background:${esc(bg)};color:${esc(color)};padding:11px 22px;border-radius:8px;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;font-size:14px;">${esc(label)}</a>`;
/** One feature column: tinted icon tile + title + supporting text. */
const featureCol = (icon: unknown, color: unknown, title: unknown, text: unknown) =>
  `<div style="font-family:Arial,sans-serif;">
    <span style="display:inline-block;width:42px;height:42px;line-height:42px;text-align:center;border-radius:11px;background:${esc(color)}22;font-size:19px;">${esc(icon)}</span>
    <div style="margin:10px 0 4px;font-size:15px;font-weight:700;color:${BRAND.ink};">${esc(title)}</div>
    <div style="font-size:13px;line-height:1.55;color:#6b7280;">${esc(text)}</div>
  </div>`;
const cardOpen = (extra = "") => `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:20px 22px;${extra}">`;

export function renderBlock(b: Block): string {
  const x = b.props;
  switch (b.type) {
    case "header": {
      const logo = x.logoSrc
        ? `<img src="${esc(x.logoSrc)}" alt="${esc(x.brandTop)} ${esc(x.brandSub)}" style="max-height:44px;" />`
        : `<span style="font-family:Arial,sans-serif;font-weight:800;font-size:22px;letter-spacing:.5px;"><span style="color:${BRAND.gold};">${esc(x.brandTop)}</span> <span style="color:#ffffff;">${esc(x.brandSub)}</span></span>`;
      return `<div style="background:${esc(x.bg)};padding:22px 24px 18px;text-align:center;border-radius:10px 10px 0 0;">${logo}<div style="height:3px;width:56px;margin:14px auto 0;background:${BRAND.gold};border-radius:2px;"></div></div>`;
    }
    case "logoHeader": {
      const pad = Number(x.padding ?? 26);
      const logo = x.logoSrc
        ? `<img src="${esc(x.logoSrc)}" alt="${esc(x.wordTop)} ${esc(x.wordSub)}" style="max-height:48px;display:inline-block;" />`
        : `<span style="font-family:Arial,sans-serif;font-weight:800;font-size:22px;letter-spacing:.5px;"><span style="color:${esc(x.topColor ?? BRAND.gold)};">${esc(x.wordTop)}</span> <span style="color:${esc(x.subColor ?? "#ffffff")};">${esc(x.wordSub)}</span></span>`;
      return `<div style="background:${esc(x.bg)};padding:${pad}px 24px;text-align:center;">${logo}</div>`;
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
    case "footer": {
      // Legacy footers (saved before the contact redesign) keep their simple layout.
      if (!x.brandName) {
        return `<div style="border-top:3px solid ${BRAND.gold};background:${esc(x.bg)};padding:20px 24px;text-align:center;border-radius:0 0 10px 10px;font-family:Arial,sans-serif;"><p style="margin:0 0 6px;font-size:12px;line-height:1.6;color:${esc(x.color)};">${nl2br(x.text)}</p><a href="${esc(x.link)}" style="font-size:12px;font-weight:700;color:${BRAND.blue};text-decoration:none;">${esc(x.linkLabel)}</a></div>`;
      }
      const bg = esc(x.bg);
      const muted = esc(x.color);
      const social = (url: unknown, glyph: string) =>
        url ? `<a href="${esc(url)}" style="display:inline-block;width:30px;height:30px;line-height:30px;text-align:center;border-radius:50%;background:#ffffff;color:${bg};font-family:Arial,sans-serif;font-weight:800;font-size:14px;text-decoration:none;margin-right:8px;">${glyph}</a>` : "";
      const socials = [social(x.facebookUrl, "f"), social(x.twitterUrl, "&#120143;"), social(x.instagramUrl, "&#9673;")].join("");
      return `<div style="background:${bg};padding:26px 28px;border-radius:0 0 10px 10px;font-family:Arial,sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td valign="top">
              <div style="font-size:17px;font-weight:800;color:#ffffff;">${esc(x.brandName)}</div>
              ${x.address ? `<div style="margin-top:8px;font-size:13px;color:${muted};">${esc(x.address)}</div>` : ""}
              ${socials ? `<div style="margin-top:16px;">${socials}</div>` : ""}
            </td>
            <td valign="top" align="right">
              ${x.phone ? `<div style="font-size:13px;color:#ffffff;">${esc(x.phone)}</div>` : ""}
              ${x.email ? `<div style="margin-top:4px;font-size:13px;color:${muted};"><a href="mailto:${esc(x.email)}" style="color:${muted};text-decoration:none;">${esc(x.email)}</a></div>` : ""}
              ${x.unsubscribeUrl ? `<div style="margin-top:26px;"><a href="${esc(x.unsubscribeUrl)}" style="font-size:13px;color:#ffffff;text-decoration:underline;">${esc(x.unsubscribeLabel ?? "Unsubscribe")}</a></div>` : ""}
            </td>
          </tr>
        </table>
      </div>`;
    }

    case "videoCta": {
      const thumb = x.thumb
        ? `<img src="${esc(x.thumb)}" alt="${esc(x.title)}" width="100%" style="display:block;width:100%;height:auto;border-radius:10px 10px 0 0;" />`
        : `<div style="width:100%;height:200px;background:#dfe4ec;border-radius:10px 10px 0 0;"></div>`;
      return `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;font-family:Arial,sans-serif;margin:6px 0 16px;background:${esc(x.bg)};">
        <a href="${esc(x.videoUrl)}" style="display:block;position:relative;text-decoration:none;">
          ${thumb}
          <span style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:64px;height:64px;line-height:64px;text-align:center;border-radius:50%;background:${BRAND.blue}e6;color:#ffffff;font-size:24px;">&#9654;</span>
        </a>
        <div style="padding:22px 24px;text-align:center;">
          <div style="font-size:20px;font-weight:800;color:${BRAND.ink};margin-bottom:8px;">${esc(x.title)}</div>
          <p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#6b7280;">${nl2br(x.text)}</p>
          ${emailBtn(x.buttonLabel, x.buttonUrl, x.buttonBg ?? BRAND.blue, x.buttonColor ?? "#ffffff")}
        </div>
      </div>`;
    }

    case "textImage": {
      const textCell = `<td valign="top" width="56%" style="padding:16px 18px;font-family:Arial,sans-serif;">
        ${x.eyebrow ? `<div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:6px;">${esc(x.eyebrow)}</div>` : ""}
        <div style="font-size:17px;font-weight:800;color:${BRAND.ink};line-height:1.3;margin-bottom:8px;">${esc(x.title)}</div>
        <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">${nl2br(x.text)}</p>
      </td>`;
      const imgCell = `<td valign="top" width="44%" style="padding:16px;">${cellImg(x.image, 130, 8)}</td>`;
      const row = x.imageSide === "left" ? imgCell + textCell : textCell + imgCell;
      return `<div style="border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;margin:6px 0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${row}</tr></table>
      </div>`;
    }

    case "article":
      return `${cardOpen("text-align:center;font-family:Arial,sans-serif;margin:6px 0 16px;")}
        <div style="font-size:22px;font-weight:800;color:${BRAND.ink};line-height:1.3;margin-bottom:16px;">${esc(x.title)}</div>
        <div style="margin-bottom:16px;">${cellImg(x.image, 200, 10)}</div>
        <p style="margin:0 0 18px;font-size:14px;line-height:1.65;color:#6b7280;">${nl2br(x.text)}</p>
        ${emailBtn(x.buttonLabel, x.buttonUrl, x.buttonBg ?? BRAND.blue, x.buttonColor ?? "#ffffff")}
      </div>`;

    case "features3": {
      const cols = [1, 2, 3].map((i) =>
        `<td valign="top" width="33.33%" style="padding:6px 10px;">${featureCol(x[`f${i}icon`], x[`f${i}color`], x[`f${i}title`], x[`f${i}text`])}</td>`,
      ).join("");
      return `${cardOpen("font-family:Arial,sans-serif;margin:6px 0 16px;")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:18px;font-weight:800;color:${BRAND.ink};">${esc(x.heading)}</td>
          <td align="right"><a href="${esc(x.viewAllUrl)}" style="font-size:12px;color:#6b7280;text-decoration:none;background:#f3f4f6;padding:5px 12px;border-radius:6px;">${esc(x.viewAllLabel)}</a></td>
        </tr></table>
        <p style="margin:6px 0 16px;font-size:13px;color:#9aa4b2;">${esc(x.intro)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cols}</tr></table>
      </div>`;
    }

    case "features4": {
      const cell = (i: number) => `<td valign="top" width="50%" style="padding:10px 12px;">${featureCol(x[`f${i}icon`], x[`f${i}color`], x[`f${i}title`], x[`f${i}text`])}</td>`;
      return `${cardOpen("font-family:Arial,sans-serif;margin:6px 0 16px;")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td style="font-size:18px;font-weight:800;color:${BRAND.ink};">${esc(x.heading)}</td>
          <td align="right"><a href="${esc(x.viewAllUrl)}" style="font-size:12px;color:#6b7280;text-decoration:none;background:#f3f4f6;padding:5px 12px;border-radius:6px;">${esc(x.viewAllLabel)}</a></td>
        </tr></table>
        <p style="margin:6px 0 12px;font-size:13px;color:#9aa4b2;">${esc(x.intro)}</p>
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>${cell(1)}${cell(2)}</tr>
          <tr>${cell(3)}${cell(4)}</tr>
        </table>
      </div>`;
    }

    case "imageGrid":
      return `<div style="margin:6px 0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="33.33%" style="padding:4px;">${cellImg(x.img1, 90)}</td>
            <td width="33.33%" style="padding:4px;">${cellImg(x.img2, 90)}</td>
            <td width="33.33%" style="padding:4px;">${cellImg(x.img3, 90)}</td>
          </tr>
          <tr><td colspan="3" style="padding:4px;">${cellImg(x.img4, 150)}</td></tr>
        </table>
      </div>`;

    case "gallery":
      return `<div style="margin:6px 0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td width="62%" rowspan="2" valign="top" style="padding:4px;">${cellImg(x.img1, 190)}</td>
            <td width="38%" valign="top" style="padding:4px;">${cellImg(x.img2, 90)}</td>
          </tr>
          <tr><td valign="top" style="padding:4px;">${cellImg(x.img3, 90)}</td></tr>
        </table>
      </div>`;

    case "buttons": {
      const n = Number(x.count) === 3 ? 3 : 2;
      const cells = Array.from({ length: n }, (_, i) => {
        const k = i + 1;
        const bg = x[`bg${k}`] ?? x.bg ?? BRAND.blue;
        const color = x[`color${k}`] ?? x.color ?? "#ffffff";
        return `<td align="center" width="${Math.floor(100 / n)}%" style="padding:0 6px;">${emailBtn(x[`l${k}`], x[`u${k}`], bg, color)}</td>`;
      }).join("");
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;"><tr>${cells}</tr></table>`;
    }

    case "coupon":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 16px;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
        <tr>
          <td valign="middle" width="52%" style="background:${esc(x.leftBg)};padding:26px 24px;font-family:Arial,sans-serif;">
            <div style="font-size:19px;font-weight:800;color:${BRAND.ink};line-height:1.25;margin-bottom:14px;">${esc(x.title)}</div>
            <div style="font-size:14px;font-weight:700;color:${BRAND.ink};margin-bottom:6px;">${esc(x.greeting)}</div>
            <p style="margin:0;font-size:13px;line-height:1.6;color:#6b7280;">${nl2br(x.text)}</p>
          </td>
          <td valign="middle" width="48%" align="center" style="background:${esc(x.bg)};padding:26px 20px;font-family:Arial,sans-serif;">
            <div style="display:inline-block;background:${esc(x.badgeBg)};color:#ffffff;font-size:22px;font-weight:800;padding:8px 18px;border-radius:8px;">${esc(x.discountLabel)}</div>
            <div style="margin:16px 0 8px;font-size:11px;letter-spacing:1px;color:#ffffff;opacity:.85;">${esc(x.codeLabel)}</div>
            <div style="background:#ffffff;border-radius:6px;padding:10px 16px;font-size:15px;font-weight:800;letter-spacing:1px;color:${BRAND.ink};display:inline-block;">${esc(x.code)}</div>
          </td>
        </tr>
      </table>`;

    case "product":
      return `${cardOpen("padding:0;overflow:hidden;margin:6px 0 16px;")}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
          <td width="42%" valign="middle" style="padding:16px;">${cellImg(x.image, 150, 10)}</td>
          <td width="58%" valign="middle" style="padding:16px 20px;font-family:Arial,sans-serif;">
            ${x.eyebrow ? `<div style="font-size:12px;font-weight:700;color:#16a34a;margin-bottom:6px;">${esc(x.eyebrow)}</div>` : ""}
            <div style="font-size:17px;font-weight:800;color:${BRAND.ink};line-height:1.3;margin-bottom:10px;">${esc(x.title)}</div>
            <div style="margin-bottom:14px;">
              <span style="font-size:18px;font-weight:800;color:${BRAND.ink};">${esc(x.price)}</span>
              ${x.comparePrice ? `<span style="font-size:14px;color:#9aa4b2;text-decoration:line-through;margin-left:8px;">${esc(x.comparePrice)}</span>` : ""}
            </div>
            ${emailBtn(x.buttonLabel, x.buttonUrl, x.buttonBg ?? BRAND.blue, x.buttonColor ?? "#ffffff")}
          </td>
        </tr></table>
      </div>`;

    case "countdown": {
      const align = String(x.align ?? "center");
      const heading = x.title
        ? `<div style="margin-bottom:12px;font-family:Arial,sans-serif;font-size:14px;font-weight:700;color:${BRAND.ink};">${esc(x.title)}</div>`
        : "";
      if (x.gifUrl) {
        return `<div style="text-align:${align};margin:8px 0 16px;">${heading}<img src="${esc(x.gifUrl)}" alt="Countdown" style="display:inline-block;max-width:100%;" /></div>`;
      }
      const ms = x.endDate ? Date.parse(String(x.endDate)) : NaN;
      let diff = Number.isFinite(ms) ? Math.max(0, ms - Date.now()) / 1000 : 0;
      const d = Math.floor(diff / 86400); diff %= 86400;
      const h = Math.floor(diff / 3600); diff %= 3600;
      const m = Math.floor(diff / 60); const s = Math.floor(diff % 60);
      const box = (val: string, lab: string) => `<td align="center" style="padding:0 5px;">
        <div style="background:${esc(x.boxBg)};border-radius:11px;padding:12px 4px;min-width:58px;">
          <div style="font-family:Arial,sans-serif;font-size:26px;font-weight:800;color:${esc(x.numColor)};line-height:1;">${val}</div>
        </div>
        <div style="margin-top:6px;font-family:Arial,sans-serif;font-size:10px;letter-spacing:1px;text-transform:uppercase;color:${esc(x.labelColor)};">${lab}</div>
      </td>`;
      return `<div style="text-align:${align};margin:8px 0 16px;">
        ${heading}
        <table role="presentation" cellpadding="0" cellspacing="0" style="display:inline-table;"><tr>
          ${box(pad2(d), "Days")}${box(pad2(h), "Hours")}${box(pad2(m), "Mins")}${box(pad2(s), "Secs")}
        </tr></table>
      </div>`;
    }

    case "spotlight": {
      const panel = `<td valign="middle" width="55%" style="padding:26px 28px;background:${esc(x.bg)};border-radius:14px;font-family:Arial,sans-serif;">
        ${x.eyebrow ? `<div style="font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:${esc(x.color)};opacity:.8;margin-bottom:8px;">${esc(x.eyebrow)}</div>` : ""}
        <div style="font-size:21px;font-weight:800;color:${esc(x.color)};line-height:1.25;margin-bottom:10px;">${esc(x.title)}</div>
        <p style="margin:0 0 18px;font-size:13px;line-height:1.6;color:${esc(x.color)};opacity:.92;">${nl2br(x.text)}</p>
        ${emailBtn(x.buttonLabel, x.buttonUrl, x.buttonBg ?? BRAND.gold, x.buttonColor ?? BRAND.ink)}
      </td>`;
      const img = `<td valign="middle" width="45%" style="padding:8px;">${cellImg(x.image, 170, 12)}</td>`;
      const row = x.imageSide === "right" ? panel + img : img + panel;
      return `<div style="margin:6px 0 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${row}</tr></table>
      </div>`;
    }

    case "coursesList": {
      const n = Number(x.count) === 2 ? 2 : 3;
      // One course per row: title / subtitle / button on the left, image (r=50) on the right.
      const item = (i: number) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border:1px solid #e5e7eb;border-radius:14px;">
        <tr>
          <td valign="middle" width="55%" style="padding:16px 18px;font-family:Arial,sans-serif;">
            <div style="font-size:16px;font-weight:800;color:${BRAND.ink};line-height:1.3;">${esc(x[`c${i}title`])}</div>
            <div style="margin-top:4px;font-size:13px;color:#6b7280;">${esc(x[`c${i}subtitle`])}</div>
            <div style="margin-top:12px;">${emailBtn(x[`c${i}btn`], x[`c${i}url`], x.buttonBg ?? BRAND.blue, x.buttonColor ?? "#ffffff")}</div>
          </td>
          <td valign="middle" width="45%" style="padding:12px;">${cellImg(x[`c${i}img`], 110, 10)}</td>
        </tr>
      </table>`;
      const items = Array.from({ length: n }, (_, i) => item(i + 1)).join("");
      return `<div style="margin:6px 0 16px;">
        ${x.heading ? `<div style="font-family:Arial,sans-serif;font-size:18px;font-weight:800;color:${BRAND.ink};margin-bottom:10px;">${esc(x.heading)}</div>` : ""}
        ${items}
      </div>`;
    }
    /* ── RTL newsletter sections (byte-compatible with the hand-authored HTML) ── */
    case "emailImageLogo":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td align="center" style="padding:22px 24px 14px;background:${esc(x.bg)};"><img src="${esc(x.logoSrc)}" alt="${esc(x.logoAlt)}" width="${esc(x.width)}" style="display:block;height:auto;border:0;"></td></tr></table>`;

    case "emailHero":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(135deg,${esc(x.gradFrom)} 0%,${esc(x.gradTo)} 100%);background-color:${esc(x.gradFallback)};font-family:${RTL_FONT};direction:rtl;"><tr><td align="center" style="padding:34px 28px 30px;"><div style="font-size:44px;line-height:1;margin-bottom:10px;">${esc(x.emoji)}</div><div style="color:#ffffff;font-size:24px;font-weight:800;line-height:1.35;">${esc(x.title)}</div><div style="display:inline-block;margin-top:12px;background:rgba(255,255,255,0.14);color:#ffffff;font-size:13px;font-weight:600;padding:7px 16px;border-radius:999px;">${esc(x.pill)}</div></td></tr></table>`;

    case "emailStepper": {
      const st = (s: unknown) => s === "done" ? { i: "✔", c: "#16a34a", w: 700 } : s === "upcoming" ? { i: "◻", c: "#94a3b8", w: 600 } : { i: "▶", c: "#1111D4", w: 800 };
      const row = (t: unknown, s: unknown) => { const { i, c, w } = st(s); return `<div style="color:${c};font-size:14px;font-weight:${w};padding:3px 0;">${i}&nbsp;&nbsp;${esc(t)}</div>`; };
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td style="padding:22px 30px 0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fd;border:1px solid #e2e8f5;border-radius:12px;"><tr><td style="padding:14px 18px;"><div style="color:#1111D4;font-size:11px;font-weight:800;letter-spacing:.4px;margin-bottom:9px;">${esc(x.stepLabel)}</div>${row(x.s1text, x.s1state)}${row(x.s2text, x.s2state)}${row(x.s3text, x.s3state)}</td></tr></table></td></tr></table>`;
    }

    case "emailText": {
      const greeting = x.greeting ? `<p style="margin:0 0 6px;color:#0f172a;font-size:17px;font-weight:800;">${esc(x.greeting)}</p>` : "";
      const paras = String(x.body ?? "").split(/\n{2,}/).map((t) => t.trim()).filter(Boolean)
        .map((t) => `<p style="margin:0 0 12px;color:#334155;font-size:15px;line-height:1.9;">${mdBold(t).replace(/\n/g, "<br>")}</p>`).join("");
      const leadIn = x.leadIn ? `<p style="margin:0 0 12px;color:#0f172a;font-size:15px;font-weight:700;">${esc(x.leadIn)}</p>` : "";
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td style="padding:20px 30px 2px;">${greeting}${paras}${leadIn}</td></tr></table>`;
    }

    case "emailList": {
      const items = String(x.items ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
      const isNum = x.variant === "number";
      const rows = items.map((it, i) => {
        const border = i > 0 ? "border-top:1px solid #e7edf8;" : "";
        return isNum
          ? `<tr><td style="padding:11px 12px;color:#1e293b;font-size:14.5px;line-height:1.75;${border}"><span style="font-size:16px;">${NUM_EMOJI[i] ?? `${i + 1}.`}</span>&nbsp;&nbsp;${mdBold(it)}</td></tr>`
          : `<tr><td style="padding:9px 12px;color:#1e293b;font-size:14.5px;line-height:1.7;${border}"><span style="color:#16a34a;font-weight:800;">✓</span>&nbsp;&nbsp;${mdBold(it)}</td></tr>`;
      }).join("");
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td style="padding:10px 30px 2px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7fd;border:1px solid #e2e8f5;border-radius:14px;padding:6px 8px;">${rows}</table></td></tr></table>`;
    }

    case "emailCallout":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td style="padding:16px 30px 2px;"><div style="background:${esc(x.bg ?? "#fff8e6")};border:1px solid ${esc(x.border ?? "#f6e4b0")};border-radius:10px;padding:11px 14px;color:${esc(x.color ?? "#8a6d00")};font-size:13px;font-weight:700;text-align:center;line-height:1.6;">${esc(x.text)}</div></td></tr></table>`;

    case "emailCta": {
      const isWa = x.variant === "whatsapp";
      const bg = isWa ? "#25D366" : "#f4c430";
      const color = isWa ? "#ffffff" : "#0a1424";
      const pad = isWa ? "15px 34px" : "15px 40px";
      const shadow = isWa ? "0 6px 16px rgba(37,211,102,0.35)" : "0 6px 16px rgba(244,196,48,0.35)";
      const icon = isWa ? `<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/48px-WhatsApp.svg.png" width="20" height="20" alt="WhatsApp" style="vertical-align:middle;border:0;margin-left:8px;">` : "";
      const arrow = Number(x.showArrow ?? 1) ? `<div style="color:#64748b;font-size:22px;line-height:1;margin-bottom:8px;">👇</div>` : "";
      const fallback = Number(x.showFallback ?? (isWa ? 0 : 1))
        ? `<p style="margin:14px 0 0;text-align:center;color:#cbd5e1;font-size:11px;line-height:1.6;">${esc(x.fallbackPrompt ?? "لا يعمل الزر؟")} <a href="${esc(x.url)}" target="_blank" style="color:#94a3b8;text-decoration:underline;">${esc(x.fallbackLink ?? "اضغط هنا")}</a></p>`
        : "";
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td align="center" style="padding:18px 30px 8px;">${arrow}<a href="${esc(x.url)}" target="_blank" style="display:inline-block;background:${bg};color:${color};font-size:16px;font-weight:800;text-decoration:none;padding:${pad};border-radius:12px;box-shadow:${shadow};">${icon}${esc(x.label)}</a>${fallback}</td></tr></table>`;
    }

    case "emailSignature":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td style="padding:16px 30px 8px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #eef2f9;"><tr><td width="60" valign="middle" style="padding-top:16px;width:60px;"><img src="${esc(x.avatarUrl)}" width="52" height="52" alt="${esc(x.name)}" style="display:block;width:52px;height:52px;border-radius:50%;object-fit:cover;object-position:top;border:2px solid #e2e8f5;"></td><td valign="middle" style="padding-top:16px;padding-right:12px;"><div style="color:#334155;font-size:13px;line-height:1.5;">${esc(x.signoff)}</div><div style="color:#0f172a;font-size:15px;font-weight:800;line-height:1.4;">${esc(x.name)}</div><div style="color:#64748b;font-size:12px;line-height:1.5;">${esc(x.role)}</div></td></tr></table></td></tr></table>`;

    case "emailFooter":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-family:${RTL_FONT};direction:rtl;"><tr><td style="padding:16px 30px 28px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e8f1fd;border:1px solid #d3e2fb;border-radius:14px;"><tr><td align="center" style="padding:24px 24px 22px;"><div style="color:#334155;font-size:13px;font-weight:600;margin-bottom:10px;">${esc(x.helpPrompt)}</div><a href="${esc(x.waUrl)}" target="_blank" style="display:inline-block;background:#25D366;color:#ffffff;font-size:14px;font-weight:800;text-decoration:none;padding:11px 24px;border-radius:10px;box-shadow:0 4px 12px rgba(37,211,102,0.35);"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/48px-WhatsApp.svg.png" width="18" height="18" alt="WhatsApp" style="vertical-align:middle;border:0;margin-left:8px;">${esc(x.waLabel)}</a><div style="margin-top:20px;color:#0f172a;font-size:15px;font-weight:800;">${esc(x.brandName)}</div><div style="color:#64748b;font-size:12px;line-height:1.8;">${esc(x.brandTagline)}</div><div style="margin-top:10px;"><a href="${esc(x.siteUrl)}" style="color:#1111D4;font-size:12px;text-decoration:none;font-weight:700;">${esc(x.siteLabel)}</a><span style="color:#94a3b8;">&nbsp;•&nbsp;</span><a href="mailto:${esc(x.email)}" style="color:#475569;font-size:12px;text-decoration:none;">${esc(x.email)}</a></div><div style="margin-top:14px;color:#94a3b8;font-size:11px;line-height:1.8;">${esc(x.disclaimer)}<br><a href="{{UnsubscribeURL}}" style="color:#94a3b8;text-decoration:underline;">${esc(x.unsubLabel)}</a></div></td></tr></table></td></tr></table>`;

    case "html": {
      // Content authored in the Rich-text (visual) mode is plain semantic HTML
      // with no inline styles, so wrap it in the newsletter RTL font/direction.
      // Custom table markup (HTML mode) sets its own styles and just inherits.
      return `<div style="font-family:${RTL_FONT};direction:rtl;font-size:15px;line-height:1.7;color:#374151;">${String(x.html ?? "")}</div>`;
    }
  }
}

/** A block that paints its own full-width band (no side padding around it). */
const RTL_SECTIONS: BlockType[] = ["emailImageLogo", "emailHero", "emailStepper", "emailText", "emailList", "emailCallout", "emailCta", "emailSignature", "emailFooter"];
const isFullBleed = (t: BlockType) =>
  t === "header" || t === "logoHeader" || t === "footer" || t === "hero" || t === "html" || RTL_SECTIONS.includes(t);

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
