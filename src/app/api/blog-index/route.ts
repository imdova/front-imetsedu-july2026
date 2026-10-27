import { NextResponse } from "next/server";

import { dal } from "@/lib/dal";
import { toArticleCardData } from "@/features/blog/lib/article-card-data";

/**
 * Every published article as a card, for the blog explorer's search and filters.
 *
 * The listing page is paginated at 12, so the page itself only carries 12 cards.
 * Search, tag and category filters and the "most viewed" sort need to see every
 * article, though — so the explorer fetches this the first time one is used,
 * rather than every page view carrying it.
 *
 * `force-dynamic` for the same reason as /api/course-search-index: a build with
 * the API unreachable must not fail over it. The upstream fetch is still served
 * from Next's data cache and the Cache-Control lets the CDN hold the response.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  const res = await dal.blog.fetchPublicArticles({ limit: 200 });
  if (!res.ok) {
    return NextResponse.json({ message: "Articles unavailable" }, { status: 503 });
  }
  return NextResponse.json(res.data.data.map(toArticleCardData), {
    headers: { "Cache-Control": "public, s-maxage=600, stale-while-revalidate=86400" },
  });
}
