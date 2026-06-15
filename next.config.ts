import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
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
  images: {
    remotePatterns: [
      // Demo course thumbnails (replace with the asset CDN when going live).
      { protocol: "https", hostname: "images.unsplash.com" },
      // VdoCipher / general media host used by the backend.
      { protocol: "https", hostname: "**.imetsedu.com" },
      // Backend S3 uploads (receipts, course media, avatars).
      { protocol: "https", hostname: "**.amazonaws.com" },
    ],
  },
};

// Points next-intl at src/i18n/request.ts for per-request message loading.
const withNextIntl = createNextIntlPlugin();

export default withNextIntl(nextConfig);
