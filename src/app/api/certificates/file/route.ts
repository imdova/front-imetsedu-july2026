import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Hosts we are willing to proxy certificate files from (our S3 buckets + legacy media). */
const ALLOWED = [/\.amazonaws\.com$/i, /(^|\.)imetsedu\.com$/i, /(^|\.)imetsacademy\.com$/i];

/**
 * Same-origin proxy for certificate files. Two jobs:
 *  - `?url=…&name=…`        → streams the file with `Content-Disposition: attachment`
 *                              so the Download button saves a PDF directly (no new tab,
 *                              no S3 CORS dependency).
 *  - `?url=…&inline=1`      → serves it inline so the card preview iframe is same-origin.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = searchParams.get("url") || "";
  let target: URL;
  try { target = new URL(raw); } catch { return NextResponse.json({ error: "Invalid url" }, { status: 400 }); }
  if (target.protocol !== "https:" || !ALLOWED.some((re) => re.test(target.hostname))) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  const upstream = await fetch(target, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: "File not found" }, { status: 404 });

  const inline = searchParams.get("inline") === "1";
  const ext = (target.pathname.match(/\.(pdf|png|jpe?g|webp|gif)$/i)?.[1] || "pdf").toLowerCase();
  const name = (searchParams.get("name") || `certificate.${ext}`).replace(/[^\w.\- ]+/g, "_");
  const type = upstream.headers.get("content-type") || (ext === "pdf" ? "application/pdf" : `image/${ext === "jpg" ? "jpeg" : ext}`);

  const headers = new Headers({
    "Content-Type": type,
    "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${name}"`,
    "Cache-Control": "private, max-age=3600",
  });
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  return new Response(upstream.body, { status: 200, headers });
}
