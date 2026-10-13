import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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
  images: {
    remotePatterns: [
      // Demo course thumbnails (replace with the asset CDN when going live).
      { protocol: "https", hostname: "images.unsplash.com" },
      // VdoCipher / general media host used by the backend.
      { protocol: "https", hostname: "**.imetsedu.com" },
      // Backend S3 uploads (receipts, course media, avatars).
      { protocol: "https", hostname: "**.amazonaws.com" },
      // YouTube video poster thumbnails (student testimonial reviews).
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "img.youtube.com" },
    ],
  },
};

// Points next-intl at src/i18n/request.ts for per-request message loading.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
