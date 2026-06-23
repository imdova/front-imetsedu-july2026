import { ImageResponse } from "next/og";

import { SITE_NAME } from "@/lib/seo";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Branded default social-share image, inherited by any public page that does
 * not set its own `openGraph.images` (e.g. course pages use their thumbnail). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #1111D4 0%, #2b6cb8 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 40, fontWeight: 700, letterSpacing: 6, opacity: 0.9 }}>IMETS</div>
        <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.1, marginTop: 12 }}>
          School of Business
        </div>
        <div style={{ fontSize: 34, marginTop: 28, opacity: 0.92, maxWidth: 900 }}>
          Professional, accredited, bilingual courses across the MENA region.
        </div>
      </div>
    ),
    size,
  );
}
