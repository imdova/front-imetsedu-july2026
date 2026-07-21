import { NextResponse } from "next/server";

import { currencyForCountry } from "@/lib/geo-currency";

/**
 * Resolve the visitor's country → display currency for course pricing.
 *
 * Order of trust:
 *   1. A CDN-provided country header (works out-of-the-box on Cloudflare and
 *      Vercel — no config, no third-party call, most accurate).
 *   2. Fallback: a free IP-geolocation lookup (ipwho.is) using the client IP,
 *      for hosts that don't inject a country header (plain VPS/nginx).
 *
 * Always resolves — on total failure it returns country "" ⇒ currency "USD"
 * is NOT forced; the client keeps its EGP default when country is empty (see
 * CoursePrice). Per-visitor, so never cached.
 */
export const dynamic = "force-dynamic";

const HEADER_KEYS = [
  "cf-ipcountry", // Cloudflare
  "x-vercel-ip-country", // Vercel
  "x-country", // generic / custom nginx
  "x-geo-country",
];

const isValidCC = (v: string | null | undefined): v is string =>
  !!v && /^[A-Za-z]{2}$/.test(v) && !["XX", "T1"].includes(v.toUpperCase());

function clientIp(headers: Headers): string | null {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return headers.get("x-real-ip");
}

async function lookupCountryByIp(ip: string): Promise<string> {
  try {
    const res = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}?fields=country_code,success`, {
      signal: AbortSignal.timeout(2500),
      headers: { accept: "application/json" },
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { success?: boolean; country_code?: string };
    return data?.success && isValidCC(data.country_code) ? data.country_code!.toUpperCase() : "";
  } catch {
    return "";
  }
}

export async function GET(request: Request) {
  const headers = request.headers;

  // 1) CDN header
  let country = "";
  for (const k of HEADER_KEYS) {
    const v = headers.get(k);
    if (isValidCC(v)) {
      country = v.toUpperCase();
      break;
    }
  }

  // 2) IP-geolocation fallback (skip private/local IPs — they never resolve)
  if (!country) {
    const ip = clientIp(headers);
    if (ip && !/^(127\.|10\.|192\.168\.|::1|localhost)/.test(ip)) {
      country = await lookupCountryByIp(ip);
    }
  }

  return NextResponse.json(
    { country, currency: currencyForCountry(country || undefined) },
    { headers: { "cache-control": "no-store" } },
  );
}
