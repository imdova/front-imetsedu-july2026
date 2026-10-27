/**
 * Title-tag rules, in one place and with no imports so a plain Node test can
 * load this file (`scripts/titles.test.mjs`) — keep it that way: no `@/…`.
 *
 * Google shows roughly the first 60 characters of a title; what follows is cut
 * mid-word. So every title the site generates has to fit in {@link TITLE_MAX},
 * brand included, and the brand goes last so that when something does get cut,
 * it is the brand and not the keyword.
 */

/** The longest title tag we ship, in characters. */
export const TITLE_MAX = 60;

/** What the root layout's title template appends to a title that is not branded. */
export const TITLE_SUFFIX = " | IMETS";

/** Jobs carry their own, longer brand so a listing reads as a vacancy, not a course. */
export const CAREERS_SUFFIX = " | IMETS Careers";

/**
 * A title that already names the school must not be given the template's
 * suffix on top of it ("… | IMETS Medical School | IMETS").
 */
export function isBranded(title: string): boolean {
  return /IMETS/i.test(title);
}

/** `text`, cut at a word boundary to at most `max` characters, with an ellipsis. */
export function clampTitle(text: string, max: number): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= max) return flat;
  const cut = flat.slice(0, Math.max(1, max - 1));
  const at = cut.lastIndexOf(" ");
  // Back up to a word boundary unless that would throw away most of the text.
  return `${(at > max * 0.5 ? cut.slice(0, at) : cut).trimEnd()}…`;
}

/**
 * A blog post's title tag: the editor's `seoTitle` when there is one, else the
 * headline — and nothing after it. No brand suffix: the keyword is the title.
 *
 * Deliberately not clamped. A title over {@link TITLE_MAX} is an editorial
 * decision to revisit (the CMS refuses to save one), not something to chop
 * silently at render time; `scripts/titles.test.mjs` fails on it instead.
 */
export function blogTitle(post: { seoTitle?: string | null; title: string }): string {
  return (post.seoTitle?.trim() || post.title).replace(/\s+/g, " ").trim();
}

/**
 * A job listing's title tag: "{Role} — {City} | IMETS Careers".
 *
 * The employer and the country are left out on purpose — they stay in the H1
 * and the JobPosting JSON-LD, where they are structured and cost no title
 * budget. The role is the part that gets shortened when the whole does not
 * fit; the city and the brand are not.
 */
export function jobTitle(job: { title: string; city?: string | null }): string {
  const city = job.city?.trim();
  const withCity = city ? ` — ${city}${CAREERS_SUFFIX}` : "";
  // A city so long it leaves no room for the role is dropped, not the role.
  const tail = withCity && TITLE_MAX - withCity.length >= 20 ? withCity : CAREERS_SUFFIX;
  return `${clampTitle(job.title, TITLE_MAX - tail.length)}${tail}`;
}

/** The `<title>` a visitor's tab and a SERP actually get for `title` under the layout template. */
export function renderedTitle(title: string): string {
  return isBranded(title) ? title : `${title}${TITLE_SUFFIX}`;
}
