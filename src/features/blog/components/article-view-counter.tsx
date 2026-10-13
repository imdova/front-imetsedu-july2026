"use client";

import * as React from "react";

import { dal } from "@/lib/dal";

/**
 * Counts one view of an article, from the browser.
 *
 * The count used to be a side effect of the server-side article fetch, which
 * meant the article page could never be cached: a GET that writes has to run on
 * every request, so every visit re-rendered the page and re-hit the backend
 * just to move a counter. Firing it from the client instead lets the page be
 * served from the ISR cache while the counter still tracks real visits.
 *
 * Renders nothing, fails silently — a lost count is not worth an error toast.
 */
export function ArticleViewCounter({ slug }: { slug: string }) {
  const sent = React.useRef<string | null>(null);

  React.useEffect(() => {
    // React 18+ mounts effects twice in dev; the ref keeps that from double-counting.
    if (sent.current === slug) return;
    sent.current = slug;
    void dal.blog.recordArticleView(slug);
  }, [slug]);

  return null;
}
