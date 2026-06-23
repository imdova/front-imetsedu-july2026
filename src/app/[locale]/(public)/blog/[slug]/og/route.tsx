import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/seo";

/**
 * Dynamic OG image for an article (route handler — the `opengraph-image` file
 * convention is unreliable under next-intl + route groups in this stack, so the
 * article's `generateMetadata` points `openGraph.images` here). Self-contained
 * (humanizes the slug) so it never hits the backend or inflates view counts.
 */
const humanize = (slug: string) =>
  decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).slice(0, 90);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; locale: string }> },
) {
  const { slug } = await params;
  const title = humanize(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column",
          justifyContent: "space-between", padding: "72px",
          background: "linear-gradient(135deg, #1111D4 0%, #4f46e5 60%, #7c3aed 100%)",
          color: "white", fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 30, fontWeight: 600, opacity: 0.9 }}>{SITE_NAME} · Blog</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 26, opacity: 0.85 }}>imetsedu.com/blog</div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
