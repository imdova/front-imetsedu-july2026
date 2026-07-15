/**
 * Pure helpers for the course "About" block.
 *
 * These live in a plain module rather than inside the `"use client"` component:
 * the course detail page is a server component and calls `buildCourseAbout()`
 * directly, which is impossible across the client boundary ("Attempted to call
 * buildCourseAbout() from the server but buildCourseAbout is on the client").
 * Both the server page and the client component import from here.
 */

export type CourseAboutData = { summary: string; more: string[] };

/** Flatten course description HTML (or plain text) into readable paragraphs. */
export function plainTextFromHtml(input: string): string {
  return input
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/(div|h[1-6]|li|tr)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Build a short on-page summary + modal paragraphs from a long course
 * description. A bespoke summary (from course-content) always wins.
 */
export function buildCourseAbout(
  description: string,
  bespoke?: CourseAboutData | null,
): CourseAboutData | null {
  if (bespoke?.summary) {
    return {
      summary: bespoke.summary,
      more: bespoke.more ?? [],
    };
  }

  const plain = plainTextFromHtml(description);
  if (!plain) return null;

  const paras = plain
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paras.length === 0) return null;

  // Prefer first ~2 sentences as summary when the first block is long.
  const first = paras[0];
  const sentences =
    first.match(/[^.!?…]+[.!?…]+|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [first];
  const summary =
    sentences.length > 1
      ? sentences.slice(0, Math.min(3, sentences.length)).join(" ").trim()
      : first.length > 320
        ? `${first.slice(0, 300).trimEnd()}…`
        : first;

  const restFromFirst = sentences.slice(
    summary === first || sentences.length <= 3 ? sentences.length : 3,
  );
  const more = [
    ...(restFromFirst.length ? [restFromFirst.join(" ").trim()] : []),
    ...paras.slice(1),
  ].filter((p) => p && p !== summary);

  // If the summary ate the whole thing, still allow Learn More with a longer cut.
  if (!more.length && plain.length > summary.length + 40) {
    const leftover = plain.slice(summary.replace(/…$/, "").length).trim();
    if (leftover) more.push(leftover.replace(/^…/, "").trim());
  }

  return { summary, more };
}
