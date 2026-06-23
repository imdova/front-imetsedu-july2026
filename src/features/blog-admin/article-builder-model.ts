/** Factories + defaults for the article block-builder document. */
import type { ArticleBlock, ArticleColumn, ArticleSection, BlockType } from "@/types/blog";

let seq = 0;
export const bid = (p = "b") => `${p}_${Date.now().toString(36)}_${(seq++).toString(36)}`;

export const BLOCK_PALETTE: { label: string; type: BlockType }[] = [
  { label: "Heading", type: "heading" },
  { label: "Rich text", type: "paragraph" },
  { label: "List", type: "list" },
  { label: "Checklist", type: "checklist" },
  { label: "Quote", type: "quote" },
  { label: "Image", type: "image" },
  { label: "Gallery", type: "gallery" },
  { label: "Embed", type: "embed" },
  { label: "Table", type: "table" },
  { label: "Code", type: "code" },
  { label: "Hero", type: "hero" },
  { label: "Stats", type: "stats" },
  { label: "Feature", type: "feature" },
  { label: "Testimonial", type: "testimonial" },
  { label: "Callout", type: "callout" },
  { label: "FAQ", type: "faq" },
  { label: "CTA banner", type: "cta" },
  { label: "Button", type: "button" },
  { label: "Divider", type: "divider" },
];

export function newBlock(type: BlockType): ArticleBlock {
  const base: ArticleBlock = { id: bid(), type };
  switch (type) {
    case "heading": return { ...base, level: 2, text: "Section heading" };
    case "paragraph": return { ...base, text: "Write your paragraph here. You can mention {{name}} etc." };
    case "list": return { ...base, ordered: false, items: ["First item", "Second item"] };
    case "checklist": return { ...base, items: ["Key takeaway"] };
    case "quote": return { ...base, text: "An insightful quote.", cite: "" };
    case "image": return { ...base, url: "", alt: "", caption: "" };
    case "gallery": return { ...base, images: [] };
    case "embed": return { ...base, url: "" };
    case "table": return { ...base, rows: [["Header 1", "Header 2"], ["Cell", "Cell"]] };
    case "code": return { ...base, text: "console.log('hello');", lang: "ts" };
    case "hero": return { ...base, text: "Big statement", caption: "A supporting line.", label: "Learn more", url: "#" };
    case "stats": return { ...base, metrics: [{ value: "100+", label: "Students" }] };
    case "feature": return { ...base, label: "Feature title", text: "Feature description." };
    case "testimonial": return { ...base, text: "This changed everything.", cite: "Happy reader" };
    case "callout": return { ...base, variant: "info", label: "Note", text: "Something worth noting." };
    case "faq": return { ...base, faqs: [{ q: "A question?", a: "An answer." }] };
    case "cta": return { ...base, text: "Ready to start?", label: "Enroll now", url: "#" };
    case "button": return { ...base, label: "Click here", url: "#" };
    case "divider": return { ...base };
    default: return base;
  }
}

export function newColumn(): ArticleColumn { return { id: bid("c"), blocks: [] }; }

export function newSection(columns: 1 | 2 | 3 | 4 = 1): ArticleSection {
  return { id: bid("s"), columns, bg: "default", cols: Array.from({ length: columns }, newColumn) };
}

/** Resize a section's column count, preserving blocks (merges dropped columns into the last). */
export function resizeColumns(section: ArticleSection, columns: 1 | 2 | 3 | 4): ArticleSection {
  const cols = [...section.cols];
  if (columns > cols.length) {
    while (cols.length < columns) cols.push(newColumn());
  } else if (columns < cols.length) {
    const kept = cols.slice(0, columns);
    const dropped = cols.slice(columns).flatMap((c) => c.blocks);
    kept[kept.length - 1] = { ...kept[kept.length - 1], blocks: [...kept[kept.length - 1].blocks, ...dropped] };
    return { ...section, columns, cols: kept };
  }
  return { ...section, columns, cols };
}
