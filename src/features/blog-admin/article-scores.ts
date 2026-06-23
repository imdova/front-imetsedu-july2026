/**
 * Dependency-free article scoring (ported from the spec §6). Works off a
 * BlogPost's block `sections[]` or the legacy `content` HTML.
 */
import type { BlogPost } from "@/types/blog";

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

/** Flatten all readable text from a post (blocks or legacy HTML). */
export function extractText(post: BlogPost): string {
  if (post.sections && post.sections.length) {
    const parts: string[] = [];
    for (const s of post.sections)
      for (const c of s.cols)
        for (const b of c.blocks) {
          if (b.text) parts.push(b.text);
          if (b.html) parts.push(b.html.replace(/<[^>]*>/g, " "));
          if (b.caption) parts.push(b.caption);
          if (b.items?.length) parts.push(...b.items);
          if (b.rows?.length) parts.push(...b.rows.flat());
          if (b.faqs?.length) for (const f of b.faqs) parts.push(f.q, f.a);
        }
    return parts.join(" ");
  }
  return (post.content || "").replace(/<[^>]*>/g, " ");
}

/** Rough syllable estimator for the Flesch formula. */
function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return w.length ? 1 : 0;
  const trimmed = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  const m = trimmed.match(/[aeiouy]{1,2}/g);
  return m ? m.length : 1;
}

export interface ReadabilityResult { score: number; label: string; words: number }

/** Flesch Reading Ease (0–100). */
export function readability(post: BlogPost): ReadabilityResult {
  const text = extractText(post).trim();
  const words = text.split(/\s+/).filter(Boolean);
  const wc = words.length;
  if (wc < 20) return { score: 0, label: "Too short", words: wc };
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const syl = words.reduce((sum, w) => sum + syllables(w), 0);
  const raw = 206.835 - 1.015 * (wc / sentences) - 84.6 * (syl / wc);
  const score = Math.round(clamp(raw, 0, 100));
  const label = score >= 70 ? "Easy" : score >= 50 ? "Standard" : score >= 30 ? "Difficult" : "Hard";
  return { score, label, words: wc };
}

export interface SeoCheck { label: string; pass: boolean }
export interface SeoResult { score: number; label: string; checks: SeoCheck[] }

/** SEO score = % of checks passing. */
export function seoScore(post: BlogPost): SeoResult {
  const seoTitle = post.seoTitle || post.title || "";
  const metaDesc = post.seoDescription || post.excerpt || "";
  const bodyWords = extractText(post).trim().split(/\s+/).filter(Boolean).length;
  const checks: SeoCheck[] = [
    { label: "SEO title 30–60 chars", pass: seoTitle.length >= 30 && seoTitle.length <= 60 },
    { label: "Meta description 120–160 chars", pass: metaDesc.length >= 120 && metaDesc.length <= 160 },
    { label: "Has excerpt", pass: !!post.excerpt?.trim() },
    { label: "At least 3 tags", pass: (post.tags?.length ?? 0) >= 3 },
    { label: "Cover image set", pass: !!post.coverImageUrl },
    { label: "Body ≥ 300 words", pass: bodyWords >= 300 },
    { label: "Category assigned", pass: !!post.category },
    { label: "Slug set", pass: !!post.slug },
  ];
  const passing = checks.filter((c) => c.pass).length;
  const score = Math.round((passing / checks.length) * 100);
  const label = score >= 70 ? "Good" : score >= 40 ? "Fair" : "Poor";
  return { score, label, checks };
}

export function scoreColor(score: number): { bar: string; text: string } {
  if (score >= 70) return { bar: "bg-emerald-500", text: "text-emerald-600" };
  if (score >= 40) return { bar: "bg-amber-500", text: "text-amber-600" };
  return { bar: "bg-destructive", text: "text-destructive" };
}
