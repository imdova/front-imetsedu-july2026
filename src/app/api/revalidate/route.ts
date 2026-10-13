import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation, called by the backend after an admin edits content.
 *
 * Public pages are prerendered and held for between 10 minutes and a day, so
 * a price or copy change made in the admin would otherwise wait out that window
 * — an admin would change a price, reload the page, see the old one, and
 * reasonably conclude the save had failed. This endpoint closes that gap: the
 * backend pings it after a mutation and the affected pages regenerate on their
 * next visit.
 *
 * It clears two things per scope. **Tags** reach the cached backend response
 * wherever it was fetched — detail page, listing, sitemap — without having to
 * enumerate every route that happens to read the same endpoint. **Paths** clear
 * the rendered documents themselves.
 *
 * Paths are **route patterns, not URLs**. `src/proxy.ts` rewrites `/courses/x`
 * to `/en/courses/x`, and `revalidatePath` keys off the destination of a
 * rewrite, so the pattern has to carry the `[locale]` segment — that also means
 * one call covers both locales. Route groups like `(public)` are not part of
 * the path.
 */
const SCOPE_TAGS: Record<string, string[]> = {
  course: ["courses"],
  blog: ["blog"],
  category: ["courses", "categories"],
  instructor: ["instructors"],
  settings: ["settings", "seo"],
  job: ["jobs"],
  review: ["reviews"],
  marketing: ["marketing"],
};

const SCOPES: Record<string, string[]> = {
  course: ["/[locale]/courses/[slug]", "/[locale]/courses", "/[locale]"],
  blog: ["/[locale]/blog/[slug]", "/[locale]/blog", "/[locale]"],
  category: ["/[locale]/category/[slug]", "/[locale]/courses", "/[locale]"],
  instructor: ["/[locale]/instructors/[id]", "/[locale]/instructors"],
  /* Settings and SEO touch the shell, so the layout goes with them. */
  settings: ["/[locale]"],
  job: ["/[locale]/careers/[slug]", "/[locale]/careers"],
  review: ["/[locale]/reviews", "/[locale]"],
  /* The promo bar is in the public shell, so it reaches every page. */
  marketing: ["/[locale]"],
};

export async function POST(request: NextRequest) {
  const secret = process.env.REVALIDATE_SECRET;
  // Unset secret means the endpoint is closed, not open — an empty comparison
  // would otherwise let anyone flush the cache of every public page.
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    scope?: string;
    paths?: string[];
    tags?: string[];
  } | null;

  const scope = String(body?.scope ?? "").trim();
  const extra = Array.isArray(body?.paths) ? body.paths.filter((p) => typeof p === "string") : [];
  // Caller-supplied tags are how a single record is cleared, e.g. `blog:my-slug`.
  const extraTags = Array.isArray(body?.tags) ? body.tags.filter((t) => typeof t === "string") : [];
  const patterns = [...(SCOPES[scope] ?? []), ...extra];

  if (!patterns.length && !extraTags.length) {
    return NextResponse.json(
      { message: `Unknown scope "${scope}" and no paths given`, scopes: Object.keys(SCOPES) },
      { status: 400 },
    );
  }

  const tags = [...new Set([...(SCOPE_TAGS[scope] ?? []), ...extraTags])];
  /*
   * `{ expire: 0 }`, not the recommended `"max"`. `"max"` marks the tag stale
   * and serves the stale copy once more while it refetches, so an admin who
   * saves and reloads still sees the old value on that first reload — which is
   * the exact confusion this endpoint exists to end. Expiring outright makes
   * the next request a blocking refetch. Next's docs name this as the pattern
   * for a webhook calling a route handler; `updateTag` is not an option here
   * because it only works inside a Server Action.
   */
  for (const tag of tags) revalidateTag(tag, { expire: 0 });

  const revalidated: string[] = [];
  for (const pattern of patterns) {
    try {
      // A pattern with a dynamic segment must say which type it is; a literal
      // path must not. `/[locale]` on its own is the locale layout.
      if (pattern === "/[locale]") revalidatePath(pattern, "layout");
      else if (pattern.includes("[")) revalidatePath(pattern, "page");
      else revalidatePath(pattern);
      revalidated.push(pattern);
    } catch {
      // One bad pattern should not stop the rest.
    }
  }

  return NextResponse.json({ revalidated, tags, at: new Date().toISOString() });
}
