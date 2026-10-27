import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import { allImageHosts, imageHost } from "./src/lib/image-hosts";

const nextConfig: NextConfig = {
  // Lets a check build go to its own folder (NEXT_DIST_DIR=.next/check) so it
  // starts from nothing without touching a running site's `.next`. Unset in
  // every normal build and deploy, where it is just `.next`.
  distDir: process.env.NEXT_DIST_DIR || ".next",

  // "X-Powered-By: Next.js" tells an attacker which framework to target and
  // tells a visitor nothing.
  poweredByHeader: false,

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // A year, subdomains included: the site is HTTPS-only, and without
          // this the first request of a session can still be downgraded.
          { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
          // Stops a browser from guessing a type for an uploaded file and
          // running it as something else.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Full URL to our own origin, origin only to others — analytics keeps
          // working, student paths stop leaking to third parties.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing on this site asks for a camera, a microphone or a location.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },

  // Allow the dev server's HMR / RSC resources to be requested from these LAN
  // hosts (e.g. opening the app from a phone or another machine on the network).
  allowedDevOrigins: ["192.168.1.3"],
  // The default 11-worker static-generation fan-out exhausts memory on this
  // machine (197 prerendered pages). Cap concurrency and force fewer workers.
  experimental: {
    staticGenerationMaxConcurrency: 4,
    staticGenerationMinPagesPerWorker: 60,
    staticGenerationRetryCount: 1,
    // Own the 404 for unmatched (non-locale) URLs so it ships our own
    // <body suppressHydrationWarning> instead of Next's bare synthesized one.
    globalNotFound: true,
  },
  async redirects() {
    return [
      // The legal pages live under /policy/* now; these two URLs are the ones
      // that were linked and indexed before the move.
      { source: "/privacy", destination: "/policy/privacy", statusCode: 301 },
      { source: "/terms", destination: "/policy/terms", statusCode: 301 },
      { source: "/ar/privacy", destination: "/ar/policy/privacy", statusCode: 301 },
      { source: "/ar/terms", destination: "/ar/policy/terms", statusCode: 301 },
    ];
  },
  // `IMAGE_HOST` reaches the browser bundle as well as this config, so
  // `SmartImage` and the optimizer always agree on what is allowed.
  env: { NEXT_PUBLIC_IMAGE_HOST: imageHost() },
  images: {
    // AVIF first, WebP as the fallback; the optimizer picks per request from the
    // browser's Accept header. (The default is WebP only.) AVIF costs more CPU the
    // first time a given image is encoded, which `minimumCacheTTL` amortises.
    formats: ["image/avif", "image/webp"],
    // Uploads are named by key and not replaced in place, so a long cache is safe
    // and keeps the VPS from re-encoding the same file. The default is 4 hours.
    minimumCacheTTL: 60 * 60 * 24 * 7,
    // Exact hosts only — see src/lib/image-hosts.ts. The previous
    // `**.amazonaws.com` let anyone proxy any AWS-hosted file through the optimizer.
    remotePatterns: allImageHosts().map((hostname) => ({ protocol: "https" as const, hostname })),
  },
};

// Points next-intl at src/i18n/request.ts for per-request message loading.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
