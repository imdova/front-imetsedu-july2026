import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

/**
 * On-demand revalidation, called by the backend after an admin edits content.
 *
 * Public pages are statically generated with `revalidate = 86400`, so a price
 * or copy change made in the admin took up to a day to appear — an admin would
 * change a price, reload the page, see the old one, and reasonably conclude the
 * save had failed. This endpoint closes that gap: the backend pings it after a
 * mutation and the affected pages regenerate on their next visit.
 *
 * Paths are **route patterns, not URLs**. `src/proxy.ts` rewrites `/courses/x`
 * to `/en/courses/x`, and `revalidatePath` keys off the destination of a
 * rewrite, so the pattern has to carry the `[locale]` segment — that also means
 * one call covers both locales. Route groups like `(public)` are not part of
 * the path.
 */
const SCOPES: Record<string, string[]> = {
  course: ["/[locale]/courses/[slug]", "/[locale]/courses", "/[locale]"],
  blog: ["/[locale]/blog/[slug]", "/[locale]/blog", "/[locale]"],
  category: ["/[locale]/category/[slug]", "/[locale]/courses", "/[locale]"],
  instructor: ["/[locale]/instructors/[id]", "/[locale]/instructors"],
  /* Settings and SEO touch the shell, so the layout goes with them. */
  settings: ["/[locale]"],
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
  } | null;

  const scope = String(body?.scope ?? "").trim();
  const extra = Array.isArray(body?.paths) ? body.paths.filter((p) => typeof p === "string") : [];
  const patterns = [...(SCOPES[scope] ?? []), ...extra];

  if (!patterns.length) {
    return NextResponse.json(
      { message: `Unknown scope "${scope}" and no paths given`, scopes: Object.keys(SCOPES) },
      { status: 400 },
    );
  }

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

  return NextResponse.json({ revalidated, at: new Date().toISOString() });
}
